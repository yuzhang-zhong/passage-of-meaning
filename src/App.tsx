import { useDeferredValue, useEffect, useState, type FormEvent } from 'react';

import {
  catalogMechanisms,
  catalogThemes,
  catalogWords,
  getCatalogTheme,
  type CatalogEra,
  type CatalogMechanism,
  type CatalogTheme,
  type CatalogWord,
} from './catalog';
import {
  periods,
  topics,
  type Evidence,
  type Sense,
  type WordStory,
} from './data';
import { allStories } from './storyCatalog';
import {
  getLiteraryTimeline,
  literaryHotspotWords,
  literaryWorks,
  type LiteraryTimeline,
} from './literary';

type Page =
  | { kind: 'home' }
  | { kind: 'literary' }
  | { kind: 'story'; storyId: string; from: 'home' | 'literary' };

type Lens = '意义' | '证据' | '媒介' | '稳定度' | '争议';

const literatureGatewayWorks = [literaryWorks[0]!, literaryWorks[7]!, literaryWorks[10]!] as const;

interface UserContribution {
  id: string;
  excerpt: string;
  source: string;
  year: string;
  note: string;
}

const lensNotes: Record<Lens, string> = {
  意义: '横轴是真实材料年份，纵轴是义项；只有可回到出处的材料才形成节点，连线仅提示编辑上的意义关联。',
  证据: '横轴是证据年代，纵轴是义项；每格数字是该时段可以回到出处的原句数量。',
  媒介: '横轴是证据数量，纵轴是来源媒介；色段区分义项，回答材料主要来自哪里。',
  稳定度: '横轴是证据稳定度，纵轴是义项；分数只由真实原句数、覆盖年代段、证据等级与核验状态计算。',
  争议: '横轴是年代，纵轴是义项；逐格区分直接证据、边界案例、两端有材料但中间缺证，以及当前材料空白。',
};

const lenses: Lens[] = ['意义', '证据', '媒介', '稳定度', '争议'];
const mechanismOptions: readonly (CatalogMechanism | '全部')[] = ['全部', ...catalogMechanisms];

function isUserContribution(value: unknown): value is UserContribution {
  return typeof value === 'object'
    && value !== null
    && 'id' in value && typeof value.id === 'string'
    && 'excerpt' in value && typeof value.excerpt === 'string'
    && 'source' in value && typeof value.source === 'string'
    && 'year' in value && typeof value.year === 'string'
    && 'note' in value && typeof value.note === 'string';
}

function readContributions(storageKey: string): UserContribution[] {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isUserContribution) : [];
  } catch {
    return [];
  }
}

function writeContributions(storageKey: string, contributions: UserContribution[]) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(contributions));
  } catch {
    // The form remains usable for this session when browser storage is unavailable.
  }
}

function getStory(storyId: string): WordStory {
  return allStories.find((story) => story.id === storyId) ?? allStories[0]!;
}

function findCatalogWord(word: string): CatalogWord {
  return catalogWords.find((entry) => entry.word === word) ?? catalogWords[0]!;
}

function MiniRiver({ pattern }: { pattern: WordStory['pattern'] }) {
  const variants: Record<WordStory['pattern'], string[]> = {
    branch: ['M4 17 C35 17 42 16 58 10 C79 3 92 5 116 5', 'M4 17 C42 17 48 18 62 24 C82 31 101 27 116 27'],
    coexist: ['M4 9 C33 6 77 10 116 7', 'M4 20 C41 24 77 18 116 22', 'M42 30 C67 27 90 31 116 29'],
    surge: ['M4 22 C39 22 56 23 70 19 C83 15 94 4 116 4', 'M4 28 C49 26 83 30 116 25'],
    revival: ['M4 8 C32 8 44 18 65 22 C87 25 96 13 116 9', 'M4 27 C37 25 77 27 116 26'],
  };

  return (
    <svg className="mini-river" viewBox="0 0 120 34" aria-hidden="true">
      {variants[pattern].map((path, index) => (
        <path key={path} d={path} className={`mini-river__line mini-river__line--${index + 1}`} />
      ))}
    </svg>
  );
}

function SiteHeader({ onHome, onLiterary, compact = false }: { onHome: () => void; onLiterary: () => void; compact?: boolean }) {
  function openMethod() {
    onHome();
    window.requestAnimationFrame(() => document.getElementById('method')?.scrollIntoView({ behavior: 'smooth' }));
  }

  return (
    <header className={`site-header ${compact ? 'site-header--compact' : ''}`}>
      <button className="brand" onClick={onHome} aria-label="返回词渡首页">
        <span className="brand__seal">渡</span>
        <span>
          <strong>词渡</strong>
          <small>Passage of Meaning</small>
        </span>
      </button>
      <nav className="site-nav" aria-label="主要导航">
        <button onClick={onHome}>策展词集</button>
        <button onClick={onLiterary}>课本名篇</button>
        <button className="site-nav__method" onClick={openMethod}>方法</button>
        <span className="edition">策展版 · 02</span>
      </nav>
    </header>
  );
}

