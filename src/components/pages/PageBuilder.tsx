import React, { useState } from 'react';
import { 
  Smartphone, 
  Monitor, 
  Save, 
  RotateCw, 
  Code, 
  Check, 
  ArrowRight,
  Layers,
  X,
  Undo2,
  Redo2,
  Download,
  MessageCircle,
  Send,
  Palette,
  Shuffle,
  Sparkles,
  Sliders,
  Type,
  Layout,
  Square
} from 'lucide-react';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';
import { getDefaultDesignForOffer } from '../../constants/designs';

interface PageBuilderProps {
  offer: Offer;
  page: SalesPage;
  onUpdatePage: (page: SalesPage) => void;
  creditsBalance: number;
  theme?: 'black' | 'white';
}

export const PageBuilder: React.FC<PageBuilderProps> = ({
  offer,
  page,
  onUpdatePage,
  creditsBalance,
  theme = 'white'
}) => {
  const isBlack = theme === 'black';
  const productName = offer.title || page.title.replace(/^Página de Vendas\s*-\s*/i, '');

  // Has page been generated? If page has blocks > 1, it's considered generated
  const [hasGeneratedPage, setHasGeneratedPage] = useState<boolean>(() => {
    return !!(page && page.blocks && page.blocks.length >= 3);
  });

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [generationProgress, setGenerationProgress] = useState(3);

  // Modal Settings (Image 9)
  const [pricingModel, setPricingModel] = useState<'single' | 'two_plans'>('two_plans');
  const [upgradePopup, setUpgradePopup] = useState(true);
  const [imagesChoice, setImagesChoice] = useState<'ai' | 'upload_later'>('ai');
  const [mockupText, setMockupText] = useState(false);
  const [modalPresetId, setModalPresetId] = useState<string>('auto');

  // Editor states (Image 10)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('mobile');
  const [activeRightTab, setActiveRightTab] = useState<'estilos' | 'ia' | 'geral'>('estilos');
  const [history, setHistory] = useState<SalesPage[]>([]);
  const [future, setFuture] = useState<SalesPage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'assistant' | 'user'; text: string }>>([
    { role: 'assistant', text: 'Posso melhorar esta página inteira. Peça uma mudança de visual, copy, estrutura ou conversão.' }
  ]);

  const commitPageChange = async (nextPage: SalesPage) => {
    setHistory(prev => [...prev, page].slice(-20));
    setFuture([]);
    await api.savePage(nextPage);
    onUpdatePage(nextPage);
  };

  const handleSelectPreset = async (preset: PageDesignPreset) => {
    const updated: SalesPage = {
      ...page,
      theme: preset.theme,
      design: { ...preset.design },
      lastUpdated: new Date().toISOString()
    };
    await commitPageChange(updated);
  };

  const handleRandomizeDesign = async () => {
    const currentConcept = page.design?.visualConcept;
    const currentPreset = PAGE_DESIGN_PRESETS.find(p => p.design.visualConcept === currentConcept);
    const nextPreset = getRandomDesignPreset(currentPreset?.id);
    await handleSelectPreset(nextPreset);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
  };

  const handleUpdateDesignProperty = async <K extends keyof PageDesign>(key: K, value: PageDesign[K]) => {
    const baseDesign = page.design || PAGE_DESIGN_PRESETS[0].design;
    const updatedDesign: PageDesign = {
      ...baseDesign,
      [key]: value
    };
    const updated: SalesPage = {
      ...page,
      design: updatedDesign,
      lastUpdated: new Date().toISOString()
    };
    await commitPageChange(updated);
  };

  const handleUpdateBaseTheme = async (nextTheme: SalesPage['theme']) => {
    const updated: SalesPage = {
      ...page,
      theme: nextTheme,
      lastUpdated: new Date().toISOString()
    };
    await commitPageChange(updated);
  };

  const handleGenerateAiStyle = async () => {
    setActiveRightTab('ia');
    await handlePageChatSubmit('Como Diretor de Arte, invente uma direção visual autoral e inédita para esta página, decidindo cores exclusivas em hex, tipografia, heroLayout, textura e acabamento sem usar nenhum estilo padrão.');
  };

  const handleUndo = async () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setHistory(prev => prev.slice(0, -1));
    setFuture(prev => [page, ...prev].slice(0, 20));
    await api.savePage(previous);
    onUpdatePage(previous);
  };

  const handleRedo = async () => {
    const next = future[0];
    if (!next) return;
    setFuture(prev => prev.slice(1));
    setHistory(prev => [...prev, page].slice(-20));
    await api.savePage(next);
    onUpdatePage(next);
  };

  const handleUpdateCheckoutUrl = (checkoutUrl: string) => {
    const nextPage = { ...page, checkoutUrl, lastUpdated: new Date().toISOString() };
    onUpdatePage(nextPage);
    void api.savePage(nextPage);
  };

  const handlePageChatSubmit = async (instruction = chatInput) => {
    const request = instruction.trim();
    if (!request || isChatting) return;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: request }]);
    setIsChatting(true);
    try {
      const result = await api.editPageWithAi(offer, page, request);
      const updatedPage = { ...result.page, lastUpdated: new Date().toISOString() };
      await api.savePage(updatedPage);
      onUpdatePage(updatedPage);
      setChatMessages(prev => [...prev, { role: 'assistant', text: result.reply || 'Página atualizada. Revise o preview e me diga o próximo ajuste.' }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: error instanceof Error ? error.message : 'Não consegui atualizar a página. Tente novamente.' }]);
    } finally {
      setIsChatting(false);
    }
  };

  const editorInputClass = `w-full rounded-xl border px-3 py-2 text-xs outline-none transition-colors ${
    isBlack
      ? 'border-[#2A324A] bg-[#0F1320] text-white focus:border-white'
      : 'border-[#DCE2EA] bg-white text-[#172033] focus:border-[#172033]'
  }`;

  const handleOpenGenerateModal = () => {
    setShowGenerateModal(true);
  };

  const [isGeneratingDesignOnly, setIsGeneratingDesignOnly] = useState(false);

  const handleRegenerateArtDirection = async () => {
    setIsGeneratingDesignOnly(true);
    try {
      const generated = await api.generatePage(offer, undefined, undefined);
      if (generated?.design) {
        const updated: SalesPage = {
          ...page,
          theme: (generated.theme === 'midnight-dark' || generated.theme === 'clean-white' || generated.theme === 'warm-cream') ? generated.theme : page.theme,
          design: generated.design,
          lastUpdated: new Date().toISOString()
        };
        await api.savePage(updated);
        onUpdatePage(updated);
        confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error('Failed to regenerate visual direction:', err);
    } finally {
      setIsGeneratingDesignOnly(false);
    }
  };

  const handleExecuteGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress(1);
    setGenerationError('');

    try {
      const targetPreset = modalPresetId !== 'auto' ? getDesignPresetById(modalPresetId) : null;
      // When modalPresetId === 'auto', we pass undefined so the AI Art Director invents a completely bespoke design from the offer's niche!
      const targetTheme = targetPreset ? targetPreset.theme : undefined;
      const targetDesign = targetPreset ? targetPreset.design : undefined;

      const generated = await api.generatePage(offer, targetTheme, targetDesign);
      if (!Array.isArray(generated?.blocks) || generated.blocks.length === 0) {
        throw new Error('A IA não retornou uma página completa. Revise a oferta e tente novamente.');
      }

      const updated: SalesPage = {
        ...page,
        title: `Página de Vendas - ${offer.title}`,
        slug: offer.id,
        theme: targetPreset ? targetPreset.theme : (generated.theme === 'midnight-dark' || generated.theme === 'clean-white' || generated.theme === 'warm-cream' ? generated.theme : page.theme),
        design: targetPreset ? targetPreset.design : (generated.design || page.design),
        blocks: generated.blocks,
        lastUpdated: new Date().toISOString()
      };
      await api.savePage(updated);
      onUpdatePage(updated);
      setHasGeneratedPage(true);
      setShowGenerateModal(false);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      console.error('Gemini generatePage failed:', err);
      setGenerationError(err instanceof Error ? err.message : 'A página não foi gerada. Revise os dados e tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const pageCanvasClass = page.theme === 'midnight-dark'
    ? 'bg-[#111827] text-white'
    : page.theme === 'clean-white'
      ? 'bg-white text-neutral-900'
      : 'bg-[#FAF7F2] text-neutral-900';
  const design = page.design;
  const motionClass = design?.animation ? `sales-page-motion-${design.animation}` : '';
  const designFont = design?.fontStyle === 'technical'
    ? 'ui-monospace, SFMono-Regular, Menlo, monospace'
    : design?.fontStyle === 'soft'
      ? 'Nunito, ui-rounded, system-ui, sans-serif'
      : design?.fontStyle === 'modern'
        ? 'Inter, ui-sans-serif, system-ui, sans-serif'
        : 'Georgia, ui-serif, serif';
  const designStyle = design ? {
    backgroundColor: design.backgroundColor,
    color: design.textColor,
    fontFamily: designFont,
    borderRadius: design.radius === 'sharp' ? '8px' : design.radius === 'pill' ? '32px' : '24px',
    ['--sales-accent' as string]: design.accentColor,
    ['--sales-surface' as string]: design.surfaceColor,
    ['--sales-radius' as string]: design.radius === 'sharp' ? '8px' : design.radius === 'pill' ? '999px' : '16px'
  } : undefined;
  const sectionStyle = design ? { color: design.textColor } : undefined;
  const accentStyle = design?.accentColor ? { backgroundColor: design.accentColor } : undefined;

  const renderPageBlock = (block: PageBlock) => {
    switch (block.type) {
      case 'hero':
        return (
            <section key={block.id} style={sectionStyle} className="sales-page-hero relative p-6 text-center space-y-4">
            <div className="sales-page-hero-content space-y-4">
              {block.badge && <span className="inline-block rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-bold uppercase text-neutral-700">{block.badge}</span>}
              <h1 className="text-2xl font-black leading-tight">{block.headline || offer.title}</h1>
              {block.subheadline && <p className="mx-auto max-w-xl text-sm opacity-75">{block.subheadline}</p>}
              {block.chips?.length ? <div className="flex flex-wrap justify-center gap-2">{block.chips.map(chip => <span key={chip} className="rounded-full border px-2.5 py-1 text-xs">{chip}</span>)}</div> : null}
              {block.ctaText && <button type="button" disabled style={accentStyle} className="rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-70">{block.ctaText}</button>}
            </div>
            {block.heroImage && <img src={block.heroImage} alt="" className="hero-image mx-auto max-h-80 w-full max-w-xl rounded-2xl object-cover" />}
          </section>
        );
      case 'problem':
        return (
            <section key={block.id} style={sectionStyle} className="sales-page-section space-y-4 px-6 py-12 md:px-10">
            {block.title && <h2 className="text-center text-lg font-bold">{block.title}</h2>}
            {block.description && <p className="text-center text-sm opacity-75">{block.description}</p>}
            {block.cards?.length ? <div className="grid gap-3 sm:grid-cols-2">{block.cards.map(card => <article key={card.title} className="rounded-xl border p-4"><h3 className="font-bold">{card.title}</h3><p className="mt-1 text-sm opacity-75">{card.description}</p></article>)}</div> : null}
          </section>
        );
      case 'mechanism':
        return (
            <section key={block.id} style={sectionStyle} className="sales-page-section space-y-4 px-6 py-12 md:px-10">
            {block.title && <h2 className="text-center text-lg font-bold">{block.title}</h2>}
            {block.description && <p className="text-center text-sm opacity-75">{block.description}</p>}
            {block.steps?.length ? <div className="grid gap-3 sm:grid-cols-3">{block.steps.map(item => <article key={item.step} className="rounded-xl border p-4"><span className="text-xs font-bold opacity-60">{item.step}</span><h3 className="mt-1 font-bold">{item.title}</h3><p className="mt-1 text-sm opacity-75">{item.text}</p></article>)}</div> : null}
          </section>
        );
      case 'items':
        return (
            <section key={block.id} style={sectionStyle} className="sales-page-section space-y-4 px-6 py-12 md:px-10">
            {block.title && <h2 className="text-center text-lg font-bold">{block.title}</h2>}
            {block.items?.length ? <div className="grid gap-3 sm:grid-cols-2">{block.items.map(item => <article key={item.title} className="overflow-hidden rounded-xl border">{item.image && <img src={item.image} alt="" className="h-36 w-full object-cover" />}<div className="p-4"><h3 className="font-bold">{item.title}</h3><p className="mt-1 text-sm opacity-75">{item.desc}</p>{item.tag && <span className="mt-2 inline-block text-xs font-semibold opacity-60">{item.tag}</span>}</div></article>)}</div> : null}
          </section>
        );
      case 'offer':
        return (
            <section key={block.id} style={sectionStyle} className="sales-page-offer sales-page-section space-y-3 px-6 py-14 text-center md:px-10">
            {block.title && <h2 className="text-lg font-bold">{block.title}</h2>}
            {block.urgency && <p className="text-sm opacity-75">{block.urgency}</p>}
            {block.regularPrice && <p className="text-sm line-through opacity-60">{block.regularPrice}</p>}
            {block.price && <p className="text-2xl font-black">{block.price}</p>}
            {block.guaranteeText && <p className="text-xs opacity-70">{block.guaranteeText}</p>}
            {block.ctaText && <button type="button" disabled style={accentStyle} className="rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-70">{block.ctaText}</button>}
          </section>
        );
      case 'faq':
        return (
            <section key={block.id} style={sectionStyle} className="sales-page-section space-y-3 px-6 py-12 md:px-10">
            {block.title && <h2 className="text-center text-lg font-bold">{block.title}</h2>}
            {block.cards?.map(card => <article key={card.title} className="rounded-xl border p-4"><h3 className="font-bold">{card.title}</h3><p className="mt-1 text-sm opacity-75">{card.description}</p></article>)}
          </section>
        );
      case 'guarantee':
        return block.guaranteeText ? <section key={block.id} style={sectionStyle} className="sales-page-section px-6 py-10 text-center text-sm md:px-10">{block.guaranteeText}</section> : null;
      case 'socialProof':
        return block.testimonials?.length ? <section key={block.id} style={sectionStyle} className="sales-page-section space-y-3 px-6 py-12 md:px-10">{block.title && <h2 className="text-center text-lg font-bold">{block.title}</h2>}{block.testimonials.map(testimonial => <blockquote key={testimonial.name} className="rounded-xl border p-4"><p className="text-sm">{testimonial.text}</p><footer className="mt-2 text-xs font-semibold opacity-60">{testimonial.name}{testimonial.role ? ` · ${testimonial.role}` : ''}</footer></blockquote>)}</section> : null;
      case 'footer':
        return block.description ? <footer key={block.id} style={sectionStyle} className="px-6 py-10 text-center text-xs opacity-60">{block.description}</footer> : null;
      default:
        return null;
    }
  };

  const handleDownloadHtml = () => {
    const d = page.design;
    const accent = d?.accentColor || '#10b981';
    const bg = d?.backgroundColor || '#ffffff';
    const text = d?.textColor || '#111827';
    const surface = d?.surfaceColor || '#f9fafb';
    const font = d?.fontStyle === 'technical' ? 'monospace' : d?.fontStyle === 'editorial' ? 'Georgia, serif' : d?.fontStyle === 'soft' ? 'Nunito, system-ui, sans-serif' : 'Inter, system-ui, sans-serif';

    const blocksHtml = (page.blocks || []).map(b => {
      if (b.type === 'hero') {
        return `<section style="text-align:center;padding:64px 20px;">
          ${b.badge ? `<span style="display:inline-block;padding:6px 14px;border-radius:999px;background:${surface};color:${text};font-size:12px;font-weight:bold;margin-bottom:12px;">${b.badge}</span>` : ''}
          <h1 style="font-size:36px;font-weight:900;line-height:1.15;margin:12px auto;max-width:800px;">${b.headline || offer.title}</h1>
          ${b.subheadline ? `<p style="font-size:16px;opacity:0.8;max-width:640px;margin:0 auto 24px;">${b.subheadline}</p>` : ''}
          ${b.ctaText ? `<a href="${page.checkoutUrl || '#'}" style="display:inline-block;padding:14px 28px;border-radius:12px;background:${accent};color:#fff;font-weight:bold;text-decoration:none;">${b.ctaText}</a>` : ''}
        </section>`;
      }
      if (b.type === 'problem') {
        return `<section style="padding:48px 20px;max-width:800px;margin:0 auto;">
          <h2 style="text-align:center;font-size:24px;font-weight:bold;margin-bottom:12px;">${b.title || 'Desafios'}</h2>
          ${b.description ? `<p style="text-align:center;opacity:0.8;margin-bottom:24px;">${b.description}</p>` : ''}
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;">
            ${(b.cards || []).map(c => `<div style="padding:20px;border-radius:12px;background:${surface};border:1px solid rgba(120,120,120,0.15);">
              <h3 style="font-size:16px;font-weight:bold;margin-bottom:8px;">${c.title}</h3>
              <p style="font-size:14px;opacity:0.8;margin:0;">${c.description}</p>
            </div>`).join('')}
          </div>
        </section>`;
      }
      if (b.type === 'mechanism') {
        return `<section style="padding:48px 20px;max-width:800px;margin:0 auto;">
          <h2 style="text-align:center;font-size:24px;font-weight:bold;margin-bottom:12px;">${b.title || 'Como Funciona'}</h2>
          ${b.description ? `<p style="text-align:center;opacity:0.8;margin-bottom:24px;">${b.description}</p>` : ''}
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;">
            ${(b.steps || []).map(s => `<div style="padding:20px;border-radius:12px;background:${surface};border:1px solid rgba(120,120,120,0.15);">
              <span style="font-weight:bold;color:${accent};font-size:12px;">Passo ${s.step}</span>
              <h3 style="font-size:16px;font-weight:bold;margin:6px 0;">${s.title}</h3>
              <p style="font-size:14px;opacity:0.8;margin:0;">${s.text}</p>
            </div>`).join('')}
          </div>
        </section>`;
      }
      if (b.type === 'items') {
        return `<section style="padding:48px 20px;max-width:800px;margin:0 auto;">
          <h2 style="text-align:center;font-size:24px;font-weight:bold;margin-bottom:24px;">${b.title || 'O que você recebe'}</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;">
            ${(b.items || []).map(i => `<div style="padding:20px;border-radius:12px;background:${surface};border:1px solid rgba(120,120,120,0.15);">
              <h3 style="font-size:16px;font-weight:bold;margin-bottom:8px;">${i.title}</h3>
              <p style="font-size:14px;opacity:0.8;margin:0 0 8px;">${i.desc}</p>
              ${i.tag ? `<span style="font-size:11px;font-weight:bold;color:${accent};">${i.tag}</span>` : ''}
            </div>`).join('')}
          </div>
        </section>`;
      }
      if (b.type === 'offer') {
        return `<section style="padding:48px 20px;text-align:center;max-width:640px;margin:32px auto;background:${surface};border-radius:16px;border:1px solid ${accent}40;">
          <h2 style="font-size:26px;font-weight:900;margin-bottom:12px;">${b.title || 'Acesso Imediato'}</h2>
          ${b.urgency ? `<p style="font-size:13px;color:${accent};font-weight:bold;margin-bottom:8px;">${b.urgency}</p>` : ''}
          ${b.regularPrice ? `<span style="text-decoration:line-through;opacity:0.6;font-size:14px;">${b.regularPrice}</span>` : ''}
          <div style="font-size:36px;font-weight:900;margin:8px 0;">${b.price || ''}</div>
          ${b.guaranteeText ? `<p style="font-size:12px;opacity:0.7;margin-bottom:16px;">${b.guaranteeText}</p>` : ''}
          <a href="${page.checkoutUrl || '#'}" style="display:inline-block;padding:16px 32px;border-radius:12px;background:${accent};color:#fff;font-weight:bold;text-decoration:none;">${b.ctaText || 'Comprar Agora'}</a>
        </section>`;
      }
      if (b.type === 'faq') {
        return `<section style="padding:48px 20px;max-width:800px;margin:0 auto;">
          <h2 style="text-align:center;font-size:24px;font-weight:bold;margin-bottom:24px;">${b.title || 'Perguntas Frequentes'}</h2>
          ${(b.cards || []).map(f => `<div style="padding:16px;border-radius:10px;background:${surface};margin-bottom:12px;border:1px solid rgba(120,120,120,0.15);">
            <h3 style="font-size:15px;font-weight:bold;margin:0 0 6px;">${f.title}</h3>
            <p style="font-size:13px;opacity:0.8;margin:0;">${f.description}</p>
          </div>`).join('')}
        </section>`;
      }
      if (b.type === 'guarantee') {
        return `<section style="padding:24px 20px;text-align:center;max-width:640px;margin:0 auto;font-size:13px;opacity:0.8;">${b.guaranteeText || ''}</section>`;
      }
      if (b.type === 'footer') {
        return `<footer style="padding:32px 20px;text-align:center;font-size:12px;opacity:0.6;">${b.description || ''}</footer>`;
      }
      return '';
    }).join('\n');

    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title}</title>
</head>
<body style="margin:0;background:${bg};color:${text};font-family:${font};line-height:1.6;">
  ${blocksHtml}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${page.slug || 'pagina-de-vendas'}.html`;
    a.click();
  };

  const handlePublish = async () => {
    const updated = { ...page, published: true, lastUpdated: new Date().toISOString() };
    await api.savePage(updated);
    onUpdatePage(updated);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div className={`flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden select-none transition-colors ${
      isBlack ? 'bg-[#090A0F] text-[#E2E4E9]' : 'bg-[#F8F9FA] text-[#111827]'
    }`}>
      {/* 1. Empty State (Image 8) */}
      {!hasGeneratedPage && !isGenerating && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
          {generationError && <p role="alert" className="max-w-xl rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{generationError}</p>}
          <p className="text-neutral-500 text-sm font-medium">
            Nenhuma página de vendas gerada ainda para essa oferta.
          </p>
          <button
            onClick={handleOpenGenerateModal}
            className="px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Gerar página de vendas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Generating Progress Bar Notice (Image 10 top) */}
      {isGenerating && (
        <div className="p-3 px-6 bg-neutral-100 dark:bg-[#121522] border-b border-neutral-200 dark:border-[#202538] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
            <RotateCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
            <span>Gerando as imagens da página ({generationProgress}/7)</span>
          </div>
          <div className="w-32 bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-black dark:bg-white h-1.5 transition-all"
              style={{ width: `${(generationProgress / 7) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 3. Live Sales Page Editor (Image 10) */}
      {hasGeneratedPage && (
        <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden">
          {/* Controls Top Bar (Image 10) */}
          <div className={`h-14 px-6 border-b flex items-center justify-between shrink-0 z-20 ${
            isBlack ? 'border-[#1C2030] bg-[#0C0E17]' : 'border-[#E5E7EB] bg-white'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-1.5 font-bold text-xs ${isBlack ? 'text-white' : 'text-neutral-800'}`}>
                <span>{productName}</span>
              </div>

              {/* Device Toggle */}
              <div className={`flex items-center p-1 rounded-full text-xs ${
                isBlack ? 'bg-[#161928]' : 'bg-[#F1F3F5] border border-[#E5E7EB]'
              }`}>
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-3 py-1 rounded-full font-semibold transition-all flex items-center gap-1.5 ${
                    previewDevice === 'desktop'
                      ? isBlack ? 'bg-[#202538] text-white shadow-xs' : 'bg-white text-neutral-900 shadow-xs'
                      : isBlack ? 'text-neutral-500 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-3 py-1 rounded-full font-semibold transition-all flex items-center gap-1.5 ${
                    previewDevice === 'mobile'
                      ? isBlack ? 'bg-[#202538] text-white shadow-xs' : 'bg-white text-neutral-900 shadow-xs'
                      : isBlack ? 'text-neutral-500 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>

            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" />
                <span>Alterações salvas</span>
              </span>

              <button
                onClick={handleUndo}
                disabled={history.length === 0}
                title="Desfazer"
                className={`p-1.5 rounded-lg transition-colors ${history.length === 0 ? 'text-neutral-300 cursor-not-allowed' : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-white'}`}
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={future.length === 0}
                title="Refazer"
                className={`p-1.5 rounded-lg transition-colors ${future.length === 0 ? 'text-neutral-300 cursor-not-allowed' : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-white'}`}
              >
                <Redo2 className="w-4 h-4" />
              </button>

              <button
                onClick={handlePublish}
                className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-colors ${
                  isBlack ? 'border-[#252B42] hover:bg-[#181B2A]' : 'border-[#D9DEE7] hover:bg-[#F5F7FA]'
                }`}
              >
                Publicar
              </button>

              <a
                href={`/p/${page.slug}`}
                target="_blank"
                rel="noreferrer"
                className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-colors ${
                  isBlack ? 'border-[#252B42] hover:bg-[#181B2A]' : 'border-[#D9DEE7] hover:bg-[#F5F7FA]'
                }`}
              >
                Ver página
              </a>

              <button
                onClick={handleDownloadHtml}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isBlack ? 'bg-white hover:bg-neutral-200 text-black' : 'bg-[#172033] hover:bg-[#25324A] text-white'
                }`}
              >
                <Download className="w-3 h-3" />
                <span>Baixar</span>
              </button>
            </div>
          </div>

          {/* Main Workspace Body: Canvas + Right Sidebar */}
          <div className="flex-1 min-h-0 flex overflow-hidden">
            {/* Center Canvas Viewport */}
            <div className={`page-preview-scroll flex-1 min-h-0 min-w-0 overflow-y-auto overscroll-contain p-4 md:p-8 flex justify-center ${
              isBlack ? 'bg-[#08090E]' : 'bg-[#F3F4F6]'
            }`}>
              <div style={designStyle} className={`page-preview-card ${motionClass} sales-page-layout-${design?.heroLayout || 'centered'} sales-page-pattern-${design?.backgroundPattern || 'none'} sales-page-decor-${design?.heroDecoration || 'none'} sales-page-cards-${design?.cardStyle || 'bordered'} sales-page-buttons-${design?.buttonStyle || 'solid'} max-h-full min-h-0 self-start shrink-0 transition-all shadow-2xl border border-neutral-300 overflow-y-auto overscroll-contain flex flex-col ${pageCanvasClass} ${
                previewDevice === 'mobile' ? 'w-full max-w-[400px]' : 'w-full max-w-4xl'
              }`}>
                {page.blocks.map(renderPageBlock)}
                {page.blocks.length === 0 && <div className="p-8 text-center text-sm opacity-70">Esta página ainda não tem conteúdo gerado.</div>}
              </div>
            </div>

            {/* Right Panel: "Edição e controles" (Image 10) */}
            <div className={`w-80 min-h-0 border-l flex flex-col shrink-0 ${
              isBlack ? 'border-[#1C2030] bg-[#0C0E17]' : 'border-neutral-200 bg-white'
            }`}>
              <div className={`p-4 border-b flex items-center justify-between ${
                isBlack ? 'border-[#1C2030]' : 'border-[#E8EBF0]'
              }`}>
                <h3 className={`font-bold text-xs font-display ${isBlack ? 'text-white' : 'text-neutral-900'}`}>
                  Edição e controles
                </h3>
              </div>

              {/* Tabs: Estilos, Assistente IA e Geral */}
              <div className={`flex border-b text-xs ${isBlack ? 'border-[#1C2030]' : 'border-[#E8EBF0]'}`}>
                <button
                  onClick={() => setActiveRightTab('estilos')}
                  className={`flex-1 py-2.5 font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                    activeRightTab === 'estilos'
                      ? isBlack ? 'border-white text-white' : 'border-[#172033] text-[#172033]'
                      : isBlack ? 'border-transparent text-neutral-500 hover:text-white' : 'border-transparent text-neutral-400 hover:text-[#172033]'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>ESTILOS</span>
                </button>
                <button
                  onClick={() => setActiveRightTab('ia')}
                  className={`flex-1 py-2.5 font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                    activeRightTab === 'ia'
                      ? isBlack ? 'border-white text-white' : 'border-[#172033] text-[#172033]'
                      : isBlack ? 'border-transparent text-neutral-500 hover:text-white' : 'border-transparent text-neutral-400 hover:text-[#172033]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ASSISTENTE</span>
                </button>
                <button
                  onClick={() => setActiveRightTab('geral')}
                  className={`flex-1 py-2.5 font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                    activeRightTab === 'geral'
                      ? isBlack ? 'border-white text-white' : 'border-[#172033] text-[#172033]'
                      : isBlack ? 'border-transparent text-neutral-500 hover:text-white' : 'border-transparent text-neutral-400 hover:text-[#172033]'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>CONFIGS</span>
                </button>
              </div>

              {/* Content of Right Tab */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {activeRightTab === 'estilos' && (
                  <div className="space-y-4">
                    {/* Visual Identity Overview Card */}
                    <div className={`p-4 rounded-2xl border space-y-3 ${
                      isBlack ? 'border-[#22283E] bg-[#121522]' : 'border-[#E2E6EC] bg-[#FAFBFC]'
                    }`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span className={`font-bold block text-xs ${isBlack ? 'text-white' : 'text-neutral-900'}`}>
                              Direção Visual Autoral
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                            {page.design?.visualConcept || 'A IA tem autonomia para conceber todo o visual sob medida.'}
                          </p>
                        </div>
                      </div>

                      {/* Palette Swatches */}
                      {page.design && (
                        <div className="space-y-1.5 pt-1 border-t border-neutral-200/50 dark:border-white/10">
                          <span className="text-[10px] font-semibold text-neutral-400 block">Paleta Hexadecimal Ativa</span>
                          <div className="grid grid-cols-4 gap-1.5 text-center">
                            <div className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-black/40">
                              <div className="w-full h-5 rounded mb-1 shadow-xs" style={{ backgroundColor: page.design.accentColor }} />
                              <span className="text-[9px] font-mono block truncate opacity-70">{page.design.accentColor}</span>
                              <span className="text-[8px] font-bold text-neutral-400 block uppercase">Acento</span>
                            </div>
                            <div className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-black/40">
                              <div className="w-full h-5 rounded mb-1 border border-neutral-200 dark:border-neutral-600 shadow-xs" style={{ backgroundColor: page.design.backgroundColor }} />
                              <span className="text-[9px] font-mono block truncate opacity-70">{page.design.backgroundColor}</span>
                              <span className="text-[8px] font-bold text-neutral-400 block uppercase">Fundo</span>
                            </div>
                            <div className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-black/40">
                              <div className="w-full h-5 rounded mb-1 border border-neutral-200 dark:border-neutral-600 shadow-xs" style={{ backgroundColor: page.design.surfaceColor }} />
                              <span className="text-[9px] font-mono block truncate opacity-70">{page.design.surfaceColor}</span>
                              <span className="text-[8px] font-bold text-neutral-400 block uppercase">Cartões</span>
                            </div>
                            <div className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-black/40">
                              <div className="w-full h-5 rounded mb-1 shadow-xs" style={{ backgroundColor: page.design.textColor }} />
                              <span className="text-[9px] font-mono block truncate opacity-70">{page.design.textColor}</span>
                              <span className="text-[8px] font-bold text-neutral-400 block uppercase">Texto</span>
                            </div>
                          </div>

                          {/* Attribute tags */}
                          <div className="flex flex-wrap gap-1 pt-1">
                            <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[9px] font-bold text-neutral-600 dark:text-neutral-300">
                              Fonte: {page.design.fontStyle}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[9px] font-bold text-neutral-600 dark:text-neutral-300">
                              Hero: {page.design.heroLayout}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[9px] font-bold text-neutral-600 dark:text-neutral-300">
                              Cantos: {page.design.radius}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleRegenerateArtDirection}
                          disabled={isGeneratingDesignOnly}
                          className="flex-1 px-3 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white dark:bg-white dark:text-black font-bold text-[11px] shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          {isGeneratingDesignOnly ? (
                            <>
                              <RotateCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Criando Visual...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>Recriar Visual sob Medida (IA)</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleRandomizeDesign}
                          className="px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-[#2A324A] hover:bg-neutral-100 dark:hover:bg-[#1A1F30] font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                          title="Sortear estilo alternativo"
                        >
                          <Shuffle className="w-3.5 h-3.5 text-orange-500" />
                          <span>Sortear</span>
                        </button>
                      </div>
                    </div>

                    {/* Presets Grid */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-neutral-500 uppercase tracking-wider block">
                          Temas e Paletas ({PAGE_DESIGN_PRESETS.length})
                        </span>
                        <span className="text-[10px] text-neutral-400">1 clique para aplicar</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                        {PAGE_DESIGN_PRESETS.map((preset) => {
                          const isActive = page.design?.visualConcept === preset.design.visualConcept || (page.theme === preset.theme && page.design?.accentColor === preset.design.accentColor);
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handleSelectPreset(preset)}
                              className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                                isActive
                                  ? isBlack
                                    ? 'border-white bg-[#1A1F30] shadow-sm'
                                    : 'border-neutral-900 bg-white shadow-sm ring-1 ring-neutral-900'
                                  : isBlack
                                    ? 'border-[#202538] bg-[#0E111C] hover:border-[#353D5C]'
                                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className="w-5 h-5 rounded-full shrink-0 border border-neutral-300 dark:border-white/20 shadow-xs flex items-center justify-center"
                                  style={{ backgroundColor: preset.design.backgroundColor }}
                                >
                                  <div
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: preset.design.accentColor }}
                                  />
                                </div>
                                <div className="min-w-0">
                                  <span className={`font-bold block truncate text-xs ${isBlack ? 'text-white' : 'text-neutral-900'}`}>
                                    {preset.name}
                                  </span>
                                  <p className="text-[10px] text-neutral-400 truncate">
                                    {preset.theme} • {preset.design.fontStyle} • {preset.design.radius}
                                  </p>
                                </div>
                              </div>
                              {isActive && (
                                <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                                  <Check className="w-2.5 h-2.5" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Fine-Tuning Controls */}
                    <div className={`p-3.5 rounded-2xl border space-y-3 ${
                      isBlack ? 'border-[#22283E] bg-[#121522]' : 'border-[#E2E6EC] bg-[#FAFBFC]'
                    }`}>
                      <span className="font-bold text-[11px] text-neutral-500 uppercase tracking-wider block">
                        Ajuste Fino de Design
                      </span>

                      {/* Base Theme */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-neutral-400 block">Tema de Fundo</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['warm-cream', 'midnight-dark', 'clean-white'] as const).map(t => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => handleUpdateBaseTheme(t)}
                              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-colors ${
                                page.theme === t
                                  ? isBlack ? 'bg-white text-black border-white' : 'bg-neutral-900 text-white border-neutral-900'
                                  : isBlack ? 'border-[#2A324A] text-neutral-400 hover:text-white' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                              }`}
                            >
                              {t === 'warm-cream' ? 'Creme' : t === 'midnight-dark' ? 'Dark' : 'Branco'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Hero Layout */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-neutral-400 block">Layout do Topo (Hero)</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['centered', 'split', 'immersive'] as const).map(l => (
                            <button
                              key={l}
                              type="button"
                              onClick={() => handleUpdateDesignProperty('heroLayout', l)}
                              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-colors ${
                                page.design?.heroLayout === l
                                  ? isBlack ? 'bg-white text-black border-white' : 'bg-neutral-900 text-white border-neutral-900'
                                  : isBlack ? 'border-[#2A324A] text-neutral-400 hover:text-white' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                              }`}
                            >
                              {l === 'centered' ? 'Centrado' : l === 'split' ? 'Dividido' : 'Imersivo'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Typography */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-neutral-400 block">Tipografia</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(['editorial', 'modern', 'technical', 'soft'] as const).map(f => (
                            <button
                              key={f}
                              type="button"
                              onClick={() => handleUpdateDesignProperty('fontStyle', f)}
                              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-colors ${
                                page.design?.fontStyle === f
                                  ? isBlack ? 'bg-white text-black border-white' : 'bg-neutral-900 text-white border-neutral-900'
                                  : isBlack ? 'border-[#2A324A] text-neutral-400 hover:text-white' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                              }`}
                            >
                              {f === 'editorial' ? 'Editorial Serif' : f === 'modern' ? 'Modern Sans' : f === 'technical' ? 'Tech Mono' : 'Soft Rounded'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Card Style */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-neutral-400 block">Estilo dos Cartões</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(['bordered', 'elevated', 'flat', 'glass'] as const).map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => handleUpdateDesignProperty('cardStyle', c)}
                              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-colors ${
                                page.design?.cardStyle === c
                                  ? isBlack ? 'bg-white text-black border-white' : 'bg-neutral-900 text-white border-neutral-900'
                                  : isBlack ? 'border-[#2A324A] text-neutral-400 hover:text-white' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                              }`}
                            >
                              {c === 'bordered' ? 'Borda Fina' : c === 'elevated' ? 'Elevado' : c === 'flat' ? 'Plano / Flat' : 'Vidro Glass'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Button Style */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-neutral-400 block">Estilo dos Botões</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(['solid', 'gradient', 'outline', 'soft'] as const).map(b => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => handleUpdateDesignProperty('buttonStyle', b)}
                              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-colors ${
                                page.design?.buttonStyle === b
                                  ? isBlack ? 'bg-white text-black border-white' : 'bg-neutral-900 text-white border-neutral-900'
                                  : isBlack ? 'border-[#2A324A] text-neutral-400 hover:text-white' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                              }`}
                            >
                              {b === 'solid' ? 'Sólido' : b === 'gradient' ? 'Degradê' : b === 'outline' ? 'Contorno' : 'Suave'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Pattern */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-neutral-400 block">Textura de Fundo</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['none', 'grid', 'dots', 'soft-glow', 'paper'] as const).map(p => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => handleUpdateDesignProperty('backgroundPattern', p)}
                              className={`py-1.5 px-1.5 rounded-lg text-[9px] font-bold border transition-colors ${
                                page.design?.backgroundPattern === p
                                  ? isBlack ? 'bg-white text-black border-white' : 'bg-neutral-900 text-white border-neutral-900'
                                  : isBlack ? 'border-[#2A324A] text-neutral-400 hover:text-white' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                              }`}
                            >
                              {p === 'none' ? 'Liso' : p === 'grid' ? 'Grade' : p === 'dots' ? 'Pontos' : p === 'soft-glow' ? 'Brilho' : 'Papel'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Radius */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-neutral-400 block">Arredondamento dos Cantos</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['sharp', 'rounded', 'pill'] as const).map(r => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => handleUpdateDesignProperty('radius', r)}
                              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-colors ${
                                page.design?.radius === r
                                  ? isBlack ? 'bg-white text-black border-white' : 'bg-neutral-900 text-white border-neutral-900'
                                  : isBlack ? 'border-[#2A324A] text-neutral-400 hover:text-white' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                              }`}
                            >
                              {r === 'sharp' ? 'Reto' : r === 'rounded' ? 'Arredondado' : 'Pílula'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeRightTab === 'geral' && (
                  <div className="space-y-4">
                    <div className={`p-3 rounded-2xl border space-y-1 ${isBlack ? 'border-[#22283E] bg-[#121522]' : 'border-[#E2E6EC] bg-[#FAFBFC]'}`}>
                      <span className={`font-bold block ${isBlack ? 'text-neutral-200' : 'text-neutral-800'}`}>
                        Identidade visual ativa
                      </span>
                      <p className="text-[11px] text-neutral-500">
                        {page.design?.visualConcept || 'Padrão da oferta'}
                      </p>
                    </div>

                    <div className={`p-3 rounded-2xl border space-y-1 ${isBlack ? 'border-[#22283E] bg-[#121522]' : 'border-[#E2E6EC] bg-[#FAFBFC]'}`}>
                      <span className={`font-bold block ${isBlack ? 'text-neutral-200' : 'text-neutral-800'}`}>
                        Links de checkout
                      </span>
                      <p className="text-[11px] text-neutral-500">
                        Botões de compra integrados
                      </p>
                    </div>

                    <label className={`block p-3 rounded-2xl border space-y-2 ${isBlack ? 'border-[#22283E] bg-[#121522]' : 'border-[#E2E6EC] bg-[#FAFBFC]'}`}>
                      <span className={`font-bold block ${isBlack ? 'text-neutral-200' : 'text-neutral-800'}`}>
                        Link dos botões de checkout
                      </span>
                      <input
                        className={editorInputClass}
                        value={page.checkoutUrl || ''}
                        placeholder="https://seu-checkout.com"
                        onChange={(event) => handleUpdateCheckoutUrl(event.target.value)}
                      />
                      <span className="text-[10px] text-neutral-500 block">
                        Destino para onde o cliente é enviado ao clicar em comprar.
                      </span>
                    </label>
                  </div>
                )}

                {activeRightTab === 'ia' && (
                  <div className="space-y-4">
                    <div className={`rounded-2xl border p-3 ${isBlack ? 'border-[#2A324A] bg-[#121522]' : 'border-[#E2E6EC] bg-[#FAFBFC]'}`}>
                      <div className="mb-3 flex items-center gap-2">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-xl ${isBlack ? 'bg-white text-black' : 'bg-[#172033] text-white'}`}>
                          <MessageCircle className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${isBlack ? 'text-white' : 'text-[#172033]'}`}>Ajustar com IA</p>
                          <p className="text-[10px] text-neutral-500">Descreva o que deseja mudar na página.</p>
                        </div>
                      </div>

                      <div className="mb-3 max-h-52 space-y-2 overflow-y-auto pr-1">
                        {chatMessages.map((message, index) => (
                          <div key={`${message.role}-${index}`} className={`rounded-xl px-2.5 py-2 text-[11px] leading-relaxed ${message.role === 'user' ? (isBlack ? 'ml-3 bg-[#20283E] text-neutral-100' : 'ml-3 bg-[#172033] text-white') : (isBlack ? 'mr-2 bg-[#181D2D] text-neutral-300' : 'mr-2 bg-white text-neutral-600 border border-neutral-200')}`}>
                            {message.text}
                          </div>
                        ))}
                        {isChatting && <div className={`mr-2 rounded-xl px-2.5 py-2 text-[11px] ${isBlack ? 'bg-[#181D2D] text-neutral-400' : 'bg-white text-neutral-500 border border-neutral-200'}`}><RotateCw className="mr-1 inline h-3 w-3 animate-spin" /> Ajustando o preview...</div>}
                      </div>

                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {['Deixe mais premium', 'Mude para tema dark', 'Layout split com foto', 'Adicione depoimentos'].map((suggestion) => (
                          <button key={suggestion} type="button" disabled={isChatting} onClick={() => void handlePageChatSubmit(suggestion)} className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${isBlack ? 'border-[#303954] text-neutral-300 hover:bg-[#20283E]' : 'border-neutral-200 text-neutral-600 hover:bg-white'}`}>
                            {suggestion}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-end gap-1.5">
                        <textarea
                          value={chatInput}
                          onChange={(event) => setChatInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' && !event.shiftKey) {
                              event.preventDefault();
                              void handlePageChatSubmit();
                            }
                          }}
                          rows={2}
                          placeholder="Ex.: troque as cores por azul cobalto e deixe os botões em degradê"
                          className={`${editorInputClass} min-h-12 resize-none`}
                        />
                        <button type="button" aria-label="Enviar pedido" disabled={isChatting || !chatInput.trim()} onClick={() => void handlePageChatSubmit()} className={`mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white disabled:opacity-40 ${isBlack ? 'bg-white text-black' : 'bg-[#172033]'}`}>
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal "Gerar a página de vendas" (Image 9) */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white text-neutral-900 rounded-3xl w-full max-w-xl border border-neutral-200 shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 pb-4 border-b border-neutral-100 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-5 h-5 text-neutral-700" />
                  <h3 className="font-bold text-lg text-neutral-900 font-display">
                    Gerar a página de vendas
                  </h3>
                </div>
                <p className="text-xs text-neutral-500">
                  A IA escolhe a estrutura, o visual e a experiência completa com base na sua oferta. Você pode pedir ajustes depois pelo assistente.
                </p>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs max-h-[75vh]">
              {generationError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-800">{generationError}</div>}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-800 block text-xs">
                      Direção Visual & Identidade
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      Sem modelo padrão: a IA cria cores e tipografia para o nicho
                    </span>
                  </div>

                  {/* Standout AI Option */}
                  <div
                    onClick={() => setModalPresetId('auto')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      modalPresetId === 'auto'
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-md ring-2 ring-neutral-900 ring-offset-1'
                        : 'border-neutral-200 bg-neutral-50 hover:bg-white hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Sparkles className={`w-4 h-4 ${modalPresetId === 'auto' ? 'text-amber-400' : 'text-amber-500'}`} />
                        <span className={`text-xs font-bold ${modalPresetId === 'auto' ? 'text-white' : 'text-neutral-900'}`}>
                          ✨ IA Diretor de Arte (Visual sob Medida para o Nicho)
                        </span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${modalPresetId === 'auto' ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'}`}>
                        RECOMENDADO
                      </span>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${modalPresetId === 'auto' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      A IA analisa a essência de <strong>{offer.title}</strong> ({offer.niche || 'seu tema'}) e inventa uma identidade visual própria: paleta de cores autoral, tipografia, layout do hero e estilo de cartões sem nenhum padrão repetitivo.
                    </p>
                  </div>

                  <div className="pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                      Ou selecione uma paleta manual pré-definida:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 bg-neutral-50 rounded-2xl border border-neutral-200">
                      {PAGE_DESIGN_PRESETS.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => setModalPresetId(p.id)}
                          className={`p-2 rounded-xl border cursor-pointer transition-all ${
                            modalPresetId === p.id
                              ? 'border-black bg-white shadow-xs font-bold ring-1 ring-black'
                              : 'border-transparent bg-white/70 hover:bg-white hover:border-neutral-200'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.design.accentColor }} />
                            <span className="text-xs truncate">{p.name}</span>
                          </div>
                          <p className="text-[10px] text-neutral-500 truncate">{p.theme} • {p.design.fontStyle}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              {/* Option 1: Modelo de precificação */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setPricingModel('single')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      pricingModel === 'single'
                        ? 'border-black bg-neutral-50 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-neutral-900">1 oferta</span>
                      <input type="radio" checked={pricingModel === 'single'} onChange={() => {}} className="accent-black" />
                    </div>
                    <p className="text-[11px] text-neutral-500">Um preço e um botão de compra</p>
                  </div>

                  <div
                    onClick={() => setPricingModel('two_plans')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      pricingModel === 'two_plans'
                        ? 'border-black bg-neutral-50 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-neutral-900">2 planos</span>
                      <input type="radio" checked={pricingModel === 'two_plans'} onChange={() => {}} className="accent-black" />
                    </div>
                    <p className="text-[11px] text-neutral-500">Básico e completo, lado a lado</p>
                  </div>
                </div>

                {/* Toggle: Popup de upgrade no básico */}
                <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-neutral-900">Popup de upgrade no básico</span>
                      <span className="text-[9px] font-bold bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded">
                        RECOMENDADO
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Quem clica no básico vê o completo por um valor intermediário antes do checkout
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={upgradePopup}
                    onChange={(e) => setUpgradePopup(e.target.checked)}
                    className="w-4 h-4 accent-black rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Imagens da página */}
              <div className="space-y-2">
                <span className="font-bold text-neutral-800 block">
                  Imagens da página
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setImagesChoice('ai')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      imagesChoice === 'ai'
                        ? 'border-black bg-neutral-50 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-neutral-900">Gerar página</span>
                      <input type="radio" checked={imagesChoice === 'ai'} onChange={() => {}} className="accent-black" />
                    </div>
                    <p className="text-[11px] text-neutral-500">Cria as imagens dos espaços marcados, 4 tokens cada</p>
                  </div>

                  <div
                    onClick={() => setImagesChoice('upload_later')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      imagesChoice === 'upload_later'
                        ? 'border-black bg-neutral-50 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-neutral-900">Eu envio depois</span>
                      <input type="radio" checked={imagesChoice === 'upload_later'} onChange={() => {}} className="accent-black" />
                    </div>
                    <p className="text-[11px] text-neutral-500">Os espaços ficam vazios pra você subir</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-neutral-900 block">Texto escrito nos mockups</span>
                    <p className="text-[11px] text-neutral-500">Nome do produto e preço dentro da imagem. Desligado, a imagem sai sem palavras</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={mockupText}
                    onChange={(e) => setMockupText(e.target.checked)}
                    className="w-4 h-4 accent-black rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 px-6 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <span className="text-xs text-neutral-500">
                Até 56 tokens • você tem {creditsBalance} (4 da página + 4 por imagem). Só a imagem gerada é cobrada.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleExecuteGenerate}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-black text-white shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Gerar página</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
