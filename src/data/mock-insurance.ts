/* eslint-disable @typescript-eslint/no-explicit-any */
import { InsuranceProduct, Agent } from "@/types/insurance";

const generateCoverageDescription = (type: string, amount: number) => {
  const descriptions = {
    life: [
      `身故保險金 ${(amount / 10000).toFixed(0)}萬元`,
      `完全失能保險金 ${(amount / 10000).toFixed(0)}萬元`,
      `意外身故額外給付 ${(amount / 20000).toFixed(0)}萬元`,
      "住院日額給付 1000-2000元/日",
    ],
    health: [
      `住院醫療給付最高 ${(amount / 10000).toFixed(0)}萬元`,
      `門診手術給付 ${(amount / 100000).toFixed(0)}萬元`,
      "住院日額給付 1000-3000元/日",
      `重大疾病一次給付 ${(amount / 20000).toFixed(0)}萬元`,
    ],
    accident: [
      `意外身故保險金 ${(amount / 10000).toFixed(0)}萬元`,
      `意外失能保險金 ${(amount / 10000).toFixed(0)}萬元`,
      `意外醫療給付 ${(amount / 100000).toFixed(0)}萬元`,
      `公共交通意外額外給付 ${(amount / 20000).toFixed(0)}萬元`,
    ],
    travel: [
      `海外醫療費用 ${(amount / 10000).toFixed(0)}萬元`,
      `緊急救援費用 ${(amount / 20000).toFixed(0)}萬元`,
      "行李延誤補償 3000-8000元",
      "班機延誤補償 2000-5000元",
    ],
    vehicle: [
      `第三人責任險 ${(amount / 10000).toFixed(0)}萬元`,
      "車體險賠償金額依車價",
      "竊盜險全額理賠",
      "道路救援服務",
    ],
    property: [
      `建築物火災損失 ${(amount / 10000).toFixed(0)}萬元`,
      `動產火災損失 ${(amount / 60000).toFixed(0)}萬元`,
      `第三人責任 ${(amount / 30000).toFixed(0)}萬元`,
      "臨時住宿費用 3-10萬元",
    ],
  };

  return (
    descriptions[type as keyof typeof descriptions] || [
      "基本保障項目",
      "額外給付項目",
      "特殊保障項目",
      "附加服務項目",
    ]
  );
};

// Generate 100+ insurance products
const generateInsuranceProducts = (): InsuranceProduct[] => {
  // 使用種子隨機數生成器來確保SSR和客戶端一致性  
  let seed = 54321;
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const companies = [
    "台灣人壽",
    "國泰人壽",
    "富邦人壽",
    "新光人壽",
    "中國人壽",
    "南山人壽",
    "三商美邦",
    "台灣產險",
    "新光產險",
    "明台產險",
    "和泰產險",
    "兆豐產險",
    "華南產險",
    "第一產險",
    "台產",
    "泰安產險",
    "中華民國產險",
    "旺旺友聯產險",
  ];

  const baseProducts = {
    life: [
      "終身壽險",
      "定期壽險",
      "投資型壽險",
      "萬能壽險",
      "變額壽險",
      "年金險",
      "儲蓄險",
      "增額終身壽險",
      "利率變動壽險",
      "外幣保單",
      "房貸壽險",
      "信用貸款壽險",
    ],
    health: [
      "醫療險",
      "住院險",
      "手術險",
      "癌症險",
      "重大疾病險",
      "長期照顧險",
      "失能扶助險",
      "實支實付醫療險",
      "日額型醫療險",
      "一次給付醫療險",
      "牙科醫療險",
      "眼科醫療險",
    ],
    accident: [
      "意外險",
      "旅平險",
      "學生平安險",
      "工作傷害險",
      "交通意外險",
      "運動意外險",
      "職業災害險",
      "公共意外險",
      "居家意外險",
      "戶外活動險",
      "極限運動險",
      "水上活動險",
    ],
    travel: [
      "海外旅遊險",
      "國內旅遊險",
      "商務旅行險",
      "留學保險",
      "打工度假險",
      "自由行保險",
      "跟團旅遊險",
      "郵輪旅遊險",
      "背包客保險",
      "家庭旅遊險",
      "蜜月旅行險",
      "登山保險",
    ],
    vehicle: [
      "汽車險",
      "機車險",
      "第三人責任險",
      "車體險",
      "竊盜險",
      "電動車險",
      "營業用車險",
      "貨車險",
      "計程車險",
      "租車險",
      "露營車險",
      "重機險",
    ],
    property: [
      "住宅火險",
      "商業火險",
      "地震險",
      "颱風洪水險",
      "竊盜險",
      "玻璃險",
      "工程險",
      "電子設備險",
      "貨物險",
      "責任險",
      "營業中斷險",
      "建築工程險",
    ],
  };

  const features = [
    ["終身保障", "保費固定", "可借款", "分期繳費"],
    ["實支實付", "重大疾病保障", "住院津貼", "門診手術"],
    ["24小時保障", "全球理賠", "保費便宜", "快速理賠"],
    ["全球適用", "24小時救援", "線上投保", "即時理賠"],
    ["全險保障", "道路救援", "免費拖吊", "修車代步車"],
    ["火災保障", "地震基本險", "第三人責任", "臨時住宿"],
    ["保本型", "投資收益", "彈性繳費", "部分提領"],
    ["免體檢", "即時生效", "網路投保", "自動續保"],
    ["家庭優惠", "團體優惠", "無理賠折扣", "多年期優惠"],
  ];

  const products: InsuranceProduct[] = [];
  let id = 1;

  const getCoverageMultiplier = (insuranceType: string) => {
    switch (insuranceType) {
      case "life":
        return 400;
      case "accident":
        return 2500;
      case "vehicle":
        return 1500;
      default:
        return 600;
    }
  };

  const getMaxAge = (insuranceType: string) => {
    if (insuranceType === "life") {
      return 65;
    }
    if (insuranceType === "health") {
      return 75;
    }
    return 80;
  };

  Object.entries(baseProducts).forEach(([type, names]) => {
    names.forEach((name) => {
      // Only generate 2-3 products per name to ensure variety across types
      const productsPerName = Math.min(3, Math.ceil(20 / names.length));

      for (let p = 0; p < productsPerName; p++) {
        if (products.length >= 120) return; // Generate 120 products

        const company = companies[Math.floor(seededRandom() * companies.length)];
        const basePriceMap = {
          life: [1500, 5000],
          health: [800, 3000],
          accident: [300, 1200],
          travel: [200, 1500],
          vehicle: [2000, 6000],
          property: [300, 1000],
        } as const;

        const basePrice = basePriceMap[type as keyof typeof basePriceMap];

        const monthlyPremium = Math.floor(
          seededRandom() * (basePrice[1] - basePrice[0]) + basePrice[0],
        );
        const coverage = monthlyPremium * getCoverageMultiplier(type);

        products.push({
          id: id.toString(),
          name: `${company} ${name}`,
          company,
          type: type as any,
          premium: {
            monthly: monthlyPremium,
            annually: Math.floor(monthlyPremium * 11.5), // Usually 10-12 month discount
          },
          coverage: {
            amount: coverage,
            description: generateCoverageDescription(type as any, coverage),
          },
          rating: Math.round((seededRandom() * 1.5 + 3.5) * 10) / 10, // 3.5-5.0 rating
          reviewCount: Math.floor(seededRandom() * 200 + 10),
          features: features[Math.floor(seededRandom() * features.length)],
          ageRange: {
            min: type === "travel" ? 0 : 16,
            max: getMaxAge(type),
          },
          terms: `https://example.com/terms/${type}-insurance-${id}`,
        });
        id++;
      }
    });
  });

  return products.slice(0, 120); // Return exactly 120 products
};

