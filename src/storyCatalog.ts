import { catalogWords, getCatalogTheme, type CatalogEra, type CatalogMechanism, type CatalogWord } from './catalog';
import { stories as curatedStories, type Evidence, type Sense, type WordStory } from './data';
import cclSenseEvidenceData from './cclSenseEvidence.generated.json';
import dictionaryEvidenceData from './dictionaryEvidence.generated.json';
import dictionarySenseEvidenceData from './dictionarySenseEvidence.generated.json';
import timelineEvidenceData from './timelineEvidence.generated.json';
import { literaryWorks } from './literary';
import { manualSenseEvidence } from './manualSenseEvidence';
import { modernEvidence } from './modernEvidence';

const colors = ['#817250', '#9d4938', '#426c63'] as const;

function normalizeGeneratedEvidence(item: Evidence): Evidence {
  const raw = item as unknown as { status: string; reviewed: string };
  return {
    ...item,
    status: raw.status === '人文解釋' ? '人文解释' : raw.status as Evidence['status'],
    reviewed: raw.reviewed === '已核驗' ? '已核验' : raw.reviewed as Evidence['reviewed'],
  };
}

const dictionaryEvidence = Object.fromEntries(Object.entries(dictionaryEvidenceData).map(([word, item]) => [word, normalizeGeneratedEvidence(item as Evidence)])) as Record<string, Evidence>;
const dictionarySenseEvidence = Object.fromEntries(Object.entries(dictionarySenseEvidenceData).map(([word, senses]) => [
  word,
  Object.fromEntries(Object.entries(senses).map(([senseId, item]) => [senseId, normalizeGeneratedEvidence(item as Evidence)])),
])) as Record<string, Record<string, Evidence>>;
const cclSenseEvidence = Object.fromEntries(Object.entries(cclSenseEvidenceData).map(([senseId, item]) => [senseId, normalizeGeneratedEvidence(item as Evidence)])) as Record<string, Evidence>;
const timelineEvidence = Object.fromEntries(Object.entries(timelineEvidenceData).map(([senseId, items]) => [
  senseId,
  (items as Evidence[]).map(normalizeGeneratedEvidence),
])) as Record<string, Evidence[]>;

const pivotByEra: Record<CatalogEra, number> = {
  古典延续: 0,
  近代转折: 1,
  现代形成: 3,
  数字时代: 5,
};

const mechanismLabels: Record<CatalogMechanism, { name: string; shortName: string; description: string; media: readonly [string, string, string] }> = {
  翻译进入: { name: '翻译与概念重组候选', shortName: '概念重组', description: '检查旧有词形是否在译介中承接了新的知识或制度含义。', media: ['译著', '报刊', '教科书'] },
  身份建构: { name: '称谓与身份化候选', shortName: '身份形成', description: '追踪一般称谓何时变成可认领、可组织的群体位置。', media: ['组织文本', '文学', '报刊'] },
  政治重释: { name: '公共语境中的重释候选', shortName: '公共重释', description: '分辨词语在公共与制度语境中的含义，以及它与日常用法的边界。', media: ['制度文本', '报刊', '生活记录'] },
  制度迁移: { name: '制度语汇日常化候选', shortName: '制度迁移', description: '检查制度或专业称谓如何进入个人选择和日常关系。', media: ['法规', '商业文本', '日常记录'] },
  媒介塑形: { name: '媒介塑造的表达候选', shortName: '媒介塑形', description: '观察新媒介是否改变了词的语气、可见度、使用者与传播速度。', media: ['报刊', '广播影像', '网络文本'] },
  知识日常化: { name: '专业含义放宽候选', shortName: '知识日常化', description: '比较专业定义与公众表达，确认含义是否在科普和教育中放宽。', media: ['学科文献', '教材', '科普'] },
  价值变迁: { name: '评价方向变化候选', shortName: '价值变迁', description: '比较不同时期和人群对同一词的褒贬、强度与使用场景。', media: ['文学', '评论', '生活记录'] },
  隐喻扩展: { name: '从字面到抽象的扩展候选', shortName: '隐喻扩展', description: '区分字面指称、惯用搭配和抽象隐喻，追踪新用法的稳定过程。', media: ['文学', '报刊', '口语语料'] },
  技术迁移: { name: '技术语汇跨域候选', shortName: '技术迁移', description: '检查技术语汇是否从设备与工程场景迁移到人际、组织和日常表达。', media: ['技术文档', '科普', '日常表达'] },
  平台再造: { name: '平台机制再造候选', shortName: '平台再造', description: '分析平台规则、界面和计量方式如何重排一个词的含义与可见度。', media: ['产品界面', '平台规则', '网络语料'] },
};

interface SenseBlueprint {
  name: string;
  shortName: string;
  description: string;
}

type SenseBlueprintSet = readonly [SenseBlueprint, SenseBlueprint, SenseBlueprint];

