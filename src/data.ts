export type EvidenceGrade = 'A' | 'B' | 'C';
export type ReviewStatus = '语料事实' | '计算结果' | '人文解释';

export interface Evidence {
  id: string;
  excerpt: string;
  context: string;
  source: string;
  year: number;
  medium: string;
  grade: EvidenceGrade;
  status: ReviewStatus;
  note: string;
  isBoundary?: boolean;
  dateLabel?: string;
  sourceUrl: string;
  reviewed: '已核验' | '有争议';
}

export interface Sense {
  id: string;
  name: string;
  shortName: string;
  description: string;
  color: string;
  startIndex: number;
  activity: number[];
  media: Array<{ name: string; value: number }>;
  confidence: number;
  firstStable: string;
  evidence: Evidence[];
}

export interface WordStory {
  id: string;
  word: string;
  english: string;
  topic: string;
  intro: string;
  question: string;
  pattern: 'branch' | 'coexist' | 'surge' | 'revival';
  maturity?: 'verified' | 'research';
  senses: Sense[];
}

export const periods = [
  '1800—1840',
  '1840—1895',
  '1895—1919',
  '1919—1949',
  '1949—1978',
  '1978—2000',
  '2000—2012',
  '2012—2025',
] as const;

const evidenceCatalog: Record<string, Evidence[]> = {
  civilized: [
    { id: 'civilized-zhouyi', excerpt: '“见龙在田，天下文明。”', context: '《周易》乾卦文言中的“文明”处在“文采光明、文德昭著”的古典语境，不能直接等同于近代的 civilization。', source: '《周易·乾·文言》', year: -300, dateLabel: '先秦', medium: '经籍', grade: 'B', status: '语料事实', note: '原句可核；释义采用古典语境，现代概念对译需另行论证。', sourceUrl: 'https://www.shidianguji.com/book/SK0090/chapter/1lxf46d51dudm', reviewed: '已核验' },
    { id: 'civilized-shangshu', excerpt: '“濬哲文明，温恭允塞。”', context: '《尚书·舜典》以“文明”形容人的德性与文采。它说明古典用法早已存在，但不证明现代社会阶段义也同样古老。', source: '《尚书·舜典》', year: -300, dateLabel: '先秦', medium: '经籍', grade: 'B', status: '语料事实', note: '采用传世文本的常见断句；成书与篇章年代不在此作精确判断。', sourceUrl: 'https://www.shidianguji.com/mingju/7473815619491102757', reviewed: '已核验' },
    { id: 'civilized-study', excerpt: '“论中国古代‘文明’话语的演进。”', context: '学术研究提示，古代“文明”自身也有长期演进，不能把两条先秦句子当成此后全部传统用法的固定定义。', source: '《北京师范大学学报》研究', year: 2025, medium: '学术研究', grade: 'A', status: '人文解释', note: '这是论文题名与研究范围提示，不是古籍原句。', sourceUrl: 'https://wkxb.bnu.edu.cn/CN/Y2025/V0/I3/5', reviewed: '已核验' },
  ],
  stage: [
    { id: 'stage-liang', excerpt: '“学其文明技术，传与其民。”', context: '梁启超在《新民说》中把“文明”置于国家学习、技术与国民塑造的论述中，已明显不同于古典的个人德性评价。', source: '梁启超《新民说》', year: 1902, medium: '政论', grade: 'B', status: '语料事实', note: '篇章原文可检；具体刊期仍应在正式版本中补齐。', sourceUrl: 'https://ctext.org/wiki.pl?if=gb&remap=gb&res=900281', reviewed: '已核验' },
    { id: 'stage-study', excerpt: '“以‘文明’为中国现代化的目标。”', context: '当代研究将梁启超流亡日本时期的文明论放在福泽谕吉等思想资源与中国现代化语境中考察。', source: '《梁启超的文明观》', year: 2024, medium: '学术研究', grade: 'A', status: '人文解释', note: '这是研究者的概括，不是梁启超原句。', sourceUrl: 'https://xbzs.ecnu.edu.cn/CN/Y2024/V56/I4/26', reviewed: '已核验' },
  ],
  conduct: [
    { id: 'conduct-2009', excerpt: '“文明礼貌十字用语：请、你好、谢谢、对不起、再见。”', context: '地方公共文明宣传把“文明”具体落实为可观察、可学习的礼貌行为。', source: '徐水区政府文明宣传内容', year: 2009, medium: '公共宣传', grade: 'A', status: '语料事实', note: '可作为日常行为义的实例，不能据此断定该义始于 2009 年。', sourceUrl: 'https://xushui.gov.cn/zfxxgk/fdzdgknr/gggs/665958434680901.html', reviewed: '已核验' },
    { id: 'conduct-2021', excerpt: '“请你讲话文明点。”', context: '“文明”在此直接评价说话方式，语义落在礼貌、克制与公共交往规范。', source: '沁水县政府《文明用语篇》', year: 2021, medium: '公共服务', grade: 'A', status: '语料事实', note: '这是清晰的现代日常用法。', sourceUrl: 'https://www.qinshui.gov.cn/ztzl_369/qgwmcsxjcj_458/wmcj_23/202107/t20210707_1432999.shtml', reviewed: '已核验' },
    { id: 'conduct-standard', excerpt: '“礼貌用语使用‘请’‘谢谢’‘对不起’‘再见’等。”', context: '地方服务标准把文明用语进一步写成可执行的日常交往规范。', source: '深圳市地方标准附录', year: 2024, medium: '地方标准', grade: 'A', status: '语料事实', note: '这是制度化的行为规范实例，不代表日常义只存在于制度文本。', sourceUrl: 'https://amr.sz.gov.cn/attachment/1/1502/1502846/11672275.pdf', reviewed: '已核验' },
  ],
  modern: [
    { id: 'modern-network', excerpt: '“网络文明理念深入人心。”', context: '“文明”与网络空间结合，形成对数字行为、内容生态和公共秩序的综合评价。', source: '中央网信办网络文明建设综述', year: 2021, medium: '政策传播', grade: 'A', status: '语料事实', note: '这里是“网络文明”的复合概念，不等于技术本身更先进。', sourceUrl: 'https://www.cac.gov.cn/2021-11/19/c_1638918482453412.htm', reviewed: '已核验' },
    { id: 'modern-digital', excerpt: '“让数字文明造福各国人民。”', context: '“数字文明”把文明的评价尺度进一步投向数字技术塑造的社会生活。', source: '北京公共数据开放平台转载文章', year: 2023, medium: '公共论述', grade: 'B', status: '人文解释', note: '属于宏观修辞性用法；不应与“文明礼貌”合并统计。', sourceUrl: 'https://data.beijing.gov.cn/xydt/ljhd/d11c54b46fff41eabadca3b23ecb94c1.htm', reviewed: '已核验' },
    { id: 'modern-online-conduct', excerpt: '“让文明办网、文明用网、文明上网蔚然成风。”', context: '这里的“文明”同时评价平台运营、用户行为与网络公共空间，显示技术语境与行为语境的交叠。', source: '中央网信办网络文明评论', year: 2023, medium: '政策传播', grade: 'A', status: '语料事实', note: '属于边界实例：既可归入网络文明，也保留日常行为规范色彩。', isBoundary: true, sourceUrl: 'https://www.cac.gov.cn/2023-07/18/c_1691334316261096.htm', reviewed: '已核验' },
  ],
  aspire: [
    { id: 'aspire-guoyu', excerpt: '“同心则同志。同志虽远，男女不相及，畏黩敬也。”', context: '《国语》把“同志”放在“同德—同心—同志”的推演中，核心是志向相同，而非现代组织称谓。', source: '《国语·晋语四》', year: -500, dateLabel: '先秦', medium: '史籍', grade: 'B', status: '语料事实', note: '传世文本原句可查；古典词义不应直接套用现代身份含义。', sourceUrl: 'https://ctext.org/text.pl?if=en&node=24719&remap=gb&show=parallel', reviewed: '已核验' },
    { id: 'aspire-sunyat', excerpt: '“革命尚未成功，同志仍须努力。”', context: '这句话长期作为孙中山遗训式表述传播，强化了“共同革命志向者”的政治关联。', source: '孙中山故居纪念馆展览资料', year: 1925, medium: '纪念叙事', grade: 'C', status: '人文解释', note: '并非遗嘱逐字原文；应标作纪念性转述，不能当作无争议的临终原话。', isBoundary: true, sourceUrl: 'https://ads.dyshf.com/index.php?c=msg&id=5561', reviewed: '有争议' },
    { id: 'aspire-sequence', excerpt: '“同姓则同德，同德则同心，同心则同志。”', context: '完整递进关系进一步说明，古典“同志”由共同德性与共同心志推出。', source: '《国语·晋语四》', year: -500, dateLabel: '先秦', medium: '史籍', grade: 'B', status: '语料事实', note: '与同篇另一例来自同一段落，用于展示上下文而非增加独立来源数量。', sourceUrl: 'https://ctext.org/text.pl?if=en&node=24719&remap=gb&show=parallel', reviewed: '已核验' },
  ],
  political: [
    { id: 'political-1925', excerpt: '“同志仍须努力。”', context: '在革命组织和纪念实践中，“同志”成为以共同政治目标连接成员的称谓。', source: '孙中山相关纪念性表述', year: 1925, medium: '政治传播', grade: 'C', status: '人文解释', note: '用法存在无疑，但这句表述的形成与转述链仍需逐层考证。', isBoundary: true, sourceUrl: 'https://news.cau.edu.cn/mtndnew/ceb68d8edc15492bb24e5aec175485d8.htm', reviewed: '有争议' },
    { id: 'political-current', excerpt: '“全党同志务必不忘初心、牢记使命。”', context: '“全党同志”显示这一称谓至今仍稳定存在于正式政治文件和公共讲话中。', source: '中国政府网公开讲话', year: 2022, medium: '政治文件', grade: 'A', status: '语料事实', note: '用于证明现代正式称谓的持续，不用于追定首次出现年代。', sourceUrl: 'https://www.gov.cn/xinwen/2022-10/25/content_5721685.htm', reviewed: '已核验' },
  ],
  everyday: [
    { id: 'everyday-service', excerpt: '“对不起，xx同志外出办事。”', context: '公共服务用语中，“同志”可作为对普通工作人员的相对正式称呼。', source: '温县纪委监委常用文明用语规范', year: 2020, medium: '公共服务', grade: 'A', status: '语料事实', note: '这是当代制度场景实例；其社会使用强度不能由单条材料推出。', sourceUrl: 'https://www.kflz.gov.cn/sitesources/jzjjw/page_pc/xsqjw/wx/xxgk/qt/article417efc15ff5448c0a8d1ccba175a87f6.html', reviewed: '已核验' },
    { id: 'everyday-standard', excerpt: '“称谓用语使用‘同志’‘先生’‘老师’‘师傅’‘女士’等。”', context: '地方服务标准把“同志”与其他一般称谓并列，显示其在公共服务语境中的持续使用。', source: '深圳市地方标准附录', year: 2024, medium: '地方标准', grade: 'A', status: '语料事实', note: '标准中的许可不等于所有地区、所有人群都以同样频率使用。', sourceUrl: 'https://amr.sz.gov.cn/attachment/1/1502/1502846/11672275.pdf', reviewed: '已核验' },
  ],
  identity: [
    { id: 'identity-1989', excerpt: '“香港同志电影节始于 1989 年。”', context: '1989 年香港电影节是“同志”进入性少数社群公共文化的重要传播节点。', source: '香港同志影展组织介绍', year: 1989, medium: '社群档案', grade: 'A', status: '语料事实', note: '“电影节推动普及”较可靠；谁最先创造此用法存在麦继强、林奕华等不同叙述。', isBoundary: true, sourceUrl: 'https://www.hklgff.hk/about/organisation/', reviewed: '有争议' },
    { id: 'identity-study', excerpt: '“1989 年电影节使这一用法迅速传播。”', context: '学术研究通常把 1989 年香港同志电影节视为关键节点，同时提醒“首创者”归属并不完全一致。', source: 'Frames Cinema Journal 研究', year: 2018, medium: '学术研究', grade: 'A', status: '人文解释', note: '这是研究概括，不是当年宣传材料的逐字引文。', sourceUrl: 'https://framescinemajournal.com/article/commercialisation-as-a-tool-the-commercial-transformation-of-the-hong-kong-lesbian-and-gay-film-festival/', reviewed: '已核验' },
  ],
  structure: [
    { id: 'structure-dpm', excerpt: '“坐落于须弥座平台上。”', context: '故宫建筑介绍中的“平台”是可承托建筑的实体结构，词义具体、空间性强。', source: '故宫博物院《禊赏亭》', year: 2025, dateLabel: '当代释文', medium: '建筑说明', grade: 'A', status: '语料事实', note: '可证明实体义在当代仍存，不能据此确定这一词义的历史起点。', sourceUrl: 'https://www.dpm.org.cn/explore/building/236514.html', reviewed: '已核验' },
    { id: 'structure-lianyungang', excerpt: '“石岩底下，是一方天然平台。”', context: '地方遗产介绍仍以“平台”指可驻足、观景的平坦空间。', source: '连云港市政府《平台水月》', year: 2020, medium: '遗产说明', grade: 'A', status: '语料事实', note: '页面叙述涉及历史遗迹，但句子本身是现代说明文字。', sourceUrl: 'https://www.lyg.gov.cn/zglygzfmhwz/whycbh/content/0cea47b5-5f9a-4849-aebe-9fc9c78bbfcc.shtml', reviewed: '已核验' },
    { id: 'structure-park', excerpt: '“有正殿三间，四面平台。”', context: '北京公园史料介绍以“平台”描述建筑周围的实体平面空间。', source: '北京市公园管理中心史迹介绍', year: 2019, medium: '遗产说明', grade: 'A', status: '语料事实', note: '页面依据旧图复原历史格局，但这句是现代整理文本。', sourceUrl: 'https://gygl.beijing.gov.cn/whgy/whgy_wsgc/201912/t20191206_885313.html', reviewed: '已核验' },
  ],
  institution: [
    { id: 'institution-culture', excerpt: '“为民间文艺团队提供竞艺交流平台。”', context: '“平台”从实体结构抽象为组织机会、连接关系与活动空间。', source: '文化和旅游部地方工作信息', year: 2013, medium: '机构文本', grade: 'A', status: '语料事实', note: '清晰展示抽象机构义；不声称该义始于 2013 年。', sourceUrl: 'https://www.mct.gov.cn/wlbphone/wlbydd/xxfb/qglb/zq/201304/t20130411_790528.html', reviewed: '已核验' },
    { id: 'institution-exchange', excerpt: '“为中美青少年的互访学习、交流体验提供平台。”', context: '这里的平台不是单一场地，而是由项目组织出来的交流条件。', source: '文化和旅游部文化交流资料', year: 2015, medium: '机构文本', grade: 'A', status: '语料事实', note: '抽象义与数字义可能共现，分类需看具体上下文。', sourceUrl: 'https://www.mct.gov.cn/whzx/bnsj/dwwhllj/201507/t20150722_772863.html', reviewed: '已核验' },
    { id: 'institution-forum', excerpt: '“论坛为各国开展文化交流与合作提供平台。”', context: '“平台”指由论坛创造的交流条件与关系网络，并非论坛建筑本身。', source: '文化和旅游部论坛报道', year: 2019, medium: '新闻', grade: 'A', status: '语料事实', note: '这是抽象机构义的清晰例句。', sourceUrl: 'https://www.mct.gov.cn/whzx/whyw/201911/t20191118_848932.htm', reviewed: '已核验' },
  ],
  digital: [
    { id: 'digital-cac', excerpt: '“平台日益成为数字经济时代重要的组织模式。”', context: '互联网平台由服务器、接口、应用程序和网站等组成，承担连接与组织功能。', source: '中央网信办平台属性研究', year: 2020, medium: '政策研究', grade: 'A', status: '语料事实', note: '比“一个网站”更完整地呈现数字平台的基础设施与组织双重属性。', sourceUrl: 'https://www.cac.gov.cn/2020-02/06/c_1582531846467456.htm', reviewed: '已核验' },
    { id: 'digital-drc', excerpt: '“以网络为基础进行连接、匹配和价值创造。”', context: '国务院发展研究中心文章把连接、匹配与共同创造价值视作互联网平台的关键机制。', source: '国务院发展研究中心平台研究', year: 2021, medium: '政策研究', grade: 'A', status: '人文解释', note: '是研究性定义，适合说明核心机制，不等于法律定义。', sourceUrl: 'https://www.drc.gov.cn/DocView.aspx?chnid=379&docid=2903714&leafid=1338', reviewed: '已核验' },
    { id: 'digital-definition', excerpt: '“使相互依赖的双边或者多边主体……交互。”', context: '反垄断指南用网络信息技术、平台规则、多边主体与共同创造价值界定互联网平台。', source: '平台经济领域反垄断指南', year: 2021, medium: '政策文本', grade: 'A', status: '语料事实', note: '省略号用于缩短展示，证据阅读器可进入完整公开文本。', sourceUrl: 'https://www.samr.gov.cn/zt/ndzt/2025n/sqxzjcgs/jcbz/art/2025/art_27c2be1ca40b42a9949c12dbd213ba8e.html', reviewed: '已核验' },
  ],
  governance: [
    { id: 'governance-rule', excerpt: '“明确平台企业定位和监管规则。”', context: '平台不再只是技术工具，也成为反垄断、竞争政策和公共责任的治理对象。', source: '国家发展改革委平台经济名词解释', year: 2021, medium: '政策文本', grade: 'A', status: '语料事实', note: '展示治理义的稳定公共表达。', sourceUrl: 'https://www.ndrc.gov.cn/fggz/fzzlgh/gjfzgh/202112/t20211224_1309341.html', reviewed: '已核验' },
    { id: 'governance-npc', excerpt: '“撮合交易、传输内容、管理流程的新经济模式。”', context: '中国人大网文章把平台经济放进数字经济治理中，凸显其组织市场和管理流程的能力。', source: '中国人大网《数字经济的发展与治理》', year: 2023, medium: '政策研究', grade: 'A', status: '人文解释', note: '这是平台经济的概括，不是对所有“平台”一词实例的统一释义。', sourceUrl: 'https://www.npc.gov.cn/npc/c2/c30834/202301/t20230103_423214.html', reviewed: '已核验' },
    { id: 'governance-antitrust', excerpt: '“预防和制止平台经济领域垄断行为。”', context: '平台被置于公平竞争、消费者权益、算法与平台规则的监管框架中。', source: '平台经济领域反垄断指南', year: 2021, medium: '政策文本', grade: 'A', status: '语料事实', note: '此例直接展示“平台治理”成为制度对象。', sourceUrl: 'https://www.samr.gov.cn/zt/ndzt/2025n/sqxzjcgs/jcbz/art/2025/art_27c2be1ca40b42a9949c12dbd213ba8e.html', reviewed: '已核验' },
  ],
  food: [
    { id: 'food-standard', excerpt: '“无公害食品 粉丝。”', context: '行业标准名称直接把“粉丝”作为淀粉制品类别，显示食物义在现代制度文本中的稳定性。', source: '全国标准信息公共服务平台 NY 5188—2002', year: 2002, medium: '行业标准', grade: 'A', status: '语料事实', note: '该标准现已废止，但作为 2002 年用词证据仍然有效。', sourceUrl: 'https://std.samr.gov.cn/hb/search/stdHBDetailed?id=8B1827F1E149BB19E05397BE0A0AB44A', reviewed: '已核验' },
    { id: 'food-samr', excerpt: '“粉丝粉条、面制品生产企业。”', context: '市场监管文件将“粉丝粉条”作为食品生产与安全治理对象。', source: '市场监管总局专项整治通知', year: 2018, medium: '制度文本', grade: 'A', status: '语料事实', note: '可证食物义持续存在；早期历史仍需补入古籍或物质文化资料。', sourceUrl: 'https://www.gov.cn/zhengce/zhengceku/2018-12/31/content_5451176.htm', reviewed: '已核验' },
    { id: 'food-heritage', excerpt: '“龙口粉丝传统制作技艺。”', context: '老字号数字博物馆把“粉丝”置于传统制作、烹饪与非物质文化遗产语境中。', source: '商务部老字号数字博物馆', year: 2018, medium: '文化遗产', grade: 'A', status: '语料事实', note: '年份对应传承人认定叙述；传统技艺入选国家级名录的年份为 2014。', sourceUrl: 'https://lzhbwg.mofcom.gov.cn/edi_ecms_web_front/thb/detail/24752a438cd743feb07f6d59b75ba489', reviewed: '已核验' },
  ],
  admirer: [
    { id: 'admirer-supergirl', excerpt: '“2005 年超女舞台，成了粉丝记忆的分水岭。”', context: '“超级女声”及其投票、应援和群体命名，让音译自 fans 的“粉丝”在大众文化中高度可见。', source: '人民网《内地选秀节目十年大事记》', year: 2014, medium: '大众媒体', grade: 'A', status: '人文解释', note: '2005 年是扩散节点，不是已经证明的首次出现年份。', sourceUrl: 'https://media.people.com.cn/BIG5/n/2014/1205/c40606-26151843.html', reviewed: '已核验' },
    { id: 'admirer-culture', excerpt: '“让粉丝文化醒目进入中国大众视野。”', context: '人民网回顾把 2005 年的短信投票与参与式造星视作粉丝文化扩张的重要节点。', source: '人民网《粉丝文化怎么看》', year: 2019, medium: '大众媒体', grade: 'A', status: '人文解释', note: '用于说明社会扩散，不用于证明音译来源；音译关系另有语言学研究支持。', sourceUrl: 'https://media.people.com.cn/n1/2019/0716/c40606-31235733.html', reviewed: '已核验' },
    { id: 'admirer-participation', excerpt: '“粉丝们自发组织起来。”', context: '媒体研究用组织、投票和推动内容改变等行为描述粉丝，不再只是被动“歌迷”。', source: '人民网传媒研究', year: 2013, medium: '媒体研究', grade: 'A', status: '语料事实', note: '用于展示参与式粉丝群体，不用于确定词源。', sourceUrl: 'https://media.people.com.cn/n/2013/0314/c358821-20791416.html', reviewed: '已核验' },
  ],
  follower: [
    { id: 'follower-cac', excerpt: '“粉丝数量为 1400 万。”', context: '当“粉丝”与账号和可计量数量搭配时，它已从文娱追随者扩展为社交平台关注者指标。', source: '中央网信办短视频传播研究', year: 2017, medium: '网络研究', grade: 'A', status: '语料事实', note: '同一人仍可能是名人崇拜意义的粉丝，两义存在重叠边界。', isBoundary: true, sourceUrl: 'https://www.cac.gov.cn/2017-01/23/c_1120367428.htm', reviewed: '已核验' },
    { id: 'follower-account', excerpt: '“官方认证的气象抖音账号已有 85 个。”', context: '材料随后以“粉丝量”描述这些账号的受众规模，呈现平台指标化的关注者用法。', source: '浙江省经济信息中心新媒体研究', year: 2024, medium: '机构研究', grade: 'A', status: '语料事实', note: '这里“粉丝”首先是账号受众指标，而非单纯的明星崇拜群体。', sourceUrl: 'https://zjic.zj.gov.cn/zkfw/xcfwybz/202407/t20240731_22648524.shtml', reviewed: '已核验' },
    { id: 'follower-account-value', excerpt: '“一个粉丝数量众多的虚拟账号，往往能带来更多关注度。”', context: '“粉丝数量”在账号交易报道中被直接当作账号影响力和价值的可计量指标。', source: '司法部智慧普法平台调查', year: 2023, medium: '法治报道', grade: 'A', status: '语料事实', note: '报道讨论的是账号交易风险，不是在肯定以粉丝数衡量价值。', sourceUrl: 'https://legalinfo.moj.gov.cn/zhfxfzzx/fzzxyw/202305/t20230510_478486.html', reviewed: '已核验' },
  ],
};