// Generate 50+ agents
const generateAgents = (): Agent[] => {
  // 使用種子隨機數生成器來確保SSR和客戶端一致性
  let seed = 12345;
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const firstNames = [
    "小明",
    "美華",
    "志強",
    "淑芬",
    "建華",
    "雅婷",
    "志偉",
    "怡君",
    "文雄",
    "麗娟",
    "俊傑",
    "佳蓉",
    "宗翰",
    "慧如",
    "家豪",
    "純如",
    "冠廷",
    "玉婷",
    "士豪",
    "惠如",
    "凱文",
    "雅雯",
    "宏達",
    "淑敏",
    "進財",
    "素梅",
    "耀輝",
    "秀蘭",
    "國華",
    "鳳儀",
  ];

  const lastNames = [
    "王",
    "李",
    "張",
    "劉",
    "陳",
    "楊",
    "趙",
    "黃",
    "周",
    "吳",
    "徐",
    "孫",
    "胡",
    "朱",
    "高",
    "林",
    "何",
    "郭",
    "馬",
    "羅",
    "梁",
    "宋",
    "鄭",
    "謝",
    "韓",
    "唐",
    "馮",
    "于",
    "董",
    "蕭",
  ];

  const companies = [
    "台灣人壽",
    "國泰人壽",
    "富邦人壽",
    "新光人壽",
    "中國人壽",
    "南山人壽",
    "三商美邦",
    "台灣產險",
    "新光產險",
    "明台產險",
    "和泰產險",
    "兆豐產險",
    "華南產險",
    "第一產險",
  ];

  const cities = [
    {
      city: "台北市",
      districts: [
        "中正區",
        "大同區",
        "中山區",
        "松山區",
        "大安區",
        "萬華區",
        "信義區",
        "士林區",
        "北投區",
        "內湖區",
        "南港區",
        "文山區",
      ],
    },
    {
      city: "新北市",
      districts: [
        "板橋區",
        "三重區",
        "中和區",
        "永和區",
        "新莊區",
        "新店區",
        "樹林區",
        "鶯歌區",
        "三峽區",
        "淡水區",
        "汐止區",
        "五股區",
      ],
    },
    {
      city: "桃園市",
      districts: [
        "桃園區",
        "中壢區",
        "大溪區",
        "楊梅區",
        "蘆竹區",
        "大園區",
        "龜山區",
        "八德區",
        "龍潭區",
        "平鎮區",
        "新屋區",
        "觀音區",
      ],
    },
    {
      city: "台中市",
      districts: [
        "中區",
        "東區",
        "南區",
        "西區",
        "北區",
        "北屯區",
        "西屯區",
        "南屯區",
        "太平區",
        "大里區",
        "霧峰區",
        "烏日區",
      ],
    },
    {
      city: "台南市",
      districts: [
        "中西區",
        "東區",
        "南區",
        "北區",
        "安平區",
        "安南區",
        "永康區",
        "歸仁區",
        "新化區",
        "左鎮區",
        "玉井區",
        "楠西區",
      ],
    },
    {
      city: "高雄市",
      districts: [
        "新興區",
        "前金區",
        "苓雅區",
        "鹽埕區",
        "鼓山區",
        "旗津區",
        "前鎮區",
        "三民區",
        "左營區",
        "楠梓區",
        "小港區",
        "仁武區",
      ],
    },
  ];

  const specialties = [
    ["life", "health"],
    ["health", "accident"],
    ["accident", "travel", "vehicle"],
    ["property", "vehicle"],
    ["life", "property"],
    ["travel", "health"],
    ["vehicle", "accident"],
    ["life", "health", "accident"],
    ["health", "property"],
    ["travel", "accident"],
  ];

  const languages = [
    ["中文"],
    ["中文", "English"],
    ["中文", "English", "日本語"],
    ["中文", "台語"],
    ["中文", "English", "客家話"],
    ["中文", "日本語"],
    ["中文", "韓語"],
    ["中文", "English", "台語"],
  ];

  const agents: Agent[] = [];

  // 姓名拼音映射表
  const lastNamePinyin: Record<string, string> = {
    "王": "wang", "李": "li", "張": "zhang", "劉": "liu", "陳": "chen",
    "楊": "yang", "趙": "zhao", "黃": "huang", "周": "zhou", "吳": "wu",
    "徐": "xu", "孫": "sun", "胡": "hu", "朱": "zhu", "高": "gao",
    "林": "lin", "何": "he", "郭": "guo", "馬": "ma", "羅": "luo",
    "梁": "liang", "宋": "song", "鄭": "zheng", "謝": "xie", "韓": "han", "唐": "tang"
  };

  const firstNamePinyin: Record<string, string> = {
    "小明": "xiaoming", "美華": "meihua", "志強": "zhiqiang", "淑芬": "shufen",
    "建華": "jianhua", "雅婷": "yating", "志偉": "zhiwei", "怡君": "yijun",
    "文雄": "wenxiong", "麗娟": "lijuan", "俊傑": "junjie", "佳蓉": "jiarong",
    "宗翰": "zonghan", "慧如": "huiru", "家豪": "jiahao", "純如": "chunru",
    "冠廷": "guanting", "玉婷": "yuting", "士豪": "shihao", "惠如": "huiru",
    "凱文": "kaiwen", "雅雯": "yawen", "宏達": "hongda", "淑敏": "shumin",
    "進財": "jincai", "素梅": "sumei", "耀輝": "yaohui", "秀蘭": "xiulan",
    "國華": "guohua", "鳳儀": "fengyi"
  };

  for (let i = 0; i < 60; i++) {
    const lastName = lastNames[Math.floor(seededRandom() * lastNames.length)];
    const firstName = firstNames[Math.floor(seededRandom() * firstNames.length)];
    const location = cities[Math.floor(seededRandom() * cities.length)];
    const district =
      location.districts[Math.floor(seededRandom() * location.districts.length)];

    agents.push({
      id: (i + 1).toString(),
      name: `${lastName}${firstName}`,
      company: companies[Math.floor(seededRandom() * companies.length)],
      specialties: specialties[
        Math.floor(seededRandom() * specialties.length)
      ] as any,
      rating: Math.round((seededRandom() * 1.5 + 3.5) * 10) / 10, // 3.5-5.0 rating
      reviewCount: Math.floor(seededRandom() * 80 + 5),
      location: {
        city: location.city,
        district,
      },
      experience: Math.floor(seededRandom() * 20 + 1), // 1-20 years
      languages: languages[Math.floor(seededRandom() * languages.length)],
      contactInfo: {
        phone: `09${Math.floor(seededRandom() * 9) + 1}${Math.floor(seededRandom() * 900 + 100)}-${Math.floor(seededRandom() * 900 + 100)}`,
        email: `${lastNamePinyin[lastName] || lastName.toLowerCase()}${firstNamePinyin[firstName] || firstName.toLowerCase()}@${["fubon", "cathay", "taipei", "chunghwa", "nanshan", "shinkong", "globallife", "twlife", "axa", "zurich", "allianz", "metlife", "prudential", "manulife", "takaful", "ming"][Math.floor(seededRandom() * 16)]}.com`,
      },
    });
  }

  return agents;
};

export const mockInsuranceProducts: InsuranceProduct[] =
  generateInsuranceProducts();
export const mockAgents: Agent[] = generateAgents();
