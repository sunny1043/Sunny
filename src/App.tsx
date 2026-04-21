import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Bell, 
  BookOpen, 
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Github,
  Monitor,
  Menu,
  X,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';

import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from './lib/firebase';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { AdminPanel } from './components/AdminPanel';
import { LogIn, LogOut, User, Trash2 } from 'lucide-react';

import { STUDY_MATERIALS as STATIC_MATERIALS, StudyMaterial } from './data/materials';
import { ADMIN_MESSAGES } from './data/messages';

function AppContent() {
  const { user, signIn, logout, isAdmin, isPasscodeAuth, passcodeLogin, loading: authLoading } = useAuth();
  const [dbMaterials, setDbMaterials] = useState<StudyMaterial[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [activeAnnouncement, setActiveAnnouncement] = useState(0);
  const [currentView, setCurrentView] = useState<'home' | 'messages'>('home');

  // Auto-rotate leading announcement
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAnnouncement((prev) => (prev + 1) % ADMIN_MESSAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dynamic materials from Firestore
  useEffect(() => {
    const q = query(collection(db, 'materials'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const materials = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StudyMaterial[];
      setDbMaterials(materials);
    });
    return () => unsubscribe();
  }, []);

  const allMaterials = useMemo(() => {
    // Combine static default data with dynamically added database data
    return [...dbMaterials, ...STATIC_MATERIALS].filter((item, index, self) => 
      index === self.findIndex((t) => t.id === item.id)
    );
  }, [dbMaterials]);

  const filteredMaterials = useMemo(() => {
    return allMaterials.filter((m) => {
      const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === '全部' || m.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, allMaterials]);

  const handleDelete = async (id: string, title: string) => {
    if (!isAdmin) return;
    if (window.confirm(`确定要删除“${title}”吗？如果是默认初始资料将无法删除。`)) {
      try {
        await deleteDoc(doc(db, 'materials', id));
      } catch (error) {
        console.error("Delete error", error);
        alert('删除失败，可能该资源是受保护的初始资料。');
      }
    }
  };

  const categories = ['全部', '数学', '编程', '英语', '工程学', '考研', '历史', '其他'];

  return (
    <div className="min-h-screen bg-apple-bg selection:bg-apple-blue/20 flex flex-col">
      {/* Universal Top Nav */}
      <header className="sticky top-0 z-50 w-full glass apple-blur border-b border-black/5">
        <div className="container mx-auto px-4 md:px-10 h-12 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-6">
            <span 
              className="font-semibold text-[17px] tracking-tight cursor-pointer"
              onClick={() => setCurrentView('home')}
            >
              SUNNY
            </span>
            <nav className="flex gap-4 md:gap-8 text-[12px] font-normal text-black/80 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setCurrentView('home')}
                className={`hover:text-apple-blue transition-colors cursor-pointer whitespace-nowrap ${currentView === 'home' ? 'text-apple-blue font-medium' : ''}`}
              >
                学习资料库
              </button>
              <button 
                onClick={() => setCurrentView('messages')}
                className={`hover:text-apple-blue transition-colors cursor-pointer whitespace-nowrap ${currentView === 'messages' ? 'text-apple-blue font-medium' : ''}`}
              >
                Sunny的消息
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
             {isAdmin ? (
               <div className="flex items-center gap-2">
                 {user?.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-6 h-6 rounded-full border border-black/5" referrerPolicy="no-referrer" />
                 ) : (
                    <div className="w-6 h-6 rounded-full bg-apple-blue/10 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-apple-blue" />
                    </div>
                 )}
                 <span className="text-[11px] font-bold text-black/40">ADMIN</span>
                 <button 
                  onClick={logout} 
                  className="text-[11px] font-medium text-apple-gray hover:text-black transition-colors flex items-center gap-1"
                 >
                   <LogOut className="w-3 h-3" />
                   退出
                 </button>
               </div>
             ) : (
               <button 
                onClick={() => {
                  const passcode = window.prompt("请输入管理员访问代码（或尝试谷歌登录）：");
                  if (passcode) {
                    if (passcodeLogin(passcode)) {
                      alert("代码正确，已管理员方式登录。");
                    } else {
                      signIn();
                    }
                  } else {
                    signIn();
                  }
                }}
                className="text-[11px] font-medium text-apple-blue hover:opacity-80 transition-opacity flex items-center gap-1"
               >
                 <LogIn className="w-3 h-3" />
                 管理登录
               </button>
             )}
             {currentView === 'home' && (
               <div className="hidden md:flex items-center bg-black/5 rounded-full px-3 py-1 border border-black/5">
                  <Search className="w-3.5 h-3.5 text-apple-gray" />
                  <input
                    placeholder="搜索..."
                    className="bg-transparent border-none focus:ring-0 text-[11px] placeholder:text-apple-gray/60 ml-2 w-32 outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
             )}
             <Dialog>
                <DialogTrigger render={<Button variant="ghost" size="icon" className="rounded-full w-8 h-8 hover:bg-black/5" />}>
                   <ShieldCheck className="w-4 h-4" />
                </DialogTrigger>
                <DialogContent className="rounded-3xl max-w-2xl bg-white/95 backdrop-blur-3xl border-none shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-semibold tracking-tight mb-6">管理与 PDF 发布指南</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-sm text-[#1d1d1f]">
                    <div className="space-y-4">
                      <div className="w-10 h-10 rounded-2xl bg-apple-blue/10 flex items-center justify-center mb-4">
                        <FileText className="w-5 h-5 text-apple-blue" />
                      </div>
                      <h3 className="font-bold text-lg tracking-tight">如何加入 PDF 资料</h3>
                      <p className="text-apple-gray leading-relaxed text-[13px]">
                        您可以将 PDF 直接作为网页资料加入。步骤如下：
                      </p>
                      <ul className="space-y-3">
                        <li className="flex gap-3">
                          <span className="text-apple-blue font-bold">01</span>
                          <span className="text-[13px]">将 PDF 文件放入项目根目录的 <code className="bg-gray-100 px-1 rounded">public/materials/</code> 文件夹中。</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-apple-blue font-bold">02</span>
                          <span className="text-[13px]">在 <code className="bg-gray-100 px-1 rounded">data/materials.ts</code> 的 <code className="bg-gray-100 px-1 rounded">downloadUrl</code> 中填入相对路径（如：<code className="bg-gray-100 px-1 rounded">/materials/test.pdf</code>）。</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-apple-blue font-bold">03</span>
                          <span className="text-[13px]">访问下载链接时，浏览器会自动调用内置 PDF 阅读器将其像网页一样展示。</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center mb-4">
                        <Bell className="w-5 h-5 text-orange-600" />
                      </div>
                      <h3 className="font-bold text-lg tracking-tight">内容更新机制</h3>
                      <p className="text-apple-gray leading-relaxed text-[13px]">
                        所有标签（分类）和消息均采用静态数据管理：
                      </p>
                      <ul className="space-y-3">
                        <li className="flex gap-3">
                          <span className="text-orange-600 font-bold">01</span>
                          <span className="text-[13px]">修改 <code className="bg-gray-100 px-1 rounded">data/materials.ts</code> 的分类枚举。</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-orange-600 font-bold">02</span>
                          <span className="text-[13px]">推送代码至 GitHub。</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-orange-600 font-bold">03</span>
                          <span className="text-[13px]">Cloudflare Pages 自动构建，实现零配置秒级更新。</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </DialogContent>
             </Dialog>
          </div>
        </div>
      </header>

      {/* Announcement Bar */}
      <div className="w-full bg-white border-b border-black/5 h-10 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeAnnouncement}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="text-[12px] font-medium text-apple-text/80 flex items-center gap-3"
          >
            <span className="text-apple-blue font-bold tracking-widest text-[9px] uppercase">Announcement</span>
            {ADMIN_MESSAGES[activeAnnouncement]?.content}
          </motion.div>
        </AnimatePresence>
      </div>

      <main className="flex-1 container mx-auto px-6 py-20 lg:px-10 max-w-7xl">
        <AnimatePresence mode="wait">
          {currentView === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Hero Section */}
              <section className="text-center mb-24 space-y-4">
                <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-black to-black/60">
                  基米大学习
                </h1>
                <p className="text-2xl md:text-3xl text-apple-gray font-light max-w-2xl mx-auto leading-tight">
                  由 SUNNY 倾心整理。追求极致的学习效率，从这一刻开始。
                </p>
              </section>

              {/* Content Explorer */}
              <section className="space-y-12">
                {/* Filters Bar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-black/5 pb-8">
                  <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full md:w-auto">
                    <TabsList className="bg-transparent h-auto p-0 flex gap-8 flex-wrap">
                      {categories.map((cat) => (
                        <TabsTrigger
                          key={cat}
                          value={cat}
                          className="px-0 py-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-apple-blue data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-apple-blue rounded-none text-[13px] font-medium transition-all"
                        >
                          {cat}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                  <p className="text-[13px] text-apple-gray font-medium">{filteredMaterials.length} 份精选资源</p>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredMaterials.map((material, idx) => (
                    <motion.div
                      layout
                      key={material.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Card className="rounded-3xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden group hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-700 bg-white h-full flex flex-col">
                        <CardHeader className="p-8 pb-4">
                          <div className="flex justify-between items-start mb-6">
                            <div className="px-3 py-1 rounded-full bg-[#f2f2f7] text-black text-[10px] font-bold tracking-tight">
                              {material.category.toUpperCase()}
                            </div>
                            <span className="text-[10px] text-apple-gray font-semibold tracking-widest">{material.fileSize}</span>
                          </div>
                          <CardTitle className="text-2xl font-bold tracking-tight mb-3">
                            {material.title}
                          </CardTitle>
                          <CardDescription className="text-[14px] leading-relaxed text-[#1d1d1f]/70 line-clamp-2">
                            {material.description}
                          </CardDescription>
                        </CardHeader>
                        <div className="flex-1 p-8 pt-0">
                           <div className="w-full h-px bg-black/5 mt-4" />
                        </div>
                        <CardFooter className="p-8 pt-0 flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <span className="text-[11px] text-apple-gray font-medium uppercase tracking-wider">{material.date}</span>
                            {isAdmin && !STATIC_MATERIALS.some(s => s.id === material.id) && (
                              <button 
                                onClick={() => handleDelete(material.id, material.title)}
                                className="text-apple-gray hover:text-red-500 transition-colors"
                                title="删除此资料"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <a 
                            href={material.downloadUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-full text-apple-blue hover:bg-apple-blue/5 px-4 py-2 transition-colors group/btn font-semibold text-[13px]"
                          >
                            查看
                            <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
                          </a>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {filteredMaterials.length === 0 && (
                  <div className="py-32 text-center">
                    <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-6">
                       <Search className="w-8 h-8 text-apple-gray" />
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight">未能找到相关资料</h3>
                    <Button variant="link" className="text-apple-blue" onClick={() => { setSearchQuery(''); setActiveCategory('全部'); }}>
                      查看全部资料
                    </Button>
                  </div>
                )}
              </section>

              {/* Feature Teasers moved into home view for structural integrity */}
              <section className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-white p-10 rounded-[40px] shadow-sm flex flex-col justify-between aspect-square md:aspect-video">
                  <div className="space-y-4">
                    <Github size={30} strokeWidth={1.5} />
                    <h3 className="text-3xl font-bold tracking-tight">开源共享</h3>
                    <p className="text-apple-gray leading-relaxed max-w-sm">
                      本项目代码在 GitHub 完全透明，你可以自由分支或参与贡献。
                    </p>
                  </div>
                  <Button variant="link" className="w-fit p-0 h-auto text-apple-blue font-bold text-base group">
                    前往仓库 <ChevronRight size={18} className="translate-y-0.5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                <div className="bg-[#1d1d1f] p-10 rounded-[40px] text-white shadow-sm flex flex-col justify-between aspect-square md:aspect-video">
                  <div className="space-y-4">
                    <Monitor size={30} strokeWidth={1.5} className="text-apple-blue" />
                    <h3 className="text-3xl font-bold tracking-tight text-white/95">极速分发</h3>
                    <p className="text-white/60 leading-relaxed max-w-sm">
                      依托 Cloudflare Pages 边缘网络，为您提供毫秒级的访问响应。
                    </p>
                  </div>
                  <Button variant="link" className="w-fit p-0 h-auto text-apple-blue font-bold text-base group">
                    了解更多 <ChevronRight size={18} className="translate-y-0.5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl mx-auto space-y-16"
            >
              <div className="text-center space-y-4">
                <h2 className="text-5xl font-bold tracking-tight">Sunny的消息</h2>
                <p className="text-apple-gray text-xl font-light italic">在这里，分享最真实的思考与动态。</p>
              </div>

              <div className="flex flex-col gap-12 mt-20">
                {ADMIN_MESSAGES.map((msg, idx) => (
                  <motion.article 
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="space-y-6 group"
                  >
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-apple-gray/60">
                      <span>{msg.date}</span>
                      {msg.important && <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">Important</span>}
                    </div>
                    <div className="bg-white rounded-[40px] p-10 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-700">
                      <p className="text-xl md:text-2xl leading-relaxed text-[#1d1d1f] font-normal">
                        {msg.content}
                      </p>
                      <div className="mt-10 flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-apple-blue/10 flex items-center justify-center text-apple-blue font-bold text-xs">S</div>
                         <span className="text-sm font-semibold text-apple-gray uppercase tracking-wider">{msg.author}</span>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Minimal Footer */}
      <footer className="bg-white py-12 border-t border-black/5 mt-auto">
        <div className="container mx-auto px-6 lg:px-10 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] text-apple-gray font-semibold tracking-tight">
             <div className="flex items-center gap-6">
                <p>© 2024 Sunny. 版权所有。</p>
                <div className="flex gap-4">
                   <span>隐私政策</span>
                   <span>站点地图</span>
                </div>
             </div>
             <div className="flex items-center gap-1">
                <span>Designed for </span>
                <span className="text-black font-bold">Base Gimi University</span>
             </div>
          </div>
        </div>
      </footer>
      <AdminPanel />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
