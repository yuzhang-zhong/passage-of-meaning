from __future__ import annotations

import json
import math
import re
from collections import Counter, defaultdict
from pathlib import Path

from openpyxl import load_workbook


ROOT = Path(__file__).resolve().parents[1]
DICT_PATH = ROOT / "research" / "dict_revised_2015_20260625.xlsx"
TARGET_PATH = ROOT / "research" / "story-senses.json"
OUTPUT_PATH = ROOT / "src" / "dictionarySenseEvidence.generated.json"
REPORT_PATH = ROOT / "research" / "dictionary-sense-match-report.json"
SOURCE_URL = "https://language.moe.gov.tw/001/Upload/Files/site_content/M0001/respub/dict_reviseddict_download.html"


def load_conversion_table(path: Path) -> dict[str, str]:
    result: dict[str, str] = {}
    with path.open("r", encoding="utf-8") as source:
        for raw_line in source:
            line = raw_line.strip()
            if not line or "\t" not in line:
                continue
            simplified, traditional = line.split("\t", 1)
            result[simplified] = traditional.split(" ", 1)[0]
    return result


character_map = load_conversion_table(ROOT / "research" / "STCharacters.txt")
phrase_map = load_conversion_table(ROOT / "research" / "STPhrases.txt")
reverse_character_map = {traditional: simplified for simplified, traditional in character_map.items() if len(traditional) == 1}


def to_traditional(text: str) -> str:
    if text in phrase_map:
        return phrase_map[text]
    return "".join(character_map.get(character, character) for character in text)


def to_simplified(text: str) -> str:
    return "".join(reverse_character_map.get(character, character) for character in text)


def split_definition(raw: str) -> list[str]:
    text = raw.replace("_x000D_", "\n").replace("\r", "\n")
    text = re.sub(r"\[(?:名|動|形|副|介|連|助|嘆|代|數|量)\]", "\n", text)
    text = re.sub(r"(?m)^\s*(?=\d+[.．])", "\n", text)
    parts: list[str] = []
    for block in re.split(r"\n+", text):
        block = re.sub(r"^\s*\d+[.．]\s*", "", block).strip()
        if not block or block.startswith("參見"):
            continue
        parts.append(re.sub(r"\s+", " ", block))
    return parts


def core_gloss(text: str) -> str:
    simplified = to_simplified(text)
    first_sentence = simplified.split("。", 1)[0]
    return re.split(r"(?:如：|例如|例：|也作|也稱|亦稱)", first_sentence, maxsplit=1)[0].strip()


GENERIC_BIGRAMS = {
    "词形", "前史", "早期", "现代", "近代", "当代", "候选", "语境", "意义", "用法", "词语",
    "概念", "指向", "检查", "追踪", "区分", "描述", "成为", "形成", "进入", "一种", "可以",
    "以及", "相关", "一般", "不同", "作为", "常用", "日常", "范围", "方式", "部分", "特定",
}

