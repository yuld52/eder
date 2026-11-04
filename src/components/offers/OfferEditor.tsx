import React, { useState, useEffect } from 'react';
import { 
  RotateCw, 
  Check, 
  AlertCircle, 
  Save, 
  Plus, 
  Trash2, 
  FileText, 
  Target, 
  Lightbulb, 
  Tag, 
  ShoppingBag,
  ExternalLink,
  Copy as CopyIcon,
  LayoutGrid,
  PenLine,
  Eye,
  Globe,
  Package,
  CreditCard,
  BarChart3,
  ArrowLeft,
  ChevronDown,
  User,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { Offer, BonusItem, FAQItem, SalesPage, Deliverable } from '../../types';
import { api } from '../../services/api';
import { getDefaultDesignForOffer } from '../../constants/designs';
import confetti from 'canvas-confetti';
import { PageBuilder } from '../pages/PageBuilder';
import { CountryFlag } from '../common/CountryFlag';
import { DeliverableBuilder } from '../deliverables/DeliverableBuilder';
import { MetaAdsAnalytics } from '../analytics/MetaAdsAnalytics';

interface OfferEditorProps {
  offer: Offer;
  onUpdateOffer: (updated: Offer) => void;
  onDeleteOffer?: (id: string) => void;
  onBackToList?: () => void;
  page?: SalesPage;
  onUpdatePage?: (page: SalesPage) => void;
  deliverable?: Deliverable;
  onUpdateDeliverable?: (del: Deliverable) => void;
  campaigns?: any[];
  onSyncCampaign?: (campaignId: string, purchases?: number, spend?: number) => void;
  onNavigateToPage?: () => void;
  onNavigateToDeliverables?: () => void;
  onNavigateToCheckout?: () => void;
  onNavigateToAnalytics?: () => void;
  creditsBalance: number;
  onCreditsUsed?: (amount: number, action: string) => void;
  theme?: 'black' | 'white';
}

export const OfferEditor: React.FC<OfferEditorProps> = ({
  offer,
  onUpdateOffer,
  onDeleteOffer,
  onBackToList,
  page,
  onUpdatePage,
  deliverable,
  onUpdateDeliverable,
  campaigns = [],
  onSyncCampaign,
  onNavigateToPage,
  onNavigateToDeliverables,
  onNavigateToCheckout,
  onNavigateToAnalytics,
  creditsBalance,
  onCreditsUsed,
  theme = 'white'
}) => {
  const isBlack = theme === 'black';

  // Sub-tabs: Visão geral | Copy | Prévia | Página de vendas | Entregáveis | Checkout
  const [subTab, setSubTab] = useState<
    'visao_geral' | 'copy' | 'previa' | 'pagina' | 'entregaveis' | 'checkout'
  >('visao_geral');

  const [localOffer, setLocalOffer] = useState<Offer>(offer);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isGeneratingVersion, setIsGeneratingVersion] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync if parent offer id changes
  useEffect(() => {
    setLocalOffer(offer);
  }, [offer.id]);

  const handleChange = (field: keyof Offer, value: any) => {
    setLocalOffer(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.saveOffer(localOffer);
      onUpdateOffer(localOffer);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const [isRegeneratingCopy, setIsRegeneratingCopy] = useState(false);

  const handleGenerateNewVersion = async () => {
    setIsGeneratingVersion(true);
    try {
      const generated = await api.generateOffer(localOffer.briefing);
      const updated: Offer = {
        ...localOffer,
        ...(generated.title ? { title: generated.title } : {}),
        ...(generated.promise ? { promise: generated.promise } : {}),
        ...(generated.mechanism ? { mechanism: generated.mechanism } : {}),
        ...(generated.benefits ? { benefits: generated.benefits } : {}),
        ...(generated.bonuses ? { bonuses: generated.bonuses } : {}),
        version: (localOffer.version || 1) + 1,
        lastModified: new Date().toISOString()
      };
      setLocalOffer(updated);
      await api.saveOffer(updated);
      onUpdateOffer(updated);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      console.warn('Fallback generating new version:', err);
      const updated: Offer = {
        ...localOffer,
        version: (localOffer.version || 1) + 1,
        lastModified: new Date().toISOString()
      };
      setLocalOffer(updated);
      onUpdateOffer(updated);
    } finally {
      setIsGeneratingVersion(false);
    }
  };

  const handleRegenerateCopy = async () => {
    setIsRegeneratingCopy(true);
    try {
      const res = await api.regenerateSection('copyOverview', localOffer);
      if (res && res.copyOverview) {
        const updated: Offer = {
          ...localOffer,
          copyOverview: res.copyOverview,
          lastModified: new Date().toISOString()
        };
        setLocalOffer(updated);
        await api.saveOffer(updated);
        onUpdateOffer(updated);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error('Failed to regenerate copy with Gemini:', err);
    } finally {
      setIsRegeneratingCopy(false);
    }
  };

  const defaultDesignData = getDefaultDesignForOffer(localOffer.niche, localOffer.title);
  const associatedPage: SalesPage = page || {
    id: `page-${localOffer.id}`,
    offerId: localOffer.id,
    offerTitle: localOffer.title,
    title: `Página de Vendas - ${localOffer.title}`,
    slug: localOffer.id,
    published: true,
    lastUpdated: new Date().toISOString(),
    theme: localOffer.pageTheme || defaultDesignData.theme,
    design: localOffer.pageDesign || defaultDesignData.design,
    checkoutUrl: 'https://pay.kiwify.com.br/checkout',
    blocks: [
      {
        id: 'hero',
        type: 'hero',
        badge: 'Lançamento 2026',
        headline: localOffer.promise,
        subheadline: localOffer.mechanism,
        ctaText: `Quero Acesso Imediato Por ${localOffer.briefing.price || 'R$ 27,90'}`,
        heroImage: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1200&q=80'
      }
    ]
  };

  const associatedDeliverable: Deliverable = deliverable || {
    id: `del-${localOffer.id}`,
    offerId: localOffer.id,
    offerTitle: localOffer.title,
    title: `${localOffer.title} - Material Digital`,
    format: 'PDF',
    totalPages: 16,
    status: 'draft',
    chapters: [
      {
        id: 'cap-1',
        title: 'Manual de Aplicação Prática',
        content: `Guia de execução para ${localOffer.title}. Siga o passo a passo para aplicar o ${localOffer.mechanism}.`
      }
    ]
  };

  // Avatar defaults dynamically tailored to the offer if not set
  const avatar = localOffer.avatar || {
    ageRange: '25-45',
    incomeProfile: 'Classe B/C',
    behavior: `Público interessado em soluções práticas, acessíveis e rápidas para ${localOffer.title}. Busca materiais aplicáveis imediatamente sem curva longa de aprendizado.`,
    purchaseTrigger: `A urgência de solucionar um problema específico com praticidade e baixo risco financeiro.`,
    mainPain: localOffer.briefing?.coreProblem || `Falta de tempo e dificuldade para executar o processo sem um método direto e validado.`,
    mainDesire: localOffer.promise || `Alcançar resultados práticos com facilidade e rapidez através de um método estruturado.`
  };

  const updateAvatarField = (field: keyof typeof avatar, value: string) => {
    setLocalOffer(prev => ({
      ...prev,
      avatar: {
        ...(prev.avatar || avatar),
        [field]: value
      }
    }));
  };

  // Kit composition
  const kitComp = localOffer.kitComposition || {
    format: localOffer.briefing?.productType || 'Pack de modelos/templates digitais (PDF)',
    referenceUrl: '',
    items: localOffer.benefits && localOffer.benefits.length > 0 ? localOffer.benefits.slice(0, 3) : [
      `Guia completo de execução do ${localOffer.title} em PDF`,
      'Modelos e recursos complementares prontos para uso',
      'Checklist prático de aplicação em minutos'
    ]
  };

  const updateKitComp = (field: keyof typeof kitComp, value: any) => {
    setLocalOffer(prev => ({
      ...prev,
      kitComposition: {
        ...(prev.kitComposition || kitComp),
        [field]: value
      }
    }));
  };

  // Price & Guarantee
  const priceGuarantee = localOffer.priceGuarantee || {
    frontendPrice: (localOffer.briefing?.price || '27,90').replace(/[^0-9,.]/g, '') || '27,90',
    justification: `O preço de entrada para ${localOffer.title} funciona como oferta tripwire de baixo atrito para atrair alto volume de compradores e alimentar a esteira de produtos.`
  };

  // Order Bumps
  const orderBumps = localOffer.orderBumpsList || [
    {
      id: 'ob-1',
      title: localOffer.orderBump?.title || `Checklist & Planilha de Apoio Exclusiva para ${localOffer.title}`,
      price: 9.9,
      takeRate: 35,
      impact: 3.46
    }
  ];

  // Upsells
  const upsells = localOffer.upsellsList || [
    {
      id: 'up-1',
      title: localOffer.upsell?.title || `Upgrade Master VIP: Acervo Completo com Atualizações`,
      description: localOffer.upsell?.description || `Receba o dobro de modelos e acesso a todas as futuras atualizações sem custo adicional.`,
      price: 47.0,
      takeRate: 35,
      impact: 16.45
    }
  ];

  // Calculated projected average ticket
  const frontendNum = parseFloat(priceGuarantee.frontendPrice.replace(',', '.')) || 27.9;
  const bumpsImpactTotal = orderBumps.reduce((acc, cur) => acc + (cur.impact || (cur.price * cur.takeRate / 100)), 0);
  const upsellsImpactTotal = upsells.reduce((acc, cur) => acc + (cur.impact || (cur.price * cur.takeRate / 100)), 0);
  const ticketProjetado = frontendNum + bumpsImpactTotal + upsellsImpactTotal;
  const ticketBoostPercent = Math.round(((ticketProjetado - frontendNum) / frontendNum) * 100);

  // Copy overview matching the offer
  const copyData = localOffer.copyOverview || {
    headline: `Descubra Como Obter Resultados Concretos Com ${localOffer.title}`,
    subheadline: localOffer.promise || `A metodologia prática e comprovada para alcançar resultados rápidos sem complicações.`,
    ctaText: `Quero Acesso Imediato Agora Por ${localOffer.briefing?.price || 'R$ 27,90'}!`,
    benefits: localOffer.benefits && localOffer.benefits.length > 0 ? localOffer.benefits : [
      `Acesso imediato e vitalício a todo o conteúdo de ${localOffer.title}.`,
      'Material 100% digital pronto para colocar em prática hoje mesmo.',
      'Economize dezenas de horas com modelos testados e aprovados.',
      'Garantia incondicional de 7 dias com risco absolutamente zero.'
    ],
    painAgitation: `Você se esforça e dedica energia, mas muitas vezes fica travado sem um método direto e organizado para seguir.`,
    solutionPresentation: `${localOffer.title} foi desenvolvido exatamente para resolver isso: entrega o caminho mais curto, seguro e direto ao ponto.`,
    socialProofNote: `Depoimentos reais de alunos e clientes satisfeitos comprovando a eficácia do método.`,
    sampleTestimonials: [
      {
        author: 'Mariana S.',
        role: 'Cliente Verificada',
        quote: 'Material direto ao ponto e sem enrolação. Consegui aplicar no mesmo dia e os resultados foram incríveis!'
      }
    ]
  };

  return (
    <div className={`flex-1 flex flex-col h-full min-w-0 overflow-hidden select-none transition-colors ${
      isBlack ? 'bg-[#090A0F] text-[#E2E4E9]' : 'bg-[#F8F9FA] text-[#111827]'
    }`}>
      {/* 1. Header Bar with Offer Title and Sub-Tabs (Image 5) */}
      <div className={`h-16 px-6 border-b flex items-center justify-between shrink-0 z-20 transition-colors ${
        isBlack ? 'bg-[#0C0E17] border-[#1C2030]' : 'bg-white border-[#E5E7EB]'
      }`}>
        {/* Left: Back Arrow and Title Dropdown */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToList}
            title="Voltar para a lista de ofertas"
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors border ${
              isBlack 
                ? 'hover:bg-[#161928] text-neutral-400 hover:text-white border-[#22283E]' 
                : 'hover:bg-neutral-100 text-neutral-600 hover:text-black border-neutral-200'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center gap-2 text-left group"
            >
              <span className={`font-bold text-sm max-w-[280px] truncate ${
                isBlack ? 'text-white' : 'text-neutral-900'
              }`}>
                {localOffer.title}
              </span>

              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                isBlack ? 'bg-[#181B2A] text-neutral-300 border-[#2A3048]' : 'bg-[#F4F5F7] text-neutral-600 border-[#E5E7EB]'
              }`}>
                <span>{localOffer.status || 'Aprovada'}</span>
                <ChevronDown className="w-2.5 h-2.5 text-neutral-400" />
              </span>
            </button>

            {showStatusDropdown && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowStatusDropdown(false)} />
                <div className={`absolute left-0 mt-2 w-44 rounded-2xl border p-1.5 shadow-xl z-40 ${
                  isBlack ? 'bg-[#141624] border-[#252B42]' : 'bg-white border-[#E5E7EB]'
                }`}>
                  {(['Aprovada', 'Em produção', 'Validado', 'Escalando', 'Pausado', 'Rascunho'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => {
                        handleChange('status', st);
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                        localOffer.status === st
                          ? 'bg-neutral-100 text-neutral-900 font-bold'
                          : 'text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <span>{st}</span>
                      {localOffer.status === st && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center: Sub-Tabs matching Image 5 */}
        <div className={`hidden md:flex items-center gap-1 p-1 rounded-full border transition-colors ${
          isBlack ? 'bg-[#12141F] border-[#22273D]' : 'bg-[#ECEEF2] border-[#E2E4E9]'
        }`}>
          <button
            onClick={() => setSubTab('visao_geral')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              subTab === 'visao_geral'
                ? isBlack
                  ? 'bg-[#1E2336] text-white shadow-xs font-bold border border-[#2E3654]'
                  : 'bg-white text-neutral-900 shadow-xs font-bold'
                : isBlack ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Visão geral</span>
          </button>

          <button
            onClick={() => setSubTab('copy')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              subTab === 'copy'
                ? isBlack
                  ? 'bg-[#1E2336] text-white shadow-xs font-bold border border-[#2E3654]'
                  : 'bg-white text-neutral-900 shadow-xs font-bold'
                : isBlack ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>Copy</span>
          </button>

          <button
            onClick={() => setSubTab('previa')}
            className={`p-1.5 rounded-full transition-all ${
              subTab === 'previa'
                ? isBlack ? 'bg-[#1E2336] text-white' : 'bg-white text-neutral-900 shadow-xs'
                : isBlack ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'
            }`}
            title="Prévia Rápida"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setSubTab('pagina')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'pagina'
                ? isBlack
                  ? 'bg-[#1E2336] text-white shadow-xs font-bold border border-[#2E3654]'
                  : 'bg-white text-neutral-900 shadow-xs font-bold'
                : isBlack ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'
            }`}
            title="Página de vendas da oferta"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Página</span>
          </button>

          <button
            onClick={() => setSubTab('entregaveis')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'entregaveis'
                ? isBlack
                  ? 'bg-[#1E2336] text-white shadow-xs font-bold border border-[#2E3654]'
                  : 'bg-white text-neutral-900 shadow-xs font-bold'
                : isBlack ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'
            }`}
            title="Entregáveis em PDF da oferta"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Entregáveis</span>
          </button>
        </div>

        {/* Right Action: Gerar nova versão / Grátis */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isBlack
                ? 'border-[#262B42] hover:bg-[#161826] text-neutral-300'
                : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'
            }`}
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Salvo!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-neutral-400" />
                <span>Salvar</span>
              </>
            )}
          </button>

          <button
            onClick={handleGenerateNewVersion}
            disabled={isGeneratingVersion}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
              isBlack
                ? 'bg-white hover:bg-neutral-200 text-black'
                : 'bg-black hover:bg-neutral-800 text-white'
            }`}
          >
            <span>Gerar nova versão</span>
            <span className="text-[10px] font-normal opacity-70">Grátis</span>
          </button>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
        {/* SUBTAB: VISÃO GERAL (Images 5 & 6) */}
        {subTab === 'visao_geral' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column (2 cols): Avatar, Mecanismo, Ângulo, O que compõe o kit */}
              <div className="lg:col-span-2 space-y-6">
                {/* 1. Avatar do comprador */}
                <div className={`p-6 rounded-3xl border shadow-xs ${
                  isBlack ? 'bg-[#10121C] border-[#1E2336]' : 'bg-white border-[#E5E7EB]'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-neutral-500" />
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                      Avatar do comprador
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-500 mb-5">
                    Quem é, o que sente e o que dispara a decisão de compra.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-[10px] uppercase text-neutral-400 tracking-wider block mb-1">
                        FAIXA DE IDADE
                      </span>
                      <input
                        type="text"
                        value={avatar.ageRange}
                        onChange={(e) => updateAvatarField('ageRange', e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs font-medium outline-none ${
                          isBlack ? 'bg-[#151826] border-[#22283E] text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                        }`}
                      />
                    </div>

                    <div>
                      <span className="font-bold text-[10px] uppercase text-neutral-400 tracking-wider block mb-1">
                        PERFIL DE RENDA
                      </span>
                      <input
                        type="text"
                        value={avatar.incomeProfile}
                        onChange={(e) => updateAvatarField('incomeProfile', e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs font-medium outline-none ${
                          isBlack ? 'bg-[#151826] border-[#22283E] text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                        }`}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <span className="font-bold text-[10px] uppercase text-neutral-400 tracking-wider block mb-1">
                        COMPORTAMENTO
                      </span>
                      <textarea
                        rows={3}
                        value={avatar.behavior}
                        onChange={(e) => updateAvatarField('behavior', e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs leading-relaxed outline-none ${
                          isBlack ? 'bg-[#151826] border-[#22283E] text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                        }`}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <span className="font-bold text-[10px] uppercase text-neutral-400 tracking-wider block mb-1">
                        GATILHO DE COMPRA
                      </span>
                      <textarea
                        rows={2}
                        value={avatar.purchaseTrigger}
                        onChange={(e) => updateAvatarField('purchaseTrigger', e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs leading-relaxed outline-none ${
                          isBlack ? 'bg-[#151826] border-[#22283E] text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                        }`}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <span className="font-bold text-[10px] uppercase text-neutral-400 tracking-wider block mb-1">
                        MAIOR DOR
                      </span>
                      <textarea
                        rows={2}
                        value={avatar.mainPain}
                        onChange={(e) => updateAvatarField('mainPain', e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs leading-relaxed outline-none ${
                          isBlack ? 'bg-[#151826] border-[#22283E] text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                        }`}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <span className="font-bold text-[10px] uppercase text-neutral-400 tracking-wider block mb-1">
                        MAIOR DESEJO
                      </span>
                      <textarea
                        rows={2}
                        value={avatar.mainDesire}
                        onChange={(e) => updateAvatarField('mainDesire', e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs leading-relaxed outline-none ${
                          isBlack ? 'bg-[#151826] border-[#22283E] text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Ângulo, crença e prova */}
                <div className={`p-6 rounded-3xl border shadow-xs ${
                  isBlack ? 'bg-[#10121C] border-[#1E2336]' : 'bg-white border-[#E5E7EB]'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-neutral-500" />
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                      Ângulo, crença e prova
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-500 mb-4">
                    O jeito específico de posicionar essa oferta. Nicho é a área, ângulo é o recorte dentro dela.
                  </p>

                  <div>
                    <span className="font-bold text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1.5">
                      Ângulo (o recorte de posicionamento, não o nicho)
                    </span>
                    <textarea
                      rows={3}
                      value={localOffer.promise}
                      onChange={(e) => handleChange('promise', e.target.value)}
                      className={`w-full p-3 rounded-xl border text-xs leading-relaxed outline-none ${
                        isBlack ? 'bg-[#151826] border-[#22283E] text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                      }`}
                    />
                  </div>
                </div>

                {/* 3. O que compõe o kit (Image 6) */}
                <div className={`p-6 rounded-3xl border shadow-xs ${
                  isBlack ? 'bg-[#10121C] border-[#1E2336]' : 'bg-white border-[#E5E7EB]'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-neutral-500" />
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                      O que compõe o kit
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-500 mb-4">
                    Itens que serão produzidos na aba Entregáveis.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="font-bold text-[10px] uppercase text-neutral-400 tracking-wider block mb-1">
                        Formato do entregável
                      </span>
                      <select
                        value={kitComp.format}
                        onChange={(e) => updateKitComp('format', e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs font-medium outline-none ${
                          isBlack ? 'bg-[#151826] border-[#22283E] text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                        }`}
                      >
                        <option value="Pack de modelos/templates">Pack de modelos/templates</option>
                        <option value="E-book / Guia em PDF">E-book / Guia em PDF</option>
                        <option value="Planilhas e Ferramentas">Planilhas e Ferramentas</option>
                        <option value="Curso Rápido em Vídeo">Curso Rápido em Vídeo</option>
                      </select>
                      <span className="text-[10px] text-neutral-400 mt-1 block">
                        Escolha o que faz a pessoa USAR o quanto antes (não é PDF por padrão).
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-[10px] uppercase text-neutral-400 tracking-wider block mb-1">
                        🔗 Referência/fonte (se modelada)
                      </span>
                      <input
                        type="text"
                        value={kitComp.referenceUrl || ''}
                        onChange={(e) => updateKitComp('referenceUrl', e.target.value)}
                        placeholder="https://exemplo.com"
                        className={`w-full p-2.5 rounded-xl border text-xs font-medium outline-none ${
                          isBlack ? 'bg-[#151826] border-[#22283E] text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Bullets */}
                  <div className="space-y-2 pt-2">
                    {kitComp.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const newItems = [...kitComp.items];
                            newItems[idx] = e.target.value;
                            updateKitComp('items', newItems);
                          }}
                          className={`flex-1 p-2 rounded-xl border text-xs outline-none ${
                            isBlack ? 'bg-[#151826] border-[#22283E] text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                          }`}
                        />
                        <button
                          onClick={() => {
                            const newItems = kitComp.items.filter((_, i) => i !== idx);
                            updateKitComp('items', newItems);
                          }}
                          className="text-neutral-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => updateKitComp('items', [...kitComp.items, 'Novo item do kit digital'])}
                      className="text-xs font-bold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white flex items-center gap-1.5 mt-2 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar item ao kit</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column (1 col): Mercado, Mecanismo único, Preço e Garantia, Order Bump, Upsell, Ticket Médio */}
              <div className="space-y-6">
                {/* 1. Mercado */}
                <div className={`p-5 rounded-3xl border shadow-xs ${
                  isBlack ? 'bg-[#10121C] border-[#1E2336]' : 'bg-white border-[#E5E7EB]'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-neutral-500" />
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                      Mercado
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-500 mb-3">
                    Pra quem essa oferta é vendida. Decide o idioma e a moeda de tudo que o cliente vê.
                  </p>

                  <div className="space-y-3">
                    <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                      isBlack ? 'bg-[#151826] border-[#22283E] text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                    }`}>
                      <CountryFlag country={localOffer.targetMarket || 'Brasil'} />
                      <span>{localOffer.targetMarket || 'Brasil • Português, R$'}</span>
                    </div>

                    <button
                      onClick={() => alert('Para mudar de mercado, você pode duplicar ou ajustar a moeda.')}
                      className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        isBlack ? 'border-[#262C42] hover:bg-[#181B2A] text-neutral-300' : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Levar pra outro mercado</span>
                    </button>
                  </div>
                </div>

                {/* 2. Mecanismo único */}
                <div className={`p-5 rounded-3xl border shadow-xs ${
                  isBlack ? 'bg-[#10121C] border-[#1E2336]' : 'bg-white border-[#E5E7EB]'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="w-4 h-4 text-neutral-500" />
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                      Mecanismo único
                    </h3>
                  </div>
                  <textarea
                    rows={4}
                    value={localOffer.mechanism}
                    onChange={(e) => handleChange('mechanism', e.target.value)}
                    className={`w-full p-3 rounded-xl border text-xs leading-relaxed outline-none mt-2 ${
                      isBlack ? 'bg-[#151826] border-[#22283E] text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                    }`}
                  />
                </div>

                {/* 3. Preço e garantia */}
                <div className={`p-5 rounded-3xl border shadow-xs ${
                  isBlack ? 'bg-[#10121C] border-[#1E2336]' : 'bg-white border-[#E5E7EB]'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingBag className="w-4 h-4 text-neutral-500" />
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                      Preço e garantia
                    </h3>
                  </div>

                  <div className="space-y-3 mt-3">
                    <div>
                      <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                        Preço de front-end (R$)
                      </span>
                      <input
                        type="text"
                        value={priceGuarantee.frontendPrice}
                        onChange={(e) => setLocalOffer(prev => ({
                          ...prev,
                          priceGuarantee: {
                            ...(prev.priceGuarantee || priceGuarantee),
                            frontendPrice: e.target.value
                          }
                        }))}
                        className={`w-full p-2.5 rounded-xl border text-xs font-extrabold outline-none ${
                          isBlack ? 'bg-[#151826] border-[#22283E] text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                        }`}
                      />
                      <span className="text-[10px] text-neutral-400 mt-1 block">
                        Normalmente só empata com o custo do anúncio. O lucro real está no bloco abaixo.
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider block mb-1">
                        JUSTIFICATIVA DO PREÇO
                      </span>
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {priceGuarantee.justification}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Order Bump & Upsell (Image 6) */}
                <div className={`p-5 rounded-3xl border shadow-xs space-y-4 ${
                  isBlack ? 'bg-[#10121C] border-[#1E2336]' : 'bg-white border-[#E5E7EB]'
                }`}>
                  {/* Order Bump */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-neutral-900 dark:text-white">
                        Order bump
                      </span>
                    </div>

                    {orderBumps.map((ob, idx) => (
                      <div key={ob.id || idx} className={`p-3 rounded-2xl border mb-2 text-xs space-y-2 ${
                        isBlack ? 'bg-[#151826] border-[#22283E]' : 'bg-neutral-50 border-neutral-200'
                      }`}>
                        <p className="text-[11px] text-neutral-700 dark:text-neutral-300 leading-relaxed">
                          {ob.title}
                        </p>
                        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-neutral-200 dark:border-neutral-800 text-[10px]">
                          <div>
                            <span className="text-neutral-400 block font-medium">PREÇO</span>
                            <span className="font-bold">R$ {ob.price}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block font-medium">% QUE PEGAM</span>
                            <span className="font-bold">{ob.takeRate}%</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block font-medium">Soma ticket</span>
                            <span className="font-bold text-emerald-500">+ R$ {ob.impact.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => alert('Order bump configurado!')}
                      className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white flex items-center gap-1 mt-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Adicionar order bump</span>
                    </button>
                  </div>

                  {/* Upsell */}
                  <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-neutral-900 dark:text-white">
                        Upsell <span className="font-normal text-neutral-400 text-[10px]">(Pós-compra - até 1)</span>
                      </span>
                    </div>

                    {upsells.map((up, idx) => (
                      <div key={up.id || idx} className={`p-3 rounded-2xl border mb-2 text-xs space-y-2 ${
                        isBlack ? 'bg-[#151826] border-[#22283E]' : 'bg-neutral-50 border-neutral-200'
                      }`}>
                        <span className="font-bold text-xs block text-neutral-900 dark:text-white">
                          {up.title}
                        </span>
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          {up.description}
                        </p>
                        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-neutral-200 dark:border-neutral-800 text-[10px]">
                          <div>
                            <span className="text-neutral-400 block font-medium">PREÇO</span>
                            <span className="font-bold">R$ {up.price}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block font-medium">% QUE COMPRAM</span>
                            <span className="font-bold">{up.takeRate}%</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block font-medium">Soma ticket</span>
                            <span className="font-bold text-emerald-500">+ R$ {up.impact.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Projected Ticket Summary Calculator */}
                  <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                    isBlack ? 'bg-[#181B2A] border-[#2A3048]' : 'bg-neutral-100/80 border-neutral-300'
                  }`}>
                    <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                      <span>Front-end</span>
                      <span className="font-bold text-neutral-800 dark:text-neutral-200">
                        R$ {frontendNum.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                      <span>Order bumps</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        + R$ {bumpsImpactTotal.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                      <span>Upsell</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        + R$ {upsellsImpactTotal.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-neutral-300 dark:border-neutral-700 flex items-center justify-between font-bold text-sm">
                      <span className="text-neutral-900 dark:text-white">Ticket médio projetado</span>
                      <span className="text-neutral-900 dark:text-white font-extrabold font-display">
                        R$ {ticketProjetado.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-500 font-semibold block text-right">
                      +{ticketBoostPercent}% sobre o front-end sozinho
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB: COPY (Image 7) */}
        {subTab === 'copy' && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Top Toolbar for Copy */}
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-semibold text-neutral-500">
                Copywriting estratégico da oferta (Headline, promessa, quebra de objeções e depoimentos)
              </span>
              <button
                onClick={handleRegenerateCopy}
                disabled={isRegeneratingCopy}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                  isBlack ? 'bg-white hover:bg-neutral-200 text-black' : 'bg-black hover:bg-neutral-800 text-white'
                }`}
              >
                {isRegeneratingCopy ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Otimizando com Gemini...</span>
                  </>
                ) : (
                  <>
                    <span>Otimizar texto</span>
                  </>
                )}
              </button>
            </div>

            {/* Big Headline Banner */}
            <div className={`p-8 rounded-3xl border shadow-xs space-y-4 ${
              isBlack ? 'bg-[#10121C] border-[#1E2336]' : 'bg-white border-[#E5E7EB]'
            }`}>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-center font-display text-neutral-900 dark:text-white">
                {copyData.headline}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center max-w-3xl mx-auto leading-relaxed">
                {copyData.subheadline}
              </p>

              {/* Big Black CTA Button */}
              <div className="pt-2 text-center">
                <button className="w-full py-4 px-6 rounded-2xl bg-black text-white text-xs md:text-sm font-bold shadow-xl hover:opacity-95 transition-opacity leading-relaxed max-w-4xl mx-auto cursor-pointer">
                  {copyData.ctaText}
                </button>
              </div>
            </div>

            {/* Two Columns Grid matching Image 7 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Bullets de benefício, Agitação da dor, Apresentação da solução */}
              <div className="space-y-6">
                {/* Bullets de benefício */}
                <div className={`p-6 rounded-3xl border shadow-xs space-y-3 ${
                  isBlack ? 'bg-[#10121C] border-[#1E2336]' : 'bg-white border-[#E5E7EB]'
                }`}>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                    Bullets de benefício
                  </h3>
                  <ul className="space-y-2.5 text-xs text-neutral-700 dark:text-neutral-300">
                    {copyData.benefits.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Agitação da dor */}
                <div className={`p-6 rounded-3xl border shadow-xs space-y-2 ${
                  isBlack ? 'bg-[#10121C] border-[#1E2336]' : 'bg-white border-[#E5E7EB]'
                }`}>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                    Agitação da dor
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {copyData.painAgitation}
                  </p>
                </div>

                {/* Apresentação da solução */}
                <div className={`p-6 rounded-3xl border shadow-xs space-y-2 ${
                  isBlack ? 'bg-[#10121C] border-[#1E2336]' : 'bg-white border-[#E5E7EB]'
                }`}>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                    Apresentação da solução
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {copyData.solutionPresentation}
                  </p>
                </div>
              </div>

              {/* Right Column: Onde encaixar prova social & Depoimentos-modelo */}
              <div className="space-y-6">
                {/* Onde encaixar prova social */}
                <div className={`p-6 rounded-3xl border shadow-xs space-y-2 ${
                  isBlack ? 'bg-[#10121C] border-[#1E2336]' : 'bg-white border-[#E5E7EB]'
                }`}>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                    Onde encaixar prova social
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {copyData.socialProofNote}
                  </p>
                </div>

                {/* Depoimentos-modelo */}
                <div className={`p-6 rounded-3xl border shadow-xs space-y-4 ${
                  isBlack ? 'bg-[#10121C] border-[#1E2336]' : 'bg-white border-[#E5E7EB]'
                }`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                      Depoimentos-modelo
                    </h3>
                    <span className="text-[10px] text-neutral-400 font-medium">
                      Fictícios: troque pelos reais
                    </span>
                  </div>

                  <div className="space-y-3">
                    {copyData.sampleTestimonials.map((t, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border text-xs space-y-2 ${
                          isBlack ? 'bg-[#151826] border-[#22283E]' : 'bg-neutral-50 border-neutral-200'
                        }`}
                      >
                        <p className="italic text-neutral-700 dark:text-neutral-300 leading-relaxed">
                          "{t.quote}"
                        </p>
                        <span className="text-[11px] font-bold text-neutral-900 dark:text-white block text-right">
                          — {t.author}, {t.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB: PRÉVIA */}
        {subTab === 'previa' && (
          <div className="max-w-3xl mx-auto p-8 rounded-3xl border shadow-xs text-center space-y-5 bg-white dark:bg-[#10121C] dark:border-[#1E2336]">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
              PRÉVIA DO PITCH DA OFERTA
            </span>
            <h2 className="text-2xl font-bold font-display text-neutral-900 dark:text-white">
              {localOffer.title}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {localOffer.promise}
            </p>
            <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-[#181B28] inline-block font-mono text-sm font-bold">
              Front-end: R$ {priceGuarantee.frontendPrice} • Ticket projetado: R$ {ticketProjetado.toFixed(2)}
            </div>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => onNavigateToPage?.()}
                className="px-5 py-2.5 rounded-full bg-black text-white text-xs font-bold shadow-md hover:bg-neutral-800 transition-colors"
              >
                Abrir Construtor de Página
              </button>
            </div>
          </div>
        )}

        {/* SUBTAB: CHECKOUT */}
        {subTab === 'checkout' && (
          <div className="max-w-2xl mx-auto p-8 rounded-3xl border shadow-xs space-y-5 bg-white dark:bg-[#10121C] dark:border-[#1E2336]">
            <h2 className="text-xl font-bold font-display text-neutral-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
              <span>Configuração de Checkout & Links</span>
            </h2>
            <p className="text-xs text-neutral-500">
              Insira o link de checkout da Kiwify, Hotmart, Eduzz ou plataforma de sua preferência.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                  URL de Checkout (Front-end)
                </label>
                <input
                  type="text"
                  defaultValue="https://pay.kiwify.com.br/passa-ou-repassa"
                  className="w-full p-3 rounded-xl border border-neutral-200 dark:border-[#22283E] dark:bg-[#151826] dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                  URL da Página de Obrigado / Upsell
                </label>
                <input
                  type="text"
                  defaultValue="https://lowstack.app/obrigado-passa-repassa"
                  className="w-full p-3 rounded-xl border border-neutral-200 dark:border-[#22283E] dark:bg-[#151826] dark:text-white outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => alert('Links de checkout atualizados com sucesso!')}
              className="px-5 py-2.5 rounded-xl bg-black text-white text-xs font-bold shadow-md hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Salvar Links de Checkout
            </button>
          </div>
        )}

        {/* SUBTAB: PÁGINA DE VENDAS DA OFERTA */}
        {subTab === 'pagina' && (
          <div className="w-full h-full min-h-[700px] flex flex-col">
            <PageBuilder
              offer={localOffer}
              page={associatedPage}
              onUpdatePage={onUpdatePage || (() => {})}
              creditsBalance={creditsBalance}
              theme={theme}
            />
          </div>
        )}

        {/* SUBTAB: ENTREGÁVEIS EM PDF DA OFERTA */}
        {subTab === 'entregaveis' && (
          <div className="w-full h-full min-h-[700px] flex flex-col">
            <DeliverableBuilder
              offer={localOffer}
              deliverable={associatedDeliverable}
              onUpdateDeliverable={onUpdateDeliverable || (() => {})}
              creditsBalance={creditsBalance}
              theme={theme}
            />
          </div>
        )}
      </div>
    </div>
  );
};