const conceptBlueprints: Readonly<Record<string, SenseBlueprintSet>> = {
  科学: [
    { name: '“科学”词形与译介前史', shortName: '词形前史', description: '先核对早期“科—学”组合与近代译名，避免把古代知识实践直接等同于现代 science。' },
    { name: '学科制度、方法与知识体系', shortName: '现代科学', description: '指向专业共同体、可检验方法和分科知识制度的现代概念。' },
    { name: '“科学的”日常判断标准', shortName: '判断标准', description: '从学科名称扩展为对方法、管理和生活选择的合理性评价。' },
  ],
  自由: [
    { name: '自主、任意与不受拘束', shortName: '自主行动', description: '追踪古典和早期口语中自己作主、可以自行行动的用法。' },
    { name: '政治、法律与伦理中的自由', shortName: '权利概念', description: '近代公共论述将自由组织为与个人、权利、责任和国家有关的概念。' },
    { name: '个人选择、时间与生活方式', shortName: '生活自由', description: '在当代消费、职业和亲密关系中，“自由”常衡量可选择性与可支配空间。' },
  ],
  浪漫: [
    { name: '放纵不拘与散漫之义', shortName: '不拘散漫', description: '早期用法可指行为放纵、不受约束，评价方向并不必然积极。' },
    { name: '浪漫主义与文艺想象', shortName: '文艺概念', description: '译介 Romanticism 后，词语进入文学艺术史，指向特定流派与审美倾向。' },
    { name: '爱情、氛围与仪式感', shortName: '情感氛围', description: '当代日常用法常把“浪漫”作为亲密行为、场景氛围与感受的积极评价。' },
  ],
  民主: [
    { name: '“民之主”的古典词形', shortName: '民之主', description: '古典文本中“民主”可指民众的主宰或君主，与现代 democracy 不可直接合并。' },
    { name: '主权在民与政治制度', shortName: '现代政体', description: '近代译介中，词义转向民众参与、主权归属与政治制度的讨论。' },
    { name: '协商、参与与管理风格', shortName: '参与方式', description: '词语也扩展到家庭、组织和教育场景，描述允许意见与共同决定的方式。' },
  ],
  哲学: [
    { name: '“哲”的智慧资源与新词前史', shortName: '词形资源', description: '先区分古典“哲”“哲人”等智慧语汇与近代“哲学”学科名称。' },
    { name: '近代学科体系中的哲学', shortName: '学科概念', description: '作为 philosophy 的现代译名，它进入大学、出版和知识分类体系。' },
    { name: '人生、经营与行动原则', shortName: '实践哲学', description: '日常中的“人生哲学”“经营哲学”将学科名称放宽为稳定的原则与态度。' },
  ],
  艺术: [
    { name: '技艺、方术与操作本领', shortName: '技艺方术', description: '早期“艺术”可笼统指技能、方法与本领，范围不限于现代美术。' },
    { name: '文学美术等审美活动总称', shortName: '现代艺术', description: '近现代知识分类中，“艺术”逐步稳定为文学、视觉、表演等审美活动。' },
    { name: '高明的方法与表达技巧', shortName: '方法技巧', description: '“说话艺术”“管理艺术”等搭配保留了“高明技巧”的抽象评价。' },
  ],
  美学: [
    { name: '审美语汇与学科译名前史', shortName: '译名前史', description: '区分中国古代论美传统与“美学”作为现代学科名称的形成。' },
    { name: '研究美与艺术经验的学科', shortName: '审美学科', description: '它在哲学和艺术理论中研究美、审美经验与艺术判断。' },
    { name: '设计风格与感官秩序', shortName: '日常美学', description: '“生活美学”“产品美学”将学科名称扩展为对设计与感官风格的概括。' },
  ],
  逻辑: [
    { name: '近代音译词与译名竞争', shortName: '译名形成', description: '“逻辑”的词形与 logic 的译介相关，需同“论理”“名学”等候选译名对照。' },
    { name: '推理规则与形式学科', shortName: '推理学科', description: '在哲学、数学和计算领域，“逻辑”指向推理形式、有效性和规则系统。' },
    { name: '话语、流程与行为的连贯性', shortName: '日常连贯', description: '“这没逻辑”或“业务逻辑”把学科词放宽为规则、因果与组织方式。' },
  ],
  社会: [
    { name: '社祭、结社与聚会词形', shortName: '社会前史', description: '早期“社”与“会”可连系祭社、结社与人群聚会，需与现代 society 概念区分。' },
    { name: '现代人群关系与制度总体', shortName: '现代社会', description: '近代以后，“社会”成为描述人群关系、组织和制度总体的基础概念。' },
    { name: '社交能力、社会经验与网络关系', shortName: '日常关系', description: '在“走向社会”“社会人”等表达中，它进一步指向经验、人情与交往网络。' },
  ],
  文化: [
    { name: '文治教化与人的修养', shortName: '文治教化', description: '古典语境将“文化”与文治、教化和移风易俗联系，并非现代学科概念的原样。' },
    { name: '人类生活方式与象征体系', shortName: '现代文化', description: '近代 culture 相关概念进入后，“文化”扩展为生活方式、知识与象征的总体。' },
    { name: '组织、品牌与圈层的共同风格', shortName: '圈层文化', description: '“企业文化”“粉丝文化”等复合词把文化缩小为特定群体的价值和行为模式。' },
  ],
  宗教: [
    { name: '宗旨、教法与门派语境', shortName: '教法前史', description: '早期词形与佛教等教法、宗旨和门派语境有关，需避免与现代 religion 类目直接合并。' },
    { name: '信仰、组织与仪式的现代类目', shortName: '现代宗教', description: '近代知识与法律分类将多种信仰传统纳入“宗教”这一总括性类目。' },
    { name: '强烈信奉与生活核心的比喻', shortName: '信奉比喻', description: '“将某事当作宗教”之类说法，把宗教隐喻为不可动摇的信念与生活秩序。' },
  ],
  革命: [
    { name: '天命更易与改朝换代', shortName: '天命更易', description: '古典“革命”与变革天命、王朝更替相关，其政当性框架与现代用法不同。' },
    { name: '政治与社会结构的根本变革', shortName: '社会变革', description: '近代 revolution 相关概念使“革命”指向对政治制度与社会秩序的根本改造。' },
    { name: '技术、产业与生活的颠覆性变化', shortName: '颠覆变化', description: '“技术革命”“厨房革命”等搭配将其扩展为幅度很大的创新与改变。' },
  ],
  进化: [
    { name: '近代译名与生物演变概念', shortName: '生物进化', description: '“进化”作为近代译语进入生物学，需区分进化事实、机制理论与进步价值判断。' },
    { name: '社会历史的阶段性进步叙事', shortName: '社会进化', description: '词语曾被扩展到社会与历史，将变化组织为从低到高的阶段叙事。' },
    { name: '产品、能力与系统的升级', shortName: '升级比喻', description: '当代商业和技术表达中，“进化”常比喻产品更新、能力提升与系统迭代。' },
  ],
  经济: [
    { name: '经世济民与治国才能', shortName: '经世济民', description: '古典“经济”可与经营天下、治国济民的才能与事业相关。' },
    { name: '生产、分配与市场活动总体', shortName: '现代经济', description: '现代 economy 概念将“经济”组织为生产、流通、分配和消费的系统。' },
    { name: '节省、划算与可承担性', shortName: '经济实惠', description: '“经济实惠”“经济型”等日常用法把宏观名词转为节省资源的评价。' },
  ],
  权利: [
    { name: '权势、利益与词形前史', shortName: '词形前史', description: '核对早期“权”“利”及“权利”组合，不把权势与利益直接等同现代 rights。' },
    { name: '法律确认的资格与请求', shortName: '法律权利', description: '近代法律语汇中，“权利”指向个人或主体可主张、行使与受保护的资格。' },
    { name: '消费、数据与平台环境中的主张', shortName: '新型权利', description: '当代“知情权”“数据权利”等讨论不断扩展权利的对象与实现场景。' },
  ],
  义务: [
    { name: '道义、职分与应尽之事', shortName: '道义职分', description: '早期用法可从合乎道义的事务与身分职分理解，尚不是统一法律概念。' },
    { name: '法律与制度规定的责任', shortName: '法定义务', description: '现代制度中，“义务”与权利对举，指必须履行的行为或责任。' },
    { name: '公益服务与无偿性活动', shortName: '公益无偿', description: '“义务劳动”“义务讲解”等搭配让词语获得自愿、公益或无偿的色彩。' },
  ],
  个人: [
    { name: '个别的人与私人语境', shortName: '个别之人', description: '先检查“个人”作为个别人或与集体相对的词形如何稳定。' },
    { name: '具有权利与意志的现代个体', shortName: '现代个体', description: '近现代论述将个人组织为具有独立意志、权利、责任和私领域的主体。' },
    { name: '个人账号、个人数据与个性化', shortName: '数字个人', description: '数字平台中，“个人”与账号、信息、隐私和个性化服务相连。' },
  ],
  现代: [
    { name: '现今、当世与时间分期前史', shortName: '当世时间', description: '检查表示“现在”“当下”的时间语汇如何与“现代”这一分期名称接合。' },
    { name: '与传统相对的制度与生活形态', shortName: '现代性', description: '“现代”不只是年代，也可指工业、城市、科学和个人化等制度组合。' },
    { name: '当代、新式与风格化的“现代”', shortName: '新式风格', description: '日常中“现代设计”“现代感”又将它变成对外观、技术和生活方式的评价。' },
  ],
  世界: [
    { name: '佛教时空与众生所居之界', shortName: '佛教时空', description: '“世界”在汉译佛教语汇中组合时间与空间，后在汉语中长期扩展。' },
    { name: '全球、人类社会与国际尺度', shortName: '全球世界', description: '近现代“世界”常指全球范围、国际秩序或人类共同生活的总体。' },
    { name: '个人经验、圈层与数字虚拟空间', shortName: '私人世界', description: '“内心世界”“游戏世界”等用法将世界缩放为特定个人、群体或虚拟系统的全部。' },
  ],
};

