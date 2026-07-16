import { writeFile } from 'node:fs/promises';
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
  const timelineMode = process.argv.includes('--timeline');
  const targets = allStories.flatMap((story) => story.senses.flatMap((sense, senseIndex) => (
    (timelineMode
      ? !sense.evidence.some((item) => item.status === '语料事实' && item.year <= 2025)
      : sense.evidence.length === 0) ? [{
      word: story.word,
      storyId: story.id,
      topic: story.topic,
      maturity: story.maturity ?? 'verified',
      senseIndex,
      sense: {
        id: sense.id,
        name: sense.name,
        shortName: sense.shortName,
        description: sense.description,
        startIndex: sense.startIndex,
      },
    }] : []
  )));
  const output = resolve(root, 'research', timelineMode ? 'timeline-missing-senses.json' : 'empty-senses.json');
  await writeFile(output, `${JSON.stringify(targets, null, 2)}\n`, 'utf8');
  const byTopic = Object.fromEntries(Map.groupBy(targets, (target) => target.topic).entries().map(([topic, items]) => [topic, items.length]));
  process.stdout.write(`${JSON.stringify({ mode: timelineMode ? 'timeline' : 'empty', emptySenses: targets.length, byTopic, output }, null, 2)}\n`);
} finally {
  await server.close();
}
