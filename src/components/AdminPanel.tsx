import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthProvider';
import { Button } from '../../components/ui/button';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function AdminPanel() {
  const { user, isAdmin } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('工程学');
  const [description, setDescription] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  if (!isAdmin) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'materials'), {
        title,
        category,
        description,
        downloadUrl,
        date: new Date().toLocaleDateString('zh-CN').replace(/\//g, '.'),
        fileSize: "未知",
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      });
      setTitle('');
      setDescription('');
      setDownloadUrl('');
      setShowForm(false);
      alert('发布成功！资料已上线。');
    } catch (error) {
      console.error("Upload error", error);
      alert('发布失败，请检查权限。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 bg-white/90 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-black/5"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold tracking-tight">发布新资料</h3>
              <button 
                onClick={() => setShowForm(false)}
                className="text-apple-gray hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-apple-gray uppercase tracking-wider block mb-1">资料名称</label>
                <input 
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="例如：微积分复习讲义"
                  className="w-full bg-black/5 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-apple-gray uppercase tracking-wider block mb-1">分类</label>
                <select 
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-black/5 border-none rounded-xl px-4 py-2 text-sm outline-none cursor-pointer"
                >
                  {["数学", "编程", "英语", "工程学", "考研", "其他"].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-apple-gray uppercase tracking-wider block mb-1">网盘链接</label>
                <input 
                  required
                  value={downloadUrl}
                  onChange={e => setDownloadUrl(e.target.value)}
                  placeholder="https://pan.baidu.com/..."
                  className="w-full bg-black/5 border-none rounded-xl px-4 py-2 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-apple-gray uppercase tracking-wider block mb-1">简介 (可选)</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-black/5 border-none rounded-xl px-4 py-2 text-sm outline-none resize-none"
                />
              </div>
              <Button 
                disabled={loading}
                className="w-full rounded-xl bg-apple-blue h-10 font-medium active:scale-95 transition-transform"
              >
                {loading ? '发布中...' : '立即发布'}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <Button 
        onClick={() => setShowForm(!showForm)}
        className="w-14 h-14 rounded-full bg-apple-blue shadow-xl shadow-apple-blue/30 hover:scale-105 active:scale-95 transition-all"
      >
        <Plus className={`w-8 h-8 transition-transform duration-300 ${showForm ? 'rotate-45' : ''}`} />
      </Button>
    </div>
  );
}
