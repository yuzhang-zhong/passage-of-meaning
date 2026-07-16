import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createServer } from 'vite';

const root = resolve(import.meta.dirname, '..');
const server = await createServer({
  root,
  logLevel: 'silent',
  server: { middlewareMode: true },
  appType: 'custom',
});

try {
  const { allStories } = await server.ssrLoadModule('/src/storyCatalog.ts');
  const files = (await readdir(resolve(root, 'research')))
    .filter((name) => /^ccl-candidates-.*\.json$/.test(name));
  const candidateMap = new Map();
  for (const file of files) {
    const rows = JSON.parse(await readFile(resolve(root, 'research', file), 'utf8'));
    for (const row of rows) {
      const current = candidateMap.get(row.sense.id);
      if (!current || row.candidates.length > current.candidates.length || file.includes('refined')) {
        candidateMap.set(row.sense.id, { file, ...row });
      }
    }
  }

  const missing = allStories.flatMap((story) => story.senses
    .filter((sense) => !sense.evidence.some((item) => item.status === '语料事实' && item.year <= 2025))
    .map((sense) => {
      const candidate = candidateMap.get(sense.id);
      return {
        word: story.word,
        topic: story.topic,
        senseId: sense.id,
        sense: sense.shortName,
        candidateFile: candidate?.file ?? null,
        query: candidate?.query ?? null,
        candidates: candidate?.candidates ?? [],
      };
    }));
  const byTopic = Object.fromEntries(Map.groupBy(missing, (item) => item.topic).entries().map(([topic, items]) => [topic, {
    missing: items.length,
    withCandidates: items.filter((item) => item.candidates.length).length,
  }]));

  process.stdout.write(`${JSON.stringify({
    missingSenses: missing.length,
    withCandidateSets: missing.filter((item) => item.candidates.length).length,
    withoutCandidateSets: missing.filter((item) => !item.candidates.length).length,
    candidateExamples: missing.filter((item) => item.candidates.length).slice(0, 12),
    noCandidateExamples: missing.filter((item) => !item.candidates.length).slice(0, 40),
    byTopic,
  }, null, 2)}\n`);
} finally {
  await server.close();
}
