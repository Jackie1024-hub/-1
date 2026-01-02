
import { Question, EngineerLevel } from './types';

export const LEVEL_CONFIG = [
  {
    title: EngineerLevel.ASSISTANT,
    maxPurity: 90,
    baseDuration: 600, // 10 min
    expThreshold: 10,
  },
  {
    title: EngineerLevel.JUNIOR,
    maxPurity: 95,
    baseDuration: 480, // 8 min
    expThreshold: 30,
  },
  {
    title: EngineerLevel.INTERMEDIATE,
    maxPurity: 99.99,
    baseDuration: 300, // 5 min
    expThreshold: 100,
  },
  {
    title: EngineerLevel.SENIOR,
    maxPurity: 99.9999,
    baseDuration: 180, // 3 min
    expThreshold: Infinity,
  }
];

export const QUESTIONS: Question[] = [
  // Stage 1
  {
    id: 1, stage: 1, text: "芯片制造最基础的原材料是什么？",
    options: ["黄金", "沙子(二氧化硅)", "石油", "木材"], answer: 1,
    explanation: "硅片是由高纯度的硅制成的，而硅的主要来源是自然界中的石英砂。"
  },
  {
    id: 2, stage: 1, text: "在提纯过程中，焦炭的作用主要是？",
    options: ["染色剂", "冷却剂", "还原剂", "密封剂"], answer: 2,
    explanation: "在高温下，焦炭与二氧化硅发生还原反应生成粗硅。"
  },
  {
    id: 3, stage: 1, text: "硅在元素周期表中的原子序数是？",
    options: ["6", "14", "26", "32"], answer: 1,
    explanation: "硅的原子序数是14。"
  },
  {
    id: 4, stage: 1, text: "判断：粗硅的纯度可以直接满足先进制程芯片的制造要求。",
    options: ["正确", "错误"], answer: 1,
    explanation: "粗硅纯度通常在98-99%左右，远达不到半导体级的要求。"
  },
  {
    id: 5, stage: 1, text: "在阶段1中，我们的首要任务是？",
    options: ["组装手机", "原材料提纯", "设计电路", "封测芯片"], answer: 1,
    explanation: "阶段1主要是从沙子到粗硅的基础加工。"
  },
  // Stage 2
  {
    id: 6, stage: 2, text: "单晶硅生长的常用方法是什么？",
    options: ["浇筑法", "切削法", "西门子法/拉晶法", "印刷法"], answer: 2,
    explanation: "西门子法和切克劳斯基法(Czochralski)是生产电子级硅的主流方法。"
  },
  {
    id: 7, stage: 2, text: "将硅棒切成薄片，这种薄片被称为？",
    options: ["硅条", "硅板", "硅片(Wafer)", "硅膜"], answer: 2,
    explanation: "切成圆盘状的薄片称为晶圆或硅片。"
  },
  {
    id: 8, stage: 2, text: "判断：外延片(Epitaxial Wafer)的性能通常优于普通的存储硅片。",
    options: ["正确", "错误"], answer: 0,
    explanation: "外延片是在衬底上生长一层单晶，缺陷更少，适用于高性能器件。"
  },
  {
    id: 9, stage: 2, text: "硅片切割过程中，哪种工具最常用？",
    options: ["不锈钢锯条", "金刚石线切割", "激光雕刻机", "美工刀"], answer: 1,
    explanation: "金刚石线切割具有损耗小、效率高的特点。"
  },
  {
    id: 10, stage: 2, text: "如果硅棒纯度达到99.99%，它更适合制造哪种芯片？",
    options: ["高功率芯片", "基础计算器", "低速传感器", "玩具喇叭"], answer: 0,
    explanation: "更高的纯度能够支撑更复杂的器件性能需求。"
  },
  // Stage 3
  {
    id: 11, stage: 3, text: "在硅片上“雕刻”电路的核心技术是？",
    options: ["3D打印", "光刻(Photolithography)", "精密焊接", "化学喷涂"], answer: 1,
    explanation: "光刻技术决定了芯片的制程节点。"
  },
  {
    id: 12, stage: 3, text: "光刻机使用的光源目前最先进的是？",
    options: ["可见光", "紫外光(UV)", "极紫外光(EUV)", "X射线"], answer: 2,
    explanation: "EUV是目前实现7nm及以下制程的关键光源。"
  },
  {
    id: 13, stage: 3, text: "芯片制造完成后，为了保护它需要进行？",
    options: ["清洗", "封装", "打磨", "上漆"], answer: 1,
    explanation: "封装(Packaging)不仅保护芯片，还提供与外界连接的引脚。"
  },
  {
    id: 14, stage: 3, text: "摩尔定律预测晶体管数量大约每隔多久翻一倍？",
    options: ["10年", "5年", "18-24个月", "1个月"], answer: 2,
    explanation: "这是由英特尔创始人戈登·摩尔提出的经验性定律。"
  },
  {
    id: 15, stage: 3, text: "终极纯度要求 99.9999% 通常被称为几个“9”？",
    options: ["4个9", "6个9", "9个9", "11个9"], answer: 1,
    explanation: "通常数小数点前后的9的总数。"
  }
];