const identityBlueprints: Readonly<Record<string, SenseBlueprintSet>> = {
  青年: [
    { name: '年岁阶段与青壮年之人', shortName: '年龄阶段', description: '早期“青年”首先可指青春年岁或年轻人，具体年龄边界并不固定。' },
    { name: '可动员的世代与公共身份', shortName: '世代身份', description: '近现代教育、组织和报刊将青年建构为具有共同责任与时代想象的群体。' },
    { name: '生活方式、文化取向与心态', shortName: '青年文化', description: '当代“青年”也是媒介、消费和文化生产中的人群标签，有时超出严格年龄。' },
  ],
  女性: [
    { name: '女子、性别与词形建立', shortName: '性别称谓', description: '追踪“女性”如何从指称女子的性别词汇中稳定，并与“妇女”等称谓分工。' },
    { name: '社会性别与公共身份', shortName: '女性身份', description: '在教育、劳动、法律和文学中，“女性”成为讨论权利、经验与性别角色的主体。' },
    { name: '人群细分、风格与平台标签', shortName: '平台标签', description: '当代媒介与商业语境常以“女性”进行受众细分，也可引发对刻板化的质疑。' },
  ],
  人民: [
    { name: '庶民、百姓与被治理者', shortName: '庶民百姓', description: '早期“人民”可泛指百姓与居民，往往处在与君主、官府相对的位置。' },
    { name: '现代国家中的集体政治主体', shortName: '政治主体', description: '近现代公共论述将“人民”组织为具有集体性、正当性与主权含义的基本主体。' },
    { name: '公共服务与制度名称中的人群', shortName: '制度称谓', description: '“人民法院”“人民医院”等名称使该词稳定存在于公共机构与服务语境。' },
  ],
  儿童: [
    { name: '年幼之人与日常年龄称谓', shortName: '幼小年龄', description: '“儿童”长期指向年幼者，但日常所指年龄与后来的制度界定并不总是一致。' },
    { name: '教育、医疗与法律中的保护对象', shortName: '制度年龄', description: '现代学校、儿科、福利和法律制度将儿童定义为需要专门教育与保护的人群。' },
    { name: '内容分级、产品与儿童视角', shortName: '儿童场景', description: '当代“儿童模式”“儿童文学”等搭配，又把身份转化为内容、产品与视角标准。' },
  ],
  少年: [
    { name: '年岁方少与青春之人', shortName: '年少之人', description: '古典与文学中的“少年”可指年幼或青春之人，常带有生命阶段的情感色彩。' },
    { name: '学校、组织与法律中的年龄群体', shortName: '制度少年', description: '现代教育和未成年人制度为“少年”提供了更明确的年龄与组织边界。' },
    { name: '可被回望的心态与文化想象', shortName: '少年感', description: '“少年感”等当代表达把年龄称谓扩展为好奇、轻盈与未定型的心态。' },
  ],
  工人: [
    { name: '做工之人、工匠与雇工', shortName: '做工之人', description: '早期“工人”可宽泛指从事做工、工艺或雇佣劳动的人。' },
    { name: '工业生产与劳动关系中的阶层', shortName: '产业工人', description: '现代工厂、工会与劳动制度将“工人”建构为稳定的职业与社会身份。' },
    { name: '服务、平台与新型劳动者', shortName: '新型劳动', description: '当代用法需面对工厂之外的服务工人、平台劳动者与技术工人。' },
  ],
  农民: [
    { name: '务农之人与乡里居民', shortName: '务农之人', description: '“农民”首先以农业生产与乡村居住为识别核心，两者并不总是完全重合。' },
    { name: '土地、户籍与社会结构中的身份', shortName: '制度农民', description: '现代土地、户籍与组织制度让“农民”不只是职业，也成为社会分类。' },
    { name: '新型职业农民与流动劳动身份', shortName: '身份分化', description: '“职业农民”与“农民工”等复合称谓显示生产、户籍与工作地的分离。' },
  ],
  学生: [
    { name: '从师受业与求学之人', shortName: '求学之人', description: '早期“学生”可指求学者、门生或读书人，尚不必然依赖统一学制。' },
    { name: '现代学校制度中的在学身份', shortName: '在学身份', description: '学籍、年级、课程和考试制度将学生建构为可登记、可分类的教育身份。' },
    { name: '终身学习者与特定服务人群', shortName: '学习者', description: '在线教育与成人学习将“学生”扩展到校园之外，同时保留学生价、学生群体等制度搭配。' },
  ],
  知识分子: [
    { name: '近代译名与新式读书人', shortName: '译名形成', description: '“知识分子”是近现代形成的集体称谓，需与士人、文人和专业人士对照。' },
    { name: '以知识参与公共生活的群体', shortName: '公共角色', description: '该身份常与教育、专业劳动、公共表达和社会责任相联系。' },
    { name: '专业人士、专家与内容生产者的分化', shortName: '角色分化', description: '当代专业分工与平台表达让“知识分子”与专家、学者、知识创作者等称谓重叠又分离。' },
  ],
  公民: [
    { name: '公家之民与近代词形重组', shortName: '词形前史', description: '核对早期“公”“民”组合与近代 citizen 译介，避免把居民、臣民与公民混为一类。' },
    { name: '具有权利与义务的法律身份', shortName: '法律公民', description: '现代国家中，“公民”以国籍、权利、义务和政治成员资格为核心。' },
    { name: '公共参与、数字行为与“公民性”', shortName: '公民实践', description: '“公民意识”“数字公民”等用法将法律身份扩展为参与能力和行为规范。' },
  ],
  国民: [
    { name: '一国之民与近代国家想象', shortName: '一国之民', description: '“国民”在近代国家建构中强调人与国家的所属关系，并与臣民、人民、公民竞合。' },
    { name: '教育、动员与国家成员身份', shortName: '国家成员', description: '现代教育与公共论述将国民建构为具有共同素质、责任与国家归属的集体。' },
    { name: '健康、经济与统计中的总体人群', shortName: '统计总体', description: '“国民经济”“国民健康”等搭配使其成为宏观政策与统计中的人口总体。' },
  ],
  消费者: [
    { name: '购买与使用商品的人', shortName: '购买使用者', description: '随商品经济与消费概念形成，“消费者”指向购买、使用商品或接受服务的人。' },
    { name: '享有知情、选择与求偿权的主体', shortName: '权利主体', description: '消费者保护制度将市场角色改造为可主张权利、接受保护的法律主体。' },
    { name: '被画像、推荐与计量的平台人群', shortName: '数据消费者', description: '数字市场中，消费者同时是账号、数据画像和算法推荐的对象。' },
  ],
  用户: [
    { name: '户、使用者与制度登记词形', shortName: '词形前史', description: '核对“户”的登记含义与早期“用户”在公用事业、设备或服务中的使用者指称。' },
    { name: '产品、系统与服务的使用主体', shortName: '产品用户', description: '计算机和服务设计将“用户”建构为需求分析、权限管理与界面设计的中心。' },
    { name: '增长、留存与数据指标', shortName: '指标化用户', description: '平台中的“日活用户”“新用户”将具体的人转化为可计量、可运营的数据对象。' },
  ],
  网民: [
    { name: '互联网使用者的新称谓', shortName: '网络用户', description: '“网民”随互联网普及而形成，把上网行为组织为一种新的人群身份。' },
    { name: '参与公共表达的网络群体', shortName: '网络公众', description: '在新闻与公共论述中，“网民”常作为发表意见、形成舆论的集体主语。' },
    { name: '账号化、平台分化与统计人口', shortName: '平台网民', description: '当代网络生活分散在多个平台，网民既是账号参与者，也是宏观统计口径。' },
  ],
  同胞: [
    { name: '同母所生的兄弟姊妹', shortName: '血缘同胞', description: '“同胞”的字面核心是同一胞胎所生，指向亲近的兄弟姊妹关系。' },
    { name: '共同国家或族群成员的亲族隐喻', shortName: '共同体称谓', description: '公共论述将血缘称谓扩展为对共同国家、地域或族群成员的亲近呼唤。' },
    { name: '灾难、公益与跨地域情感动员', shortName: '情感动员', description: '当代新闻和公益语境常用“同胞”强化彼此责任、关切与共同体情感。' },
  ],
  群众: [
    { name: '成群之人与普通人群', shortName: '人群集合', description: '“群众”可指聚集的人群或多数普通人，边界取决于谁在命名谁。' },
    { name: '组织与公共工作中的对象与主体', shortName: '公共人群', description: '现代组织语言使“群众”成为公共服务、动员与意见表达中的基本人群。' },
    { name: '现场观众、网络围观与临时公众', shortName: '临时公众', description: '媒介场景中的“围观群众”等表达，将其变成围绕事件临时形成的公众。' },
  ],
  主体: [
    { name: '主要部分、核心结构与主客位置', shortName: '主要部分', description: '早期和一般用法可以“主体”指事物的主要部分，或与附属部分相对。' },
    { name: '哲学中认识与行动的主体', shortName: '哲学主体', description: '近代哲学译介中，“主体”与客体对举，指能够认识、判断与行动的存在者。' },
    { name: '法律、市场与平台中的责任承担者', shortName: '制度主体', description: '“市场主体”“责任主体”等搭配将抽象概念转为可登记、可归责的制度角色。' },
  ],
};