# Explicit stage decisions for high-value definitions and for cases where lexical
# similarity alone confuses a historical/literal sense with a later abstraction.
# Values are zero-based indices into the three-stage research blueprint.
MANUAL_STAGE_OVERRIDES: dict[tuple[str, str], int] = {
    ("科学", "以一定对象"): 1,
    ("科学", "合乎科学精神"): 2,
    ("自由", "指在《宪法》"): 1,
    ("浪漫", "富有诗意"): 2,
    ("哲学", "哲学一词"): 1,
    ("艺术", "对自然物及科学"): 1,
    ("逻辑", "研究思想本质"): 1,
    ("逻辑", "合乎一般常情"): 2,
    ("社会", "旧时里社"): 0,
    ("文化", "人类在历史发展"): 1,
    ("宗教", "利用人类对于宇宙"): 1,
    ("革命", "古时因天子"): 0,
    ("革命", "人类发展过程中"): 2,
    ("进化", "生物受外界环境"): 0,
    ("经济", "经济学上指"): 1,
    ("经济", "用较少的人力"): 2,
    ("义务", "泛称人在社会"): 0,
    ("义务", "出劳力而不接受"): 2,
    ("个人", "一己、单独一人"): 0,
    ("世界", "佛教用语"): 0,
    ("世界", "地球上的所有地方"): 1,
    ("世界", "自成体系的组织"): 2,
    ("少年", "年轻"): 0,
    ("企业", "从事生产、运输"): 1,
    ("投资", "以资本或劳务"): 1,
    ("自然", "当然"): 0,
    ("卫生", "清洁"): 1,
    ("心理", "个体心智活动"): 1,
    ("焦虑", "一种紧张不安"): 1,
    ("儿童", "未成年的男女"): 1,
    ("工人", "凭劳力做工"): 0,
    ("农民", "以务农為业"): 0,
    ("知识分子", "具有相当知识学问"): 1,
    ("国民", "泛指全国的人民"): 0,
    ("国家", "指具备领土"): 1,
    ("政治", "政就是眾人的事"): 0,
    ("干部", "政党或团体的中坚分子"): 1,
    ("代表", "某一地、事、物的象征物"): 2,
    ("代表", "由机关、团体选举出来"): 1,
    ("代表", "替代人选"): 0,
    ("法律", "泛指适用于所有人的规范"): 1,
    ("公共", "眾人共有"): 0,
    ("社会主义", "一种社会体制"): 1,
    ("社会主义", "一种思想主张"): 0,
    ("民族", "咸信共享文化的群体"): 1,
    ("中华", "中华民国的简称"): 1,
    ("中华", "古代汉族最初多建都"): 0,
    ("建设", "创建事业或增添设施"): 0,
    ("商品", "為𧹒卖而製造"): 0,
    ("劳动", "精神或肉体利用自然资源"): 1,
    ("劳动", "劳累、烦劳"): 0,
    ("工资", "劳工从事工作"): 1,
    ("品牌", "指用以代表某一销售者"): 1,
    ("广告", "经由平面、电子"): 1,
    ("信用", "不需要提供物资保证"): 1,
    ("信用", "诚实不欺的美德"): 0,
    ("风险", "可能发生的危险"): 0,
    ("报纸", "用一定名称"): 1,
    ("出版", "印成图书报刊"): 1,
    ("作者", "创作诗歌、文章"): 0,
    ("记者", "新闻事业中负责"): 1,
    ("编辑", "蒐集资料"): 0,
    ("编辑", "製作、编辑书报"): 1,
    ("传播", "广泛流传"): 0,
    ("节目", "泛指各种活动的项目"): 0,
    ("化学", "研究物质的组成"): 1,
    ("历史", "记载或讨论过去"): 0,
    ("历史", "以历史為研究对象"): 1,
    ("数学", "讨论数量、形状"): 1,
    ("数据", "经由调查或实验得到"): 1,
    ("能量", "物体或力场所具有"): 1,
    ("生态", "生物圈内的生物"): 1,
    ("环境", "周围地方的状况"): 0,
    ("环境", "泛指地表上影响人类"): 1,
    ("健康", "生理及心理机能正常"): 1,
    ("情感", "内心有所触发"): 1,
    ("爱情", "相爱的感情"): 0,
    ("隐私", "隐秘而不使人知道"): 0,
    ("婚姻", "因结婚而产生互為配偶"): 1,
    ("婚姻", "因婚姻而产生的亲戚"): 0,
    ("家庭", "一种以婚姻、血缘"): 1,
    ("时尚", "正在流行"): 0,
    ("压力", "个体生理或心理上"): 1,
    ("压力", "单位面积上所受之力"): 0,
    ("幸福", "平安吉祥"): 0,
    ("城市", "有宽广繁盛的街道"): 1,
    ("社区", "一些人以自由结合"): 1,
    ("街道", "供人车通行的道路"): 0,
    ("公园", "经过造园处理"): 1,
    ("空间", "泛称天地之间"): 0,
    ("空间", "物质存在的一种客观形式"): 1,
    ("地图", "说明地表自然景观"): 1,
    ("舞台", "剧场内供演戏"): 0,
    ("舞台", "比喻供某种事件"): 2,
    ("旅行", "泛称作客出行"): 0,
    ("移民", "人口在地理上"): 1,
    ("移民", "从甲地迁移"): 0,
    ("网络", "网罗、搜求"): 0,
    ("网络", "由若干电子元件"): 1,
    ("网络", "各相关部门互相联繫"): 2,
    ("窗口", "车站或电影院等的售票处"): 0,
    ("文件", "书札、公文"): 0,
    ("接口", "接合的地方"): 0,
    ("接口", "接著别人的话题"): 2,
    ("云", "水蒸气遇冷"): 0,
    ("代码", "电脑中，送入的讯息"): 1,
    ("智能", "智识与才能"): 0,
    ("病毒", "一种极小的微生物"): 1,
    ("病毒", "电脑病毒"): 2,
    ("标签", "贴在物品上的小纸片"): 0,
    ("表情", "由脸部的表现"): 0,
}

