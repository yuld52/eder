import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  RotateCw,
  LogOut,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../brand/Logo';
import confetti from 'canvas-confetti';

interface LoginPageProps {
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { currentUser, signInWithEmail, signUpWithEmail, logout } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Set clean background and enable scrolling for login page
  useEffect(() => {
    const root = document.documentElement;
    const rootElement = document.getElementById('root');
    const prevRootClass = root.className;
    const prevBodyClass = document.body.className;
    const prevRootOverflow = rootElement?.style.overflow || '';

    root.classList.remove('dark');
    document.body.className = 'bg-[#F9FAFB] text-neutral-900 antialiased selection:bg-black selection:text-white overflow-y-auto';
    if (rootElement) {
      rootElement.style.overflow = 'auto';
    }

    return () => {
      root.className = prevRootClass;
      document.body.className = prevBodyClass;
      if (rootElement) {
        rootElement.style.overflow = prevRootOverflow;
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Por favor, informe um email válido.');
      return;
    }

    if (!cleanPassword || cleanPassword.length < 4) {
      setAuthError('A senha deve ter no mínimo 4 caracteres.');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setAuthError('Por favor, informe seu nome completo.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(cleanEmail, cleanPassword);
      } else {
        await signUpWithEmail(name.trim(), cleanEmail, cleanPassword);
      }
      confetti({ particleCount: 55, spread: 65, origin: { y: 0.6 } });
      onSuccess();
    } catch (err: any) {
      console.error('Authentication error:', err);
      const msg = err instanceof Error ? err.message : 'Falha na autenticação. Verifique os dados.';
      setAuthError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setMode('login');
    setEmail('admin@veltor.com');
    setPassword('admin123');
    setAuthError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-[#F9FAFB] text-neutral-900 flex flex-col justify-between font-sans selection:bg-black selection:text-white overscroll-contain">
      {/* Top Navbar */}
      <header className="h-20 px-6 sm:px-8 max-w-7xl mx-auto w-full flex items-center justify-between shrink-0">
        <Logo theme="white" size="md" badge="PRO" />
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-xs text-neutral-500 font-medium">
            Ambiente Seguro & Autônomo
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </header>

      {/* Main Login Form Centered */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-12 my-auto shrink-0 min-h-0">
        <div className="w-full max-w-md my-auto py-2">
          <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-9 shadow-xl shadow-neutral-200/50 space-y-6 relative">
            
            {/* Header */}
            <div className="space-y-2 text-center">
              <div className="flex justify-center mb-1">
                <Logo theme="white" size="xl" showText={false} />
              </div>
              <h2 className="text-2xl font-extrabold text-neutral-900 font-display tracking-tight">
                {currentUser ? 'Sessão Ativa' : mode === 'login' ? 'Acesse o Veltor' : 'Criar Nova Conta'}
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-xs mx-auto">
                {currentUser 
                  ? `Conectado como ${currentUser.displayName || currentUser.email}` 
                  : mode === 'login'
                    ? 'Informe seu email e senha para acessar o workspace de validação de produtos digitais.'
                    : 'Cadastre-se com seu email e senha para começar a validar produtos digitais.'}
              </p>
            </div>

            {/* Error Banner */}
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 font-medium text-center">
                {authError}
              </div>
            )}

            {currentUser ? (
              /* Already Authenticated State */
              <div className="space-y-4 pt-2">
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                  <div className="truncate flex-1">
                    <p className="font-bold text-sm text-neutral-900 truncate">
                      {currentUser.displayName || 'Usuário'}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">{currentUser.email}</p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-emerald-600 font-semibold font-mono">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Autenticado com Email
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onSuccess}
                  className="w-full py-3.5 rounded-2xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <span>Entrar no Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={logout}
                  className="w-full py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 hover:text-red-600 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Desconectar / Trocar de Conta</span>
                </button>
              </div>
            ) : (
              /* Email & Password Authentication Form */
              <div className="space-y-4">
                {/* Tabs: Entrar vs Criar Conta */}
                <div className="flex p-1 bg-neutral-100 rounded-xl border border-neutral-200/80 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setAuthError(null); }}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                      mode === 'login'
                        ? 'bg-white text-neutral-900 shadow-xs font-bold'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    Entrar
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setAuthError(null); }}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                      mode === 'register'
                        ? 'bg-white text-neutral-900 shadow-xs font-bold'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    Criar Conta
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Name field (Register only) */}
                  {mode === 'register' && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-neutral-700 block">
                        Nome Completo
                      </label>
                      <div className="relative flex items-center">
                        <User className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ex: Ana Silva"
                          required
                          className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-hidden focus:border-black transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email field */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-700 block">
                      Email
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-hidden focus:border-black transition-colors"
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-neutral-700 block">
                        Senha
                      </label>
                      <span className="text-[10px] text-neutral-400">
                        {mode === 'register' ? 'Mínimo 4 caracteres' : ''}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-hidden focus:border-black transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 text-neutral-400 hover:text-neutral-700 absolute right-3 cursor-pointer"
                        title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-3.5 px-5 rounded-2xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                  >
                    {isSubmitting ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin text-white" />
                        <span>{mode === 'login' ? 'Entrando no Workspace...' : 'Criando Conta...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{mode === 'login' ? 'Entrar no Workspace' : 'Criar Conta e Acessar'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Quick-fill Demo Account Helper */}
                <div className="pt-2 border-t border-neutral-100 text-center">
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                    <span>Usar conta de teste (admin@veltor.com)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-16 px-8 max-w-7xl mx-auto w-full flex items-center justify-center text-xs text-neutral-400 border-t border-neutral-100 shrink-0">
        <p>© {new Date().getFullYear()} Veltor · Plataforma Autônoma de Validação de Produtos Digitais.</p>
      </footer>
    </div>
  );
};
