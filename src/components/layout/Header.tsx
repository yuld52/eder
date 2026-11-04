import React, { useState } from 'react';
import { 
  ArrowLeft, 
  LayoutGrid, 
  PenTool, 
  Eye, 
  Globe, 
  Package, 
  CreditCard, 
  ChevronDown, 
  ArrowUpRight,
  AlertTriangle,
  Plus,
  Coins,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { Offer, AppTab } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  activeOffer: Offer | null;
  offers: Offer[];
  onSelectOffer: (offer: Offer) => void;
  onNewOffer: () => void;
  onBackToDashboard: () => void;
  creditsBalance: number;
  onOpenCreditsModal: () => void;
  onAdvance?: () => void;
  theme?: 'black' | 'white';
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  activeOffer,
  offers,
  onSelectOffer,
  onNewOffer,
  onBackToDashboard,
  creditsBalance,
  onOpenCreditsModal,
  onAdvance,
  theme = 'white'
}) => {
  const isBlack = theme === 'black';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { currentUser, signInWithGoogle, logout, firestoreConnected } = useAuth();

  const hasOutdated = activeOffer?.outdatedMaterials && (
    activeOffer.outdatedMaterials.page || 
    activeOffer.outdatedMaterials.deliverable
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getUserGreeting = () => {
    if (!currentUser) return 'Visitante';
    return currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuário';
  };

  // If on dashboard, show dashboard top bar: 100% fixed at the top, perfectly locked
  if (currentTab === 'dashboard') {
    return (
      <header className={`h-20 px-6 md:px-8 flex items-center justify-between shrink-0 z-30 select-none transition-colors ${
        isBlack ? 'bg-[#090A0F] text-white' : 'bg-[#F8F9FA] text-neutral-900'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border border-neutral-200/90 dark:border-neutral-700/80 shadow-xs shrink-0">
            {currentUser?.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt={currentUser.displayName || "Perfil Google"} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                {(currentUser?.displayName || currentUser?.email || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>
          <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight font-display ${
            isBlack ? 'text-white' : 'text-neutral-900'
          }`}>
            {getGreeting()}, {currentUser?.displayName || 'LowStack'}
          </h1>
        </div>
      </header>
    );
  }

  // Inside Workspace: Top Bar
  return (
    <header className={`h-16 border-b px-6 flex items-center justify-between shrink-0 z-30 transition-colors bg-transparent ${
      isBlack ? 'border-[#1C2030] text-white' : 'border-[#E5E7EB] text-neutral-900'
    }`}>
      {/* Left: Back button & Offer Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBackToDashboard}
          title="Voltar ao Painel"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors border ${
            isBlack 
              ? 'hover:bg-[#141622] text-neutral-400 hover:text-white border-transparent hover:border-[#22273B]' 
              : 'hover:bg-neutral-100 text-neutral-500 hover:text-black border-transparent hover:border-neutral-200'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {activeOffer ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 hover:opacity-90 transition-opacity text-left group"
            >
              <span className={`font-semibold text-sm max-w-[260px] truncate transition-colors ${
                isBlack ? 'text-white' : 'text-neutral-900'
              }`}>
                {activeOffer.title}
              </span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                isBlack ? 'bg-[#161926] text-neutral-300 border-[#272D45]' : 'bg-[#F3F4F6] text-neutral-700 border-[#E5E7EB]'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {activeOffer.status || 'Aprovada'}
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </span>
            </button>

            {hasOutdated && (
              <span 
                title="A oferta foi modificada. Atualize a página ou entregável para manter o alinhamento." 
                className="hidden lg:inline-flex items-center gap-1 ml-2 px-2 py-0.5 text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/25 rounded-md font-medium"
              >
                <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                Materiais desatualizados
              </span>
            )}

            {dropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setDropdownOpen(false)} 
                />
                <div className={`absolute left-0 mt-2 w-80 border rounded-2xl shadow-2xl p-2 z-50 ${
                  isBlack ? 'bg-[#12141F] border-[#252A40]' : 'bg-white border-[#E5E7EB]'
                }`}>
                  <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    Alternar Oferta Ativa
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {offers.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => {
                          onSelectOffer(o);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          o.id === activeOffer.id
                            ? isBlack
                              ? 'bg-[#1C2032] text-white font-semibold border border-[#313856]'
                              : 'bg-neutral-100 text-neutral-900 font-bold border border-neutral-200'
                            : isBlack
                              ? 'text-neutral-300 hover:bg-[#181B2A]'
                              : 'text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        <span className="truncate pr-2">{o.title}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          isBlack ? 'bg-[#202538] text-neutral-400 border-[#2D334C]' : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                        }`}>
                          {o.status}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className={`pt-2 mt-1 border-t ${isBlack ? 'border-[#1C2030]' : 'border-[#E5E7EB]'}`}>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onNewOffer();
                      }}
                      className={`w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-xl transition-colors shadow-xs ${
                        isBlack ? 'text-black bg-white hover:bg-neutral-200' : 'text-white bg-black hover:bg-neutral-800'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Criar Nova Oferta
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <span className={`font-semibold text-sm ${isBlack ? 'text-white' : 'text-neutral-900'}`}>Veltor Workspace</span>
        )}
      </div>

      {/* Center: Module Navigation Cluster */}
      <div className={`flex items-center gap-1 p-1 rounded-full border transition-colors ${
        isBlack ? 'bg-[#12141D] border-[#212538] shadow-inner' : 'bg-[#ECEEF2] border-[#E2E4E9]'
      }`}>
        {/* 1. Dashboard / Grid */}
        <button
          onClick={() => onSelectTab('dashboard')}
          title="Dashboard"
          className={`p-1.5 rounded-full transition-all ${
            isBlack ? 'text-neutral-400 hover:text-white hover:bg-[#1E2235]' : 'text-neutral-600 hover:text-neutral-900 hover:bg-white'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        {/* 2. Oferta / Pencil */}
        <button
          onClick={() => onSelectTab('offers')}
          title="Estrutura da Oferta"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            currentTab === 'offers'
              ? isBlack
                ? 'bg-[#1E2235] text-white border border-[#2F3654] shadow-xs'
                : 'bg-white text-neutral-900 border border-[#D1D5DB] shadow-xs font-bold'
              : isBlack
                ? 'text-neutral-400 hover:text-white hover:bg-[#181B2A]'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          {currentTab === 'offers' && <span>Oferta</span>}
        </button>

        {/* 3. Preview / Eye */}
        <button
          onClick={() => onSelectTab('pages')}
          title="Pré-visualizar Página"
          className={`p-1.5 rounded-full transition-all ${
            isBlack ? 'text-neutral-400 hover:text-white hover:bg-[#1E2235]' : 'text-neutral-600 hover:text-neutral-900 hover:bg-white'
          }`}
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* 4. Página de vendas / Globe */}
        <button
          onClick={() => onSelectTab('pages')}
          title="Página de vendas"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            currentTab === 'pages'
              ? isBlack
                ? 'bg-[#1E2235] text-white border border-[#2F3654] shadow-xs'
                : 'bg-white text-neutral-900 border border-[#D1D5DB] shadow-xs font-bold'
              : isBlack
                ? 'text-neutral-400 hover:text-white hover:bg-[#181B2A]'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-emerald-500" />
          <span>Página de vendas</span>
        </button>

        {/* 6. Entregáveis / Package */}
        <button
          onClick={() => onSelectTab('deliverables')}
          title="Entregáveis"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            currentTab === 'deliverables'
              ? isBlack
                ? 'bg-[#1E2235] text-white border border-[#2F3654] shadow-xs'
                : 'bg-white text-neutral-900 border border-[#D1D5DB] shadow-xs font-bold'
              : isBlack
                ? 'text-neutral-400 hover:text-white hover:bg-[#181B2A]'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-amber-500" />
          {currentTab === 'deliverables' && <span>Entregáveis</span>}
        </button>

        {/* 7. Checkout / CreditCard */}
        <button
          onClick={() => onSelectTab('settings')}
          title="Checkout e Configurações"
          className={`p-1.5 rounded-full transition-all ${
            isBlack ? 'text-neutral-400 hover:text-white hover:bg-[#1E2235]' : 'text-neutral-600 hover:text-neutral-900 hover:bg-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Credits, Auth & Avançar ↗ */}
      <div className="flex items-center gap-2.5">
        {currentUser ? (
          <button
            onClick={logout}
            title={`Conectado como ${currentUser.email}. Clique para sair.`}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] transition-colors ${
              isBlack ? 'bg-[#161824] border-[#2A2F45] text-neutral-300 hover:text-red-400' : 'bg-white border-[#E5E7EB] text-neutral-700 hover:text-red-600 shadow-xs'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="max-w-[80px] truncate">{currentUser.displayName?.split(' ')[0] || 'Google'}</span>
          </button>
        ) : (
          <button
            onClick={() => onSelectTab('login')}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-colors ${
              isBlack ? 'bg-[#161824] hover:bg-[#202538] border-[#2A2F45] text-white' : 'bg-neutral-100 hover:bg-neutral-200 border-[#E5E7EB] text-neutral-900'
            }`}
          >
            <LogIn className="w-3 h-3 text-amber-500" />
            <span>Login</span>
          </button>
        )}

        <button
          onClick={onOpenCreditsModal}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold transition-colors ${
            isBlack ? 'bg-[#12141D] border-[#212538] hover:border-[#323852] text-neutral-300' : 'bg-white border-[#E5E7EB] hover:border-neutral-300 text-neutral-700 shadow-xs'
          }`}
        >
          <Coins className="w-3.5 h-3.5 text-amber-500" />
          <span>{creditsBalance} cr</span>
        </button>

        <button
          onClick={onAdvance || (() => {
            if (currentTab === 'offers') onSelectTab('pages');
            else if (currentTab === 'pages') onSelectTab('deliverables');
          })}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-xs ${
            isBlack 
              ? 'bg-[#181B28] hover:bg-[#202538] border border-[#2E3550] text-white' 
              : 'bg-black hover:bg-neutral-800 text-white'
          }`}
        >
          <span>Avançar</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