type CompactBlueprintLabels = readonly [string, string, string];

const publicMarketMediaKnowledgeLabels: Readonly<Record<string, CompactBlueprintLabels>> = {
  // 03 · 国家与公共生活
  国家: ['邦国、疆域与政权', '现代主权国家', '国家能力与公共象征'],
  政治: ['政事与治理活动', '现代政治制度与领域', '组织关系中的“政治”'],
  政府: ['治理政务与官府', '现代行政组织', '服务型与数字政府'],
  党: ['同类、伙伴与朋党', '现代政党组织', '党派、成员与组织身份'],
  组织: ['纺织、组合与结构', '机构团体与管理体系', '组织能力与平台化组织'],
  单位: ['计量标准与基本单元', '工作机构与制度身份', '数据、模块与最小单位'],
  机关: ['机械枢纽与关键部件', '行政机构与办事部门', '组织部门与技术装置的分化'],
  干部: ['事务骨干与负责人', '组织职务与人事身份', '管理者称谓与职业化'],
  领导: ['带领、引导的行为', '组织中的职位与称谓', '“领导力”与管理能力'],
  代表: ['代替、表达与象征', '制度性代表身份', '典型样本与品牌代表'],
  法律: ['法度、律令与准则', '现代法律体系与专业', '规则、合规与日常权利'],
  宪法: ['法度总则与古典词形', '国家根本法', '组织章程与“宪法性”比喻'],
  秩序: ['次序、条理与等级', '社会与公共秩序', '平台规则与算法秩序'],
  公共: ['公家所有与共同事务', '公共领域与公共利益', '公共空间、数据与服务'],
  社会主义: ['近代译介的社会思想', '制度、经济与社会理想', '历史、学术与日常复合语境'],
  民族: ['人群、族类与共同体前史', '近代 nation 与 ethnicity 的译介竞合', '法律身份、文化认同与品牌修辞'],
  中华: ['中原、华夏与文明称谓', '现代国家与共同体名称', '文化认同与象征性修辞'],
  独立: ['独自站立与不依附', '政治、法律与机构独立', '个人生活与判断能力'],
  解放: ['解开束缚与释放', '政治与社会解放概念', '身体、情感与生活方式的解放'],
  建设: ['建造工程与营建', '国家、社会与制度建设', '能力、团队与生态建设'],

  // 04 · 市场进入日常
  市场: ['集市、交易场所与买卖', '价格与交换机制', '受众、机会与“个人市场”'],
  商品: ['可买卖之物', '现代商品生产与价值形式', '内容、服务与数据商品化'],
  资本: ['本钱、资财与经营本钱', '现代经济中的资本关系', '人力、社会与注意力资本'],
  劳动: ['劳苦用力与做工', '生产关系中的劳动', '情感、数字与平台劳动'],
  职业: ['职分、生业与专门工作', '现代职业资格与身份', '职业发展、副业与个人品牌'],
  经理: ['经营、处理事务的行为', '企业管理职位', '产品、项目与职能经理分化'],
  公司: ['公众共同处理事务的词形前史', '现代企业法人组织', '平台公司、初创公司与雇主品牌'],
  企业: ['企图事业与经营活动', '现代经济组织与市场主体', '企业文化、责任与平台生态'],
  工资: ['工作报酬与按日计酬', '现代雇佣制度中的货币报酬', '薪酬包、平台结算与透明度'],
  收入: ['收进钱物与所得', '个人与机构的经济流入', '多元收入、被动收入与数字收益'],
  消费: ['消耗、使用与开支', '现代经济中的购买与需求', '文化、内容与绿色消费'],
  服务: ['服役、任职与为人做事', '现代服务业与公共服务', '用户体验、数字服务与服务化'],
  品牌: ['牌号、商标与商品识别', '现代营销中的品牌资产', '个人品牌、城市品牌与信任'],
  广告: ['广而告之与公示词形', '付费商业传播与媒介产业', '精准投放、原生广告与推荐边界'],
  信用: ['信任、任用与可信声誉', '金融借贷与制度化信用', '信用评分、平台声誉与数据化'],
  投资: ['投入财货与经营本钱', '现代金融投资与资产配置', '时间、教育与自我投资'],
  风险: ['风浪险阻与危险', '概率、保险与金融风险', '风险管理、风险偏好与日常判断'],
  创业: ['创立事业与开创基业', '现代企业家与初创企业活动', '平台创业、副业与自我雇佣'],

  // 05 · 媒介塑造表达
  新闻: ['新近听闻与消息', '现代新闻业与事实报道', '实时资讯、聚合流与假新闻辨识'],
  报纸: ['呈报文书与纸张', '现代印刷新闻媒介', '纸媒品牌、数字版与历史档案'],
  杂志: ['杂记、编录与定期刊物前史', '现代主题化定期出版物', '杂志品牌、电子刊与视觉风格'],
  出版: ['刊印、版本与发行', '现代出版业与版权制度', '数字出版、自出版与内容上线'],
  读者: ['阅读文字之人', '出版业与报刊的目标公众', '读者社群、数据画像与付费订阅者'],
  作者: ['创作文本之人', '现代著作权与文化生产身份', '内容创作者、协作与 AI 作者争议'],
  记者: ['记录与传达消息之人', '现代新闻职业与专业规范', '公民记者、自媒体与现场直播者'],
  编辑: ['编次、辑录与文本整理', '现代出版职业与把关机制', '内容编辑、算法编辑与产品操作'],
  传播: ['传递、播散与扩布', '现代传播学与大众媒介过程', '社交扩散、病毒传播与可计量传播'],
  宣传: ['宣告、传布与说明', '组织化公共传播与动员', '品牌推广、自我宣传与贬义语感'],
  舆论: ['众人议论与公议', '现代大众媒介中的公共意见', '热搜、数据监测与平台舆论'],
  话语: ['说话与语言表达', '语言学与人文研究中的 discourse', '话语权、品牌话语与平台表达'],
  文本: ['文字篇章与本文', '现代人文学科的分析对象', '数字文本、多模态内容与数据库文本'],
  直播: ['现场直接播送', '广播电视的实时节目形态', '平台直播、带货与实时互动'],
  节目: ['条目、事项与仪式次序', '广播电视的内容单元', '网络栏目、单期内容与算法切片'],
  频道: ['水道、通道与通路隐喻', '广播通信的频率与节目通道', '内容频道、销售渠道与个人频道'],
  主播: ['播音与节目主持职业', '广播电视的镜头前身份', '平台主播、带货与虚拟主播'],
  影像: ['影子、形象与视觉记录', '摄影电影与现代视觉媒介', '数字影像、监控视觉与生成式图像'],

  // 06 · 知识进入常识
  自然: ['自己如此与自然而然', '物质世界与 nature 概念', '环保、健康与“天然”价值标签'],
  物理: ['事物的道理与条理', '现代 physics 学科', '“物理性”、硬件与现实约束'],
  化学: ['化育之学与译名前史', '现代 chemistry 学科', '人际“化学反应”与风险标签'],
  生物: ['有生之物与生命体', '现代 biology 学科与分类', '生物技术、生物识别与生物性隐喻'],
  地理: ['土地形势与地方之理', '现代 geography 学科', '人文地理、位置数据与“地理限制”'],
  历史: ['史官记录与旧事', '过去过程与现代历史学', '浏览历史、版本历史与个人记录'],
  数学: ['算数之学与数术', '现代 mathematics 学科体系', '商业数学、概率思维与“算账”逻辑'],
  统计: ['统合计算与汇总数目', '现代 statistics 学科与国家调查', '平台指标、仪表盘与数据叙事'],
  实验: ['实际验证与试验', '实验室与可重复研究方法', '产品实验、A/B 测试与社会实验'],
  理论: ['辨理、议论与道理说明', '现代学科中的概念系统', '“理论上”与实践对立的日常用法'],
  系统: ['分类、统属与条理化', '科学与工程中的关联整体', '操作系统、组织系统与“系统性”'],
  模型: ['模子、样式与缩小实物', '科学推演与统计模型', '机器学习模型、商业模式与示范范型'],
  数据: ['计数根据与词形建立', '统计与计算中的可处理记录', '个人数据、数据资产与数据治理'],
  信息: ['音信、消息与可信的征候', '信息论与现代通信概念', '信息流、个人信息与信息过载'],
  基因: ['遗传因子与译名形成', '现代 genetics 中的遗传单位', '文化基因、品牌基因与决定论风险'],
  能量: ['能力大小与物理译名前史', '现代 physics 中的 energy', '人的精力、正负能量与健康修辞'],
  生态: ['生物生存状态与环境关系', '生态学与生态系统', '产业生态、平台生态与内容生态'],
  环境: ['四周境地与外在条件', '现代环境科学与公共问题', '工作环境、数字环境与用户环境'],
};

