import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const selections = JSON.parse(await readFile(resolve(root, 'research', 'ccl-selections.json'), 'utf8'));
const reportCache = new Map();

async function reportFor(file) {
  if (!reportCache.has(file)) {
    const path = resolve(root, 'research', `ccl-candidates-${file}.json`);
    reportCache.set(file, JSON.parse(await readFile(path, 'utf8')));
  }
  return reportCache.get(file);
}

function mediumFromPath(path) {
  return ['文学', '报刊', '应用文', '口语', '史传'].find((medium) => path.includes(`/${medium}/`)) ?? '综合语料';
}

function sourceFromPath(path, fallback) {
  if (path.includes('/人民日报/')) return '《人民日报》数字语料';
  if (path.includes('/光明日报/')) return '《光明日报》数字语料';
  const clean = fallback.replace(/^rmrb\s*·\s*/i, '《人民日报》· ').replace(/\s*·\s*/g, ' · ');
  return clean || 'CCL 数字全文';
}

const evidence = {};
for (const [senseId, selection] of Object.entries(selections)) {
  const report = await reportFor(selection.file);
  const target = report.find((item) => item.sense.id === senseId);
  if (!target) throw new Error(`找不到 CCL 候选目标：${senseId}`);
  const candidate = target.candidates[selection.candidate];
  if (!candidate) throw new Error(`找不到 CCL 候选序号：${senseId} / ${selection.candidate}`);
  const excerpt = selection.excerpt ?? candidate.excerpt;
  const recordId = selection.recordId ?? candidate.recordId;
  const sourceUrl = `https://corpus.pku.edu.cn/searchResult?type=normal&corpus=tongyongyuliao&text=${encodeURIComponent(target.query)}`;
  evidence[senseId] = {
    id: `ccl-${senseId}`,
    excerpt,
    context: `${candidate.year} 年的数字语料在这一句中使用“${target.word}”。它与“${target.sense.shortName}”候选相符，可证明这种表达已在该文本中出现；不能据此断定它始于这一年。`,
    source: `北京大学 CCL 语料库 · ${sourceFromPath(candidate.path, candidate.source)}`,
    year: candidate.year,
    dateLabel: `${candidate.year} · ${mediumFromPath(candidate.path)}`,
    medium: mediumFromPath(candidate.path),
    grade: 'B',
    status: '语料事实',
    note: `原句、年份与语料路径已经人工复核；归入“${target.sense.shortName}”是词渡编辑判断，仍可被读者质疑或改判。记录号：${recordId}。`,
    sourceUrl,
    reviewed: '已核验',
  };
}

const output = resolve(root, 'src', 'cclSenseEvidence.generated.json');
await writeFile(output, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
process.stdout.write(`${JSON.stringify({ cards: Object.keys(evidence).length, output }, null, 2)}\n`);
