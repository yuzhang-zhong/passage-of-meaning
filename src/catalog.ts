import type { WordStory } from './data';

export type CatalogMechanism =
  | '翻译进入'
  | '身份建构'
  | '政治重释'
  | '制度迁移'
  | '媒介塑形'
  | '知识日常化'
  | '价值变迁'
  | '隐喻扩展'
  | '技术迁移'
  | '平台再造';

export type CatalogEra = '古典延续' | '近代转折' | '现代形成' | '数字时代';

export interface CatalogTheme {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  description: string;
  selectionNote: string;
  defaultMechanism: CatalogMechanism;
  defaultEra: CatalogEra;
  words: readonly string[];
}

export interface CatalogWord {
  id: string;
  word: string;
  themeId: string;
  mechanism: CatalogMechanism;
  era: CatalogEra;
  pattern: WordStory['pattern'];
  question: string;
  status: '精校深度词条' | '深度词条·待核证';
}

const themeSeeds: readonly CatalogTheme[] = [
  {
    id: 'translated-concepts', index: '01', title: '概念来到中国', subtitle: '翻译不是搬运，而是重新安置',
    description: '近代以来，一批旧字词被用来承接新的知识与制度概念；它们在争论中才逐渐变得“理所当然”。',
    selectionNote: '优先保留能够呈现译名竞争、旧词新义与概念本土化的节点词。',
    defaultMechanism: '翻译进入', defaultEra: '近代转折',
    words: ['文明', '科学', '自由', '浪漫', '民主', '哲学', '艺术', '美学', '逻辑', '社会', '文化', '宗教', '革命', '进化', '经济', '权利', '义务', '个人', '现代', '世界'],
  },
  {
    id: 'social-identities', index: '02', title: '人如何成为身份', subtitle: '称谓会组织群体，也会划出边界',
    description: '年龄、职业、政治位置与媒介角色进入称谓后，一个普通名词便可能成为可认领、可动员的身份。',
    selectionNote: '避免罗列近义人群词，只保留形成过独特制度位置或公共身份的称谓。',
    defaultMechanism: '身份建构', defaultEra: '现代形成',
    words: ['青年', '女性', '同志', '人民', '儿童', '少年', '工人', '农民', '学生', '知识分子', '公民', '国民', '消费者', '用户', '网民', '同胞', '群众', '主体'],
  },
  {
    id: 'public-life', index: '03', title: '国家与公共生活', subtitle: '抽象名词进入制度，制度又改写日常',
    description: '公共生活中的高频词往往同时存在于法律、组织与口语；不同场域给同一词施加了不同重量。',
    selectionNote: '挑选在组织称谓、法律语言与公共修辞之间发生过明显迁移的词。',
    defaultMechanism: '政治重释', defaultEra: '现代形成',
    words: ['国家', '政治', '政府', '党', '组织', '单位', '机关', '干部', '领导', '代表', '法律', '宪法', '秩序', '公共', '社会主义', '民族', '中华', '独立', '解放', '建设'],
  },
  {
    id: 'market-life', index: '04', title: '市场进入日常', subtitle: '经济语言也在描述人的关系',
    description: '市场、职业与商业词汇不只记录交易，也逐渐成为衡量选择、声誉与未来的日常语言。',
    selectionNote: '兼顾制度词、职业词与消费文化词，减少同一商业链条中的细碎近义项。',
    defaultMechanism: '制度迁移', defaultEra: '现代形成',
    words: ['市场', '商品', '资本', '劳动', '职业', '经理', '公司', '企业', '工资', '收入', '消费', '服务', '品牌', '广告', '信用', '投资', '风险', '创业'],
  },
  {
    id: 'media-language', index: '05', title: '媒介塑造表达', subtitle: '一种用法常由一种媒介推着走',
    description: '报刊、广播、电视与直播改变了谁能发言、谁被看见，也改变了词的速度、口吻和边界。',
    selectionNote: '按生产、传播、接收三个位置选词，避免只收集媒介载体名称。',
    defaultMechanism: '媒介塑形', defaultEra: '现代形成',
    words: ['新闻', '报纸', '杂志', '出版', '读者', '作者', '记者', '编辑', '传播', '宣传', '舆论', '话语', '文本', '直播', '节目', '频道', '主播', '影像'],
  },
  {
    id: 'knowledge-life', index: '06', title: '知识进入常识', subtitle: '专业术语离开学科之后发生了什么',
    description: '科学与学术词汇被教育、政策和大众媒体反复转述后，会产生比原学科更宽或更模糊的日常意义。',
    selectionNote: '选择跨越专业语境与公共表达的基础词，避免堆叠过窄的学科术语。',
    defaultMechanism: '知识日常化', defaultEra: '近代转折',
    words: ['自然', '物理', '化学', '生物', '地理', '历史', '数学', '统计', '实验', '理论', '系统', '模型', '数据', '信息', '基因', '能量', '生态', '环境'],
  },
  {
    id: 'self-and-feeling', index: '07', title: '身体、情感与自我', subtitle: '私密经验也有它的公共历史',
    description: '身体、关系与情绪看似个人，却不断被医学、教育、消费文化和网络表达重新命名。',
    selectionNote: '覆盖身体、亲密关系与情绪三条线，主动剔除只在语气上相近的情绪词。',
    defaultMechanism: '价值变迁', defaultEra: '现代形成',
    words: ['身体', '健康', '卫生', '精神', '心理', '情感', '爱情', '隐私', '婚姻', '家庭', '亲密', '性', '性别', '美', '时尚', '青春', '焦虑', '压力', '幸福', '生活'],
  },
  {
    id: 'space-and-mobility', index: '08', title: '城市、空间与流动', subtitle: '地方词经常被借来理解社会',
    description: '从街道、广场到边界、中心，空间词既指向可到达的地方，也参与描述权力、关系与归属。',
    selectionNote: '在实体空间、空间隐喻与人口流动之间保持平衡，不把城市设施做成名词清单。',
    defaultMechanism: '隐喻扩展', defaultEra: '现代形成',
    words: ['城市', '乡村', '社区', '街道', '广场', '公园', '空间', '地方', '地图', '边界', '中心', '舞台', '交通', '旅行', '移民', '流动', '风景', '家园'],
  },
  {
    id: 'technical-metaphors', index: '09', title: '旧词进入技术生活', subtitle: '新系统常借旧世界来解释自己',
    description: '技术语言大量借用空间、器物与生物词；隐喻被界面固化后，人们很快忘记它曾经是比喻。',
    selectionNote: '只保留具有清晰旧义、且在技术系统中形成稳定新义的词。',
    defaultMechanism: '技术迁移', defaultEra: '数字时代',
    words: ['网络', '平台', '流量', '窗口', '桌面', '文件', '目录', '地址', '端口', '接口', '终端', '云', '计算', '程序', '代码', '机器', '智能', '算法', '病毒', '引擎'],
  },
  {
    id: 'platform-culture', index: '10', title: '平台社会的新语义', subtitle: '动作、指标与身份被界面重新定义',
    description: '社交平台把普通动词做成按钮，把关系做成数字，也让一批词在极短时间内获得新的公共含义。',
    selectionNote: '覆盖行为、身份、内容与界面四类变化，减少同类网络流行语的重复。',
    defaultMechanism: '平台再造', defaultEra: '数字时代',
    words: ['粉丝', '关注', '点赞', '转发', '分享', '订阅', '热搜', '话题', '标签', '围观', '社群', '博主', '账号', '内容', '弹幕', '表情', '头像', '朋友圈'],
  },
] as const;

