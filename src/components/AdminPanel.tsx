import { useState } from 'react';
import { collection, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from './AuthProvider';
import { Button } from '../../components/ui/button';
import { Plus, X, Upload, File, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function AdminPanel() {
  const { user, isAdmin } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('工程学');
  const [description, setDescription] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'link' | 'file'>('file');

  if (!isAdmin) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        alert('请选择 PDF 文件');
        return;
      }
      setFile(selectedFile);
      if (!title) setTitle(selectedFile.name.replace('.pdf', ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      let finalUrl = downloadUrl;
      let finalSize = "未知";

      if (uploadType === 'file' && file) {
        const storageRef = ref(storage, `materials/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        finalUrl = await getDownloadURL(snapshot.ref);
        finalSize = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      }

      await addDoc(collection(db, 'materials'), {
        title,
        category,
        description,
        downloadUrl: finalUrl,
        date: new Date().toLocaleDateString('zh-CN').replace(/\//g, '.'),
        fileSize: finalSize,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      });

      setTitle('');
      setDescription('');
      setDownloadUrl('');
      setFile(null);
      setShowForm(false);
      alert('发布成功！资料已上线。');
    } catch (error) {
      console.error("Upload error", error);
      alert('发布失败，请检查配置或权限。');
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
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex gap-2 mb-6 bg-black/5 p-1 rounded-xl">
              <button 
                onClick={() => setUploadType('file')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${uploadType === 'file' ? 'bg-white shadow-sm text-apple-blue' : 'text-apple-gray'}`}
              >
                直接上传PDF
              </button>
              <button 
                onClick={() => setUploadType('link')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${uploadType === 'link' ? 'bg-white shadow-sm text-apple-blue' : 'text-apple-gray'}`}
              >
                外部链接
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

              {uploadType === 'file' ? (
                <div>
                  <label className="text-[11px] font-bold text-apple-gray uppercase tracking-wider block mb-1">PDF 文件</label>
                  <label className="w-full flex flex-col items-center justify-center bg-black/5 border-2 border-dashed border-black/5 hover:border-apple-blue/20 rounded-2xl p-6 cursor-pointer transition-all">
                    {file ? (
                      <div className="flex items-center gap-3 text-apple-blue">
                        <File className="w-8 h-8" />
                        <div className="text-left">
                          <p className="text-xs font-bold truncate max-w-[150px]">{file.name}</p>
                          <p className="text-[10px] opacity-60">{(file.size / 1024).toFixed(0)} KB</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-apple-gray mb-2" />
                        <span className="text-[11px] font-medium text-apple-gray">点击选择 PDF 文件</span>
                      </>
                    )}
                    <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-bold text-apple-gray uppercase tracking-wider block mb-1">链接地址</label>
                  <input 
                    required={uploadType === 'link'}
                    value={downloadUrl}
                    onChange={e => setDownloadUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-black/5 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all"
                  />
                </div>
              )}

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
                <label className="text-[11px] font-bold text-apple-gray uppercase tracking-wider block mb-1">简介 (可选)</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-black/5 border-none rounded-xl px-4 py-2 text-sm outline-none resize-none"
                />
              </div>
              <Button 
                disabled={loading || (uploadType === 'file' && !file)}
                className="w-full rounded-xl bg-apple-blue h-10 font-bold active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? '正在处理...' : '立即发布'}
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
