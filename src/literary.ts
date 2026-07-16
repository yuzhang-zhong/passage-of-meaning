export interface PassageSegment {
  text: string;
  word?: string;
}

export interface LiteraryWork {
  id: string;
  order: string;
  title: string;
  author: string;
  date: string;
  genre: string;
  textbook: string;
  textbookUrl: string;
  context: string;
  segments: readonly PassageSegment[];
  sourceLabel: string;
  sourceUrl: string;
}

export interface TimelineStage {
  period: string;
  title: string;
  description: string;
  status: '文本锚点' | '语义转折' | '当代延伸' | '研究节点';
}

export interface LiteraryTimeline {
  word: string;
  heading: string;
  caveat: string;
  stages: readonly TimelineStage[];
}

const highSchoolCatalogUrl = 'https://www.pep.com.cn/xw/zt/hd/zjywjytbskjc/201909/t20190906_1945033.html';
const gradeEightUpperUrl = 'https://www.pep.com.cn/products/jc/czjks/201802/t20180209_1922717.shtml';
const gradeEightLowerUrl = 'https://www.pep.com.cn/products/jc/201905/t20190522_1938496.shtml';

export const literaryWorks: readonly LiteraryWork[] = [
  {
    id: 'mountain-walk', order: '01', title: '《山行》', author: '杜牧', date: '唐', genre: '七言绝句',
    textbook: '小学语文 · 三年级上册',
    textbookUrl: 'https://www.pep.com.cn/rjdt/mtbd/202307/t20230718_1984406.shtml',
    context: '这里的“云”首先是山间可见的水汽，同时又承担空间作用：它标出人家所在的高处。',
    segments: [
      { text: '远上寒山石径斜，白' }, { text: '云', word: '云' }, { text: '生处有人家。' },
    ],
    sourceLabel: '人民教育出版社 · 课本唐诗',
    sourceUrl: 'https://www.pep.com.cn/rjdt/mtbd/202307/t20230718_1984406.shtml',
  },
  {
    id: 'peach-blossom-spring', order: '02', title: '《桃花源记》', author: '陶渊明', date: '约 421', genre: '记叙散文',
    textbook: '初中语文 · 八年级下册 · 第9课', textbookUrl: gradeEightLowerUrl,
    context: '“阡陌交通”说田间道路交错相通；现代读者最熟悉的车辆运输还不是这句话的中心。',
    segments: [
      { text: '土地平旷，屋舍俨然，有良田美池桑竹之属；阡陌' },
      { text: '交通', word: '交通' }, { text: '，鸡犬相闻。' },
    ],
    sourceLabel: '九江文化资料 · 桃花源记并诗',
    sourceUrl: 'https://www.jiujiang.gov.cn/zjjj/whjj/ldwf/201506/t20150611_1215511.html',
  },
  {
    id: 'zou-ji', order: '03', title: '《邹忌讽齐王纳谏》', author: '《战国策》', date: '战国', genre: '寓言性史传',
    textbook: '初中语文 · 九年级下册',
    textbookUrl: 'https://www.pep.com.cn/rjdt/jqgg/201805/t20180528_1924740.shtml',
    context: '三个“美”都是意动用法，意思不是单纯描述漂亮，而是“认为我美”；语法本身保存了一层古义。',
    segments: [
      { text: '吾妻之' }, { text: '美', word: '美' }, { text: '我者，私我也；妾之' },
      { text: '美', word: '美' }, { text: '我者，畏我也；客之' }, { text: '美', word: '美' },
      { text: '我者，欲有求于我也。' },
    ],
    sourceLabel: '维基文库 · 邹忌讽齐王纳谏',
    sourceUrl: 'https://zh.wikisource.org/zh-hans/%E9%84%92%E5%BF%8C%E8%AB%B7%E9%BD%8A%E7%8E%8B%E7%B4%8D%E8%AB%AB',
  },
  {
    id: 'lake-pavilion-snow', order: '04', title: '《湖心亭看雪》', author: '张岱', date: '明末清初', genre: '小品文',
    textbook: '初中语文 · 九年级上册',
    textbookUrl: 'https://www.pep.com.cn/products/jc/201908/t20190820_1944433.shtml',
    context: '“天与云与山与水”把云放在天地山水之间，既是物象，也是雪夜边界消失的视觉层次。',
    segments: [
      { text: '雾凇沆砀，天与' }, { text: '云', word: '云' }, { text: '与山与水，上下一白。' },
    ],
    sourceLabel: '维基文库 · 湖心亭看雪',
    sourceUrl: 'https://zh.wikisource.org/zh-hans/%E6%B9%96%E5%BF%83%E4%BA%AD%E7%9C%8B%E9%9B%AA',
  },
  {
    id: 'red-cliff-rhapsody', order: '05', title: '《赤壁赋》', author: '苏轼', date: '1082', genre: '文赋',
    textbook: '高中语文 · 必修上册 · 第16课', textbookUrl: highSchoolCatalogUrl,
    context: '“遗世独立”描写脱离尘世、独自存在的超然感，与今天的独立生活、独立思考仍有距离。',
    segments: [
      { text: '浩浩乎如冯虚御风，而不知其所止；飘飘乎如遗世' },
      { text: '独立', word: '独立' }, { text: '，羽化而登仙。' },
    ],
    sourceLabel: '古诗文网 · 赤壁赋',
    sourceUrl: 'https://www.gushiwen.cn/GuShiWen.aspx?id=8b6ef29f18',
  },
  {
    id: 'dreaming-tianmu', order: '06', title: '《梦游天姥吟留别》', author: '李白', date: '唐', genre: '古体诗',
    textbook: '高中语文 · 必修上册 · 第8课', textbookUrl: highSchoolCatalogUrl,
    context: '云的颜色和欲雨状态共同制造梦境将变的气氛；它与《山行》的空间标记形成另一种诗歌用法。',
    segments: [
      { text: '' }, { text: '云', word: '云' }, { text: '青青兮欲雨，水澹澹兮生烟。' },
    ],
    sourceLabel: '古文岛 · 梦游天姥吟留别',
    sourceUrl: 'https://m.gushiwen.cn/mingju/juv_b79ddfd8f509.aspx',
  },
  {
    id: 'back-view', order: '07', title: '《背影》', author: '朱自清', date: '1925', genre: '叙事散文',
    textbook: '初中语文 · 八年级上册 · 第13课', textbookUrl: gradeEightUpperUrl,
    context: '短短一段里，年龄、谋生能力、情绪与家庭关系彼此勾连，让“独立”落到真实的日常负担上。',
    segments: [
      { text: '他' }, { text: '少年', word: '少年' }, { text: '出外谋生，' },
      { text: '独立', word: '独立' }, { text: '支持，做了许多大事。哪知老境却如此颓唐！他触目伤怀，' },
      { text: '自然', word: '自然' }, { text: '情不能自已；情郁于中，' },
      { text: '自然', word: '自然' }, { text: '要发之于外；' }, { text: '家庭', word: '家庭' },
      { text: '琐屑便往往触他之怒。' },
    ],
    sourceLabel: '朱自清散文 · 背影原文',
    sourceUrl: 'https://acikders.ankara.edu.tr/pluginfile.php/89422/mod_resource/content/1/%E6%9C%B1%E8%87%AA%E6%B8%85%E6%95%A3%E6%96%87.pdf',
  },
  {
    id: 'taking-a-walk', order: '08', title: '《散步》', author: '莫怀戚', date: '1985', genre: '家庭散文',
    textbook: '初中语文 · 七年级上册 · 第6课',
    textbookUrl: 'https://www.pep.com.cn/xw/zt/hd/ywsd/',
    context: '“世界”不再指远方或全球，而被压缩到一家人肩上的分量，成为责任感的日常隐喻。',
    segments: [
      { text: '我和妻子都是慢慢地，稳稳地，走得很仔细，好像我背上的同她背上的加起来，就是整个' },
      { text: '世界', word: '世界' }, { text: '。' },
    ],
    sourceLabel: '古文之家 · 散步原文',
    sourceUrl: 'https://www.cngwzj.com/gushi/XianDai/86947/',
  },
  {
    id: 'what-i-live-for', order: '09', title: '《我为什么而活着》', author: '伯特兰·罗素', date: '1956', genre: '哲思随笔',
    textbook: '初中语文 · 八年级上册 · 第15课', textbookUrl: gradeEightUpperUrl,
    context: '这里的“爱情”被列为支配一生的三种情感之一，强调亲密经验对生命意义的组织作用。',
    segments: [
      { text: '对' }, { text: '爱情', word: '爱情' },
      { text: '的渴望，对知识的追求，对人类苦难不可遏制的同情，这三种纯洁而无比强烈的感情支配着我的一生。' },
    ],
    sourceLabel: '人民教育出版社 · 八年级上册目录',
    sourceUrl: gradeEightUpperUrl,
  },
  {
    id: 'stone-arch-bridges', order: '10', title: '《中国石拱桥》', author: '茅以升', date: '1962', genre: '建筑说明文',
    textbook: '初中语文 · 八年级上册 · 第17课', textbookUrl: gradeEightUpperUrl,
    context: '“世界”建立技术史的比较范围，“交通”则指桥梁承担的实际通行功能；一个是尺度，一个是用途。',
    segments: [
      { text: '石拱桥在' }, { text: '世界', word: '世界' },
      { text: '桥梁史上出现得比较早。这种桥不但形式优美，而且结构坚固，能几十年几百年甚至上千年雄跨在江河之上，在' },
      { text: '交通', word: '交通' }, { text: '方面发挥作用。' },
    ],
    sourceLabel: '人民教育出版社 · 八年级上册教材',
    sourceUrl: gradeEightUpperUrl,
  },
  {
    id: 'investigating-things', order: '11', title: '《应有格物致知精神》', author: '丁肇中', date: '1991', genre: '科学演讲',
    textbook: '初中语文 · 八年级下册 · 第14课', textbookUrl: gradeEightLowerUrl,
    context: '这句话把现代知识生产拆成证据链：科学以历史积累为背景，新的认识必须经由实验取得。',
    segments: [
      { text: '' }, { text: '科学', word: '科学' }, { text: '发展的' }, { text: '历史', word: '历史' },
      { text: '告诉我们，新的知识只能通过实地' }, { text: '实验', word: '实验' },
      { text: '而得到，不是由自我检讨或哲理的清谈就可求到的。' },
    ],
    sourceLabel: '八年级语文教学资料 · 课文原句',
    sourceUrl: 'https://jy.k12res.com/space/uploads/resource/doc/20230428/644b9b9c3d380.docx.pdf',
  },
  {
    id: 'respect-work', order: '12', title: '《敬业与乐业》', author: '梁启超', date: '1922', genre: '演讲词',
    textbook: '初中语文 · 九年级上册',
    textbookUrl: 'https://www.pep.com.cn/products/dzyxn/cz/yw/202006/t20200615_1951963.shtml',
    context: '“生活”是价值判断的范围，“职业”是现代分工身份；“自然会发生”则保留“自然而然”的旧用法。',
    segments: [
      { text: '但我确信“敬业乐业”四个字，是人类' }, { text: '生活', word: '生活' },
      { text: '的不二法门。凡' }, { text: '职业', word: '职业' },
      { text: '都是有趣味的，只要你肯继续做下去，趣味' }, { text: '自然', word: '自然' },
      { text: '会发生。' },
    ],
    sourceLabel: '中华文库 · 敬业与乐业',
    sourceUrl: 'https://www.zhonghuashu.com/wiki/%E6%95%AC%E6%A5%AD%E8%88%87%E6%A8%82%E6%A5%AD',
  },
];

