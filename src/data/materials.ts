export interface StudyMaterial {
  id: string;
  title: string;
  category: "数学" | "编程" | "英语" | "工程学" | "考研" | "历史" | "其他";
  description: string;
  downloadUrl: string;
  date: string;
  fileSize?: string;
}

export const STUDY_MATERIALS: StudyMaterial[] = [
  {
    id: "m1",
    title: "空气动力学基础讲义",
    category: "工程学",
    description: "涵盖流体动力学基本方程、机翼理论及超音速流动基础。（提取码: 9d64）",
    downloadUrl: "https://pan.baidu.com/s/1uxs-Df6WZOz4H7RGOOQxCA?pwd=9d64",
    date: "2026.4.2",
    fileSize: "5.2 MB",
  },
  {
    id: "m2",
    title: "微积分 I (核心概念与解题技巧)",
    category: "数学",
    description: "重点解析导数、积分及其在物理工程中的应用，附经典例题解析。",
    downloadUrl: "https://pan.baidu.com/s/your_calculus_link",
    date: "2026.4.2",
    fileSize: "3.5 MB",
  },
  {
    id: "m3",
    title: "传热学：导热与对流换热",
    category: "工程学",
    description: "全面讲解热传导、对流和辐射三大传热机理及其工程计算方法。",
    downloadUrl: "https://pan.baidu.com/s/your_heat_transfer_link",
    date: "2026.4.2",
    fileSize: "4.8 MB",
  },
  {
    id: "m4",
    title: "工程热力学复习精要",
    category: "工程学",
    description: "热力学定律、工质热力性质及循环过程的系统性梳理。",
    downloadUrl: "https://pan.baidu.com/s/your_thermodynamics_link",
    date: "2026.4.2",
    fileSize: "4.1 MB",
  },
  {
    id: "m5",
    title: "英语语法全解析：从基础到进阶",
    category: "英语",
    description: "系统梳理英语句法结构、时态态势及长难句分析技巧。",
    downloadUrl: "https://pan.baidu.com/s/your_english_grammar_link",
    date: "2026.4.2",
    fileSize: "2.7 MB",
  },
  {
    id: "m6",
    title: "材料力学：应力与应变分析",
    category: "工程学",
    description: "拉压、剪切、扭转及弯曲等基本变形下的强度与刚度计算。",
    downloadUrl: "https://pan.baidu.com/s/your_mechanics_link",
    date: "2026.4.2",
    fileSize: "5.5 MB",
  },
  {
    id: "m7",
    title: "流体力学：管内流动与阻力计算",
    category: "工程学",
    description: "流体静力学、动力学及管路系统水力计算的核心考点总结。",
    downloadUrl: "https://pan.baidu.com/s/your_fluid_link",
    date: "2026.4.2",
    fileSize: "3.9 MB",
  },
];
