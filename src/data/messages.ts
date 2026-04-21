export interface AdminMessage {
  id: string;
  author: string;
  content: string;
  date: string;
  important: boolean;
}

export const ADMIN_MESSAGES: AdminMessage[] = [
  {
    id: "m1",
    author: "SUNNY",
    content: "欢迎来到 SUNNY---基米大学习！这里将持续分享高质量的学习资料。",
    date: "2024-04-21",
    important: true,
  },

];