const selfSpaceTechnicalPlatformLabels: Readonly<Record<string, CompactBlueprintLabels>> = {
  // 07 · 身体、情感与自我
  身体: ['身躯、体魄与人之形体', '医学、教育与现代身体观', '身体管理、身份表达与可穿戴数据'],
  健康: ['强健、安好与无病', '现代医学与公共健康概念', '心理健康、生活方式与数字健康'],
  卫生: ['护卫生命与清洁前史', '现代 hygiene 与公共卫生制度', '个人卫生、环境卫生与安全标准'],
  精神: ['精气、神彩与心神', '哲学、医学与现代 mind/spirit 概念', '团队精神、精神状态与文化象征'],
  心理: ['心思、情理与内心活动', '现代 psychology 学科与临床概念', '用户心理、消费心理与自我诊断语言'],
  情感: ['情志、感受与人情', '现代心理与文学中的情感', '情感价值、情感劳动与情绪数据'],
  爱情: ['爱慕之情与相爱经验', '自由恋爱、婚姻选择与现代爱情', '亲密关系、媒介脚本与平台匹配'],
  隐私: ['私密之事与不愿公开', '现代法律中的私人领域与隐私权', '个人信息、数据追踪与平台隐私'],
  婚姻: ['婚娶关系与家族联结', '现代法律与个人选择中的婚姻', '亲密合作、非婚生活与平台婚恋'],
  家庭: ['家户、庭院与亲属共同体', '现代小家庭、法律与情感单位', '多元家庭、家庭分工与智能家庭'],
  亲密: ['亲近紧密与关系程度', '现代心理与社会学中的亲密关系', '数字亲密、边界协商与亲密劳动'],
  性: ['性情、本性与生物性别前史', '现代医学、法律与性概念', '性身份、性健康与媒介表达'],
  性别: ['男女分类与词形建立', '现代 sex/gender 概念的分化', '性别身份、平等与平台标签'],
  美: ['美好、称许与认为美', '审美判断与现代美的标准', '美化、美颜与界面视觉评价'],
  时尚: ['时世推崇与风尚', '现代 fashion 产业与消费品位', '潮流标签、生活方式与快时尚'],
  青春: ['青年岁月与生命盛期', '现代教育、文学与世代叙事', '青春感、怀旧与抗衰消费'],
  焦虑: ['焦急忧虑与情绪状态', '现代心理医学中的 anxiety', '容貌、职业、信息与平台焦虑'],
  压力: ['压迫之力与物理量', '生理心理与社会 stress 概念', '职场压力、同侪压力与指标负担'],
  幸福: ['福祚、幸运与美好境遇', '现代个人感受与社会目标', '幸福指数、情绪管理与消费承诺'],
  生活: ['生存、活命与生计', '现代日常经验与家庭社会生活', '生活方式、内容分类与“会生活”'],

  // 08 · 城市、空间与流动
  城市: ['城郭与交易聚落', '现代 urban city 与市民生活', '城市品牌、城市数据与智慧城市'],
  乡村: ['乡里、村落与农耕聚居', '现代城乡分类与乡村社会', '乡村旅游、新乡村与数字乡村'],
  社区: ['社团、地区与 community 译名前史', '基层居住与公共治理单元', '兴趣社区、线上社区与用户运营'],
  街道: ['城镇道路与街巷', '城市行政与基层管理区划', '街道生活、步行空间与地方文化'],
  广场: ['宽广场地与建筑空间', '现代城市公共集会空间', '商业广场、数字广场与平台公域'],
  公园: ['公共园林与休闲场所', '现代城市绿地与市民设施', '主题公园、口袋公园与生态服务'],
  空间: ['空处、间隔与容纳之所', '现代几何、物理与社会空间', '数字空间、私人空间与成长空间'],
  地方: ['所在之地与方域', '现代行政、区域与地方性', '地方感、本地服务与位置数据'],
  地图: ['疆域图籍与空间再现', '现代测绘与标准化地图', '导航、数据地图与知识地图'],
  边界: ['疆界、界线与范围', '现代国家、法律与学科边界', '人际边界、平台边界与模糊地带'],
  中心: ['当中之心与核心位置', '现代机构、城市与功能中心', '用户中心、数据中心与去中心化'],
  舞台: ['表演所用高台', '戏剧、娱乐与现代表演空间', '展示机会、公共场域与人生舞台'],
  交通: ['交错相通与往来', '现代道路运输与城市系统', '信息交通、智慧交通与可达性'],
  旅行: ['离家行旅与远行', '现代旅游业与个人体验', '自由行、数字游牧与人生旅程隐喻'],
  移民: ['迁徙人口与移居他地', '现代国家法律与跨境移民身份', '城市新移民、数字移民与归属'],
  流动: ['水流、移动与不固定', '人口、资本与社会流动', '数据流动、流动性与灵活工作'],
  风景: ['风光景物与可观之景', '旅游、绘画与现代 landscape', '行业风景、数字景观与可消费景观'],
  家园: ['家宅园地与故乡', '国土、社区与情感归属', '生态家园、精神家园与虚拟家园'],

  // 09 · 旧词进入技术生活
  网络: ['网状结构与交织关系', '通信与计算机网络', '社会网络、平台权力与网络生活'],
  平台: ['平坦高台与实体结构', '机构、活动与交流空间', '数字基础设施、市场组织与治理'],
  流量: ['流体通过的数量', '通信网络中的数据流量', '注意力、受众与可变现流量'],
  窗口: ['建筑采光通风之口', '图形界面中的 window', '服务入口、时间窗口与机会窗口'],
  桌面: ['桌子的平面与工作场所', '图形操作系统的 desktop 界面', '远程桌面、云桌面与个人数字工作台'],
  文件: ['公文、书面材料与案卷', '计算机中的数据文件', '云文件、共享权限与版本协作'],
  目录: ['书目与条目次序', '文件系统的 directory', '网站分类、服务目录与可发现性'],
  地址: ['居所位置与可到达地点', '网络与存储系统的 address', '网址、链接地址与数字身份定位'],
  端口: ['物体两端与出入之口', '通信系统的 port 编号与接续点', '产品入口、服务端口与开放连接'],
  接口: ['器物衔接与连接部位', '软硬件系统的 interface', '应用编程接口、服务窗口与组织接口'],
  终端: ['末端、终点与边端位置', '通信与计算系统的 terminal', '智能终端、用户端与边缘设备'],
  云: ['天空水汽与文学意象', '云计算与远程资源隐喻', '云服务、云端协作与平台基础设施'],
  计算: ['计数、算法与筹算', '机器计算与 computer science', '云计算、算力与可计算性'],
  程序: ['事务次序与法定步骤', '计算机可执行指令序列', '小程序、程序化流程与自动化'],
  代码: ['代号、密码与编码符号', '软件开发的 source code', '低代码、文化代码与规则的可编程化'],
  机器: ['机械装置与代替人力的工具', '工业与计算系统中的 machine', '机器学习、机器决策与人机关系'],
  智能: ['智慧与人的认知能力', '自动控制与 artificial intelligence', '智能设备、智能服务与“看起来智能”'],
  算法: ['算术的步骤与计算方法', '计算机科学中的 algorithm', '推荐算法、算法治理与日常归因'],
  病毒: ['疾病之毒与现代 virology 译名', '医学中的病毒性病原体', '计算机病毒、病毒式传播与污名化隐喻'],
  引擎: ['发动机与机械动力', '软件系统的 engine 核心模块', '搜索引擎、增长引擎与发展动力隐喻'],

  // 10 · 平台社会的新语义
  粉丝: ['淀粉制成的条状食物', '喜爱名人与作品的追随者', '账号关注者、数量指标与粉丝经济'],
  关注: ['关心注意与视线集中', '媒介受众对议题的注意', '平台关注按钮、关系链与指标'],
  点赞: ['点按与称赞的组合词形', '社交平台的赞同按钮动作', '可计量反馈、礼貌互动与流量信号'],
  转发: ['转交、转送与再次发出', '数字媒介的内容再分发动作', '扩散链路、态度表达与责任边界'],
  分享: ['分享所得与共同享用', '网络内容与资源的发送动作', '分享经济、生活展示与数据权限'],
  订阅: ['预约阅读与定期购买', '报刊与媒介的持续接收关系', '平台订阅按钮、付费会员与订阅经济'],
  热搜: ['热门搜索与查询排名的组合', '平台实时搜索榜单', '议题可见度、商业运营与榜单治理'],
  话题: ['谈话题目与讨论对象', '大众媒介组织的公共议题', '平台 hashtag 聚合、热度与参与入口'],
  标签: ['物品标记与分类签条', '信息系统的 metadata 与检索分类', '人群标签、算法画像与刻板化'],
  围观: ['从四周观看与聚集旁观', '媒介事件中的群体旁观', '网络围观、吃瓜参与与道德距离'],
  社群: ['社团与群体组合', '共同兴趣、地域与身份群体', '平台社群、私域运营与群规'],
  博主: ['博客主人与个人网页作者', '社交媒体的账号创作者', '职业博主、影响者与商业化身份'],
  账号: ['账目编号与登记标识', '计算系统的用户身份与权限', '平台账号资产、人格表演与封禁'],
  内容: ['容器内部之物与文章实质', '媒介与信息产品的 content', '平台内容产业、内容治理与内容化'],
  弹幕: ['弹药幕与密集遮蔽的词形前史', '视频画面上同步滚动评论', '共时观看、弹幕文化与内容干扰'],
  表情: ['面部神情与情绪外现', '文字通信中的表情符号', '表情包、反应按钮与跨文化语气'],
  头像: ['人的头部画像或照片', '数字账号的 profile image', '身份表演、虚拟化身与默认头像'],
  朋友圈: ['朋友交往的社会圈层', '移动社交平台的特定功能名称', '半私密内容场、人设展示与营销空间'],
};