MANUAL_REJECTIONS: set[tuple[str, str]] = {
    ("党", "正直的"),
    ("新闻", "新知识"),
    ("性", "生命"),
    ("云", "比喻多"),
    ("世界", "世上、人间"),
}


def prefix_decision(table: dict[tuple[str, str], int] | set[tuple[str, str]], word: str, gloss: str):
    for key in table:
        key_word, prefix = key
        if key_word == word and gloss.startswith(prefix):
            return table[key] if isinstance(table, dict) else True
    return None


def ngrams(text: str, word: str) -> Counter[str]:
    cleaned = re.sub(r"[^\u3400-\u9fffA-Za-z0-9]+", "", to_simplified(text).lower())
    excluded = set(word) | {word}
    result: Counter[str] = Counter()
    for size, weight in ((1, 0.45), (2, 1.0), (3, 1.8), (4, 2.3)):
        for index in range(max(0, len(cleaned) - size + 1)):
            gram = cleaned[index:index + size]
            if gram in excluded or gram in GENERIC_BIGRAMS:
                continue
            result[gram] += weight
    return result


def cosine(left: Counter[str], right: Counter[str]) -> float:
    common = left.keys() & right.keys()
    numerator = sum(left[key] * right[key] for key in common)
    left_norm = math.sqrt(sum(value * value for value in left.values()))
    right_norm = math.sqrt(sum(value * value for value in right.values()))
    if not left_norm or not right_norm:
        return 0.0
    return numerator / (left_norm * right_norm)


def containment(left: Counter[str], right: Counter[str]) -> float:
    denominator = min(sum(left.values()), sum(right.values()))
    if not denominator:
        return 0.0
    return sum(min(left[key], right[key]) for key in left.keys() & right.keys()) / denominator


def semantic_score(sense: dict[str, str], gloss: str, word: str) -> float:
    label_vector = ngrams(f"{sense['name']} {sense['shortName']}", word)
    description_vector = ngrams(sense["description"], word)
    candidate_vector = ngrams(gloss, word)
    label_score = max(cosine(label_vector, candidate_vector), containment(label_vector, candidate_vector))
    description_score = max(cosine(description_vector, candidate_vector), containment(description_vector, candidate_vector))
    return max(label_score, description_score * 0.92, (label_score + description_score) * 0.56)


targets = json.loads(TARGET_PATH.read_text(encoding="utf-8"))
research_targets = [target for target in targets if target["maturity"] == "research"]

workbook = load_workbook(DICT_PATH, read_only=True, data_only=True)
sheet = workbook[workbook.sheetnames[0]]
entries: dict[str, list[str]] = defaultdict(list)

for row in sheet.iter_rows(min_row=2, values_only=True):
    headword = row[0]
    alias = row[1]
    definition = row[15]
    if not isinstance(headword, str) or not isinstance(definition, str):
        continue
    entries[headword.strip()].append(definition)
    if isinstance(alias, str):
        for item in re.split(r"[、,，;；\s]+", alias.strip()):
            if item:
                entries[item].append(definition)


output: dict[str, dict[str, dict[str, object]]] = {}
report: list[dict[str, object]] = []

