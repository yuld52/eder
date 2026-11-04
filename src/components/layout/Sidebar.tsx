import React from 'react';
import { 
  Compass, 
  Calendar, 
  Rocket, 
  Layers, 
  Clapperboard,
  Package, 
  Pickaxe, 
  Coins,
  Sun,
  Moon
} from 'lucide-react';
import { AppTab } from '../../types';
import { Logo } from '../brand/Logo';

interface SidebarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  creditsBalance: number;
  onOpenCreditsModal: () => void;
  theme?: 'black' | 'white';
  onToggleTheme?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  creditsBalance,
  onOpenCreditsModal,
  theme = 'white',
  onToggleTheme
}) => {
  const isBlack = theme === 'black';

  const menuItems: Array<{ id: AppTab; label: string; icon: React.ElementType; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: Compass },
    { id: 'seasonality', label: 'Sazonalidade', icon: Calendar },
    { id: 'offers', label: 'Ofertas', icon: Rocket },
    { id: 'pages', label: 'Páginas', icon: Layers },
    { id: 'creatives', label: 'Criativos', icon: Clapperboard },
    { id: 'deliverables', label: 'Entregáveis', icon: Package },
    { id: 'mining', label: 'Mineração', icon: Pickaxe },
  ];

  return (
    <aside className={`w-60 flex flex-col h-screen select-none shrink-0 z-30 transition-colors bg-transparent ${
      isBlack 
        ? 'border-r border-[#1C2030] text-neutral-300' 
        : 'border-r border-[#E5E7EB] text-neutral-600'
    }`}>
      {/* Brand Header */}
      <div className={`h-16 flex items-center px-5 border-b transition-colors bg-transparent ${
        isBlack ? 'border-[#1C2030]' : 'border-[#E5E7EB]'
      }`}>
        <Logo theme={theme} size="md" />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto bg-transparent">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                isActive
                  ? isBlack
                    ? 'bg-[#181B28] text-white border border-[#2D334C] shadow-sm font-bold'
                    : 'bg-white text-neutral-900 border border-[#E2E4E9] shadow-xs font-bold'
                  : isBlack
                    ? 'text-neutral-400 hover:text-white hover:bg-[#12141F]'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-[#ECEEF2]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                isActive 
                  ? (isBlack ? 'text-white' : 'text-neutral-900') 
                  : (isBlack ? 'text-neutral-500 group-hover:text-neutral-300' : 'text-neutral-500 group-hover:text-neutral-800')
              }`} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className={`px-1.5 py-0.5 text-[10px] rounded font-mono font-medium ${
                  isBlack ? 'bg-[#22273B] text-neutral-300' : 'bg-neutral-200 text-neutral-800'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Theme Switcher & Credit Footer */}
      <div className={`p-3.5 border-t space-y-2.5 transition-colors bg-transparent ${
        isBlack ? 'border-[#1C2030]' : 'border-[#E5E7EB]'
      }`}>
        
        {/* Black & White Background Switcher */}
        {onToggleTheme && (
          <div className={`w-full p-1 rounded-xl border transition-colors ${
            isBlack ? 'bg-[#141624] border-[#22273B]' : 'bg-[#ECEEF2] border-[#E2E4E9]'
          }`}>
            <div className="grid w-full grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => isBlack && onToggleTheme()}
                className={`w-full justify-center px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  !isBlack ? 'bg-white text-neutral-900 font-bold shadow-xs' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>White</span>
              </button>
              <button
                type="button"
                onClick={() => !isBlack && onToggleTheme()}
                className={`w-full justify-center px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  isBlack ? 'bg-[#22273C] text-white font-bold shadow-xs' : 'text-neutral-600 hover:text-black'
                }`}
              >
                <Moon className="w-3 h-3" />
                <span>Black</span>
              </button>
            </div>
          </div>
        )}

        {/* Credit Card */}
        <div 
          onClick={onOpenCreditsModal}
          className={`p-3 rounded-2xl border transition-all cursor-pointer group shadow-xs ${
            isBlack 
              ? 'bg-[#12141F] border-[#22273B] hover:border-[#323852]' 
              : 'bg-white border-[#E5E7EB] hover:border-neutral-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${
              isBlack ? 'text-neutral-300' : 'text-neutral-700'
            }`}>
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              Saldo de Créditos
            </span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
              isBlack ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              Ativo
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1.5">
            <div className={`text-lg font-bold font-display ${isBlack ? 'text-white' : 'text-neutral-900'}`}>
              {creditsBalance} <span className={`text-xs font-normal ${isBlack ? 'text-neutral-400' : 'text-neutral-500'}`}>créditos</span>
            </div>
            <span className={`text-[11px] font-medium underline underline-offset-2 ${
              isBlack ? 'text-white group-hover:text-neutral-200' : 'text-neutral-600 group-hover:text-neutral-900'
            }`}>
              Histórico
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