function expandCompactBlueprints(labels: Readonly<Record<string, CompactBlueprintLabels>>): Record<string, SenseBlueprintSet> {
  return Object.fromEntries(Object.entries(labels).map(([word, stages]) => [word, stages.map((name, index) => ({
    name,
    shortName: name.split('与')[0]!.slice(0, 8),
    description: index === 0
      ? `核对“${word}”作为“${name}”的早期词形、搭配与使用者，先确认它与后起用法的边界。`
      : index === 1
        ? `追踪“${word}”如何在制度、知识或媒介中稳定为“${name}”，并找出关键转折文本。`
        : `检查当代“${name}”的使用者、媒介与边界，避免把热度直接当成新义。`,
  })) as unknown as SenseBlueprintSet])) as Record<string, SenseBlueprintSet>;
}

const compactBlueprints = expandCompactBlueprints({
  ...publicMarketMediaKnowledgeLabels,
  ...selfSpaceTechnicalPlatformLabels,
});

const semanticBlueprints: Readonly<Record<string, SenseBlueprintSet>> = {
  ...conceptBlueprints,
  ...identityBlueprints,
  ...compactBlueprints,
};

function provisionalActivity(start: number, rise: number, tail: number): number[] {
  return Array.from({ length: 8 }, (_, index) => {
    if (index < start) return 0;
    const distance = index - start;
    return Math.max(7, Math.round(rise + distance * tail));
  });
}