const deepWords = new Set(['文明', '同志', '平台', '粉丝']);

const patternByMechanism: Record<CatalogMechanism, WordStory['pattern']> = {
  翻译进入: 'branch',
  身份建构: 'coexist',
  政治重释: 'revival',
  制度迁移: 'branch',
  媒介塑形: 'surge',
  知识日常化: 'branch',
  价值变迁: 'coexist',
  隐喻扩展: 'branch',
  技术迁移: 'surge',
  平台再造: 'surge',
};

const mechanismOverrides: Readonly<Record<string, CatalogMechanism>> = {
  浪漫: '价值变迁', 同志: '身份建构', 平台: '技术迁移', 粉丝: '平台再造',
  单位: '制度迁移', 领导: '身份建构', 代表: '身份建构', 公共: '翻译进入',
  风险: '知识日常化', 信用: '价值变迁', 舞台: '隐喻扩展', 云: '技术迁移',
  病毒: '技术迁移', 内容: '平台再造', 表情: '平台再造', 朋友圈: '平台再造',
};

const eraOverrides: Readonly<Record<string, CatalogEra>> = {
  同胞: '古典延续', 中华: '古典延续', 自然: '古典延续', 历史: '古典延续',
  身体: '古典延续', 精神: '古典延续', 家庭: '古典延续', 美: '古典延续',
  地方: '古典延续', 中心: '古典延续', 舞台: '古典延续', 风景: '古典延续', 家园: '古典延续',
  用户: '数字时代', 网民: '数字时代', 数据: '数字时代', 信息: '数字时代', 直播: '数字时代',
};