const sourceEvidence = (key: string): Evidence[] => evidenceCatalog[key] ?? [];

export const stories: WordStory[] = [
  {
    id: 'civilization',
    word: '文明',
    english: 'civilization · civility · cultivated conduct',
    topic: '概念来到中国',
    intro: '一个评价社会、制度与个人行为的词，如何在漫长使用中分化，又如何保留彼此的回声。',
    question: '“文明”何时从个人修养的评价，扩展为理解社会与历史的尺度？',
    pattern: 'branch',
    senses: [
      {
        id: 'cultivated', name: '文教与德化', shortName: '文教德化',
        description: '强调教化、礼制与人的修养，是进入主要分析区间前已经存在的传统表达。',
        color: '#7d7658', startIndex: 0, activity: [44, 42, 34, 29, 24, 18, 14, 12],
        media: [{ name: '古籍与文学', value: 58 }, { name: '报刊', value: 20 }, { name: '教育文本', value: 22 }],
        confidence: 0.88, firstStable: '1800 年以前已有稳定记录',
        evidence: sourceEvidence('civilized'),
      },
      {
        id: 'social-stage', name: '社会发展与制度阶段', shortName: '社会阶段',
        description: '用于描述国家、制度或社会发展状态的现代概念用法。',
        color: '#a5543c', startIndex: 1, activity: [0, 12, 33, 46, 51, 44, 37, 35],
        media: [{ name: '报刊', value: 39 }, { name: '制度文本', value: 35 }, { name: '教育文本', value: 26 }],
        confidence: 0.77, firstStable: '1895—1919',
        evidence: sourceEvidence('stage'),
      },
      {
        id: 'conduct', name: '得体、礼貌的日常评价', shortName: '日常礼貌',
        description: '从宏大的社会评价回到日常行为，指向礼貌、整洁与公共规范。',
        color: '#3e6e67', startIndex: 3, activity: [0, 0, 0, 8, 19, 32, 45, 52],
        media: [{ name: '教育文本', value: 34 }, { name: '大众媒体', value: 42 }, { name: '网络文本', value: 24 }],
        confidence: 0.83, firstStable: '1949—1978',
        evidence: sourceEvidence('conduct'),
      },
      {
        id: 'technology', name: '技术与现代生活的修辞', shortName: '现代修辞',
        description: '将技术设施、城市生活或服务体验概括为“更文明”的修辞性用法。',
        color: '#596d8e', startIndex: 5, activity: [0, 0, 0, 0, 0, 7, 16, 24],
        media: [{ name: '商业文本', value: 22 }, { name: '大众媒体', value: 33 }, { name: '网络文本', value: 45 }],
        confidence: 0.64, firstStable: '2000—2012',
        evidence: sourceEvidence('modern'),
      },
    ],
  },
  {
    id: 'comrade', word: '同志', english: 'shared aspiration · comrade · identity', topic: '个人成为身份',
    intro: '志向、组织称呼、政治称谓与身份用法并没有整齐交接，而是在不同社群中长期并存。',
    question: '当一个称谓进入新的群体，旧的政治与日常用法是否真的离场？', pattern: 'coexist',
    senses: [
      { id: 'aspiration', name: '志向相同的人', shortName: '同道同心', description: '以共同志向或目标为基础的传统称呼。', color: '#817250', startIndex: 0, activity: [38, 36, 31, 26, 17, 13, 9, 8], media: [{ name: '文学', value: 52 }, { name: '书信', value: 30 }, { name: '报刊', value: 18 }], confidence: .84, firstStable: '1800 年以前', evidence: sourceEvidence('aspire') },
      { id: 'political', name: '组织与政治称谓', shortName: '政治称谓', description: '在政治组织和公共制度语境中形成的正式或半正式称谓。', color: '#9d4938', startIndex: 2, activity: [0, 0, 14, 38, 55, 42, 28, 19], media: [{ name: '政治文件', value: 46 }, { name: '报刊', value: 34 }, { name: '公共讲话', value: 20 }], confidence: .91, firstStable: '1919—1949', evidence: sourceEvidence('political') },
      { id: 'everyday', name: '公共服务中的一般称呼', shortName: '一般称呼', description: '超出组织边界，在公共生活中作为相对平等的一般称呼。', color: '#426c63', startIndex: 4, activity: [0, 0, 0, 0, 28, 36, 20, 11], media: [{ name: '大众媒体', value: 34 }, { name: '公共服务', value: 40 }, { name: '文学', value: 26 }], confidence: .72, firstStable: '1949—1978', evidence: sourceEvidence('everyday') },
      { id: 'identity', name: '性少数身份与社群称呼', shortName: '身份用法', description: '在特定社群中被重新使用，并逐渐进入公共媒体与日常表达。', color: '#5a668f', startIndex: 5, activity: [0, 0, 0, 0, 0, 11, 35, 51], media: [{ name: '社群文本', value: 47 }, { name: '大众媒体', value: 31 }, { name: '网络文本', value: 22 }], confidence: .79, firstStable: '1989 年后形成关键传播节点', evidence: sourceEvidence('identity') },
    ],
  },
  {
    id: 'platform', word: '平台', english: 'terrace · stage · digital infrastructure', topic: '旧词进入技术生活',
    intro: '“平台”在进入数字生活前，已经拥有空间和机构含义；技术用法扩张，却没有让旧义消失。',
    question: '一个具体的空间词，如何成为组织关系与数字服务的基础隐喻？', pattern: 'surge',
    senses: [
      { id: 'structure', name: '平坦的实体结构', shortName: '实体结构', description: '建筑、交通或地理环境中可供停留和操作的平面结构。', color: '#7f7256', startIndex: 0, activity: [28, 31, 34, 36, 38, 35, 30, 27], media: [{ name: '工程文本', value: 42 }, { name: '报刊', value: 23 }, { name: '文学', value: 35 }], confidence: .92, firstStable: '1800 年以前；当前例证证明其持续', evidence: sourceEvidence('structure') },
      { id: 'institution', name: '机构或活动空间', shortName: '机构空间', description: '从实体舞台抽象为提供机会、发声或协作的组织空间。', color: '#9b533b', startIndex: 3, activity: [0, 0, 0, 8, 14, 25, 32, 38], media: [{ name: '机构文本', value: 36 }, { name: '大众媒体', value: 44 }, { name: '商业文本', value: 20 }], confidence: .74, firstStable: '1978—2000（待补早期语料）', evidence: sourceEvidence('institution') },
      { id: 'digital', name: '数字服务基础设施', shortName: '数字平台', description: '连接用户、内容与服务的数字基础设施及其商业组织形态。', color: '#376b66', startIndex: 5, activity: [0, 0, 0, 0, 0, 10, 39, 63], media: [{ name: '技术文献', value: 28 }, { name: '商业文本', value: 38 }, { name: '网络文本', value: 34 }], confidence: .86, firstStable: '2000—2012', evidence: sourceEvidence('digital') },
      { id: 'governance', name: '平台化治理与权力', shortName: '平台治理', description: '将平台作为一种新的市场组织、治理关系与权力结构加以讨论。', color: '#596586', startIndex: 6, activity: [0, 0, 0, 0, 0, 0, 8, 25], media: [{ name: '研究文本', value: 40 }, { name: '政策文本', value: 32 }, { name: '新闻', value: 28 }], confidence: .78, firstStable: '2012—2025', evidence: sourceEvidence('governance') },
    ],
  },
  {
    id: 'fans', word: '粉丝', english: 'vermicelli · fans · followers', topic: '旧词进入技术生活',
    intro: '食物名称与音译身份几乎毫不相干，却在现代汉语中以相同词形长期并存。',
    question: '当两种含义只是偶然共享词形，我们应如何避免把它们画成一次线性演化？', pattern: 'coexist',
    senses: [
      { id: 'food', name: '淀粉制成的条状食物', shortName: '食物', description: '稳定存在于饮食、地方生活与商品语境中的食物名称。', color: '#88764f', startIndex: 0, activity: [42, 45, 47, 48, 52, 55, 53, 50], media: [{ name: '食谱', value: 38 }, { name: '文学', value: 25 }, { name: '商业文本', value: 37 }], confidence: .88, firstStable: '早于现代音译义；早期例证待补', evidence: sourceEvidence('food') },
      { id: 'admirer', name: '喜爱名人的追随者', shortName: '追随者', description: '由英语 fans 音译并在大众文化中稳定下来的群体身份。', color: '#9b4d3a', startIndex: 5, activity: [0, 0, 0, 0, 0, 8, 48, 66], media: [{ name: '娱乐媒体', value: 42 }, { name: '网络文本', value: 46 }, { name: '广告', value: 12 }], confidence: .89, firstStable: '2000—2012；2005 为扩散节点', evidence: sourceEvidence('admirer') },
      { id: 'follower', name: '账号与品牌的关注者', shortName: '账号关注者', description: '从文娱追随扩展到社交账号、品牌或知识创作者的可计量受众。', color: '#3f6f68', startIndex: 6, activity: [0, 0, 0, 0, 0, 0, 19, 44], media: [{ name: '平台界面', value: 41 }, { name: '商业文本', value: 29 }, { name: '网络文本', value: 30 }], confidence: .82, firstStable: '2012—2025', evidence: sourceEvidence('follower') },
    ],
  },
];

export const topics = [
  { title: '概念来到中国', index: '壹', description: '翻译、概念输入与日常化', words: ['文明', '科学', '自由', '浪漫'] },
  { title: '个人成为身份', index: '贰', description: '称谓、政治与群体的再使用', words: ['青年', '女性', '同志', '人民'] },
  { title: '旧词进入技术生活', index: '叁', description: '隐喻扩展、同形共存与技术重构', words: ['网络', '平台', '流量', '粉丝'] },
] as const;