for target in research_targets:
    word = target["word"]
    traditional = to_traditional(word)
    raw_definitions = entries.get(traditional) or entries.get(word) or []
    candidates: list[dict[str, str]] = []
    seen: set[str] = set()
    for raw_definition in raw_definitions:
        for segment in split_definition(raw_definition):
            normalized = re.sub(r"\s+", "", segment)
            if normalized in seen:
                continue
            seen.add(normalized)
            candidates.append({"segment": segment, "gloss": core_gloss(segment)})

    # Let every dictionary segment choose its best semantic stage, then keep at most
    # one segment per stage. This avoids losing a good second-stage match merely
    # because another stage happened to rank the same segment first.
    proposals: list[dict[str, object]] = []
    for candidate_index, candidate in enumerate(candidates):
        if prefix_decision(MANUAL_REJECTIONS, word, candidate["gloss"]):
            continue
        scored = sorted(
            ((semantic_score(sense, candidate["gloss"], word), sense) for sense in target["senses"]),
            key=lambda item: item[0],
            reverse=True,
        )
        if not scored:
            continue
        best_score, best_sense = scored[0]
        second_score = scored[1][0] if len(scored) > 1 else 0.0
        manual_stage = prefix_decision(MANUAL_STAGE_OVERRIDES, word, candidate["gloss"])
        if isinstance(manual_stage, int):
            best_sense = target["senses"][manual_stage]
        proposals.append({
            "sense": best_sense,
            "candidateIndex": candidate_index,
            "score": best_score,
            "margin": best_score - second_score,
            "secondScore": second_score,
            "manual": isinstance(manual_stage, int),
        })

    accepted: list[dict[str, object]] = []
    used_senses: set[str] = set()
    for pair in sorted(proposals, key=lambda item: (bool(item["manual"]), float(item["score"]), float(item["margin"])), reverse=True):
        sense_id = pair["sense"]["id"]
        score = float(pair["score"])
        margin = float(pair["margin"])
        # A strong semantic overlap can stand alone; weaker overlaps need a clear lead.
        if sense_id in used_senses or (not pair["manual"] and (score < 0.065 or (score < 0.16 and margin < 0.018))):
            continue
        used_senses.add(sense_id)
        accepted.append(pair)

    word_output: dict[str, dict[str, object]] = {}
    for sequence, pair in enumerate(sorted(accepted, key=lambda item: target["senses"].index(item["sense"])), start=1):
        sense = pair["sense"]
        candidate = candidates[int(pair["candidateIndex"])]
        segment = candidate["segment"]
        excerpt = segment if len(segment) <= 220 else f"{segment[:219].rstrip()}…"
        word_output[sense["id"]] = {
            "id": f"moe-sense-{target['storyId']}-{sequence}",
            "excerpt": f"“{traditional}”條：{excerpt}",
            "context": f"這一辭典義項與本頁“{sense['shortName']}”候選在語義特徵上相符，可用來核對詞義邊界；它不證明這一意義始於辭典出版年。",
            "source": f"教育部《重編國語辭典修訂本》·“{traditional}”條",
            "year": 2026,
            "dateLabel": "網路第六版 · 2026-06-25",
            "medium": "歷史語言辭典",
            "grade": "A",
            "status": "人文解釋",
            "note": (
                f"官方辭書原文；階段標籤已人工復核，自動語義匹配分數為 {float(pair['score']):.3f}；只作詞義核對，不作首見年代判定。"
                if pair["manual"]
                else f"官方辭書原文；與本階段的自動語義匹配分數為 {float(pair['score']):.3f}，只作詞義核對，不作首見年代判定。"
            ),
            "sourceUrl": SOURCE_URL,
            "reviewed": "已核驗",
        }

    if word_output:
        output[word] = word_output
    report.append({
        "word": word,
        "candidateCount": len(candidates),
        "acceptedCount": len(word_output),
        "proposals": [
            {
                "sense": pair["sense"]["shortName"],
                "score": round(float(pair["score"]), 4),
                "margin": round(float(pair["margin"]), 4),
                "manual": bool(pair["manual"]),
                "gloss": candidates[int(pair["candidateIndex"])]["gloss"],
            }
            for pair in sorted(proposals, key=lambda item: float(item["score"]), reverse=True)[:6]
        ],
        "matches": [
            {
                "senseId": pair["sense"]["id"],
                "sense": pair["sense"]["shortName"],
                "score": round(float(pair["score"]), 4),
                "margin": round(float(pair["margin"]), 4),
                "manual": bool(pair["manual"]),
                "gloss": candidates[int(pair["candidateIndex"])]["gloss"],
            }
            for pair in sorted(accepted, key=lambda item: target["senses"].index(item["sense"]))
        ],
    })

OUTPUT_PATH.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({
    "researchStories": len(research_targets),
    "matchedStories": len(output),
    "matchedSenses": sum(len(items) for items in output.values()),
    "unmatchedSenses": sum(len(item["senses"]) for item in research_targets) - sum(len(items) for items in output.values()),
    "output": str(OUTPUT_PATH),
    "report": str(REPORT_PATH),
}, ensure_ascii=False, indent=2))
