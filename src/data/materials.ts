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
    id: "1",
    title: "高斯积分公式详解 (PDF)",
    category: "数学",
    description: "针对基米大学数学分析课程的重点难点解析，建议直接在线阅读或下载。",
    downloadUrl: "/materials/math_analysis_guide.pdf",
    date: "2024-04-20",
    fileSize: "1.2 MB",
  },
  {
    id: "2",
    title: "现代工程图学基础",
    category: "工程学",
    description: "涵盖投影理论与零件图绘制的核心规范，适合大一新生学习。",
    downloadUrl: "#",
    date: "2024-04-19",
    fileSize: "4.8 MB",
  },
  {
    id: "3",
    title: "世界历史通论选讲",
    category: "历史",
    description: "从文明起源到近代工业革命，梳理历史发展的核心逻辑。",
    downloadUrl: "#",
    date: "2024-04-18",
    fileSize: "2.1 MB",
  },
  {
    id: "4",
    title: "React 高级进阶指南",
    category: "编程",
    description: "从基础到架构，全面掌握现代前端开发核心技术。",
    downloadUrl: "#",
    date: "2024-04-17",
    fileSize: "5.5 MB",
  },
];
