/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { OfferEditor } from './components/offers/OfferEditor';
import { PageBuilder } from './components/pages/PageBuilder';
import { PagesSection } from './components/pages/PagesSection';
import { CreativesSection } from './components/creatives/CreativesSection';
import { DeliverableBuilder } from './components/deliverables/DeliverableBuilder';
import { DeliverablesSection } from './components/deliverables/DeliverablesSection';
import { AdMiningLibrary } from './components/mining/AdMiningLibrary';
import { SeasonalCalendar } from './components/seasonality/SeasonalCalendar';
import { MetaAdsAnalytics } from './components/analytics/MetaAdsAnalytics';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { CreditsModal } from './components/credits/CreditsModal';
import { NewOfferModal } from './components/offers/NewOfferModal';
import { OffersGallery } from './components/offers/OffersGallery';
import { LoginPage } from './components/auth/LoginPage';
import { AppState, AppTab, Offer, SalesPage, Deliverable, MinedAd, AdCreative, OfferBriefing, SeasonalEventContext } from './types';
import { getDefaultDesignForOffer } from './constants/designs';
import { api } from './services/api';
import { RotateCw, AlertCircle, Check } from 'lucide-react';

export default function App() {
  const { currentUser, loading: authLoading } = useAuth();
  const [appState, setAppState] = useState<AppState | null>(null);
  const [currentTab, setCurrentTab] = useState<AppTab>('offers');
  const [offersViewMode, setOffersViewMode] = useState<'gallery' | 'editor'>('gallery');
  const [activeOfferId, setActiveOfferId] = useState<string>('passa-ou-repassa-biblico');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
  const [isNewOfferModalOpen, setIsNewOfferModalOpen] = useState(false);
  const [newOfferInitialBriefing, setNewOfferInitialBriefing] = useState<Partial<OfferBriefing> | undefined>(undefined);
  const [seasonalGenerationEvent, setSeasonalGenerationEvent] = useState<SeasonalEventContext | null>(null);

  // Black and White Background Theme State
  const [theme, setTheme] = useState<'black' | 'white'>(() => {
    const saved = localStorage.getItem('lowstack_theme');
    return saved === 'black' || saved === 'white' ? saved : 'white';
  });

  useEffect(() => {
    if (theme === 'black') {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-[#090A0F] text-[#E2E4E9] antialiased selection:bg-white selection:text-black overflow-hidden';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-[#F8F9FA] text-[#111827] antialiased selection:bg-black selection:text-white overflow-hidden';
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'black' ? 'white' : 'black';
      localStorage.setItem('lowstack_theme', next);
      return next;
    });
  };

  // Fetch initial store from server
  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getStore();
        data.creatives = data.creatives || [];
        setAppState(data);
        if (data.offers.length > 0) {
          setActiveOfferId(data.offers[0].id);
        }
      } catch (err: any) {
        console.error('Failed to load store:', err);
        setErrorMsg('Erro ao conectar ao servidor. Recarregue a página.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (authLoading || isLoading || !appState) {
    return (
      <div className="min-h-screen bg-[#090A0F] flex flex-col items-center justify-center text-white space-y-3 font-sans">
        <div className="w-10 h-10 rounded-xl bg-[#151722] border border-[#2A2E44] flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 3h5v12h11v5H4V3z" />
          </svg>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <RotateCw className="w-3.5 h-3.5 animate-spin text-white" />
          <span>Verificando credenciais e carregando Veltor Workspace...</span>
        </div>
      </div>
    );
  }

  // PROTEÇÃO TOTAL DE ROTAS: Se não estiver autenticado, exibe a página de login
  if (!currentUser) {
    return <LoginPage onSuccess={() => setCurrentTab('dashboard')} />;
  }

  const activeOffer = appState.offers.find(o => o.id === activeOfferId) || appState.offers[0] || null;

  // Active associated page (or default page for active offer)
  const activePage: SalesPage = appState.pages.find(p => p.offerId === activeOffer?.id) || {
    id: `page-${activeOffer?.id || 'default'}`,
    offerId: activeOffer?.id || 'default',
    title: `Página de Vendas - ${activeOffer?.title || 'Novo Produto'}`,
    slug: activeOffer?.id || 'produto',
    published: true,
    lastUpdated: new Date().toISOString(),
    theme: 'warm-cream',
    checkoutUrl: 'https://pay.kiwify.com.br/checkout',
    blocks: [
      {
        id: 'hero',
        type: 'hero',
        badge: 'Lançamento 2026',
        headline: activeOffer?.promise || 'Promessa da Página de Vendas',
        subheadline: activeOffer?.mechanism || 'Mecanismo Único',
        ctaText: `Quero Acesso Imediato Por ${activeOffer?.briefing.price || 'R$ 37'}`,
        heroImage: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1200&q=80'
      }
    ]
  };

  // Active associated deliverable
  const activeDeliverable: Deliverable = appState.deliverables.find(d => d.offerId === activeOffer?.id) || {
    id: `del-${activeOffer?.id || 'default'}`,
    offerId: activeOffer?.id || 'default',
    title: `${activeOffer?.title || 'Produto'} - Guia e Fichas Técnicas`,
    format: 'PDF',
    totalPages: 32,
    status: 'draft',
    chapters: [
      {
        id: 'cap-1',
        title: 'Capítulo 1: Fundamentos do Método',
        content: `Bem-vindo ao ${activeOffer?.title}. Neste guia passo a passo, você aprenderá exatamente como colocar em prática o ${activeOffer?.mechanism}.`
      }
    ]
  };

  // Handler: Update Offer
  const handleUpdateOffer = async (updated: Offer) => {
    setAppState(prev => {
      if (!prev) return prev;
      const idx = prev.offers.findIndex(o => o.id === updated.id);
      const newOffers = [...prev.offers];
      if (idx >= 0) newOffers[idx] = updated;
      else newOffers.unshift(updated);
      return { ...prev, offers: newOffers };
    });
    try {
      await api.saveOffer(updated);
    } catch (e) {
      console.error('Failed to persist offer:', e);
    }
  };

  // Handler: Update Page
  const handleUpdatePage = async (updated: SalesPage) => {
    setAppState(prev => {
      if (!prev) return prev;
      const idx = prev.pages.findIndex(p => p.id === updated.id || p.offerId === updated.offerId);
      const newPages = [...prev.pages];
      if (idx >= 0) newPages[idx] = updated;
      else newPages.unshift(updated);
      return { ...prev, pages: newPages };
    });
    try {
      await api.savePage(updated);
    } catch (e) {
      console.error('Failed to persist page:', e);
    }
  };

  // Handler: Update Deliverable
  const handleUpdateDeliverable = async (del: Deliverable) => {
    setAppState(prev => {
      if (!prev) return prev;
      const idx = prev.deliverables.findIndex(d => 
        d.id === del.id || (del.offerId && del.offerId !== 'standalone' && d.offerId === del.offerId)
      );
      const newDels = [...prev.deliverables];
      if (idx >= 0) newDels[idx] = del;
      else newDels.unshift(del);
      return { ...prev, deliverables: newDels };
    });
    try {
      await api.saveDeliverable(del);
    } catch (e) {
      console.error('Failed to persist deliverable:', e);
    }
  };

  const handleAddCreative = async (creative: AdCreative) => {
    setAppState(prev => prev ? ({ ...prev, creatives: [creative, ...prev.creatives] }) : prev);
    try { await api.saveCreative(creative); } catch (error) { console.error('Failed to persist creative:', error); }
  };

  const handleDeleteCreative = async (id: string) => {
    setAppState(prev => prev ? ({ ...prev, creatives: prev.creatives.filter(creative => creative.id !== id) }) : prev);
    try { await api.deleteCreative(id); } catch (error) { console.error('Failed to delete creative:', error); }
  };

  // Handler: Delete Deliverable
  const handleDeleteDeliverable = async (id: string) => {
    setAppState(prev => prev ? ({ ...prev, deliverables: prev.deliverables.filter(d => d.id !== id) }) : prev);
    try {
      await api.deleteDeliverable(id);
    } catch (e) {
      console.error('Failed to delete deliverable:', e);
    }
  };

  // Handler: Add Mined Ad
  const handleAddMinedAd = async (ad: MinedAd) => {
    setAppState(prev => prev ? ({ ...prev, minedAds: [ad, ...prev.minedAds] }) : prev);
    try {
      await api.saveMinedAd(ad);
    } catch (e) {
      console.error('Failed to persist mined ad:', e);
    }
  };

  // Handler: Delete Mined Ad
  const handleDeleteMinedAd = async (id: string) => {
    setAppState(prev => prev ? ({ ...prev, minedAds: prev.minedAds.filter(a => a.id !== id) }) : prev);
    try {
      await api.deleteMinedAd(id);
    } catch (e) {
      console.error('Failed to delete mined ad:', e);
    }
  };

  // Handler: Transform Ad or Seasonality into a New Offer
  const handleCreateOfferFromAd = (ad: MinedAd) => {
    setNewOfferInitialBriefing({
      productName: `Guia Inspirado: ${ad.title}`,
      productType: 'E-book / Guia Prático Passo a Passo',
      targetAudience: `Pessoas interessadas em ${ad.niche}`,
      coreProblem: ad.copy.slice(0, 120),
      price: ad.priceEstimate || 'R$ 37,00',
      regularPrice: 'R$ 97,00',
      niche: ad.niche,
      competitorUrl: ad.sourceUrl
    });
    setIsNewOfferModalOpen(true);
  };

  const handleCreateOfferFromSeasonality = (briefing: Partial<OfferBriefing>, title: string) => {
    setNewOfferInitialBriefing(briefing);
    setIsNewOfferModalOpen(true);
  };

  const handleGenerateSeasonalIdeas = (event: SeasonalEventContext) => {
    setSeasonalGenerationEvent(event);
    setCurrentTab('seasonality');
  };

  // Handler: New Offer Created
  const handleOfferCreated = async (newOffer: Offer) => {
    const dynamicDefaults = getDefaultDesignForOffer(newOffer.niche, newOffer.title);
    const chosenDesign = newOffer.pageDesign || dynamicDefaults.design;
    const chosenTheme = newOffer.pageTheme || (chosenDesign.backgroundColor?.toLowerCase() <= '#303030' ? 'midnight-dark' : dynamicDefaults.theme);

    // 2. Prepare associated sales page with unique AI design and compatible blocks
    const associatedPage: SalesPage = {
      id: `page-${newOffer.id}`,
      offerId: newOffer.id,
      offerTitle: newOffer.title,
      title: `Página de Vendas - ${newOffer.title}`,
      slug: newOffer.id.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      published: true,
      lastUpdated: new Date().toISOString(),
      theme: chosenTheme,
      design: chosenDesign,
      checkoutUrl: 'https://pay.kiwify.com.br/checkout',
      blocks: [
        {
          id: 'hero',
          type: 'hero',
          badge: 'Lançamento 2026',
          headline: newOffer.copyOverview?.headline || newOffer.promise,
          subheadline: newOffer.copyOverview?.subheadline || newOffer.mechanism,
          ctaText: newOffer.copyOverview?.ctaText || `Quero Acesso Imediato Por ${newOffer.briefing.price || 'R$ 27,90'}`,
          chips: ['Acesso Vitalício', 'Entrega Imediata', 'Garantia Blindada de 7 Dias'],
          heroImage: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1200&q=80',
          animation: chosenDesign.animation || 'fade-up'
        },
        {
          id: 'problem',
          type: 'problem',
          title: 'Por que a maioria das pessoas continua travada?',
          description: newOffer.copyOverview?.painAgitation || newOffer.avatar?.mainPain || 'Tentar fazer tudo do zero consome tempo e energia sem garantia de retorno.',
          cards: [
            {
              title: 'Falta de Roteiro Claro',
              description: newOffer.avatar?.mainPain || 'Informações soltas e complexas dificultam a execução diária.'
            },
            {
              title: 'Perda de Horas Preciosas',
              description: 'Gastando tempo na tentativa e erro em vez de usar modelos validados e diretos ao ponto.'
            },
            {
              title: 'Insegurança nos Resultados',
              description: 'Frustração por não saber se está no caminho certo ou se o método realmente funciona.'
            }
          ]
        },
        {
          id: 'mechanism',
          type: 'mechanism',
          title: `Como o ${newOffer.mechanism.split(' ')[0] || 'Método'} Transforma Seus Resultados`,
          description: newOffer.copyOverview?.solutionPresentation || 'Um sistema prático e estruturado para você aplicar com confiança em poucos minutos.',
          steps: [
            {
              step: '1',
              title: 'Acesso Instantâneo',
              text: 'Receba todo o material digital organizado e pronto para usar no seu dispositivo.'
            },
            {
              step: '2',
              title: 'Aplicação Passo a Passo',
              text: 'Siga os modelos, checklists e roteiros desenhados para execução rápida.'
            },
            {
              step: '3',
              title: 'Resultados Visíveis',
              text: 'Alcance seus objetivos com tranquilidade e sem sobrecarga de trabalho.'
            }
          ]
        },
        {
          id: 'items',
          type: 'items',
          title: 'O Que Você Terá em Mãos:',
          items: (newOffer.benefits && newOffer.benefits.length > 0)
            ? newOffer.benefits.map((b, i) => ({
                title: `Item ${i + 1}: ${b}`,
                desc: 'Material 100% digital em alta definição pronto para aplicar imediatamente.',
                tag: 'Incluso no Pacote',
                image: [
                  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
                  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
                  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80'
                ][i % 3]
              }))
            : [
                {
                  title: `${newOffer.title} - Acervo Base`,
                  desc: 'Guia completo com modelos e fichas práticas de aplicação.',
                  tag: 'Conteúdo Principal'
                }
              ]
        },
        {
          id: 'offer',
          type: 'offer',
          title: 'Condição Especial de Lançamento',
          regularPrice: newOffer.briefing?.regularPrice || 'R$ 97,00',
          price: newOffer.briefing?.price || 'R$ 27,90',
          urgency: 'Oferta exclusiva com valor promocional por tempo limitado',
          ctaText: newOffer.copyOverview?.ctaText || `Garantir Meu Acesso Agora`,
          guaranteeText: '7 Dias de Garantia Incondicional: Se não amar, devolvemos 100% do seu dinheiro.'
        },
        {
          id: 'faq',
          type: 'faq',
          title: 'Perguntas Frequentes',
          cards: (newOffer.faqs || []).map(f => ({
            title: f.question,
            description: f.answer
          }))
        },
        {
          id: 'guarantee',
          type: 'guarantee',
          guaranteeText: 'Você tem 7 dias de garantia incondicional para acessar, testar e aprovar. Risco absolutamente zero.'
        },
        {
          id: 'footer',
          type: 'footer',
          description: `${newOffer.title} · Página Oficial de Vendas · Todos os direitos reservados`
        }
      ]
    };

    // 2. Prepare initial deliverable structure with real piece and chapters
    const associatedDeliverable: Deliverable = {
      id: `del-${newOffer.id}`,
      offerId: newOffer.id,
      offerTitle: newOffer.title,
      title: `${newOffer.title} - Acervo Digital`,
      format: 'PDF',
      totalPages: 16,
      status: 'ready',
      chapters: [
        {
          id: 'cap-1',
          title: 'Manual de Aplicação & Visão Geral',
          content: `Guia de execução para ${newOffer.title}. Siga o passo a passo para aplicar o ${newOffer.mechanism}.`
        },
        {
          id: 'cap-2',
          title: 'Passo a Passo de Execução',
          content: `Roteiro prático para colocar o material em uso imediatamente sem complicações.`
        },
        {
          id: 'cap-3',
          title: 'Modelos e Recursos Prontos',
          content: `Acervo de templates, modelos e materiais complementares prontos para imprimir e utilizar.`
        },
        {
          id: 'cap-4',
          title: 'Bônus e Material Complementar',
          content: `Conteúdo extra e checklists de implementação acelerada.`
        }
      ],
      pieces: [
        {
          id: `piece-${newOffer.id}-main`,
          category: 'main',
          title: `${newOffer.title} (Material Principal)`,
          badge: 'Principal',
          pagesCount: 8,
          status: 'ready',
          pages: [
            {
              pageNumber: 1,
              title: newOffer.title,
              subtitle: newOffer.promise,
              content: `Bem-vindo ao ${newOffer.title}. Este material foi preparado para acelerar seus resultados usando o ${newOffer.mechanism}.`
            },
            {
              pageNumber: 2,
              title: 'Instruções Rápidas de Uso',
              content: 'Siga este roteiro em 3 etapas para aproveitar ao máximo todo o conteúdo digital incluso.'
            }
          ]
        },
        {
          id: `piece-${newOffer.id}-bonus`,
          category: 'bonus',
          title: newOffer.bonuses?.[0]?.title || 'Checklist de Implementação Rápida',
          badge: 'Bônus',
          pagesCount: 4,
          status: 'ready',
          pages: [
            {
              pageNumber: 1,
              title: newOffer.bonuses?.[0]?.title || 'Checklist de Apoio',
              content: newOffer.bonuses?.[0]?.description || 'Roteiro prático para aplicação rápida.'
            }
          ]
        }
      ]
    };

    setAppState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        offers: [newOffer, ...prev.offers],
        pages: [associatedPage, ...prev.pages.filter(p => p.offerId !== newOffer.id)],
        deliverables: [associatedDeliverable, ...prev.deliverables.filter(d => d.offerId !== newOffer.id)]
      };
    });

    setActiveOfferId(newOffer.id);
    setOffersViewMode('editor');
    setCurrentTab('offers');
    setToastMessage(newOffer.title);
    setTimeout(() => setToastMessage(null), 5000);

    // Persist in backend in parallel
    api.saveOffer(newOffer).catch(e => console.error('Failed to persist offer:', e));
    api.savePage(associatedPage).catch(e => console.error('Failed to persist sales page:', e));
    api.saveDeliverable(associatedDeliverable).catch(e => console.error('Failed to persist deliverable:', e));
  };

  // Handler: Sync Meta Campaign
  const handleSyncCampaign = (campaignId: string, purchases = 1, spend = 15) => {
    setAppState(prev => {
      if (!prev) return prev;
      const newCamps = prev.campaigns.map(c => {
        if (c.id === campaignId) {
          const updatedPurchases = c.purchases + purchases;
          const updatedSpend = c.spend + spend;
          const updatedRev = updatedPurchases * 37;
          return {
            ...c,
            purchases: updatedPurchases,
            spend: updatedSpend,
            revenue: updatedRev,
            cpa: updatedPurchases > 0 ? Number((updatedSpend / updatedPurchases).toFixed(2)) : 0,
            roas: updatedSpend > 0 ? Number((updatedRev / updatedSpend).toFixed(2)) : 0
          };
        }
        return c;
      });
      return { ...prev, campaigns: newCamps };
    });
  };

  // Dev recharge credits
  const handleAddCreditsBonus = () => {
    setAppState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        credits: {
          balance: prev.credits.balance + 50,
          history: [
            {
              id: `tx-${Date.now()}`,
              date: new Date().toISOString(),
              action: 'Recarga de Teste (+50 créditos)',
              amount: 50
            },
            ...prev.credits.history
          ]
        }
      };
    });
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans selection:bg-white selection:text-black transition-colors ${
      theme === 'black' ? 'bg-[#090A0F] text-[#E2E4E9]' : 'bg-[#F8F9FA] text-[#111827]'
    }`}>
      {/* 1. Left Fixed Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'offers') {
            setOffersViewMode('gallery');
          }
          setCurrentTab(tab);
        }}
        creditsBalance={appState.credits.balance}
        onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* 2. Main Content View Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-transparent">
        {/* Top Header with Active Offer & Module Switchers (Only on global tabs) */}
        {currentTab !== 'seasonality' && currentTab !== 'offers' && currentTab !== 'pages' && currentTab !== 'creatives' && currentTab !== 'deliverables' && currentTab !== 'mining' && (
          <Header
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            activeOffer={activeOffer}
            offers={appState.offers}
            onSelectOffer={(o) => setActiveOfferId(o.id)}
            onBackToDashboard={() => setCurrentTab('dashboard')}
            onNewOffer={() => {
              setNewOfferInitialBriefing(undefined);
              setIsNewOfferModalOpen(true);
            }}
            creditsBalance={appState.credits.balance}
            onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
            theme={theme}
          />
        )}

        {/* Dynamic Main Workspace Tabs */}
        <main className="flex-1 flex min-h-0 overflow-hidden relative bg-transparent">
          {currentTab === 'dashboard' && (
            <DashboardOverview
              appState={appState}
              onSelectOffer={(o) => {
                setActiveOfferId(o.id);
                setOffersViewMode('editor');
                setCurrentTab('offers');
              }}
              onSelectTab={setCurrentTab}
              onGenerateSeasonalIdeas={handleGenerateSeasonalIdeas}
              theme={theme}
            />
          )}

          {currentTab === 'offers' && (
            offersViewMode === 'gallery' ? (
              <OffersGallery
                offers={appState.offers}
                onSelectOffer={(o) => {
                  setActiveOfferId(o.id);
                  setOffersViewMode('editor');
                }}
                onNewOffer={() => {
                  setNewOfferInitialBriefing(undefined);
                  setIsNewOfferModalOpen(true);
                }}
                theme={theme}
              />
            ) : activeOffer ? (
              <OfferEditor
                offer={activeOffer}
                onUpdateOffer={handleUpdateOffer}
                onBackToList={() => setOffersViewMode('gallery')}
                page={appState.pages.find(p => p.offerId === activeOffer.id)}
                onUpdatePage={handleUpdatePage}
                deliverable={appState.deliverables.find(d => d.offerId === activeOffer.id)}
                onUpdateDeliverable={handleUpdateDeliverable}
                campaigns={appState.campaigns}
                onSyncCampaign={handleSyncCampaign}
                creditsBalance={appState.credits.balance}
                theme={theme}
              />
            ) : null
          )}

          {/* Dedicated Individual Pages Section */}
          {currentTab === 'pages' && (
            <PagesSection
              pages={appState.pages}
              offers={appState.offers}
              onUpdatePage={handleUpdatePage}
              creditsBalance={appState.credits.balance}
              theme={theme}
            />
          )}

          {currentTab === 'creatives' && (
            <CreativesSection
              creatives={appState.creatives}
              offers={appState.offers}
              onAddCreative={handleAddCreative}
              onDeleteCreative={handleDeleteCreative}
              creditsBalance={appState.credits.balance}
              theme={theme}
            />
          )}

          {/* Dedicated Individual Deliverables Section */}
          {currentTab === 'deliverables' && (
            <DeliverablesSection
              deliverables={appState.deliverables}
              offers={appState.offers}
              onUpdateDeliverable={handleUpdateDeliverable}
              onDeleteDeliverable={handleDeleteDeliverable}
              creditsBalance={appState.credits.balance}
              theme={theme}
            />
          )}

          {currentTab === 'mining' && (
            <AdMiningLibrary
              onCreateOfferFromAd={handleCreateOfferFromAd}
              theme={theme}
            />
          )}

          {currentTab === 'seasonality' && (
            <SeasonalCalendar
              onCreateOfferFromSeasonality={handleCreateOfferFromSeasonality}
              initialEvent={seasonalGenerationEvent}
              onInitialEventHandled={() => setSeasonalGenerationEvent(null)}
              creditsBalance={appState.credits.balance}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              onCreditsUsed={(amount, action) => {
                setAppState(prev => prev ? ({
                  ...prev,
                  credits: {
                    balance: Math.max(0, prev.credits.balance - amount),
                    history: [
                      {
                        id: `tx-${Date.now()}`,
                        date: new Date().toISOString(),
                        action,
                        amount: -amount
                      },
                      ...prev.credits.history
                    ]
                  }
                }) : prev);
              }}
            />
          )}

          {currentTab === 'analytics' && activeOffer && (
            <MetaAdsAnalytics
              offer={activeOffer}
              campaigns={appState.campaigns}
              onSyncCampaign={handleSyncCampaign}
              theme={theme}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsPanel
              appState={appState}
              onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
              theme={theme}
            />
          )}
        </main>
      </div>

      {/* Notification Toast Top Right matching Image 5 */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-white dark:bg-[#121420] text-neutral-900 dark:text-white px-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-[#242A42] shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xs">
            <span className="font-bold block text-neutral-900 dark:text-white">Oferta criada</span>
            <span className="text-neutral-500 dark:text-neutral-400 text-[11px] truncate max-w-xs block">
              {toastMessage}
            </span>
          </div>
        </div>
      )}

      {/* Credits Audit Modal */}
      <CreditsModal
        isOpen={isCreditsModalOpen}
        onClose={() => setIsCreditsModalOpen(false)}
        balance={appState.credits.balance}
        history={appState.credits.history}
        onAddCreditsBonus={handleAddCreditsBonus}
      />

      {/* New Offer Modal */}
      <NewOfferModal
        isOpen={isNewOfferModalOpen}
        onClose={() => setIsNewOfferModalOpen(false)}
        onOfferCreated={handleOfferCreated}
        creditsBalance={appState.credits.balance}
        initialBriefing={newOfferInitialBriefing}
      />
    </div>
  );
}