function CatalogLibrary({ onOpenWord }: { onOpenWord: (entry: CatalogWord) => void }) {
  const [query, setQuery] = useState('');
  const [mechanism, setMechanism] = useState<CatalogMechanism | '全部'>('全部');
  const [themeId, setThemeId] = useState('all');
  const deferredQuery = useDeferredValue(query.trim());
  const filteredWords = catalogWords.filter((entry) => {
    const theme = getCatalogTheme(entry.themeId);
    const matchesQuery = !deferredQuery
      || entry.word.includes(deferredQuery)
      || entry.question.includes(deferredQuery)
      || theme.title.includes(deferredQuery);
    const matchesMechanism = mechanism === '全部' || entry.mechanism === mechanism;
    const matchesTheme = themeId === 'all' || entry.themeId === themeId;
    return matchesQuery && matchesMechanism && matchesTheme;
  });

  function resetFilters() {
    setQuery('');
    setMechanism('全部');
    setThemeId('all');
  }

  return (
    <section className="catalog-library" id="catalog" aria-labelledby="catalog-heading">
      <div className="catalog-library__heading">
        <div>
          <span className="folio">完整策展库 / 02</span>
          <h2 id="catalog-heading">一百八十八个渡口</h2>
        </div>
        <div className="catalog-library__summary">
          <strong>188</strong>
          <p>个不重复词 · 10 条语义航线<br />4 个深度故事 · 184 个研究线索</p>
        </div>
      </div>

      <div className="catalog-principles" aria-label="选词原则">
        <span>选词原则</span>
        <p>变化机制优先</p>
        <p>跨时代可追踪</p>
        <p>减少同义堆叠</p>
        <p>兼顾制度与日常</p>
      </div>

      <div className="catalog-controls">
        <div className="catalog-search">
          <label htmlFor="catalog-search">在 188 个词中寻找</label>
          <div>
            <input
              id="catalog-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="输入词语、主题或问题，例如：身份 / 平台"
            />
            <span aria-hidden="true">⌕</span>
          </div>
        </div>
        <div className="catalog-filter" aria-label="按变化机制筛选">
          <span>变化机制</span>
          <div>
            {mechanismOptions.map((item) => (
              <button
                type="button"
                className={mechanism === item ? 'is-active' : ''}
                aria-pressed={mechanism === item}
                key={item}
                onClick={() => setMechanism(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="theme-index" aria-label="按主题筛选">
        <button type="button" className={themeId === 'all' ? 'is-active' : ''} onClick={() => setThemeId('all')}>
          <span>00</span>全部主题
        </button>
        {catalogThemes.map((theme) => (
          <button type="button" className={themeId === theme.id ? 'is-active' : ''} key={theme.id} onClick={() => setThemeId(theme.id)}>
            <span>{theme.index}</span>{theme.title}
          </button>
        ))}
      </div>

      <div className="catalog-results__topline" aria-live="polite">
        <span>当前显示 <strong>{filteredWords.length}</strong> / 188</span>
        <span>{themeId === 'all' ? '全部主题' : getCatalogTheme(themeId).title} · {mechanism}</span>
      </div>

      {filteredWords.length > 0 ? (
        <div className="catalog-grid">
          {filteredWords.map((entry) => {
            const theme = getCatalogTheme(entry.themeId);
            return (
              <button className="catalog-card" type="button" key={entry.id} onClick={() => onOpenWord(entry)}>
                <span className="catalog-card__index">{theme.index}.{entry.id.slice(-2)}</span>
                <strong>{entry.word}</strong>
                <span className="catalog-card__mechanism">{entry.mechanism}</span>
                <MiniRiver pattern={entry.pattern} />
                <small>{entry.question}</small>
                <span className="catalog-card__status is-deep">
                  {entry.status}<i aria-hidden="true">↗</i>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="catalog-empty">
          <strong>没有落在当前筛选里的词</strong>
          <p>试着删去一个条件，或从全部主题重新开始。</p>
          <button type="button" onClick={resetFilters}>清除筛选</button>
        </div>
      )}
    </section>
  );
}

function PassageText({ segments, onOpenWord }: { segments: readonly { text: string; word?: string }[]; onOpenWord: (entry: CatalogWord) => void }) {
  return (
    <>
      {segments.map((segment, index) => {
        const word = segment.word;
        return word ? (
          <button type="button" className="passage-word" key={`${word}-${index}`} onClick={() => onOpenWord(findCatalogWord(word))}>
            {segment.text}<span aria-hidden="true">↗</span>
          </button>
        ) : <span key={`${segment.text}-${index}`}>{segment.text}</span>;
      })}
    </>
  );
}

function LiteraryPage({ onHome, onOpenWord }: { onHome: () => void; onOpenWord: (entry: CatalogWord) => void }) {
  return (
    <>
      <a className="skip-link" href="#literary-main">跳到课本名篇</a>
      <div className="paper-grain" aria-hidden="true" />
      <SiteHeader onHome={onHome} onLiterary={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
      <main className="literary-page" id="literary-main">
        <header className="literary-hero">
          <div>
            <span className="folio">另一种入口 / 课本选本</span>
            <h1>从课本名篇<br />进入词史</h1>
          </div>
          <div className="literary-hero__note">
            <p>先不搜索词。从小学古诗读到高中古文，再经过现代散文、哲思与科学说明，从原句进入词的历史。</p>
            <dl>
              <div><dt>入选文本</dt><dd>{String(literaryWorks.length).padStart(2, '0')}</dd></div>
              <div><dt>可点击词</dt><dd>{String(literaryHotspotWords.length).padStart(2, '0')}</dd></div>
              <div><dt>题材跨度</dt><dd>古诗—科学</dd></div>
            </dl>
          </div>
        </header>

        <nav className="literary-index" aria-label="课本名篇目录">
          {literaryWorks.map((work) => (
            <a key={work.id} href={`#work-${work.id}`}><span>{work.order}</span>{work.title}</a>
          ))}
        </nav>

        <section className="literary-selection" aria-label="课本名篇选读">
          {literaryWorks.map((work) => {
            const hotspotWords = [...new Set(work.segments.flatMap((segment) => segment.word ? [segment.word] : []))];
            return (
              <article className="literary-work" id={`work-${work.id}`} key={work.id}>
                <header>
                  <span className="literary-work__number">{work.order}</span>
                  <div><h2>{work.title}</h2><p>{work.textbook}</p><small>{work.author} · {work.date} · {work.genre}</small></div>
                </header>
                <blockquote><PassageText segments={work.segments} onOpenWord={onOpenWord} /></blockquote>
                <aside>
                  <span>本页的阅读提示</span>
                  <p>{work.context}</p>
                  <div className="literary-work__hotspots">可进入词史：{hotspotWords.join(' · ')}</div>
                  <div className="literary-work__sources">
                    <a href={work.textbookUrl} target="_blank" rel="noreferrer">核对教材位置 ↗</a>
                    <a href={work.sourceUrl} target="_blank" rel="noreferrer">核对原文 · {work.sourceLabel} ↗</a>
                  </div>
                </aside>
              </article>
            );
          })}
        </section>

        <section className="literary-method" aria-labelledby="literary-method-heading">
          <span className="folio">阅读说明</span>
          <h2 id="literary-method-heading">课文是锚点，<br />不是全部历史。</h2>
          <p>课本名篇证明某个词在一个具体时刻如何被使用；后续时间轴仍需结合同期报刊、制度文本、字典和日常语料，才能判断新义何时稳定、旧义是否继续存在。</p>
        </section>
      </main>
      <footer className="site-footer"><span>词渡 · Passage of Meaning</span><p>教材位置与原句已核 · 时间轴为策展解释</p><span>课本选本 · 01</span></footer>
    </>
  );
}

function HomePage({ onOpenWord, onOpenLiterary }: { onOpenWord: (entry: CatalogWord) => void; onOpenLiterary: () => void }) {
  return (
    <>
      <a className="skip-link" href="#main">跳到主要内容</a>
      <div className="paper-grain" aria-hidden="true" />
      <SiteHeader onHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })} onLiterary={onOpenLiterary} />
      <main id="main">
        <section className="hero">
          <div className="hero__index" aria-hidden="true">1800<br />—<br />2025</div>
          <div className="hero__title-wrap">
            <p className="eyebrow reveal reveal--1">一个词如何穿过几百年</p>
            <h1 className="hero__title reveal reveal--2"><span>词</span><span>渡</span></h1>
            <p className="hero__english reveal reveal--3">PASSAGE <i>of</i> MEANING</p>
          </div>
          <div className="hero__manifesto reveal reveal--4">
            <span className="folio">序 / 00</span>
            <p>词语不是字典中静止的定义。</p>
            <p>它们被不同年代的人反复使用、争论、误解，也因此获得新的生命。</p>
            <button className="text-link" onClick={() => document.getElementById('islands')?.scrollIntoView({ behavior: 'smooth' })}>
              从十二个词启程 <span aria-hidden="true">↓</span>
            </button>
          </div>
          <div className="hero__river" aria-hidden="true">
            <svg viewBox="0 0 900 230" preserveAspectRatio="none">
              <path d="M-20 125 C170 92 228 138 349 118 C479 96 498 54 653 72 C742 82 822 66 940 29" />
              <path d="M-20 148 C159 123 235 163 365 155 C506 146 596 163 940 112" />
              <path d="M246 137 C336 132 403 167 487 193 C600 228 731 208 940 184" />
            </svg>
          </div>
        </section>

        <section className="islands" id="islands" aria-labelledby="islands-heading">
          <div className="section-intro">
            <div>
              <span className="folio">策展词集 / 01</span>
              <h2 id="islands-heading">词语群岛</h2>
            </div>
            <p>先从十二个首发词进入。四个词已有完整证据故事，其余八个已开放为研究线索；它们共同示范词义变化的不同结构。</p>
          </div>

          <div className="topic-list">
            {topics.map((topic) => (
              <article className="topic" key={topic.title}>
                <div className="topic__heading">
                  <span>{topic.index}</span>
                  <div>
                    <h3>{topic.title}</h3>
                    <p>{topic.description}</p>
                  </div>
                </div>
                <div className="word-grid">
                  {topic.words.map((word) => {
                    const story = allStories.find((item) => item.word === word);
                    const entry = findCatalogWord(word);
                    return (
                      <button className="word-card" key={word} onClick={() => onOpenWord(entry)}>
                        <span className="word-card__meta">{story ? '深度词条' : '研究线索'} <i>↗</i></span>
                        <strong>{word}</strong>
                        <MiniRiver pattern={entry.pattern} />
                        <small>{entry.question}</small>
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="literature-gateway" aria-labelledby="literature-gateway-heading">
          <div className="literature-gateway__heading">
            <div><span className="folio">课本名篇 / 02</span><h2 id="literature-gateway-heading">先读一句，<br />再追一个词。</h2></div>
            <div>
              <p>另一条导航不从词表开始，而从十二篇中小学语文课文开始。古诗、古文、现代散文与知识文章中的十四个词可以直接进入时间轴。</p>
              <button type="button" className="text-link" onClick={onOpenLiterary}>打开课本选本 <span>↗</span></button>
            </div>
          </div>
          <div className="literature-gateway__previews">
            {literatureGatewayWorks.map((work) => (
              <article key={work.id}>
                <span>{work.order} · {work.textbook}</span>
                <h3>{work.title}</h3>
                <blockquote><PassageText segments={work.segments} onOpenWord={onOpenWord} /></blockquote>
                <small>{work.author}</small>
              </article>
            ))}
          </div>
        </section>

        <CatalogLibrary onOpenWord={onOpenWord} />

        <section className="method" id="method" aria-labelledby="method-heading">
          <div className="method__statement">
            <span className="folio">阅读方法 / 04</span>
            <h2 id="method-heading">意义不是一个点，<br />而是一组真实使用。</h2>
          </div>
          <ol className="method__steps">
            <li><span>01</span><strong>看见分叉</strong><p>新含义出现，并不要求旧含义消失。</p></li>
            <li><span>02</span><strong>回到原句</strong><p>每条视觉判断都应能进入来源与上下文。</p></li>
            <li><span>03</span><strong>保留异议</strong><p>AI 组织候选结构，人仍然保留解释权。</p></li>
          </ol>
          <p className="method__notice"><span>研究状态</span> 188 个词已全部进入深度词条工作台；其中 4 个为精校词条。主时间轴只显示带真实年份、原句和来源的材料；没有材料的义项会明确留空，连接线只表示编辑上的意义关联。</p>
        </section>
      </main>
      <footer className="site-footer">
        <span>词渡 · Passage of Meaning</span>
        <p>AI 组织 · 研究者审核 · 原文可查</p>
        <span>© 2026 / 原型</span>
      </footer>
    </>
  );
}

const evidencePeriodUpperBounds = [1840, 1895, 1919, 1949, 1978, 2000, 2012] as const;

function evidencePeriodIndex(year: number): number {
  const index = evidencePeriodUpperBounds.findIndex((upperBound) => year < upperBound);
  return index === -1 ? 7 : index;
}

const evidenceAxisPeriods = ['1800 年前', ...periods] as const;
const evidenceAxisColumns = [...evidenceAxisPeriods, '定义 / 解释'] as const;

function evidenceAxisIndex(year: number): number {
  return year < 1800 ? 0 : evidencePeriodIndex(year) + 1;
}

function timelineX(year: number): number {
  if (year < 1800) return 32 + Math.max(0, Math.min(1, (year + 600) / 2400)) * 78;
  return 150 + Math.max(0, Math.min(1, (year - 1800) / 225)) * 664;
}

function evidenceDateLabel(evidence: Evidence): string {
  if (evidence.dateLabel) return evidence.dateLabel;
  return evidence.year < 0 ? `约公元前 ${Math.abs(evidence.year)} 年` : `${evidence.year} 年`;
}

function evidenceStability(sense: Sense) {
  const direct = sense.evidence.filter((item) => item.status === '语料事实' && item.year <= 2025);
  const periodCount = new Set(direct.map((item) => evidenceAxisIndex(item.year))).size;
  if (!direct.length) return { score: 0, direct, periodCount };

  const gradeQuality = direct.reduce((sum, item) => sum + (item.grade === 'A' ? 1 : item.grade === 'B' ? .78 : .45), 0) / direct.length;
  const reviewQuality = direct.filter((item) => item.reviewed === '已核验').length / direct.length;
  const volume = Math.min(1, direct.length / 4);
  const coverage = Math.min(1, periodCount / 4);
  const score = Math.round((volume * .35 + coverage * .25 + gradeQuality * .25 + reviewQuality * .15) * 100);
  return { score, direct, periodCount };
}

function firstEvidencePeriod(sense: Sense): number {
  const first = sense.evidence
    .filter((item) => item.status === '语料事实' && item.year <= 2025)
    .sort((left, right) => left.year - right.year)[0];
  return first ? (first.year < 1800 ? -1 : evidencePeriodIndex(first.year)) : -1;
}

function defaultStorySense(story: WordStory): Sense {
  return story.senses.find((sense) => sense.evidence.some((item) => item.status === '语料事实' && item.year <= 2025))
    ?? story.senses[0]!;
}

function RiverChart({
  story,
  selectedSense,
  onSelectSense,
  onSelectPeriod,
  onRead,
}: {
  story: WordStory;
  selectedSense: Sense;
  onSelectSense: (sense: Sense) => void;
  onSelectPeriod: (period: number) => void;
  onRead: (evidence: Evidence) => void;
}) {
  const factualBySense = story.senses.map((sense) => ({
    sense,
    evidence: sense.evidence.filter((item) => item.status === '语料事实' && item.year <= 2025).sort((left, right) => left.year - right.year),
  }));
  const initialEvidence = factualBySense.find((row) => row.sense.id === selectedSense.id)?.evidence[0] ?? null;
  const [hoveredId, setHoveredId] = useState<string | null>(initialEvidence?.id ?? null);
  const plotHeight = 86 + story.senses.length * 106;
  const hoveredRow = factualBySense.find((row) => row.evidence.some((item) => item.id === hoveredId));
  const hoveredEvidence = hoveredRow?.evidence.find((item) => item.id === hoveredId) ?? initialEvidence;
  const hoveredSense = hoveredRow?.sense ?? selectedSense;
  const hoveredRowIndex = Math.max(0, story.senses.findIndex((sense) => sense.id === hoveredSense.id));
  const hoveredX = hoveredEvidence ? timelineX(hoveredEvidence.year) : 150;
  const hoveredY = 82 + hoveredRowIndex * 106;

  useEffect(() => {
    const first = selectedSense.evidence
      .filter((item) => item.status === '语料事实' && item.year <= 2025)
      .sort((left, right) => left.year - right.year)[0];
    setHoveredId(first?.id ?? null);
  }, [selectedSense.id]);

  function selectEvidence(sense: Sense, evidence: Evidence) {
    onSelectSense(sense);
    setHoveredId(evidence.id);
    onSelectPeriod(evidence.year < 1800 ? -1 : evidencePeriodIndex(evidence.year));
    onRead(evidence);
  }

  return (
    <div className="river-chart evidence-timeline">
      <div className="river-chart__legend">
        <span><i className="legend-evidence" /> 一点 = 一则真实材料</span>
        <span><i className="legend-dash" /> 连接线 = 编辑关联，不是词频</span>
        <span className="legend-instruction">悬停读材料 · 点击打开完整证据</span>
      </div>
      <p className="river-guide"><span>真实年份轴</span> 1800 年以后按年份比例定位；古典前史使用断轴单列。没有真实材料的时期不再生成节点。</p>
      <div className="river-canvas evidence-timeline__canvas">
        <div className="river-labels evidence-timeline__labels" aria-hidden="true" style={{ gridTemplateRows: `repeat(${story.senses.length}, 1fr)`, height: `${plotHeight - 48}px` }}>
          {story.senses.map((sense) => <span key={sense.id}>{sense.shortName}</span>)}
        </div>
        <div className="river-plot">
        <svg viewBox={`0 0 850 ${plotHeight}`} role="img" aria-label={`${story.word}的真实材料时间轴；每个节点对应一则可回到出处的材料`}>
          <rect className="prehistory-band" x="20" y="34" width="102" height={plotHeight - 55} />
          <text className="period-year" x="71" y="20" textAnchor="middle">1800 年前 / 断轴</text>
          <path className="axis-break" d={`M126 38 l6 8 l6 -8 M126 ${plotHeight - 28} l6 8 l6 -8`} />
          {[1800, 1850, 1900, 1950, 2000, 2025].map((year) => {
            const x = timelineX(year);
            return <g key={year}><line className="period-line" x1={x} x2={x} y1="34" y2={plotHeight - 20} /><text className="period-year" x={x} y="20" textAnchor={year === 1800 ? 'start' : year === 2025 ? 'end' : 'middle'}>{year}</text></g>;
          })}
          {factualBySense.map(({ sense, evidence }, row) => {
            const y = 82 + row * 106;
            const points = evidence.map((item) => `${timelineX(item.year)},${y}`).join(' ');
            return (
              <g key={sense.id} className={sense.id === selectedSense.id ? 'evidence-thread evidence-thread--selected' : 'evidence-thread'}>
                <line className="evidence-thread__baseline" x1="20" x2="814" y1={y} y2={y} />
                {evidence.length > 1 && <polyline className="evidence-thread__connection" points={points} stroke={sense.color} />}
                {!evidence.length && <text className="evidence-thread__empty" x="150" y={y + 4}>暂无带真实年份的原句；定义材料在“证据”视角中保留</text>}
                {evidence.map((item, itemIndex) => {
                  const sameYear = evidence.filter((candidate) => candidate.year === item.year);
                  const sameYearIndex = evidence.slice(0, itemIndex).filter((candidate) => candidate.year === item.year).length;
                  const nodeY = y + (sameYearIndex - (sameYear.length - 1) / 2) * 12;
                  const x = timelineX(item.year);
                  const isHovered = item.id === hoveredId;
                  return (
                    <g className={`evidence-node ${isHovered ? 'evidence-node--active' : ''}`} key={item.id}>
                      <circle className="evidence-node__ring" cx={x} cy={nodeY} r={isHovered ? 9 : 7} />
                      <circle className="evidence-node__dot" cx={x} cy={nodeY} r={isHovered ? 5 : 4} fill={sense.color} />
                      <text className="evidence-node__year" x={x} y={nodeY - 12} textAnchor="middle">{item.year < 0 ? `前${Math.abs(item.year)}` : item.year}</text>
                      <circle
                        className="evidence-node__target"
                        cx={x}
                        cy={nodeY}
                        r="18"
                        role="button"
                        tabIndex={0}
                        aria-label={`${evidenceDateLabel(item)}，${sense.name}；${item.source}；${item.excerpt}`}
                        onMouseEnter={() => setHoveredId(item.id)}
                        onPointerEnter={() => setHoveredId(item.id)}
                        onFocus={() => setHoveredId(item.id)}
                        onClick={() => selectEvidence(sense, item)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            selectEvidence(sense, item);
                          }
                        }}
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}
          {hoveredEvidence && <line className="hover-line" x1={hoveredX} x2={hoveredX} y1="34" y2={plotHeight - 20} />}
        </svg>
        {hoveredEvidence && <aside
          className={`river-tooltip evidence-tooltip ${hoveredX > 610 ? 'river-tooltip--left' : ''}`}
          style={{ left: `${(hoveredX / 850) * 100}%`, top: `${(hoveredY / plotHeight) * 100}%`, borderColor: hoveredSense.color }}
          role="status"
        >
          <div className="river-tooltip__top"><span>{evidenceDateLabel(hoveredEvidence)}</span><i>{hoveredEvidence.grade} 级 · {hoveredEvidence.reviewed}</i></div>
          <strong>{hoveredSense.name}</strong>
          <q>{hoveredEvidence.excerpt}</q>
          <small>{hoveredEvidence.source}</small>
          <p className="evidence-tooltip__context">{hoveredEvidence.context}</p>
          <dl>
            <div><dt>媒介</dt><dd>{hoveredEvidence.medium}</dd></div>
            <div><dt>材料状态</dt><dd>{hoveredEvidence.status}</dd></div>
          </dl>
          <p className="evidence-tooltip__note">{hoveredEvidence.note}</p>
          <b>点击节点打开完整证据</b>
        </aside>}
        </div>
      </div>
      <div className="evidence-timeline__summary">
        <span><strong>{factualBySense.reduce((sum, row) => sum + row.evidence.length, 0)}</strong> 个真实材料节点</span>
        <span><strong>{story.senses.filter((sense) => sense.evidence.some((item) => item.status !== '语料事实' || item.year > 2025)).length}</strong> 个义项另有定义 / 解释材料</span>
        <p>节点年份来自材料本身；位置不表示首次出现，节点之间的空白也不等于当时没有使用。</p>
      </div>
      <p className="lens-note"><span>意义</span>{lensNotes.意义}</p>
    </div>
  );
}

function EvidenceAxis({
  story,
  selectedSense,
  selectedPeriod,
  onSelectSense,
  onSelectPeriod,
}: {
  story: WordStory;
  selectedSense: Sense;
  selectedPeriod: number;
  onSelectSense: (sense: Sense) => void;
  onSelectPeriod: (period: number) => void;
}) {
  const temporalEvidence = story.senses.flatMap((sense) => sense.evidence.filter((item) => item.status === '语料事实' && item.year <= 2025));
  const explanatoryEvidence = story.senses.flatMap((sense) => sense.evidence.filter((item) => item.status !== '语料事实' || item.year > 2025));

  return (
    <section className="lens-view" aria-labelledby="evidence-axis-title">
      <header className="axis-heading">
        <div><span>证据坐标</span><h2 id="evidence-axis-title">原句落在哪些年代？</h2></div>
        <p><b>X</b> 证据年代　<b>Y</b> 义项　<b>标记</b> 可回到出处的语料事实</p>
      </header>
      <div className="axis-scroll" tabIndex={0} aria-label="证据年代矩阵，可横向滚动">
        <div className="matrix-grid evidence-axis-grid">
          <div className="matrix-corner">义项 / 年代</div>
          {evidenceAxisColumns.map((period) => <div className="matrix-period" key={period}>{period.replace('—', '—\n')}</div>)}
          {story.senses.flatMap((sense) => [
            <button key={`${sense.id}-label`} className={`matrix-sense ${sense.id === selectedSense.id ? 'is-active' : ''}`} onClick={() => onSelectSense(sense)}>
              <i style={{ background: sense.color }} />{sense.shortName}
            </button>,
            ...evidenceAxisColumns.map((period, axisIndex) => {
              const isExplanation = axisIndex === evidenceAxisPeriods.length;
              const items = sense.evidence.filter((item) => isExplanation
                ? item.status !== '语料事实' || item.year > 2025
                : item.status === '语料事实' && item.year <= 2025 && evidenceAxisIndex(item.year) === axisIndex);
              const selectedAxis = selectedPeriod + 1;
              return (
                <div className={`matrix-cell ${selectedAxis === axisIndex && selectedSense.id === sense.id ? 'is-selected' : ''}`} key={`${sense.id}-${period}`}>
                  {items.length ? (
                    <button
                      className="evidence-mark"
                      style={{ borderColor: sense.color }}
                      aria-label={`${sense.name}，${period}，${items.length} 则原句：${items.map((item) => item.source).join('、')}`}
                      title={items.map((item) => `${item.grade}级 · ${item.source}`).join('\n')}
                      onClick={() => {
                        onSelectSense(sense);
                        if (!isExplanation) onSelectPeriod(axisIndex - 1);
                      }}
                    >
                      <strong>{items.length}</strong><small>{[...new Set(items.map((item) => item.grade))].join('/')}</small>
                    </button>
                  ) : <span className="matrix-empty" aria-label="暂无直接原句">—</span>}
                </div>
              );
            }),
          ])}
        </div>
      </div>
      <footer className="axis-summary">
        <span><strong>{temporalEvidence.length}</strong> 则可定位原句</span>
        <span><strong>{explanatoryEvidence.length}</strong> 则定义 / 研究解释</span>
        <p>A 原始页面 · B 数字全文 · C 聚合线索；空格表示当前材料未覆盖，不表示当时没有这种用法。</p>
      </footer>
      <p className="lens-note"><span>证据</span>{lensNotes.证据}</p>
    </section>
  );
}

const mediumGroups = ['文学古籍', '辞书工具', '学术教育', '制度文本', '报刊网络', '技术平台', '其他'] as const;
type MediumGroup = typeof mediumGroups[number];

function groupMedium(medium: string): MediumGroup {
  if (/古籍|经籍|經籍|史籍|诗|詩|词|詞|曲|文学|文學|古文|文集|小说|小說|散文|戏剧|戲劇|文化遗产|文化遺產/.test(medium)) return '文学古籍';
  if (/辞书|辭書|辞典|辭典|字典|词典|詞典|工具书|工具書/.test(medium)) return '辞书工具';
  if (/学术|學術|研究|期刊|教材|教育|讲座|講座|演讲|演講|论文|論文/.test(medium)) return '学术教育';
  if (/制度|法律|法规|政策|政府|标准|公报|公告|公共服务|公共宣传|机构|政论/.test(medium)) return '制度文本';
  if (/报刊|新闻|媒体|网络|社群|纪念|传播/.test(medium)) return '报刊网络';
  if (/技术|平台|产品|软件|应用|数字/.test(medium)) return '技术平台';
  return '其他';
}

function MediaAxis({ story, selectedSense, onSelectSense }: { story: WordStory; selectedSense: Sense; onSelectSense: (sense: Sense) => void }) {
  const rows = mediumGroups.map((group) => ({
    group,
    segments: story.senses.map((sense) => ({ sense, count: sense.evidence.filter((item) => groupMedium(item.medium) === group).length })),
  })).filter((row) => row.segments.some((segment) => segment.count));
  const maximum = Math.max(1, ...rows.map((row) => row.segments.reduce((sum, segment) => sum + segment.count, 0)));
  const total = story.senses.reduce((sum, sense) => sum + sense.evidence.length, 0);

  return (
    <section className="lens-view" aria-labelledby="media-axis-title">
      <header className="axis-heading">
        <div><span>媒介分布</span><h2 id="media-axis-title">这些判断来自什么文本？</h2></div>
        <p><b>X</b> 证据数量　<b>Y</b> 来源媒介　<b>色段</b> 所属义项</p>
      </header>
      <div className="bar-scale" aria-hidden="true"><span>0</span><span>{Math.ceil(maximum / 2)}</span><span>{maximum} 则</span></div>
      <div className="media-bars">
        {rows.map((row) => {
          const rowTotal = row.segments.reduce((sum, segment) => sum + segment.count, 0);
          return (
            <div className="media-row" key={row.group}>
              <strong>{row.group}</strong>
              <div className="media-track" aria-label={`${row.group}，共 ${rowTotal} 则`}>
                <div className="media-stack" style={{ width: `${(rowTotal / maximum) * 100}%` }}>
                  {row.segments.filter((segment) => segment.count).map(({ sense, count }) => (
                    <button
                      key={sense.id}
                      className={sense.id === selectedSense.id ? 'is-active' : ''}
                      style={{ background: sense.color, width: `${(count / rowTotal) * 100}%` }}
                      onClick={() => onSelectSense(sense)}
                      title={`${sense.shortName} · ${count} 则`}
                      aria-label={`${row.group}中的${sense.name}证据 ${count} 则`}
                    ><span>{count}</span></button>
                  ))}
                </div>
              </div>
              <span>{rowTotal} / {total}</span>
            </div>
          );
        })}
      </div>
      <div className="sense-legend" aria-label="义项颜色图例">
        {story.senses.map((sense) => <button key={sense.id} className={sense.id === selectedSense.id ? 'is-active' : ''} onClick={() => onSelectSense(sense)}><i style={{ background: sense.color }} />{sense.shortName}</button>)}
      </div>
      <p className="axis-caveat">媒介类别由每则证据的来源字段归并；它描述当前证据集的构成，不代表真实社会使用比例。</p>
      <p className="lens-note"><span>媒介</span>{lensNotes.媒介}</p>
    </section>
  );
}

function StabilityAxis({ story, selectedSense, onSelectSense }: { story: WordStory; selectedSense: Sense; onSelectSense: (sense: Sense) => void }) {
  return (
    <section className="lens-view" aria-labelledby="stability-axis-title">
      <header className="axis-heading">
        <div><span>证据稳定度</span><h2 id="stability-axis-title">哪些义项更经得住核查？</h2></div>
        <p><b>X</b> 稳定度 0–100%　<b>Y</b> 义项　<b>旁注</b> 原句、年代覆盖与等级</p>
      </header>
      <div className="stability-scale" aria-hidden="true"><span>待核证 0</span><span>50</span><span>较稳定 100%</span></div>
      <div className="stability-rows">
        {story.senses.map((sense) => {
          const { score, direct, periodCount } = evidenceStability(sense);
          const grades = { A: 0, B: 0, C: 0 };
          direct.forEach((item) => { grades[item.grade] += 1; });
          return (
            <button className={`stability-row ${sense.id === selectedSense.id ? 'is-active' : ''}`} key={sense.id} onClick={() => onSelectSense(sense)}>
              <span className="stability-name"><i style={{ background: sense.color }} />{sense.shortName}</span>
              <span className="stability-track"><i style={{ width: `${score}%`, background: sense.color }} /><b style={{ left: `${score}%` }}>{score}%</b></span>
              <span className="stability-meta"><b>{direct.length}</b> 原句 · <b>{periodCount}</b>/9 年代段 · A{grades.A} B{grades.B} C{grades.C}</span>
            </button>
          );
        })}
      </div>
      <p className="axis-caveat">稳定度是证据审计指标：原句数量 35% + 年代覆盖 25% + 证据等级 25% + 核验状态 15%；零原句记为 0%。它用于提示核证优先级，不是词频或统计置信区间。</p>
      <p className="lens-note"><span>稳定度</span>{lensNotes.稳定度}</p>
    </section>
  );
}

function DisputeAxis({
  story,
  selectedSense,
  selectedPeriod,
  onSelectSense,
  onSelectPeriod,
}: {
  story: WordStory;
  selectedSense: Sense;
  selectedPeriod: number;
  onSelectSense: (sense: Sense) => void;
  onSelectPeriod: (period: number) => void;
}) {
  const allEvidence = story.senses.flatMap((sense) => sense.evidence);
  const boundaryCount = allEvidence.filter((item) => item.isBoundary || item.reviewed === '有争议').length;
  const interpretationCount = allEvidence.filter((item) => item.status === '人文解释').length;
  const directCount = allEvidence.filter((item) => item.status === '语料事实' && item.year <= 2025).length;
  let gapCount = 0;

  return (
    <section className="lens-view" aria-labelledby="dispute-axis-title">
      <header className="axis-heading">
        <div><span>争议与缺口</span><h2 id="dispute-axis-title">哪里是事实，哪里仍是推断？</h2></div>
        <p><b>X</b> 年代　<b>Y</b> 义项　<b>格子</b> 当前判断状态</p>
      </header>
      <div className="axis-scroll" tabIndex={0} aria-label="争议与证据缺口矩阵，可横向滚动">
        <div className="matrix-grid dispute-axis-grid">
          <div className="matrix-corner">义项 / 年代</div>
          {evidenceAxisPeriods.map((period) => <div className="matrix-period" key={period}>{period.replace('—', '—\n')}</div>)}
          {story.senses.flatMap((sense) => [
            <button key={`${sense.id}-label`} className={`matrix-sense ${sense.id === selectedSense.id ? 'is-active' : ''}`} onClick={() => onSelectSense(sense)}><i style={{ background: sense.color }} />{sense.shortName}</button>,
            ...evidenceAxisPeriods.map((period, axisIndex) => {
              const items = sense.evidence.filter((item) => item.status === '语料事实' && item.year <= 2025 && evidenceAxisIndex(item.year) === axisIndex);
              const occupiedAxes = sense.evidence
                .filter((item) => item.status === '语料事实' && item.year <= 2025)
                .map((item) => evidenceAxisIndex(item.year));
              const firstOccupied = occupiedAxes.length ? Math.min(...occupiedAxes) : -1;
              const lastOccupied = occupiedAxes.length ? Math.max(...occupiedAxes) : -1;
              const boundary = items.some((item) => item.isBoundary || item.reviewed === '有争议');
              const gap = !items.length && axisIndex > firstOccupied && axisIndex < lastOccupied;
              if (gap) gapCount += 1;
              const state = boundary ? 'boundary' : items.length ? 'direct' : gap ? 'gap' : 'empty';
              const label = boundary ? `边界案例 ${items.length} 则` : items.length ? `直接证据 ${items.length} 则` : gap ? '两端有材料，但本阶段缺少直接原句' : '当前材料空白';
              return (
                <button
                  key={`${sense.id}-${period}`}
                  className={`dispute-cell dispute-cell--${state} ${selectedSense.id === sense.id && selectedPeriod + 1 === axisIndex ? 'is-selected' : ''}`}
                  onClick={() => { onSelectSense(sense); onSelectPeriod(axisIndex - 1); }}
                  aria-label={`${sense.name}，${period}，${label}`}
                  title={label}
                ><span>{boundary ? '边界' : items.length ? items.length : gap ? '缺证' : '空白'}</span></button>
              );
            }),
          ])}
        </div>
      </div>
      <div className="dispute-summary">
        <span><strong>{directCount}</strong> 直接原句</span><span><strong>{boundaryCount}</strong> 边界 / 有争议</span><span><strong>{interpretationCount}</strong> 人文解释</span><span><strong>{gapCount}</strong> 跨期缺证</span>
      </div>
      <div className="dispute-legend"><span className="is-direct">直接证据</span><span className="is-boundary">边界案例</span><span className="is-gap">跨期缺证</span><span className="is-empty">材料空白</span></div>
      <p className="lens-note"><span>争议</span>{lensNotes.争议}</p>
    </section>
  );
}

function LensVisualization({
  lens,
  story,
  selectedSense,
  selectedPeriod,
  onSelectSense,
  onSelectPeriod,
  onRead,
}: {
  lens: Lens;
  story: WordStory;
  selectedSense: Sense;
  selectedPeriod: number;
  onSelectSense: (sense: Sense) => void;
  onSelectPeriod: (period: number) => void;
  onRead: (evidence: Evidence) => void;
}) {
  if (lens === '意义') return <RiverChart story={story} selectedSense={selectedSense} onSelectSense={onSelectSense} onSelectPeriod={onSelectPeriod} onRead={onRead} />;
  if (lens === '证据') return <EvidenceAxis story={story} selectedSense={selectedSense} selectedPeriod={selectedPeriod} onSelectSense={onSelectSense} onSelectPeriod={onSelectPeriod} />;
  if (lens === '媒介') return <MediaAxis story={story} selectedSense={selectedSense} onSelectSense={onSelectSense} />;
  if (lens === '稳定度') return <StabilityAxis story={story} selectedSense={selectedSense} onSelectSense={onSelectSense} />;
  return <DisputeAxis story={story} selectedSense={selectedSense} selectedPeriod={selectedPeriod} onSelectSense={onSelectSense} onSelectPeriod={onSelectPeriod} />;
}

function GradeBadge({ grade }: { grade: Evidence['grade'] }) {
  const labels: Record<Evidence['grade'], string> = { A: '原始页面', B: '数字全文', C: '聚合线索' };
  return <span className={`grade grade--${grade}`} title={`证据 ${grade} 级：${labels[grade]}`}>{grade}</span>;
}

function ContributionPanel({ storageId, senseId, senseName, word }: { storageId: string; senseId: string; senseName: string; word: string }) {
  const storageKey = `passage-contributions:${storageId}:${senseId}`;
  const [contributions, setContributions] = useState<UserContribution[]>(() => readContributions(storageKey));
  const [excerpt, setExcerpt] = useState('');
  const [source, setSource] = useState('');
  const [year, setYear] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!excerpt.trim() || !source.trim()) {
      setStatus('请至少填写例句和出处。');
      return;
    }

    const contribution: UserContribution = {
      id: `${Date.now()}-${excerpt.trim().slice(0, 12)}`,
      excerpt: excerpt.trim(),
      source: source.trim(),
      year: year.trim(),
      note: note.trim(),
    };
    const next = [contribution, ...contributions];
    setContributions(next);
    writeContributions(storageKey, next);
    setExcerpt('');
    setSource('');
    setYear('');
    setNote('');
    setStatus('已保存到这台设备，等待后续人工核验。');
  }

  function removeContribution(id: string) {
    const next = contributions.filter((item) => item.id !== id);
    setContributions(next);
    writeContributions(storageKey, next);
    setStatus('已移除这条例子。');
  }

  return (
    <details className="contribution-panel">
      <summary>
        <span>提交你的例子</span>
        <small>辅助入口 · 非主线</small>
      </summary>
      <div className="contribution-panel__body">
        <p>如果你见过“{word}”作为“{senseName}”的真实用法，可以先记在这里。当前仅保存在本浏览器，不会自动进入研究结论。</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor={`contribution-excerpt-${senseId}`}>例句 <span>必填</span></label>
          <textarea id={`contribution-excerpt-${senseId}`} value={excerpt} onChange={(event) => setExcerpt(event.target.value)} rows={3} placeholder={`粘贴含有“${word}”的完整句子`} />
          <div className="contribution-panel__row">
            <div>
              <label htmlFor={`contribution-source-${senseId}`}>出处或链接 <span>必填</span></label>
              <input id={`contribution-source-${senseId}`} value={source} onChange={(event) => setSource(event.target.value)} placeholder="书名、报刊或网页地址" />
            </div>
            <div>
              <label htmlFor={`contribution-year-${senseId}`}>年代 <span>选填</span></label>
              <input id={`contribution-year-${senseId}`} value={year} onChange={(event) => setYear(event.target.value)} placeholder="如 1989 / 清末" />
            </div>
          </div>
          <label htmlFor={`contribution-note-${senseId}`}>为什么属于这个含义 <span>选填</span></label>
          <input id={`contribution-note-${senseId}`} value={note} onChange={(event) => setNote(event.target.value)} placeholder="补充上下文或你的判断" />
          <div className="contribution-panel__actions">
            <button type="submit">暂存例子</button>
            <span role="status" aria-live="polite">{status}</span>
          </div>
        </form>
        {contributions.length > 0 && (
          <div className="contribution-list">
            <strong>我的待核验例子 · {contributions.length}</strong>
            {contributions.map((item) => (
              <article key={item.id}>
                <q>{item.excerpt}</q>
                <small>{item.year ? `${item.year} · ` : ''}{item.source}</small>
                {item.note && <p>{item.note}</p>}
                <button type="button" onClick={() => removeContribution(item.id)}>移除</button>
              </article>
            ))}
          </div>
        )}
      </div>
    </details>
  );
}

function EvidencePanel({
  sense,
  period,
  onRead,
  isResearchDraft = false,
}: {
  sense: Sense;
  period: number;
  onRead: (evidence: Evidence) => void;
  isResearchDraft?: boolean;
}) {
  const stability = evidenceStability(sense);
  const periodLabel = period < 0 ? '1800 年前' : periods[period];
  return (
    <aside className="evidence-panel" id="evidence-panel" aria-live="polite">
      <div className="evidence-panel__topline">
        <span className="folio">当前聚焦</span>
        <span className="confidence"><i style={{ width: `${stability.score}%` }} /> {stability.score}% 证据稳定度</span>
      </div>
      <p className="evidence-panel__period">当前年代窗口：{periodLabel} · 下列为该义项全部材料</p>
      <h2>{sense.name}</h2>
      <p className="evidence-panel__description">{sense.description}</p>
      <dl className="sense-meta">
        <div><dt>稳定阶段</dt><dd>{sense.firstStable}</dd></div>
        <div><dt>解释状态</dt><dd><span className="status-dot status-dot--interpretation" />{isResearchDraft ? '待核证假设' : '人文解释'}</dd></div>
      </dl>
      <div className="source-mix">
        <div className="source-mix__heading"><strong>{isResearchDraft ? '建议优先检索' : '主要媒介'}</strong><span>{isResearchDraft ? '研究路径' : '悬停查看构成'}</span></div>
        <div className="source-mix__bar">
          {sense.media.map((medium) => <i key={medium.name} style={{ width: `${medium.value}%` }} title={`${medium.name} ${medium.value}%`} />)}
        </div>
        <div className="source-mix__labels">{sense.media.map((medium) => <span key={medium.name}>{medium.name}</span>)}</div>
      </div>
      <div className="evidence-list">
        <div className="evidence-list__heading"><strong>核验实例</strong><span>{sense.evidence.length ? `${sense.evidence.length} 则 · 可回到出处` : '待补文本锚点'}</span></div>
        {sense.evidence.length === 0 && (
          <div className="evidence-empty">
            <span>0 / 待核证</span>
            <p>暂无可回到原句的材料。这个候选不会被当作已证实词义；可在下方暂存你找到的真实例句。</p>
          </div>
        )}
        {sense.evidence.map((evidence) => (
          <button className={`evidence-card ${evidence.isBoundary ? 'evidence-card--boundary' : ''}`} key={evidence.id} onClick={() => onRead(evidence)}>
            <span className="evidence-card__meta"><GradeBadge grade={evidence.grade} /> {evidence.dateLabel ?? evidence.year} · {evidence.medium} · {evidence.reviewed}</span>
            <q>{evidence.excerpt}</q>
            <span className="evidence-card__source">{evidence.source} <i>查看证据 ↗</i></span>
          </button>
        ))}
      </div>
      <button className="challenge-button"><span>!</span> 我不同意这个分类</button>
    </aside>
  );
}

function Reader({ evidence, word, sense, onClose }: { evidence: Evidence; word: string; sense: Sense; onClose: () => void }) {
  const contextParts = evidence.context.split(word);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="reader" role="dialog" aria-modal="true" aria-labelledby="reader-title">
      <div className="reader__header">
        <button className="reader__back" onClick={onClose}>← 返回材料时间轴</button>
        <span>证据阅读模式</span>
        <button className="reader__close" onClick={onClose} aria-label="关闭阅读器">×</button>
      </div>
      <div className="reader__masthead">
        <span className="folio">原文 / {evidence.dateLabel ?? evidence.year}</span>
        <h2 id="reader-title">{evidence.source}</h2>
        <p>短引文与语义判断已核对公开来源；页面年代不等于词义首次出现年代，争议处会单独标明。</p>
      </div>
      <div className="reader__columns">
        <section className="scan-placeholder" aria-label={`${evidence.grade} 级证据的页面预览说明`}>
          <div className="scan-page">
            <span>原始扫描</span>
            <p>詞渡史料演示頁</p>
            <i /> <i /> <i /> <i /> <i /> <i /> <i />
            <strong>{word}</strong>
          </div>
          <small>{evidence.grade === 'A' ? 'A 级原始页面：点击右侧链接核对' : evidence.grade === 'B' ? 'B 级数字全文：保留语料路径与记录号' : 'C 级聚合线索：需继续追到原始页面'}</small>
        </section>
        <article className="transcript">
          <span className="column-label">校订文本</span>
          <h3>{evidence.excerpt}</h3>
          <p>{contextParts.map((part, index) => <span key={`${part}-${index}`}>{part}{index < contextParts.length - 1 && <mark>{word}</mark>}</span>)}</p>
          <div className="transcript__source"><span>{evidence.dateLabel ?? evidence.year}</span><span>{evidence.medium}</span><span>{evidence.source}</span></div>
          <a className="source-link" href={evidence.sourceUrl} target="_blank" rel="noreferrer">打开公开出处 ↗</a>
        </article>
        <aside className="annotation">
          <span className="column-label">轻量标注</span>
          <div className="annotation__sense" style={{ borderColor: sense.color }}>
            <small>候选含义</small><strong>{sense.name}</strong><p>{sense.description}</p>
          </div>
          <dl>
            <div><dt>证据等级</dt><dd><GradeBadge grade={evidence.grade} /> {evidence.grade} 级</dd></div>
            <div><dt>判断类型</dt><dd>{evidence.status}</dd></div>
            <div><dt>核验状态</dt><dd>{evidence.reviewed}</dd></div>
          </dl>
          <div className="annotation__note"><strong>{evidence.isBoundary ? '边界提醒' : '编者注'}</strong><p>{evidence.note}</p></div>
          <button>提出另一种解释</button>
        </aside>
      </div>
    </div>
  );
}

function ComparePanel({ story, onClose }: { story: WordStory; onClose: () => void }) {
  const [early, setEarly] = useState(2);
  const [late, setLate] = useState(7);
  const evidenceInPeriod = (sense: Sense, period: number) => sense.evidence.filter((item) => item.status === '语料事实' && item.year >= 1800 && item.year <= 2025 && evidencePeriodIndex(item.year) === period);
  const earlySenses = story.senses.filter((sense) => evidenceInPeriod(sense, early).length > 0);
  const lateSenses = story.senses.filter((sense) => evidenceInPeriod(sense, late).length > 0);
  const persistent = earlySenses.filter((sense) => lateSenses.some((lateSense) => lateSense.id === sense.id));
  const earlyOnly = earlySenses.filter((sense) => !persistent.some((item) => item.id === sense.id));
  const lateOnly = lateSenses.filter((sense) => !persistent.some((item) => item.id === sense.id));

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const renderSense = (sense: Sense, period: number) => (
    <article className="compare-sense" key={sense.id} style={{ borderTopColor: sense.color }}>
      <strong>{sense.name}</strong><p>{sense.description}</p>
      <small>{evidenceInPeriod(sense, period).length} 则真实材料 · {evidenceInPeriod(sense, period).map((item) => item.year).join('、')}</small>
    </article>
  );

  return (
    <section className="compare-panel" role="dialog" aria-modal="true" aria-labelledby="compare-title">
      <div className="compare-panel__header">
        <div><span className="folio">年代聚焦</span><h2 id="compare-title">什么改变了，什么留下来？</h2></div>
        <button onClick={onClose}>关闭对比 ×</button>
      </div>
      <div className="compare-selectors">
        <label>早期<select value={early} onChange={(event) => setEarly(Number(event.target.value))}>{periods.map((period, index) => <option value={index} key={period}>{period}</option>)}</select></label>
        <span>↔</span>
        <label>后期<select value={late} onChange={(event) => setLate(Number(event.target.value))}>{periods.map((period, index) => <option value={index} key={period}>{period}</option>)}</select></label>
      </div>
      <div className="compare-columns">
        <div><span className="compare-columns__label">只在早期有材料</span><h3>{periods[early]}</h3>{earlyOnly.length ? earlyOnly.map((sense) => renderSense(sense, early)) : <p className="empty-note">当前证据集没有只落在早期的义项。</p>}</div>
        <div className="compare-columns__persistent"><span className="compare-columns__label">两期均有材料</span><h3>跨期可见的义项</h3>{persistent.length ? persistent.map((sense) => renderSense(sense, late)) : <p className="empty-note">当前证据集没有同时覆盖两个时期的义项。</p>}</div>
        <div><span className="compare-columns__label">只在后期有材料</span><h3>{periods[late]}</h3>{lateOnly.length ? lateOnly.map((sense) => renderSense(sense, late)) : <p className="empty-note">当前证据集没有只落在后期的义项。</p>}</div>
      </div>
      <p className="compare-caveat">比较只使用带年份的真实材料。缺少记录不等于没有使用，两期都有材料也不证明用法持续不断。</p>
    </section>
  );
}

function StoryPage({ story, onHome, onLiterary, onSwitchStory }: { story: WordStory; onHome: () => void; onLiterary: () => void; onSwitchStory: (id: string) => void }) {
  const [lens, setLens] = useState<Lens>('意义');
  const [selectedSenseId, setSelectedSenseId] = useState(() => defaultStorySense(story).id);
  const [selectedPeriod, setSelectedPeriod] = useState(() => firstEvidencePeriod(defaultStorySense(story)));
  const [reading, setReading] = useState<Evidence | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const selectedSense = story.senses.find((sense) => sense.id === selectedSenseId) ?? story.senses[0]!;
  const isResearchDraft = story.maturity === 'research';
  const themeStories = allStories.filter((item) => item.topic === story.topic);

  useEffect(() => {
    const firstSenseWithMaterial = defaultStorySense(story);
    setSelectedSenseId(firstSenseWithMaterial.id);
    setSelectedPeriod(firstEvidencePeriod(firstSenseWithMaterial));
    setLens('意义');
    setReading(null);
    setShowCompare(false);
  }, [story.id]);

  function selectSense(sense: Sense) {
    setSelectedSenseId(sense.id);
    setSelectedPeriod(firstEvidencePeriod(sense));
  }

  return (
    <>
      <a className="skip-link" href="#story-main">跳到真实材料时间轴</a>
      <div className="paper-grain" aria-hidden="true" />
      <SiteHeader onHome={onHome} onLiterary={onLiterary} compact />
      <main className={`story-page${isResearchDraft ? ' story-page--research' : ''}`} id="story-main">
        <header className="story-intro">
          <button className="back-link" onClick={onHome}>← 策展词集</button>
          <div className="story-intro__title">
            <div><span className="folio">词义生命史 / {allStories.findIndex((item) => item.id === story.id) + 1} / 188</span><h1>{story.word}</h1></div>
            <div><p className="story-intro__english">{story.english}</p><span className={`story-maturity ${isResearchDraft ? 'is-research' : 'is-verified'}`}>{isResearchDraft ? '深度词条 · 待核证' : '精校深度词条'}</span><p>{story.intro}</p></div>
            <div className="story-intro__range"><span>主要分析区间</span><strong>1800—2025</strong><small>另含古典前史</small></div>
          </div>
          <div className="story-switcher" aria-label="切换词语">
            <span>{story.topic}</span>
            {themeStories.map((item) => <button key={item.id} className={item.id === story.id ? 'is-active' : ''} onClick={() => onSwitchStory(item.id)}>{item.word}</button>)}
          </div>
        </header>

        <section className="story-workspace" aria-label={`${story.word}的真实材料时间轴与证据`}>
          <div className="story-main">
            <div className="workspace-toolbar">
              <div className="lens-tabs" role="tablist" aria-label="观察视角">
                {lenses.map((item) => <button id={`lens-tab-${item}`} aria-controls="lens-panel" key={item} role="tab" aria-selected={lens === item} className={lens === item ? 'is-active' : ''} onClick={() => setLens(item)}>{item}</button>)}
              </div>
              <div className="workspace-actions">
                <button className="example-jump" onClick={() => document.getElementById('evidence-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>{selectedSense.evidence.length ? `查看 ${selectedSense.evidence.length} 则例证` : '核验证据空白'} <span>↓</span></button>
                <button className="compare-trigger" onClick={() => setShowCompare(true)}>对比两个年代 <span>⇄</span></button>
              </div>
            </div>
            <div id="lens-panel" role="tabpanel" aria-labelledby={`lens-tab-${lens}`}>
              <LensVisualization lens={lens} story={story} selectedSense={selectedSense} selectedPeriod={selectedPeriod} onSelectSense={selectSense} onSelectPeriod={setSelectedPeriod} onRead={setReading} />
            </div>
          </div>
          <EvidencePanel sense={selectedSense} period={selectedPeriod} onRead={setReading} isResearchDraft={isResearchDraft} />
        </section>

        <section className="contribution-shelf" aria-label="用户例子暂存">
          <ContributionPanel key={`${story.id}-${selectedSense.id}`} storageId={story.id} senseId={selectedSense.id} senseName={selectedSense.name} word={story.word} />
        </section>

        <section className="story-footnote">
          <div><span className="status-dot status-dot--fact" /><strong>语料事实</strong><p>可直接核查的文本、年份与来源。</p></div>
          <div><span className="status-dot status-dot--calculation" /><strong>计算结果</strong><p>义项聚类、材料对齐与编辑稳定度。</p></div>
          <div><span className="status-dot status-dot--interpretation" /><strong>人文解释</strong><p>研究者可修订的命名与历史叙事。</p></div>
          <p>{isResearchDraft ? '时间轴节点全部来自带年份的真实材料；没有原句的时期不会生成节点，空白也不等于当时没有使用。' : '实例均链接公开出处；节点位置来自材料年份，媒介比例与稳定度仍是编辑指标，不代表完整语料统计。'}</p>
        </section>
      </main>
      {reading && <Reader evidence={reading} word={story.word} sense={selectedSense} onClose={() => setReading(null)} />}
      {showCompare && <div className="overlay"><ComparePanel story={story} onClose={() => setShowCompare(false)} /></div>}
    </>
  );
}

const researchPeriodsByEra: Record<CatalogEra, readonly [string, string, string, string]> = {
  古典延续: ['古典前史', '1840—1919', '1919—2000', '2000—2025'],
  近代转折: ['1800 年以前', '1840—1895', '1895—1949', '1949—2025'],
  现代形成: ['1800—1919', '1919—1949', '1949—2000', '2000—2025'],
  数字时代: ['1800—1978', '1978—2000', '2000—2012', '2012—2025'],
};

const researchFocusByMechanism: Record<CatalogMechanism, { turn: string; sources: string }> = {
  翻译进入: { turn: '比较译名竞争与旧词新义', sources: '译著、报刊、辞书与教科书' },
  身份建构: { turn: '辨认称谓何时成为可认领的身份', sources: '组织文本、文学、报刊与口述材料' },
  政治重释: { turn: '区分公共语境中的新释与日常旧义', sources: '法律、制度文本、报刊与日常记录' },
  制度迁移: { turn: '追踪制度名词如何进入日常关系', sources: '法规、合同、报刊与生活记录' },
  媒介塑形: { turn: '观察新媒介是否改变语气、速度与使用者', sources: '报刊、广播电视、出版物与网络文本' },
  知识日常化: { turn: '核对专业含义在公众使用中如何放宽', sources: '学科文献、教材、科普与大众媒体' },
  价值变迁: { turn: '比较同一个词在不同人群中的评价方向', sources: '文学、报刊、评论与生活记录' },
  隐喻扩展: { turn: '区分字面义、惯用搭配与新的抽象用法', sources: '文学、报刊、辞书与口语语料' },
  技术迁移: { turn: '检查技术语汇是否迁移到人际与组织语境', sources: '技术文档、科普、报刊与日常表达' },
  平台再造: { turn: '分析平台机制如何重排词的可见度与边界', sources: '产品界面、平台规则、网络语料与当代辞书' },
};

function buildCatalogResearchTimeline(entry: CatalogWord, theme: CatalogTheme): LiteraryTimeline {
  const periods = researchPeriodsByEra[entry.era];
  const focus = researchFocusByMechanism[entry.mechanism];

  return {
    word: entry.word,
    heading: `“${entry.word}”的四段追踪路线`,
    caveat: `这是待核证的研究时间轴，不是已完成的词源结论。时段暂按“${entry.era}”组织；找到可回到原句的证据后，节点才会升级为文本锚点或语义转折。`,
    stages: [
      {
        period: periods[0],
        title: '确认早期词形与语境',
        description: `先检查“${entry.word}”的早期词形、搭配和使用者，判断它是旧词延续、同形异义，还是后起新词。`,
        status: '研究节点',
      },
      {
        period: periods[1],
        title: `定位“${entry.mechanism}”的窗口`,
        description: `围绕${focus.sources}展开检索，重点${focus.turn}。这个时段是策展线索，尚不等于确定的“首见年”。`,
        status: '研究节点',
      },
      {
        period: periods[2],
        title: '比较扩散与意义分化',
        description: `比较不同媒介和使用者中的“${entry.word}”，检查新用法是否稳定，以及它是否与旧义长期并存。`,
        status: '研究节点',
      },
      {
        period: periods[3],
        title: '核验当代用法与边界',
        description: `在“${theme.title}”的主题中检查当代实例，区分语义变化、流行搭配和短期热度，避免把使用增加直接写成新义诞生。`,
        status: '研究节点',
      },
    ],
  };
}

function WordHistoryTimeline({ timeline, provisional = false }: { timeline: LiteraryTimeline; provisional?: boolean }) {
  return (
    <section className={`word-history${provisional ? ' word-history--research' : ''}`} aria-labelledby="word-history-heading">
      <div className="word-history__heading">
        <span className="folio">{provisional ? '研究时间轴' : '名篇词史'} / 01—04</span>
        <h2 id="word-history-heading">{timeline.heading}</h2>
        <p>{timeline.caveat}</p>
        {provisional && <div className="word-history__legend"><span aria-hidden="true" />虚线 = 待核证的研究节点</div>}
      </div>
      <ol className="word-history__timeline">
        {timeline.stages.map((stage, index) => (
          <li key={`${stage.period}-${stage.title}`}>
            <div className="word-history__rail" aria-hidden="true"><span>{String(index + 1).padStart(2, '0')}</span><i /></div>
            <div className="word-history__period">{stage.period}<small className={`timeline-status timeline-status--${stage.status}`}>{stage.status}</small></div>
            <div><h3>{stage.title}</h3><p>{stage.description}</p></div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function CatalogEntryPage({ entry, onHome, onLiterary, onBack, backLabel, onOpenWord }: { entry: CatalogWord; onHome: () => void; onLiterary: () => void; onBack: () => void; backLabel: string; onOpenWord: (entry: CatalogWord) => void }) {
  const theme = getCatalogTheme(entry.themeId);
  const companions = catalogWords.filter((item) => item.themeId === entry.themeId && item.id !== entry.id).slice(0, 8);
  const literaryTimeline = getLiteraryTimeline(entry.word);
  const entryTimeline = literaryTimeline ?? buildCatalogResearchTimeline(entry, theme);

  return (
    <>
      <a className="skip-link" href="#catalog-entry-main">跳到词条线索</a>
      <div className="paper-grain" aria-hidden="true" />
      <SiteHeader onHome={onHome} onLiterary={onLiterary} compact />
      <main className="catalog-entry" id="catalog-entry-main">
        <header className="catalog-entry__hero">
          <button className="back-link" onClick={onBack}>← {backLabel}</button>
          <div className="catalog-entry__title">
            <div>
              <span className="folio">策展索引 / {theme.index}.{entry.id.slice(-2)}</span>
              <h1>{entry.word}</h1>
            </div>
            <div className="catalog-entry__question">
              <span>{theme.title}</span>
              <p>{entry.question}</p>
            </div>
          </div>
          <dl className="catalog-entry__meta">
            <div><dt>变化机制</dt><dd>{entry.mechanism}</dd></div>
            <div><dt>主要转折</dt><dd>{entry.era}</dd></div>
            <div><dt>研究状态</dt><dd>{entry.status}</dd></div>
            <div><dt>主题位置</dt><dd>{theme.index} / 10</dd></div>
          </dl>
        </header>

        <section className="catalog-entry__status" aria-labelledby="research-status-heading">
          <div>
            <span className="folio">研究状态</span>
            <h2 id="research-status-heading">先开放问题，<br />不提前制造答案。</h2>
          </div>
          <div>
            <p>这个页面是策展索引，表示“{entry.word}”已经被纳入研究路线，但尚未完成语料审计、意义聚类与来源复核。</p>
            <p>下方河流与四段时间轴标示建议追踪的变化结构，不代表词频统计；虚线节点也不会把推测写成历史事实。</p>
            <MiniRiver pattern={entry.pattern} />
          </div>
        </section>

        <WordHistoryTimeline timeline={entryTimeline} provisional={!literaryTimeline} />

        <section className="research-questions" aria-labelledby="research-questions-heading">
          <div className="research-questions__heading">
            <span className="folio">待核验问题 / 01—03</span>
            <h2 id="research-questions-heading">下一步查什么</h2>
          </div>
          <ol>
            <li><span>01</span><strong>寻找最早的稳定用法</strong><p>先区分偶然出现与持续使用，再判断“{entry.word}”的早期边界。</p></li>
            <li><span>02</span><strong>定位意义转折的媒介</strong><p>比较报刊、制度文本、文学与网络文本，确认新义由谁推动、在何处扩散。</p></li>
            <li><span>03</span><strong>保留并存与异议</strong><p>检查旧义是否仍在特定社群中活跃，避免把复杂历史画成一条直线。</p></li>
          </ol>
        </section>

        <section className="theme-dossier" aria-labelledby="theme-dossier-heading">
          <div>
            <span className="folio">所属航线 / {theme.index}</span>
            <h2 id="theme-dossier-heading">{theme.title}</h2>
            <p className="theme-dossier__subtitle">{theme.subtitle}</p>
          </div>
          <div>
            <p>{theme.description}</p>
            <blockquote>{theme.selectionNote}</blockquote>
            <div className="companion-words" aria-label="同主题的其他词">
              {companions.map((item) => <button type="button" key={item.id} onClick={() => onOpenWord(item)}>{item.word}<span>↗</span></button>)}
            </div>
          </div>
        </section>

        <section className="catalog-entry__contribution" aria-label="用户例子暂存">
          <ContributionPanel storageId={`catalog-${entry.id}`} senseId="unclassified" senseName="尚待归类的历史或当代用法" word={entry.word} />
        </section>
      </main>
      <footer className="site-footer">
        <span>词渡 · Passage of Meaning</span>
        <p>索引开放 · 证据待核 · 欢迎贡献线索</p>
        <span>188 词策展版</span>
      </footer>
    </>
  );
}

export function App() {
  const [page, setPage] = useState<Page>({ kind: 'home' });

  function openStory(storyId: string, from: 'home' | 'literary' = 'home') {
    setPage({ kind: 'story', storyId, from });
    window.scrollTo({ top: 0 });
  }

  function openWord(entry: CatalogWord, from: 'home' | 'literary' = 'home') {
    const story = allStories.find((item) => item.word === entry.word) ?? allStories[0]!;
    setPage({ kind: 'story', storyId: story.id, from });
    window.scrollTo({ top: 0 });
  }

  const goHome = () => setPage({ kind: 'home' });
  const goLiterary = () => setPage({ kind: 'literary' });

  if (page.kind === 'literary') {
    return <LiteraryPage onHome={goHome} onOpenWord={(entry) => openWord(entry, 'literary')} />;
  }

  if (page.kind === 'story') {
    return <StoryPage key={page.storyId} story={getStory(page.storyId)} onHome={goHome} onLiterary={goLiterary} onSwitchStory={(storyId) => openStory(storyId, page.from)} />;
  }

  return <HomePage onOpenWord={(entry) => openWord(entry, 'home')} onOpenLiterary={goLiterary} />;
}
