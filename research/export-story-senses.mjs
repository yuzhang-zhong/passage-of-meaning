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
  const targets = allStories.map((story) => ({
    word: story.word,
    storyId: story.id,
    maturity: story.maturity ?? 'verified',
    senses: story.senses.map((sense) => ({
      id: sense.id,
      name: sense.name,
      shortName: sense.shortName,
      description: sense.description,
    })),
  }));
  const output = resolve(root, 'research', 'story-senses.json');
  await writeFile(output, `${JSON.stringify(targets, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify({ stories: targets.length, senses: targets.reduce((sum, item) => sum + item.senses.length, 0), output }, null, 2)}\n`);
} finally {
  await server.close();
}
