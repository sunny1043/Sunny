import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isPasscodeAuth: boolean;
  signIn: () => Promise<void>;
  passcodeLogin: (passcode: string) => boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_EMAILS = ['491056297@qq.com'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasscodeAuth, setIsPasscodeAuth] = useState(() => {
    return localStorage.getItem('is_passcode_auth') === 'true';
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const isAdmin = isPasscodeAuth || (!!user && !!user.email && (ADMIN_EMAILS.includes(user.email)));

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Sign in failed", error);
      if (error.code === 'auth/unauthorized-domain') {
        alert("登录失败：当前域名未在 Firebase 控制台授权。\n\n请在 Firebase Console -> Auth -> Settings -> Authorized Domains 中添加当前域名。");
      } else if (error.code === 'auth/popup-blocked') {
        alert("登录窗口被浏览器拦截，请允许弹出窗口并重试。");
      } else {
        alert("登录出错: " + error.message);
      }
    }
  };

  const passcodeLogin = (passcode: string) => {
    const envPasscode = import.meta.env.VITE_ADMIN_PASSCODE;
    if (envPasscode && passcode === envPasscode) {
      setIsPasscodeAuth(true);
      localStorage.setItem('is_passcode_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsPasscodeAuth(false);
      localStorage.removeItem('is_passcode_auth');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isPasscodeAuth, signIn, passcodeLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
