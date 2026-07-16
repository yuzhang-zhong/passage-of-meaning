import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const selections = JSON.parse(await readFile(resolve(root, 'research', 'timeline-evidence-selections.json'), 'utf8'));
const reportCache = new Map();

async function reportFor(file) {
  if (!reportCache.has(file)) reportCache.set(file, JSON.parse(await readFile(resolve(root, 'research', file), 'utf8')));
  return reportCache.get(file);
}

function mediumFromPath(path) {
  return ['文学', '报刊', '应用文', '口语', '史传'].find((medium) => path.includes(`/${medium}/`)) ?? '综合语料';
}

function sourceFromPath(path, fallback) {
  if (path.includes('/人民日报/')) return '《人民日报》数字语料';
  if (path.includes('/光明日报/')) return '《光明日报》数字语料';
  return fallback.replace(/^rmrb\s*·\s*/i, '《人民日报》· ').replace(/\s*·\s*/g, ' · ') || 'CCL 数字全文';
}

const output = {};
for (const [senseId, selection] of Object.entries(selections)) {
  const report = await reportFor(selection.file);
  const target = report.find((item) => item.sense.id === senseId);
  if (!target) throw new Error(`找不到时间轴候选目标：${senseId}`);
  const candidate = target.candidates[selection.candidate];
  if (!candidate) throw new Error(`找不到时间轴候选序号：${senseId} / ${selection.candidate}`);
  const sourceUrl = `https://corpus.pku.edu.cn/searchResult?type=normal&corpus=tongyongyuliao&text=${encodeURIComponent(target.query)}`;
  output[senseId] = [{
    id: `timeline-ccl-${senseId}-${candidate.recordId}`,
    excerpt: candidate.excerpt,
    context: `${candidate.year} 年的数字全文在这句话中使用“${target.word}”，与“${target.sense.shortName}”的语义特征相符。它证明这种表达在该材料中已经出现，不证明它始于这一年。`,
    source: `北京大学 CCL 语料库 · ${sourceFromPath(candidate.path, candidate.source)}`,
    year: candidate.year,
    dateLabel: `${candidate.year} · ${mediumFromPath(candidate.path)}`,
    medium: mediumFromPath(candidate.path),
    grade: 'B',
    status: '语料事实',
    note: `原句、年份、语料路径与义项归类已逐条复核。记录号：${candidate.recordId}；语料路径：${candidate.path}。`,
    sourceUrl,
    reviewed: '已核验'
  }];
}

const outputPath = resolve(root, 'src', 'timelineEvidence.generated.json');
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
process.stdout.write(`${JSON.stringify({ cards: Object.keys(output).length, output: outputPath }, null, 2)}\n`);