export const literaryTimelines: Readonly<Record<string, LiteraryTimeline>> = {
  云: {
    word: '云', heading: '从天象、诗歌意象到数字基础设施', caveat: '同一个“云”在古诗中也并非固定意象；山间位置、雪夜层次与梦境气氛各不相同。',
    stages: [
      { period: '古典时期', title: '天象与多义诗歌空间', description: '《山行》用云标记高处人家，《湖心亭看雪》以云消融边界，《梦游天姥吟留别》则用云酝酿梦境变化。', status: '文本锚点' },
      { period: '近代', title: '进入标准化气象描述', description: '现代气象学以形态、高度和云量观察云，诗性经验之外出现可测量的知识语言。', status: '语义转折' },
      { period: '2000 年代', title: '云计算形成技术隐喻', description: '远程服务器、存储与算力被概括为“云”，具体设备位置被有意抽象。', status: '语义转折' },
      { period: '当代', title: '云端成为日常前缀', description: '“上云”“云文档”“云游戏”让它同时连接基础设施、使用方式和产品名称。', status: '当代延伸' },
    ],
  },
  交通: {
    word: '交通', heading: '从交错相通到运输系统', caveat: '现代义没有完全抹掉古义；“相互连通”仍是道路、运输和信息交通背后的共同结构。',
    stages: [
      { period: '中古', title: '道路交错而相通', description: '《桃花源记》的“阡陌交通”描写田间道路纵横连接，并非专指车辆运输。', status: '文本锚点' },
      { period: '晚清—民国', title: '往来、通信与运输', description: '铁路、邮政、航运与城市建设扩大了它的制度含义。', status: '语义转折' },
      { period: '1962', title: '桥梁承担公共通行功能', description: '《中国石拱桥》说桥在交通方面发挥作用，词义已稳定指向现代运输往来。', status: '文本锚点' },
      { period: '当代', title: '综合出行与智慧治理', description: '“公共交通”“交通拥堵”“智慧交通”把工具、系统和城市管理同时纳入。', status: '当代延伸' },
    ],
  },
  美: {
    word: '美', heading: '从认为美好到审美标准与界面修饰', caveat: '“美”可以是性质、判断，也可以像古汉语那样表示“认为……美”；词性变化本身就是意义史的一部分。',
    stages: [
      { period: '战国', title: '把“美”用作主观判断', description: '《邹忌讽齐王纳谏》的“美我”意为认为我美，明确呈现评价者的位置。', status: '文本锚点' },
      { period: '古典延续', title: '美好、善与合宜交叠', description: '人物、器物和德行都可被称美，感官愉悦与道德称许往往尚未严格分开。', status: '语义转折' },
      { period: '近代', title: '美学与艺术制度形成', description: '现代学科翻译使“美”成为可专门研究的审美范畴，并与艺术教育相连。', status: '语义转折' },
      { period: '当代', title: '审美判断与美颜技术', description: '“审美”“美商”“美颜”并存，平台工具也开始直接参与制造可见的美。', status: '当代延伸' },
    ],
  },
  独立: {
    word: '独立', heading: '从独自存在到生活与判断能力', caveat: '《赤壁赋》的超然独立与《背影》的谋生独立相距很远，恰好说明旧词可进入新的生活结构。',
    stages: [
      { period: '古典时期', title: '独自站立、超然于外', description: '《赤壁赋》“遗世独立”描写离开尘世束缚、独自存在的感受。', status: '文本锚点' },
      { period: '近代', title: '自主与不依附成为价值', description: '教育、家庭和个人观念变化，使独立越来越强调由自己判断和承担后果。', status: '语义转折' },
      { period: '1925', title: '独自支撑谋生与家庭', description: '《背影》写父亲“独立支持”，重点已经落在生活能力和现实责任。', status: '文本锚点' },
      { period: '当代', title: '思考、生活与经济能力', description: '“独立思考”“独立生活”“经济独立”把自主性拆分到个人生活的不同层面。', status: '当代延伸' },
    ],
  },
  少年: {
    word: '少年', heading: '从年龄阶段到可被回望的人生位置', caveat: '“少年”的具体年龄边界随教育制度和社会分类变化；文学中也常把它用作回忆视角。',
    stages: [
      { period: '古典时期', title: '年少之人与年少时光', description: '它主要描述生命阶段，也常关联游学、轻健、离家和成年后的回望。', status: '语义转折' },
      { period: '近代', title: '学校教育重画年龄边界', description: '现代学制、儿童读物和年龄组织逐渐区分儿童、少年与青年。', status: '语义转折' },
      { period: '1925', title: '父亲早年谋生的回忆坐标', description: '《背影》的“少年出外谋生”用年龄词压缩一段艰难而漫长的个人经历。', status: '文本锚点' },
      { period: '当代', title: '年龄身份与文化气质', description: '“少年感”“少年心气”等说法又把它扩展为可以跨越实际年龄的精神状态。', status: '当代延伸' },
    ],
  },
  自然: {
    word: '自然', heading: '从自然而然到物理世界与价值标签', caveat: '《背影》和《敬业与乐业》中的自然都是“自然而然”；“保护自然”则是另一条近代形成的义线。',
    stages: [
      { period: '古典时期', title: '自己如此、不假外力', description: '早期哲学与日常表达强调事物依其本性发生，常回答“如何成为这样”。', status: '语义转折' },
      { period: '晚清', title: '承接 nature 的外部世界', description: '自然科学与哲学翻译使它越来越指相对于人类社会和人工造作的物质世界。', status: '语义转折' },
      { period: '1922—1925', title: '两个“自然会”的副词旧义', description: '《敬业与乐业》与《背影》都用“自然”说明情感或趣味顺势发生。', status: '文本锚点' },
      { period: '当代', title: '生态对象与真实性修辞', description: '“自然保护”“自然妆感”“自然生长”把环境、审美与商品价值连接起来。', status: '当代延伸' },
    ],
  },
  家庭: {
    word: '家庭', heading: '从家内共同体到情感、法律与生活单位', caveat: '古代的家族、户与室并不等同于现代小家庭；居住、亲属和经济关系的组合方式一直在变化。',
    stages: [
      { period: '古典时期', title: '家、户与宗族关系', description: '家庭生活嵌在更大的亲属、财产和礼制结构中，个人角色往往由家内秩序规定。', status: '语义转折' },
      { period: '近代', title: '现代家庭成为社会单元', description: '城市居住、学校教育和婚姻观念变化，使家庭逐渐成为可独立讨论的生活组织。', status: '语义转折' },
      { period: '1925', title: '琐屑中的情感摩擦', description: '《背影》写“家庭琐屑”，让宏大的父子回忆落回日常关系中的压力与误解。', status: '文本锚点' },
      { period: '当代', title: '多样结构与家庭媒介化', description: '核心家庭、单亲家庭和重组家庭等分类并存，家庭生活也被相册、群聊和账号持续记录。', status: '当代延伸' },
    ],
  },
  世界: {
    word: '世界', heading: '从佛教时空到全球尺度与私人隐喻', caveat: '“世界”可以大到全球，也可以小到一个人所承担的全部；不同尺度长期并存。',
    stages: [
      { period: '中古时期', title: '世与界构成的时空', description: '佛教译经把时间流转与空间界域结合，用来描述众生所在的宇宙层次。', status: '语义转折' },
      { period: '晚清', title: '全球地理与跨国比较', description: '地图、报刊和新式教育让世界越来越指可观察、可比较的全球整体。', status: '语义转折' },
      { period: '1962—1985', title: '技术史尺度与家庭责任隐喻', description: '《中国石拱桥》说“世界桥梁史”，《散步》则把一家人的重量写成“整个世界”。', status: '文本锚点' },
      { period: '当代', title: '现实、虚拟与个人世界', description: '游戏世界、数字世界和“我的世界”等用法，使它也能指一套自成规则的经验空间。', status: '当代延伸' },
    ],
  },
  爱情: {
    word: '爱情', heading: '从相爱之情到现代亲密关系概念', caveat: '古代当然存在相爱经验，但现代“爱情”与自由恋爱、婚姻选择和个人幸福的绑定主要在近代加强。',
    stages: [
      { period: '古典时期', title: '爱慕、相思与婚恋情感', description: '诗词、传奇和戏曲描写丰富的亲密经验，但常使用相思、情、爱等不同词汇。', status: '语义转折' },
      { period: '晚清—民国', title: '个人选择与自由恋爱', description: '翻译文学、新式婚姻讨论和城市文化让爱情成为个人生活价值的重要名词。', status: '语义转折' },
      { period: '1956', title: '支配一生的意义来源', description: '《我为什么而活着》把对爱情的渴望与求知、同情并列，作为生命动力。', status: '文本锚点' },
      { period: '当代', title: '亲密实践与平台叙事', description: '婚恋应用、情感内容和关系心理学不断重写爱情的表达方式、节奏与评价标准。', status: '当代延伸' },
    ],
  },
  科学: {
    word: '科学', heading: '从近代译名到知识制度与判断标准', caveat: '中国古代有丰富的知识和技术实践，但不能把现代“科学”这一学科制度原样提前。',
    stages: [
      { period: '19 世纪以前', title: '格致、博物与专门技艺', description: '对自然和器物的研究分布在不同知识传统中，尚未统一为现代 science 的制度门类。', status: '语义转折' },
      { period: '晚清', title: '“科学”成为 science 译名', description: '留学、日译和新式教育推动它取代部分“格致”用法，并进入现代学科分类。', status: '语义转折' },
      { period: '1991', title: '以实验取得新知识', description: '《应有格物致知精神》把科学发展、历史和实验连成一种求真的方法。', status: '文本锚点' },
      { period: '当代', title: '学科共同体与“合理”修辞', description: '除研究制度外，“科学安排”“科学育儿”等说法也把它用作可靠、有效的评价词。', status: '当代延伸' },
    ],
  },
  历史: {
    word: '历史', heading: '从史官记录到时间过程与数字记录', caveat: '古典“史”传统深厚，但“历史”作为学科、过去整体和发展过程的总称主要在近代重新定型。',
    stages: [
      { period: '古典时期', title: '史官、史书与历代记载', description: '过去通过纪传、编年和制度记录被组织，“史”比抽象的“历史过程”更居核心。', status: '语义转折' },
      { period: '晚清—民国', title: '现代学科与发展过程', description: '新式学校和历史观变化，使它既指研究过去的学科，也指事物沿时间发生的变化。', status: '语义转折' },
      { period: '1991', title: '科学发展的经验背景', description: '《应有格物致知精神》说“科学发展的历史”，把历史用作检验知识主张的积累。', status: '文本锚点' },
      { period: '数字时代', title: '浏览、版本与操作记录', description: '“搜索历史”“版本历史”把过去压缩为系统可保存、查询和清除的数据轨迹。', status: '当代延伸' },
    ],
  },
  实验: {
    word: '实验', heading: '从实际验证到标准化研究方法', caveat: '古代存在试验与验证实践，但现代实验依赖仪器、实验室、可重复程序和学科共同体。',
    stages: [
      { period: '古代—近世', title: '尝试、检验与经验技术', description: '工艺、医药和农事中长期存在实践验证，但未必以统一的“实验科学”组织。', status: '语义转折' },
      { period: '晚清—20 世纪初', title: '实验室科学进入学校', description: '新式学科、仪器和教学制度让实验成为观察、控制与验证理论的方法。', status: '语义转折' },
      { period: '1991', title: '获得认识的必要路径', description: '《应有格物致知精神》以“实地实验”反对只靠内省和清谈取得新知。', status: '文本锚点' },
      { period: '当代', title: '研究方法扩展到产品与社会', description: '临床实验、社会实验和 A/B 实验让实验逻辑进入教育、商业与数字界面。', status: '当代延伸' },
    ],
  },
  生活: {
    word: '生活', heading: '从生存生计到日常经验与价值方式', caveat: '“生活”既可指维持生命，也可指日常经验和一种值得追求的方式，这些含义常在同一句话里叠合。',
    stages: [
      { period: '古代', title: '生存、生计与使之活', description: '早期用法更贴近活命、生计或使事物存活，并非今天完整的“日常生活”概念。', status: '语义转折' },
      { period: '近代', title: '个人与社会的日常经验', description: '职业、家庭、城市和教育语境使生活逐渐成为概括日常世界的高频词。', status: '语义转折' },
      { period: '1922', title: '合理生活的价值法门', description: '《敬业与乐业》把敬业乐业称为人类生活的法门，生活在此带有明确的价值判断。', status: '文本锚点' },
      { period: '当代', title: '方式、品质与内容分类', description: '“生活方式”“生活质量”“生活区内容”等用法连接指标、私人经验和平台栏目。', status: '当代延伸' },
    ],
  },
  职业: {
    word: '职业', heading: '从职分生业到现代个人身份', caveat: '“有工作”与“拥有职业身份”并不完全相同；现代职业还包含资格、伦理和发展路径。',
    stages: [
      { period: '古典时期', title: '职分、官职与谋生之业', description: '社会分工更多由身份、家业与官制规定，“职”与“业”各有侧重。', status: '语义转折' },
      { period: '晚清—民国', title: '现代分工与职业教育', description: '工商业、学校和职业团体使职业成为个人进入社会、获得技能和承担责任的位置。', status: '语义转折' },
      { period: '1922', title: '需要敬与乐的工作身份', description: '《敬业与乐业》面向学生谈职业，把工作伦理与个人生活价值连接起来。', status: '文本锚点' },
      { period: '当代', title: '生涯、资格与灵活就业', description: '职业规划、职业认证和平台劳动让稳定身份与临时任务之间的边界重新移动。', status: '当代延伸' },
    ],
  },
};

export const literaryHotspotWords = Object.freeze(
  [...new Set(literaryWorks.flatMap((work) => work.segments.flatMap((segment) => segment.word ? [segment.word] : [])))],
);

for (const word of literaryHotspotWords) {
  if (!literaryTimelines[word]) throw new Error(`课本热词“${word}”缺少时间轴。`);
}

export function getLiteraryTimeline(word: string): LiteraryTimeline | undefined {
  return literaryTimelines[word];
}
