import { createServer } from 'vite';

const server = await createServer({
  root: new URL('..', import.meta.url).pathname.replace(/^\/(.:)/, '$1'),
  logLevel: 'silent',
  server: { middlewareMode: true },
  appType: 'custom',
});

try {
  const { allStories } = await server.ssrLoadModule('/src/storyCatalog.ts');
  const evidence = allStories.flatMap((story) => story.senses.flatMap((sense) => sense.evidence));
  const emptySenses = allStories.flatMap((story) => story.senses
    .filter((sense) => sense.evidence.length === 0)
    .map((sense) => ({ word: story.word, sense: sense.shortName })));
  const storiesWithoutEvidence = allStories
    .filter((story) => story.senses.every((sense) => sense.evidence.length === 0))
    .map((story) => story.word);
  const idCounts = Map.groupBy(evidence, (item) => item.id);
  const duplicateEvidenceIds = [...idCounts.entries()]
    .filter(([, items]) => items.length > 1)
    .map(([id, items]) => ({ id, count: items.length }));
  const brokenSources = evidence
    .filter((item) => !item.source || !item.sourceUrl || !item.excerpt)
    .map((item) => item.id);
  const incompleteStories = allStories.filter((story) => (
    !story.id || !story.word || !story.english || !story.topic || !story.intro || !story.question
    || !['branch', 'coexist', 'surge', 'revival'].includes(story.pattern)
    || story.senses.length < 2
  )).map((story) => story.word || story.id);
  const incompleteSenses = allStories.flatMap((story) => story.senses.filter((sense) => (
    !sense.id || !sense.name || !sense.shortName || !sense.description || !sense.color
    || !Number.isInteger(sense.startIndex) || sense.startIndex < 0 || sense.startIndex > 7
    || sense.activity.length !== 8 || sense.activity.some((value) => !Number.isFinite(value) || value < 0)
    || !Number.isFinite(sense.confidence) || sense.confidence < 0 || sense.confidence > 1
    || !sense.firstStable || !sense.media.length
    || sense.media.some((item) => !item.name || !Number.isFinite(item.value) || item.value < 0)
  )).map((sense) => `${story.word}/${sense.shortName || sense.id}`));
  const incompleteEvidence = evidence.filter((item) => (
    !item.id || !item.excerpt || !item.context || !item.source || !Number.isFinite(item.year)
    || !item.medium || !['A', 'B', 'C'].includes(item.grade)
    || !['语料事实', '计算结果', '人文解释'].includes(item.status)
    || !item.note || !item.sourceUrl || !['已核验', '有争议'].includes(item.reviewed)
  )).map((item) => item.id);
  const storiesWithoutTemporalFacts = allStories.filter((story) => !story.senses.some((sense) => (
    sense.evidence.some((item) => item.status === '语料事实' && item.year <= 2025)
  ))).map((story) => story.word);
  const timelineNodes = evidence.filter((item) => item.status === '语料事实' && item.year <= 2025);
  const sensesWithoutTimelineNodes = allStories.flatMap((story) => story.senses
    .filter((sense) => !sense.evidence.some((item) => item.status === '语料事实' && item.year <= 2025))
    .map((sense) => `${story.word}/${sense.shortName}`));
  const invalidTimelineNodes = timelineNodes.filter((item) => !Number.isFinite(item.year) || !item.source || !item.sourceUrl || !item.excerpt).map((item) => item.id);
  const storiesWithoutMediaAxis = allStories.filter((story) => !story.senses.some((sense) => (
    sense.evidence.some((item) => item.medium)
  ))).map((story) => story.word);
  const evidenceAxisIndex = (year) => {
    if (year < 1800) return 0;
    const bounds = [1840, 1895, 1919, 1949, 1978, 2000, 2012];
    const index = bounds.findIndex((bound) => year < bound);
    return (index === -1 ? 7 : index) + 1;
  };
  const storiesWithoutDisputeSignal = allStories.filter((story) => !story.senses.some((sense) => (
    sense.evidence.some((item) => item.isBoundary || item.reviewed === '有争议' || item.status === '人文解释')
    || (() => {
      const occupied = sense.evidence
        .filter((item) => item.status === '语料事实' && item.year <= 2025)
        .map((item) => evidenceAxisIndex(item.year));
      if (occupied.length < 2) return false;
      return Math.max(...occupied) - Math.min(...occupied) > new Set(occupied).size - 1;
    })()
  ))).map((story) => story.word);
  const researchStories = allStories.filter((story) => story.maturity === 'research');
  const uniqueResearchTrajectories = new Set(
    researchStories.map((story) => story.senses.map((sense) => sense.activity.join(',')).join('|')),
  ).size;
  const sampleWords = ['科学', '经济', '青年', '社会', '新闻', '自然', '心理', '城市', '网络', '算法', '浪漫', '朋友圈'];
  const samples = allStories
    .filter((story) => sampleWords.includes(story.word))
    .map((story) => ({
      word: story.word,
      senses: story.senses.map((sense) => ({ shortName: sense.shortName, evidence: sense.evidence.length })),
    }));

  process.stdout.write(`${JSON.stringify({
    totalStories: allStories.length,
    storiesWithEvidence: allStories.length - storiesWithoutEvidence.length,
    storiesWithoutEvidence,
    totalSenses: allStories.reduce((sum, story) => sum + story.senses.length, 0),
    sensesWithEvidence: allStories.reduce((sum, story) => sum + story.senses.filter((sense) => sense.evidence.length > 0).length, 0),
    sensesStillWithoutEvidence: emptySenses.length,
    totalEvidenceCards: evidence.length,
    researchStories: researchStories.length,
    uniqueResearchTrajectories,
    duplicateEvidenceIds,
    brokenSources,
    exactTimeline: {
      nodes: timelineNodes.length,
      sensesWithNodes: allStories.reduce((sum, story) => sum + story.senses.filter((sense) => sense.evidence.some((item) => item.status === '语料事实' && item.year <= 2025)).length, 0),
      sensesWithoutNodes: sensesWithoutTimelineNodes.length,
      invalidTimelineNodes,
      earliestYear: Math.min(...timelineNodes.map((item) => item.year)),
      latestYear: Math.max(...timelineNodes.map((item) => item.year)),
      distinctYears: new Set(timelineNodes.map((item) => item.year)).size,
    },
    incompleteStories,
    incompleteSenses,
    incompleteEvidence,
    lensReadiness: {
      meaningAxis: allStories.length - storiesWithoutTemporalFacts.length,
      evidenceAxis: allStories.length - storiesWithoutEvidence.length,
      mediaAxis: allStories.length - storiesWithoutMediaAxis.length,
      stabilityAxis: allStories.filter((story) => story.senses.every((sense) => Array.isArray(sense.evidence))).length,
      disputeAxis: allStories.length,
      storiesWithoutTemporalFacts,
      storiesWithoutMediaAxis,
      storiesWithNoBoundaryExplanationOrGap: storiesWithoutDisputeSignal,
    },
    samples,
  }, null, 2)}\n`);
  if (incompleteStories.length || incompleteSenses.length || incompleteEvidence.length || duplicateEvidenceIds.length || brokenSources.length || invalidTimelineNodes.length || emptySenses.length || uniqueResearchTrajectories !== researchStories.length) {
    process.exitCode = 1;
  }
} finally {
  await server.close();
}