const featuredQuestions: Readonly<Record<string, string>> = {
  文明: '它如何从古典教化语汇，变成衡量国家、社会与日常行为的现代尺度？',
  科学: '“格致”“赛先生”与“科学”之间，哪些竞争被今天的常识遮住了？',
  自由: '这个古已有之的词，如何承接权利、意志与生活方式等不同现代概念？',
  浪漫: '它从译名、文学气质到日常情感修辞，经历了哪些媒介转换？',
  青年: '年龄称谓在何时成为一种可被动员、也可自我认领的社会身份？',
  女性: '“女性”何时超出性别说明，进入权利、劳动与主体性的公共讨论？',
  同志: '政治称谓、一般称呼与社群身份如何长期并存，而非线性交接？',
  人民: '谁被“人民”包含、谁被排除，这个边界如何随制度与修辞变化？',
  网络: '它如何从交织结构转为通信系统，再进入关系与权力的日常隐喻？',
  平台: '实体平面、组织舞台与数字基础设施之间，哪些旧义仍在支撑新义？',
  流量: '物理量、通信指标与注意力价值如何在同一词中接续又分离？',
  粉丝: '食物名称、音译身份与可计量受众为何能够以同一词形并存？',
};

const questionTemplates: Record<CatalogMechanism, (word: string) => string> = {
  翻译进入: (word) => `“${word}”在承接现代概念时，旧有用法改变了多少，又保留了多少？`,
  身份建构: (word) => `“${word}”何时从一种描述，变成可以认领、动员或拒绝的身份？`,
  政治重释: (word) => `制度、政治修辞与日常语言，如何分别规定“${word}”的边界？`,
  制度迁移: (word) => `“${word}”从专业或制度语境进入日常后，增加了哪些价值判断？`,
  媒介塑形: (word) => `媒介形态的变化，如何改写“${word}”的使用者、速度与语气？`,
  知识日常化: (word) => `“${word}”离开专业语境后，哪些含义被放大，哪些精度被舍弃？`,
  价值变迁: (word) => `围绕“${word}”的褒贬、规范与私人经验，何时发生了明显转向？`,
  隐喻扩展: (word) => `“${word}”怎样从具体对象扩展为理解关系、秩序或经验的隐喻？`,
  技术迁移: (word) => `技术系统借用“${word}”时，保留了旧世界的哪些结构想象？`,
  平台再造: (word) => `当“${word}”被做成界面动作、指标或身份后，它还意味着原来的事吗？`,
};

export const catalogThemes = themeSeeds;

export const catalogWords: readonly CatalogWord[] = themeSeeds.flatMap((theme) =>
  theme.words.map((word, index) => {
    const mechanism = mechanismOverrides[word] ?? theme.defaultMechanism;
    return {
      id: `${theme.id}-${String(index + 1).padStart(2, '0')}`,
      word,
      themeId: theme.id,
      mechanism,
      era: eraOverrides[word] ?? theme.defaultEra,
      pattern: patternByMechanism[mechanism],
      question: featuredQuestions[word] ?? questionTemplates[mechanism](word),
      status: deepWords.has(word) ? '精校深度词条' : '深度词条·待核证',
    };
  }),
);

export const catalogMechanisms: readonly CatalogMechanism[] = [
  '翻译进入', '身份建构', '政治重释', '制度迁移', '媒介塑形',
  '知识日常化', '价值变迁', '隐喻扩展', '技术迁移', '平台再造',
];

export function getCatalogTheme(themeId: string): CatalogTheme {
  return catalogThemes.find((theme) => theme.id === themeId) ?? catalogThemes[0]!;
}

export function getCatalogWord(wordId: string): CatalogWord {
  return catalogWords.find((entry) => entry.id === wordId) ?? catalogWords[0]!;
}

const uniqueWords = new Set(catalogWords.map((entry) => entry.word));
if (catalogWords.length !== 188 || uniqueWords.size !== 188) {
  throw new Error(`策展词库必须包含 188 个不重复词，当前为 ${catalogWords.length} 个词、${uniqueWords.size} 个唯一词。`);
}
