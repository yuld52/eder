import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Layers, 
  Globe, 
  ExternalLink, 
  RotateCw, 
  Trash2, 
  Edit3, 
  Eye, 
  Check, 
  X,
  Copy,
  Tag,
  ArrowLeft
} from 'lucide-react';
import { SalesPage, Offer } from '../../types';
import { PageBuilder } from './PageBuilder';
import { api } from '../../services/api';
import { getDefaultDesignForOffer } from '../../constants/designs';
import confetti from 'canvas-confetti';

interface PagesSectionProps {
  pages: SalesPage[];
  offers: Offer[];
  onUpdatePage: (page: SalesPage) => void;
  onDeletePage?: (id: string) => void;
  creditsBalance: number;
  theme?: 'black' | 'white';
}

export const PagesSection: React.FC<PagesSectionProps> = ({
  pages,
  offers,
  onUpdatePage,
  onDeletePage,
  creditsBalance,
  theme = 'white'
}) => {
  const isBlack = theme === 'black';

  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'published' | 'draft' | 'linked' | 'standalone'>('all');
  const [isNewPageModalOpen, setIsNewPageModalOpen] = useState(false);

  // New Page Modal Form State
  const [productTitle, setProductTitle] = useState('');
  const [niche, setNiche] = useState('Educação e Infoprodutos');
  const [coreProblem, setCoreProblem] = useState('');
  const [price, setPrice] = useState('R$ 27,90');
  const [regularPrice, setRegularPrice] = useState('R$ 97,00');
  const [selectedOfferId, setSelectedOfferId] = useState<string>('standalone');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedPage = pages.find(p => p.id === activePageId);

  // If a page is selected for editing, show PageBuilder with back navigation
  if (selectedPage) {
    // Find associated offer if any, or construct a synthetic offer for standalone pages
    const associatedOffer: Offer = offers.find(o => o.id === selectedPage.offerId) || {
      id: selectedPage.offerId || 'standalone',
      title: selectedPage.title.replace('Página de Vendas - ', ''),
      niche: 'Geral',
      status: 'Aprovada',
      version: 1,
      lastModified: selectedPage.lastUpdated,
      briefing: {
        productName: selectedPage.title,
        productType: 'Página de Vendas Independente',
        targetAudience: 'Público comprador qualificado',
        coreProblem: 'Solução rápida e prática para o cliente final',
        price: 'R$ 27,90',
        regularPrice: 'R$ 97,00',
        niche: 'Geral'
      },
      promise: selectedPage.blocks.find(b => b.type === 'hero')?.headline || 'Transforme seus resultados com praticidade e economia de tempo.',
      mechanism: selectedPage.blocks.find(b => b.type === 'hero')?.subheadline || 'Método direto ao ponto validado',
      benefits: ['Acesso imediato', 'Conteúdo 100% digital', 'Garantia blindada de 7 dias'],
      bonuses: [],
      orderBump: { active: false, title: '', price: '', description: '' },
      upsell: { active: false, title: '', price: '', description: '' },
      faqs: []
    };

    return (
      <div className={`flex-1 flex flex-col h-full min-h-0 overflow-hidden ${isBlack ? 'bg-[#090A0F]' : 'bg-[#F8F9FA]'}`}>
        {/* Back navigation header */}
        <div className={`px-6 py-3 border-b flex items-center justify-between shrink-0 transition-colors ${
          isBlack ? 'border-[#1C2030] bg-[#0E1017]' : 'border-[#E5E7EB] bg-white'
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePageId(null)}
              className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isBlack ? 'border-[#262B42] hover:bg-[#161826] text-neutral-300' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para Lista de Páginas</span>
            </button>
            <span className="text-xs text-neutral-400">|</span>
            <span className={`text-xs font-bold truncate max-w-md ${isBlack ? 'text-white' : 'text-neutral-900'}`}>
              {selectedPage.title.replace(/^Página de Vendas\s*-\s*/i, '')}
            </span>
          </div>

          <div />
        </div>

        {/* Embedded PageBuilder */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <PageBuilder
            offer={associatedOffer}
            page={selectedPage}
            onUpdatePage={onUpdatePage}
            creditsBalance={creditsBalance}
            theme={theme}
          />
        </div>
      </div>
    );
  }

  // Filtered pages list
  const filteredPages = pages.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterType === 'published') return p.published;
    if (filterType === 'draft') return !p.published;
    if (filterType === 'linked') return p.offerId && p.offerId !== 'standalone';
    if (filterType === 'standalone') return !p.offerId || p.offerId === 'standalone';
    return true;
  });

  const handleCreateIndependentPage = async () => {
    if (!productTitle.trim()) return;

    setIsGenerating(true);
    try {
      const existingOffer = selectedOfferId !== 'standalone' ? offers.find(o => o.id === selectedOfferId) : null;
      const targetNiche = niche.trim() || existingOffer?.niche || 'Geral';
      const syntheticOffer: Offer = existingOffer ? {
        ...existingOffer,
        title: productTitle.trim() || existingOffer.title,
        niche: targetNiche,
        briefing: {
          ...existingOffer.briefing,
          price: price || existingOffer.briefing.price || 'R$ 27,90',
          coreProblem: coreProblem || existingOffer.briefing.coreProblem,
          niche: targetNiche
        }
      } : {
        id: `standalone-${Date.now()}`,
        title: productTitle,
        niche: targetNiche,
        status: 'Aprovada',
        version: 1,
        lastModified: new Date().toISOString(),
        briefing: {
          productName: productTitle,
          productType: 'Página de Vendas de Alta Conversão',
          targetAudience: 'Compradores finais interessados em resultados práticos',
          coreProblem: coreProblem || 'Economizar tempo e obter um material pronto de fácil aplicação',
          price: price || 'R$ 27,90',
          regularPrice: regularPrice || 'R$ 97,00',
          niche: targetNiche
        },
        promise: `Alcance resultados comprovados com ${productTitle} em menos tempo e sem complicações.`,
        mechanism: 'Método Passo a Passo de Execução Imediata',
        benefits: [
          'Acesso imediato ao material 100% digital',
          'Tudo organizado para aplicação em minutos',
          'Garantia incondicional de 7 dias com devolução total'
        ],
        bonuses: [],
        orderBump: { active: false, title: '', price: '', description: '' },
        upsell: { active: false, title: '', price: '', description: '' },
        faqs: []
      };

      const generated = await api.generatePage(syntheticOffer);
      const fallbackDesign = getDefaultDesignForOffer(targetNiche, productTitle);
      const newPage: SalesPage = {
        id: `page-${Date.now()}`,
        offerId: selectedOfferId,
        offerTitle: selectedOfferId !== 'standalone' ? offers.find(o => o.id === selectedOfferId)?.title : undefined,
        title: `Página de Vendas - ${productTitle}`,
        slug: productTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40),
        published: true,
        lastUpdated: new Date().toISOString(),
        theme: (generated?.theme === 'midnight-dark' || generated?.theme === 'clean-white' || generated?.theme === 'warm-cream')
          ? generated.theme
          : fallbackDesign.theme,
        design: generated?.design || fallbackDesign.design,
        checkoutUrl: 'https://pay.kiwify.com.br/checkout',
        blocks: generated?.blocks || [
          {
            id: 'hero',
            type: 'hero',
            badge: 'Lançamento',
            headline: `Descubra Como Obter Resultados Imediatos com ${productTitle}`,
            subheadline: coreProblem ? `Diga adeus à ${coreProblem} com um método prático e descomplicado.` : 'Solução prática pronta para aplicar.',
            ctaText: `Quero Meu Acesso Agora Por ${price}`,
            heroImage: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1200&q=80'
          }
        ]
      };

      onUpdatePage(newPage);
      await api.savePage(newPage);
      setIsNewPageModalOpen(false);
      setProductTitle('');
      setCoreProblem('');
      setActivePageId(newPage.id);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      console.error('Failed to create independent page:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = (page: SalesPage) => {
    navigator.clipboard.writeText(`${window.location.origin}/p/${page.slug}`);
    setCopiedId(page.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-8 select-none transition-colors ${
      isBlack ? 'bg-[#090A0F] text-[#E2E4E9]' : 'bg-[#F8F9FA] text-[#111827]'
    }`}>
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${
              isBlack ? 'bg-white text-black' : 'bg-black text-white'
            }`}>
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold tracking-tight font-display ${
                isBlack ? 'text-white' : 'text-neutral-900'
              }`}>
                Páginas de Vendas
              </h1>
              <p className="text-xs text-neutral-500">
                Crie e edite landing pages de forma independente ou conectadas às suas ofertas.
              </p>
            </div>
          </div>
        </div>

        {/* Top Action Button */}
        <button
          onClick={() => setIsNewPageModalOpen(true)}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer ${
            isBlack ? 'bg-white hover:bg-neutral-200 text-black' : 'bg-black hover:bg-neutral-800 text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Nova Página de Vendas</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className={`flex items-center flex-wrap gap-1 p-1 rounded-full border transition-colors ${
          isBlack ? 'bg-[#12141F] border-[#202538]' : 'bg-[#ECEEF2] border-[#E2E4E9]'
        }`}>
          {[
            { id: 'all', label: 'Todas', count: pages.length },
            { id: 'published', label: 'Publicadas', count: pages.filter(p => p.published).length },
            { id: 'draft', label: 'Rascunhos', count: pages.filter(p => !p.published).length },
            { id: 'linked', label: 'Das Ofertas', count: pages.filter(p => p.offerId && p.offerId !== 'standalone').length },
            { id: 'standalone', label: 'Páginas Avulsas', count: pages.filter(p => !p.offerId || p.offerId === 'standalone').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterType === tab.id
                  ? isBlack
                    ? 'bg-[#1F2436] text-white shadow-xs font-bold border border-[#2F3652]'
                    : 'bg-white text-neutral-900 shadow-xs font-bold'
                  : isBlack ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[280px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar páginas por título ou slug..."
            className={`w-full pl-9 pr-4 py-1.5 rounded-xl border text-xs focus:outline-none transition-colors ${
              isBlack ? 'bg-[#10121C] border-[#22273D] text-white' : 'bg-white border-[#E5E7EB] text-neutral-900'
            }`}
          />
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dashed "+ Criar Nova Página" card */}
        <button
          onClick={() => setIsNewPageModalOpen(true)}
          className={`h-56 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all group cursor-pointer ${
            isBlack
              ? 'border-[#22273D] hover:border-neutral-500 bg-[#0E1018]/50 hover:bg-[#121422]'
              : 'border-[#D1D5DB] hover:border-neutral-600 bg-white/50 hover:bg-white'
          }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${
            isBlack ? 'bg-[#181B28] text-white border border-[#292F47]' : 'bg-neutral-100 text-neutral-800'
          }`}>
            <Plus className="w-6 h-6" />
          </div>
          <span className={`text-sm font-bold block mb-1 ${isBlack ? 'text-white' : 'text-neutral-900'}`}>
            Criar Página Independente
          </span>
          <span className={`text-xs max-w-xs ${isBlack ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Gere uma landing page individual sem precisar vincular a uma oferta.
          </span>
        </button>

        {/* Existing Pages Cards */}
        {filteredPages.map(page => {
          const associatedOffer = offers.find(o => o.id === page.offerId);
          const isStandalone = !page.offerId || page.offerId === 'standalone';

          return (
            <div
              key={page.id}
              className={`rounded-3xl border shadow-xs p-5 flex flex-col justify-between transition-all hover:shadow-md ${
                isBlack ? 'bg-[#10121C] border-[#1E2336]' : 'bg-white border-[#E5E7EB]'
              }`}
            >
              <div>
                {/* Badges bar */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    page.published
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20'
                  }`}>
                    {page.published ? 'Publicada' : 'Rascunho'}
                  </span>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    isStandalone
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                  }`}>
                    {isStandalone ? 'Página Avulsa' : `Oferta: ${associatedOffer?.title.slice(0, 18) || 'Vinculada'}...`}
                  </span>
                </div>

                <h3 className={`font-bold text-sm mb-1.5 line-clamp-2 ${isBlack ? 'text-white' : 'text-neutral-900'}`}>
                  {page.title}
                </h3>

                <p className="text-[11px] text-neutral-500 font-mono mb-3 truncate">
                  lowstack.app/p/{page.slug}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <span>{page.blocks?.length || 1} seções</span>
                  <span>•</span>
                  <span>Tema: {page.theme}</span>
                </div>
              </div>

              {/* Footer actions */}
              <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleCopyLink(page)}
                  className="p-1.5 rounded-xl border border-neutral-200 dark:border-[#22273D] text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Copiar Link"
                >
                  {copiedId === page.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => setActivePageId(page.id)}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                    isBlack
                      ? 'bg-white hover:bg-neutral-200 text-black'
                      : 'bg-black hover:bg-neutral-800 text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Página</span>
                </button>
                <a
                  href={`/p/${page.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-xl border border-neutral-200 dark:border-[#22273D] text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  title="Abrir página publicada"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Nova Página Independente com IA */}
      {isNewPageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 space-y-4 ${
            isBlack ? 'bg-[#10121C] border-[#22273D] text-white' : 'bg-white border-[#E5E7EB] text-neutral-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
                </div>
                <div>
                  <h3 className="font-bold text-sm">Criar Nova Página</h3>
                  <p className="text-[11px] text-neutral-400">Página de vendas individual e independente</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewPageModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Título ou Nome do Produto/Serviço *</label>
                <input
                  type="text"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  placeholder="Ex: Checklist Diário de Produtividade, Pack de Templates..."
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none ${
                    isBlack ? 'bg-[#181B2A] border-[#292F47] text-white' : 'bg-neutral-50 border-neutral-300'
                  }`}
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Dor Central ou Promessa que a Página Resolve</label>
                <textarea
                  value={coreProblem}
                  onChange={(e) => setCoreProblem(e.target.value)}
                  placeholder="Ex: Falta de tempo para organizar rotinas, dificuldade em atrair clientes..."
                  rows={2}
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none resize-none ${
                    isBlack ? 'bg-[#181B2A] border-[#292F47] text-white' : 'bg-neutral-50 border-neutral-300'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Nicho / Tema *</label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="Ex: Bíblico, Infantil, Finanças, Saúde..."
                    className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none ${
                      isBlack ? 'bg-[#181B2A] border-[#292F47] text-white' : 'bg-neutral-50 border-neutral-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Preço de Venda</label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none ${
                      isBlack ? 'bg-[#181B2A] border-[#292F47] text-white' : 'bg-neutral-50 border-neutral-300'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Vincular a uma Oferta Existente (Opcional)</label>
                <select
                  value={selectedOfferId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedOfferId(id);
                    if (id !== 'standalone') {
                      const found = offers.find(o => o.id === id);
                      if (found) {
                        setProductTitle(found.title);
                        setNiche(found.niche || 'Geral');
                        if (found.briefing?.coreProblem) setCoreProblem(found.briefing.coreProblem);
                        if (found.briefing?.price) setPrice(found.briefing.price);
                      }
                    }
                  }}
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none ${
                    isBlack ? 'bg-[#181B2A] border-[#292F47] text-white' : 'bg-neutral-50 border-neutral-300'
                  }`}
                >
                  <option value="standalone">Nenhuma (Página Avulsa)</option>
                  {offers.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.title.slice(0, 40)} ({o.niche})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsNewPageModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateIndependentPage}
                disabled={isGenerating || !productTitle.trim()}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
                  isBlack ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                }`}
              >
                {isGenerating ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Gerando página...</span>
                  </>
                ) : (
                  <>
                    <span>Gerar Página com Gemini</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