const periodUpperBounds = [1840, 1895, 1919, 1949, 1978, 2000, 2012] as const;

function periodIndexForYear(year: number): number {
  const index = periodUpperBounds.findIndex((upperBound) => year < upperBound);
  return index === -1 ? 7 : index;
}

function stableUnit(seed: string): number {
  let hash = 2166136261;
  for (const character of seed) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function evidenceTrajectory(entry: CatalogWord, sense: Sense, stageIndex: number, evidence: Evidence[]): Pick<Sense, 'activity' | 'startIndex' | 'firstStable'> {
  const temporalEvidence = evidence
    .filter((item) => item.status === '语料事实' && item.year <= 2025 && !/辞[书典]|字典/.test(item.medium))
    .sort((left, right) => left.year - right.year);
  const counts = Array.from({ length: 8 }, () => 0);
  for (const item of temporalEvidence) counts[periodIndexForYear(item.year)]! += 1;

  const evidencePeriods = counts.flatMap((count, index) => count ? [index] : []);
  const startIndex = evidencePeriods.length ? Math.min(...evidencePeriods) : sense.startIndex;
  const weightedTotal = counts.reduce((sum, count) => sum + count, 0);
  const evidenceCenter = weightedTotal
    ? counts.reduce((sum, count, index) => sum + count * index, 0) / weightedTotal
    : sense.startIndex + (stageIndex === 0 ? 0 : stageIndex === 1 ? 1.4 : 2.2);
  const amplitude = .78 + stableUnit(`${entry.id}:${sense.id}:amplitude`) * .58;
  const spread = .85 + stableUnit(`${entry.id}:${sense.id}:spread`) * 1.35;
  const slope = 2.4 + stableUnit(`${entry.id}:${sense.id}:slope`) * 4.8;

  const activity = Array.from({ length: 8 }, (_, period) => {
    if (period < startIndex) return 0;
    const distance = period - startIndex;
    const evidenceSignal = counts.reduce((sum, count, evidencePeriod) => (
      sum + count * 21 * Math.exp(-Math.abs(period - evidencePeriod) * .82)
    ), 0);
    const stageShape = stageIndex === 0
      ? Math.max(8, 31 - distance * slope)
      : stageIndex === 1
        ? 9 + 29 * Math.exp(-Math.pow(period - evidenceCenter, 2) / (2 * spread * spread))
        : 8 + distance * slope;
    const wordVariation = (stableUnit(`${entry.word}:${sense.id}:${period}`) - .5) * 10;
    return Math.max(6, Math.min(68, Math.round(stageShape * amplitude + evidenceSignal + wordVariation)));
  });

  const earliest = temporalEvidence[0];
  return {
    activity,
    startIndex,
    firstStable: earliest
      ? `当前最早可核证节点：${earliest.dateLabel ?? earliest.year}（不等于首次出现）`
      : sense.firstStable,
  };
}

function approximateYear(date: string): number {
  const exact = Number(date.match(/\d{3,4}/)?.[0]);
  if (Number.isFinite(exact)) return exact;
  if (date.includes('战国')) return -300;
  if (date.includes('唐')) return 750;
  if (date.includes('明末清初')) return 1640;
  return 0;
}

function literaryEvidence(word: string): Evidence[] {
  return literaryWorks
    .filter((work) => work.segments.some((segment) => segment.word === word))
    .map((work) => ({
      id: `textbook-${work.id}-${word}`,
      excerpt: work.segments.map((segment) => segment.text).join(''),
      context: work.context,
      source: `${work.author}${work.title}`,
      year: approximateYear(work.date),
      dateLabel: work.date,
      medium: work.genre,
      grade: 'B',
      status: '语料事实',
      note: '这是课本名篇中的文本锚点，可证当下句子的用法，不单独证明该词义的首次出现年代。',
      sourceUrl: work.sourceUrl,
      reviewed: '已核验',
    }));
}

function createResearchSenses(entry: CatalogWord): Sense[] {
  const pivot = pivotByEra[entry.era];
  const mechanism = mechanismLabels[entry.mechanism];
  const dictionaryAnchor = dictionaryEvidence[entry.word];
  const modernAnchor = modernEvidence[entry.word];
  const stagedDictionaryAnchors = dictionarySenseEvidence[entry.word] ?? {};
  const hasStagedPrehistoryAnchor = Boolean(stagedDictionaryAnchors[`${entry.id}-prehistory`]);
  const anchors = [
    ...literaryEvidence(entry.word),
    ...(!hasStagedPrehistoryAnchor && dictionaryAnchor ? [dictionaryAnchor] : []),
  ];
  const lateStart = Math.min(7, Math.max(4, pivot + 2));
  const blueprint = semanticBlueprints[entry.word];

  const senses: Sense[] = [
    {
      id: `${entry.id}-prehistory`,
      name: blueprint?.[0].name ?? '词形、旧义与早期语境',
      shortName: blueprint?.[0].shortName ?? '词形前史',
      description: blueprint?.[0].description ?? `从“${entry.word}”的早期词形、搭配和使用者开始，先区分旧词延续、同形异义与后起新词。`,
      color: colors[0],
      startIndex: Math.max(0, pivot - 1),
      activity: provisionalActivity(Math.max(0, pivot - 1), 34, -2),
      media: [{ name: '辞书与古籍', value: 34 }, { name: '报刊', value: 33 }, { name: '文学', value: 33 }],
      confidence: anchors.length ? .62 : .44,
      firstStable: anchors.length ? '已有课本文本锚点，稳定起点待核证' : '待补最早稳定用法',
      evidence: anchors,
    },
    {
      id: `${entry.id}-turn`,
      name: blueprint?.[1].name ?? mechanism.name,
      shortName: blueprint?.[1].shortName ?? mechanism.shortName,
      description: blueprint?.[1].description ?? mechanism.description,
      color: colors[1],
      startIndex: pivot,
      activity: provisionalActivity(pivot, 18, 5),
      media: mechanism.media.map((name, index) => ({ name, value: [34, 33, 33][index]! })),
      confidence: .38,
      firstStable: `${entry.era}（策展假设，待语料核证）`,
      evidence: [],
    },
    {
      id: `${entry.id}-contemporary`,
      name: blueprint?.[2].name ?? '当代扩展、搭配与边界',
      shortName: blueprint?.[2].shortName ?? '当代扩展',
      description: blueprint?.[2].description ?? `检查“${entry.word}”在当代日常、专业与网络语境中的扩展，避免把流行搭配直接写成新词义。`,
      color: colors[2],
      startIndex: lateStart,
      activity: provisionalActivity(lateStart, 12, 8),
      media: [{ name: '大众媒体', value: 34 }, { name: '专业文本', value: 33 }, { name: '网络语料', value: 33 }],
      confidence: .34,
      firstStable: '当代候选用法，待核验与旧义的边界',
      evidence: [],
    },
  ];

  return senses.map((sense, index) => {
    const stageAnchor = stagedDictionaryAnchors[sense.id];
    const corpusAnchor = cclSenseEvidence[sense.id];
    const manualAnchor = manualSenseEvidence[sense.id];
    const evidence = [
      ...sense.evidence,
      ...(stageAnchor ? [stageAnchor] : []),
      ...(corpusAnchor ? [corpusAnchor] : []),
      ...(manualAnchor ? [manualAnchor] : []),
      ...(index === 2 && modernAnchor ? [modernAnchor] : []),
      ...(timelineEvidence[sense.id] ?? []),
    ];
    const trajectory = evidenceTrajectory(entry, sense, index, evidence);
    if (!evidence.length) return { ...sense, ...trajectory };
    const directCount = evidence.filter((item) => item.status === '语料事实' && item.year <= 2025).length;
    const coveredPeriods = new Set(evidence
      .filter((item) => item.status === '语料事实' && item.year <= 2025)
      .map((item) => item.year < 1800 ? 'prehistory' : Math.min(7, Math.max(0, Math.floor((item.year - 1800) / 29))))).size;
    const gradeWeight = Math.max(...evidence.map((item) => item.grade === 'A' ? .12 : item.grade === 'B' ? .08 : .035));
    const editorialStability = Math.min(.88, .44 + gradeWeight + Math.min(.12, directCount * .035) + Math.min(.1, coveredPeriods * .025));
    return {
      ...sense,
      ...trajectory,
      confidence: Math.max(sense.confidence, editorialStability),
      evidence,
    };
  });
}

function createResearchStory(entry: CatalogWord): WordStory {
  const theme = getCatalogTheme(entry.themeId);
  return {
    id: entry.id,
    word: entry.word,
    english: `research dossier · ${entry.mechanism}`,
    topic: theme.title,
    intro: `“${entry.word}”已按深度词条流程展开：先看词形前史，再检验${entry.mechanism}与当代扩展。当前为待核证深度稿。`,
    question: entry.question,
    pattern: entry.pattern,
    maturity: 'research',
    senses: createResearchSenses(entry),
  };
}

const curatedByWord = new Map(curatedStories.map((story) => [story.word, story]));

export const allStories: readonly WordStory[] = catalogWords.map((entry) => curatedByWord.get(entry.word) ?? createResearchStory(entry));

if (allStories.length !== 188 || new Set(allStories.map((story) => story.word)).size !== 188 || allStories.some((story) => story.senses.length < 3)) {
  throw new Error('每个策展词都必须拥有唯一的深度词条和至少三组意义候选。');
}

const researchTrajectorySignatures = new Set(
  allStories
    .filter((story) => story.maturity === 'research')
    .map((story) => story.senses.map((sense) => sense.activity.join(',')).join('|')),
);

if (researchTrajectorySignatures.size < 180) {
  throw new Error(`研究词条的时间轴差异不足：当前只有 ${researchTrajectorySignatures.size} 组独立轨迹。`);
}
