import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  User, 
  CheckCircle2, 
  Clock, 
  Flame, 
  PauseCircle, 
  Skull,
  TrendingUp,
  Tag
} from 'lucide-react';
import { Offer } from '../../types';

interface OffersGalleryProps {
  offers: Offer[];
  onSelectOffer: (offer: Offer) => void;
  onNewOffer: () => void;
  theme?: 'black' | 'white';
}

export const OffersGallery: React.FC<OffersGalleryProps> = ({
  offers,
  onSelectOffer,
  onNewOffer,
  theme = 'white'
}) => {
  const isBlack = theme === 'black';
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('Todas');

  const filterTabs = [
    { id: 'Todas', label: 'Todas', count: offers.length },
    { id: 'Aprovada', label: 'Aprovada', count: offers.filter(o => o.status === 'Aprovada').length },
    { id: 'Em produção', label: 'Em produção', count: offers.filter(o => o.status === 'Em produção').length },
    { id: 'Em teste', label: 'Em teste', count: offers.filter(o => o.status === 'Validado' || (o.status as string) === 'Em teste').length },
    { id: 'Escalando', label: 'Escalando', count: offers.filter(o => o.status === 'Escalando').length },
    { id: 'Pausada', label: 'Pausada', count: offers.filter(o => o.status === 'Pausado' || (o.status as string) === 'Pausada').length },
    { id: 'Morta', label: 'Morta', count: offers.filter(o => (o.status as string) === 'Morta').length },
  ];

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = 
      offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.niche.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.promise.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (offer.briefing.targetAudience && offer.briefing.targetAudience.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'Todas') return true;
    if (activeFilter === 'Aprovada') return offer.status === 'Aprovada';
    if (activeFilter === 'Em produção') return offer.status === 'Em produção';
    if (activeFilter === 'Em teste') return offer.status === 'Validado' || (offer.status as string) === 'Em teste';
    if (activeFilter === 'Escalando') return offer.status === 'Escalando';
    if (activeFilter === 'Pausada') return offer.status === 'Pausado' || (offer.status as string) === 'Pausada';
    if (activeFilter === 'Morta') return (offer.status as string) === 'Morta';

    return true;
  });

  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-8 transition-colors select-none ${
      isBlack ? 'bg-[#090A0F] text-[#E2E4E9]' : 'bg-[#F8F9FA] text-[#111827]'
    }`}>
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${
            isBlack ? 'bg-white text-black' : 'bg-black text-white'
          }`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className={`text-2xl font-bold tracking-tight font-display ${
            isBlack ? 'text-white' : 'text-neutral-900'
          }`}>
            Ofertas
          </h1>
        </div>

        {/* Filter Tabs Pills */}
        <div className={`flex items-center flex-wrap gap-1 p-1 rounded-full border transition-colors ${
          isBlack ? 'bg-[#12141F] border-[#202538]' : 'bg-[#ECEEF2] border-[#E2E4E9]'
        }`}>
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? isBlack
                      ? 'bg-[#1F2436] text-white shadow-xs font-bold border border-[#2F3652]'
                      : 'bg-white text-neutral-900 shadow-xs font-bold'
                    : isBlack
                      ? 'text-neutral-400 hover:text-white'
                      : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] opacity-70`}>({tab.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome, nicho ou promessa da oferta..."
          className={`w-full pl-11 pr-4 py-3 rounded-full text-xs font-medium border transition-colors outline-none ${
            isBlack
              ? 'bg-[#10121C] border-[#22273D] text-white placeholder-neutral-500 focus:border-neutral-400'
              : 'bg-white border-[#E5E7EB] text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 shadow-xs'
          }`}
        />
      </div>

      {/* Grid of Offers matching Image 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {/* 1. "Nova oferta" Card */}
        <div
          onClick={onNewOffer}
          className={`group rounded-2xl border-2 border-dashed p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[220px] transition-all ${
            isBlack
              ? 'border-[#262B40] hover:border-neutral-400 bg-[#0E101A]/50 hover:bg-[#121524]'
              : 'border-[#D9DCE3] hover:border-neutral-500 bg-white/70 hover:bg-white shadow-xs hover:shadow-md'
          }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 ${
            isBlack ? 'bg-[#181B28] text-white border border-[#2B314B]' : 'bg-[#F1F3F6] text-neutral-800'
          }`}>
            <Plus className="w-5 h-5" />
          </div>
          <h3 className={`font-bold text-sm mb-2 transition-colors ${
            isBlack ? 'text-white' : 'text-neutral-900'
          }`}>
            Nova oferta
          </h3>
          <p className={`text-xs max-w-[200px] leading-relaxed transition-colors ${
            isBlack ? 'text-neutral-400' : 'text-neutral-500'
          }`}>
            Descreva com suas palavras ou informe um link de referência. A IA constrói o resto.
          </p>
        </div>

        {/* Existing Offer Cards */}
        {filteredOffers.map((offer) => {
          const audience = offer.briefing.targetAudience || 'Público comprador qualificado';
          const price = offer.priceGuarantee?.frontendPrice 
            ? `R$ ${offer.priceGuarantee.frontendPrice}` 
            : (offer.briefing.price || 'R$ 27,90');
          const isB2B = offer.businessType === 'B2B';

          return (
            <div
              key={offer.id}
              onClick={() => onSelectOffer(offer)}
              className={`rounded-2xl border p-5 flex flex-col justify-between cursor-pointer min-h-[220px] transition-all hover:scale-[1.01] ${
                isBlack
                  ? 'bg-[#10121C] border-[#202538] hover:border-[#353D5C] text-neutral-200 shadow-sm hover:shadow-xl'
                  : 'bg-white border-[#E5E7EB] hover:border-neutral-400 text-neutral-900 shadow-xs hover:shadow-md'
              }`}
            >
              {/* Card Top: Badges */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                    isBlack 
                      ? 'bg-[#181B2A] text-neutral-300 border-[#2A3048]' 
                      : 'bg-[#F4F5F7] text-neutral-600 border-[#E5E7EB]'
                  }`}>
                    {offer.status || 'Aprovada'}
                  </span>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                    isBlack
                      ? 'bg-[#151826] text-neutral-400 border-[#22273B]'
                      : 'bg-[#F9FAFB] text-neutral-500 border-[#EAECF0]'
                  }`}>
                    <User className="w-2.5 h-2.5" />
                    <span>{isB2B ? 'B2B' : 'B2C'}</span>
                  </span>
                </div>

                {/* Title */}
                <h3 className={`font-bold text-sm leading-snug mb-2 line-clamp-2 ${
                  isBlack ? 'text-white' : 'text-neutral-900'
                }`}>
                  {offer.title}
                </h3>

                {/* Target Audience */}
                <p className={`text-[11px] font-medium line-clamp-2 mb-2 leading-relaxed ${
                  isBlack ? 'text-neutral-400' : 'text-neutral-500'
                }`}>
                  {audience}
                </p>

                {/* Promise snippet */}
                <p className={`text-xs line-clamp-2 leading-relaxed ${
                  isBlack ? 'text-neutral-300' : 'text-neutral-700'
                }`}>
                  {offer.promise}
                </p>
              </div>

              {/* Card Bottom: Price */}
              <div className={`pt-4 mt-3 border-t flex items-center justify-between ${
                isBlack ? 'border-[#1C2030]' : 'border-[#F0F2F5]'
              }`}>
                <span className={`text-[11px] font-medium ${
                  isBlack ? 'text-neutral-400' : 'text-neutral-500'
                }`}>
                  Preço
                </span>
                <span className={`text-sm font-extrabold font-display ${
                  isBlack ? 'text-white' : 'text-neutral-900'
                }`}>
                  {price}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
