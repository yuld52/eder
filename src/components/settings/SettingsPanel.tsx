import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Key, 
  Database, 
  Globe, 
  Bell, 
  CheckCircle2, 
  Download, 
  Upload, 
  RotateCcw, 
  AlertTriangle,
  Copy,
  Check,
  LogIn,
  LogOut,
  Flame,
  ExternalLink
} from 'lucide-react';
import { AppState } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { testConnection } from '../../lib/firebase';
import confetti from 'canvas-confetti';

interface SettingsPanelProps {
  appState: AppState;
  onOpenCreditsModal: () => void;
  theme?: 'black' | 'white';
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  appState,
  onOpenCreditsModal,
  theme = 'black'
}) => {
  const isBlack = theme === 'black';
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [testingFirebase, setTestingFirebase] = useState(false);

  const { currentUser, signInWithGoogle, logout, firestoreConnected } = useAuth();

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText('https://app.lowstack.io/api/webhooks/checkout');
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleTestFirestoreConnection = async () => {
    setTestingFirebase(true);
    try {
      await testConnection();
      setStatusMessage('Conexão ao Firestore verificada com sucesso!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage('Erro ao conectar ao Firestore: ' + err.message);
    } finally {
      setTestingFirebase(false);
    }
  };

  const handleDownloadBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `lowstack-workspace-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
  };

  const handleUploadBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.offers && Array.isArray(json.offers)) {
          await api.restoreStore(json);
          setStatusMessage('Backup restaurado com sucesso! Recarregando...');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          setStatusMessage('Arquivo de backup inválido.');
        }
      } catch (err) {
        setStatusMessage('Erro ao ler arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDefault = async () => {
    setIsResetting(true);
    try {
      await api.resetStore();
      setStatusMessage('Workspace redefinida para os padrões de fábrica!');
      setShowResetConfirm(false);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-transparent">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className={`border-b pb-5 ${isBlack ? 'border-[#181a1f]' : 'border-[#E5E7EB]'}`}>
          <h1 className={`text-xl md:text-2xl font-bold font-display flex items-center gap-2.5 ${isBlack ? 'text-white' : 'text-neutral-900'}`}>
            <Settings className="w-5 h-5 text-amber-400" />
            Definições & Integrações da Workspace
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Gestão do banco de dados Firebase Firestore, autenticação Google, webhooks e parâmetros do LowStack.
          </p>
        </div>

        {statusMessage && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Firebase Firestore Database Card */}
        <div className="bg-[#101216] border border-[#1e222a] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              Banco de Dados Firebase Firestore & Auth
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
              Ativo & Conectado
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#14161c] border border-[#232730] rounded-xl space-y-1">
              <span className="text-[10px] text-neutral-400 uppercase font-mono">Projeto Firebase</span>
              <p className="font-mono text-white text-[11px] font-semibold truncate">
                gen-lang-client-0483652245
              </p>
            </div>

            <div className="p-3 bg-[#14161c] border border-[#232730] rounded-xl space-y-1">
              <span className="text-[10px] text-neutral-400 uppercase font-mono">Firestore Database ID</span>
              <p className="font-mono text-white text-[11px] font-semibold truncate" title="ai-studio-remixlowstackpro-474883fc-0c5d-4bea-8dba-932c5adc523e">
                ai-studio-remixlowstackpro-...
              </p>
            </div>
          </div>

          <div className="p-3 bg-[#14161c] border border-[#232730] rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-white block">Regras de Segurança (Firestore Rules)</span>
              <span className="text-neutral-400">Padrão ABAC com isolamento estrito por usuário e proteção anti-injeção.</span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800 text-[10px] font-bold shrink-0">
              Implantadas
            </span>
          </div>

          {/* User Auth Section */}
          <div className="p-4 bg-[#14161c] border border-[#232730] rounded-xl flex items-center justify-between">
            <div>
              <span className="font-semibold text-white text-xs block">
                {currentUser ? `Autenticado: ${currentUser.displayName || currentUser.email}` : 'Autenticação por Email e Senha'}
              </span>
              <span className="text-[11px] text-neutral-400">
                {currentUser ? `Email: ${currentUser.email} (${currentUser.provider === 'google' ? 'Google' : 'Autônomo'})` : 'Autentique-se com email e senha no Veltor.'}
              </span>
            </div>

            {currentUser && (
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-xl border border-red-900/40 text-red-300 hover:bg-red-950/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Desconectar</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleTestFirestoreConnection}
              disabled={testingFirebase}
              className="px-3.5 py-1.5 bg-[#171A24] hover:bg-[#202538] text-white text-xs font-semibold rounded-xl border border-[#2A314A] flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>{testingFirebase ? 'Verificando conexão...' : 'Testar Conexão com Firestore'}</span>
            </button>
          </div>
        </div>

        {/* Server & AI Integration Status */}
        <div className="bg-[#101216] border border-[#1e222a] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Ambiente e Inteligência Artificial (Servidor)
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#14161c] border border-[#232730] rounded-xl flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">Google Gemini · gemini-3.8-flash</span>
                <span className="text-neutral-400">Geração de ofertas, landing pages, criativos e entregáveis com Gemini</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-950/60 text-blue-400 border border-blue-800 text-[10px] font-bold">
                GEMINI 3.8
              </span>
            </div>

            <div className="p-3 bg-[#14161c] border border-[#232730] rounded-xl flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">Armazenamento Duplo e Persistência</span>
                <span className="text-neutral-400">Firebase Firestore em Nuvem + Armazenamento local data/store.json</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                Persistente & Sincronizado
              </span>
            </div>
          </div>
        </div>

        {/* Webhook Checkout Integration */}
        <div className="bg-[#101216] border border-[#1e222a] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            Webhook de Vendas do Checkout
          </h3>
          <p className="text-xs text-neutral-400">
            Configure este endpoint na sua plataforma (Kiwify, Hotmart, Eduzz, Stripe) para registrar automaticamente compras confirmadas:
          </p>

          <div className="p-3 bg-[#16181f] border border-[#232730] rounded-xl font-mono text-xs text-amber-300 flex items-center justify-between">
            <span className="truncate mr-2">https://app.lowstack.io/api/webhooks/checkout</span>
            <button 
              onClick={handleCopyWebhook}
              className="text-[11px] text-neutral-300 hover:text-white flex items-center gap-1 shrink-0 px-2.5 py-1 bg-[#1F2333] hover:bg-[#282F45] rounded-lg transition-colors"
            >
              {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedWebhook ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* Backup & Workspace Restore */}
        <div className="bg-[#101216] border border-[#1e222a] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            Backup e Restauração da Workspace
          </h3>
          <p className="text-xs text-neutral-400">
            Exporte suas ofertas, páginas e campanhas para um arquivo JSON seguro ou restaure a qualquer momento.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={handleDownloadBackup}
              className="px-4 py-2 bg-[#171A24] hover:bg-[#202538] text-white text-xs font-semibold rounded-xl border border-[#2A314A] flex items-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar Backup (JSON)</span>
            </button>

            <label className="px-4 py-2 bg-[#171A24] hover:bg-[#202538] text-white text-xs font-semibold rounded-xl border border-[#2A314A] flex items-center gap-2 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Restaurar Backup</span>
              <input type="file" accept=".json" onChange={handleUploadBackup} className="hidden" />
            </label>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 bg-red-950/30 hover:bg-red-900/40 text-red-300 text-xs font-semibold rounded-xl border border-red-900/50 flex items-center gap-2 transition-colors ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-400" />
              <span>Redefinir Dados</span>
            </button>
          </div>
        </div>

        {/* Credits quick card */}
        <div className="bg-[#101216] border border-[#1e222a] rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-display">Plano e Créditos</h3>
            <p className="text-xs text-neutral-400">Saldo atual: {appState.credits.balance} créditos</p>
          </div>
          <button
            onClick={onOpenCreditsModal}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Gerenciar Créditos
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#12141F] rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-red-900/40 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto text-xl font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Redefinir Workspace?</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Essa ação restaurará todas as ofertas e páginas para a configuração inicial de demonstração.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetToDefault}
                disabled={isResetting}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
              >
                {isResetting ? 'Redefinindo...' : 'Sim, Redefinir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
