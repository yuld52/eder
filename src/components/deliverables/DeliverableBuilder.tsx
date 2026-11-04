import React, { useState, useEffect } from 'react';
import { 
  Package, 
  RotateCw, 
  FileText, 
  CheckCircle2, 
  Zap, 
  Plus, 
  X, 
  Trash2,
  Edit3, 
  Save, 
  Check, 
  AlertCircle, 
  Eye, 
  ChevronUp, 
  ChevronDown,
  Layers,
  Copy,
  Printer,
  FileCheck,
  Sparkles,
  ListChecks,
  BookOpen,
  PenLine,
  Download
} from 'lucide-react';
import { Offer, Deliverable, DeliverablePiece, DeliverablePage } from '../../types';
import { api } from '../../services/api';
import { exportDeliverableToPdf, exportDeliverablePieceToPdf } from '../../utils/pdfExport';
import confetti from 'canvas-confetti';

interface DeliverableBuilderProps {
  offer: Offer;
  deliverable: Deliverable;
  onUpdateDeliverable: (del: Deliverable) => void;
  creditsBalance: number;
  theme?: 'black' | 'white';
}

export const DeliverableBuilder: React.FC<DeliverableBuilderProps> = ({
  offer,
  deliverable,
  onUpdateDeliverable,
  creditsBalance,
  theme = 'white'
}) => {
  const isBlack = theme === 'black';
  const [isGeneratingGamma, setIsGeneratingGamma] = useState(false);
  const [gammaMessage, setGammaMessage] = useState('');
  const deliverableDesign = deliverable.design;
  const deliverableFont = deliverableDesign?.fontStyle === 'technical'
    ? 'ui-monospace, SFMono-Regular, Menlo, monospace'
    : deliverableDesign?.fontStyle === 'soft'
      ? 'Nunito, ui-rounded, system-ui, sans-serif'
      : deliverableDesign?.fontStyle === 'modern'
        ? 'Inter, ui-sans-serif, system-ui, sans-serif'
        : 'Georgia, ui-serif, serif';
  const deliverablePageStyle = deliverableDesign ? {
    backgroundColor: deliverableDesign.pageBackground,
    color: deliverableDesign.textColor,
    fontFamily: deliverableFont,
    ['--deliverable-accent' as string]: deliverableDesign.accentColor,
    ['--deliverable-muted' as string]: deliverableDesign.mutedTextColor,
    ['--deliverable-text' as string]: deliverableDesign.textColor
  } : undefined;
  const deliverableVisualClass = `deliverable-page-style-${deliverableDesign?.pageStyle || 'editorial'} deliverable-page-cover-${deliverableDesign?.coverStyle || 'typographic'} deliverable-page-decor-${deliverableDesign?.decoration || 'none'}`;

  const defaultPieces: DeliverablePiece[] = [
    { 
      id: `piece-main-${offer.id || 'main'}`, 
      category: 'main', 
      title: offer.title || 'Produto Principal', 
      badge: 'Produto principal', 
      pagesCount: 8, 
      status: 'not_generated', 
      pages: [] 
    },
    ...(offer.bonuses || []).map((bonus, index) => ({
      id: `piece-bonus-${offer.id}-${index + 1}`,
      category: 'bonus' as const,
      title: bonus.title || `Bônus #${index + 1}`,
      badge: 'Bônus',
      pagesCount: 6,
      status: 'not_generated' as const,
      pages: []
    })),
    ...(offer.orderBump?.active ? [{ 
      id: `piece-order-bump-${offer.id}`, 
      category: 'order_bump' as const, 
      title: offer.orderBump.title || 'Order Bump', 
      badge: 'Order bump', 
      pagesCount: 6, 
      status: 'not_generated' as const, 
      pages: [] 
    }] : []),
    ...(offer.upsell?.active ? [{ 
      id: `piece-upsell-${offer.id}`, 
      category: 'upsell' as const, 
      title: offer.upsell.title || 'Upsell Especial', 
      badge: 'Upsell', 
      pagesCount: 8, 
      status: 'not_generated' as const, 
      pages: [] 
    }] : [])
  ];

  const [pieces, setPieces] = useState<DeliverablePiece[]>(() => {
    return (deliverable.pieces && deliverable.pieces.length > 0) ? deliverable.pieces : defaultPieces;
  });

  const [selectedPieceId, setSelectedPieceId] = useState<string>(() => {
    if (deliverable.pieces && deliverable.pieces.length > 0) {
      return deliverable.pieces[0].id;
    }
    return defaultPieces[0]?.id || 'piece-main';
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [generatingProgress, setGeneratingProgress] = useState<{ current: number; total: number } | null>(null);
  
  // Inspection / Zoom Modal
  const [zoomPage, setZoomPage] = useState<DeliverablePage | null>(null);

  // Edit Page Modal
  const [editingPage, setEditingPage] = useState<{ index: number; page: DeliverablePage } | null>(null);

  // Add Custom Piece Modal
  const [isAddPieceModalOpen, setIsAddPieceModalOpen] = useState(false);
  const [newPieceTitle, setNewPieceTitle] = useState('');
  const [newPieceCategory, setNewPieceCategory] = useState<'main' | 'bonus' | 'order_bump' | 'upsell'>('bonus');
  const [newPiecePagesCount, setNewPiecePagesCount] = useState<number>(6);

  // Synchronize pieces if deliverable changes externally
  useEffect(() => {
    if (deliverable.pieces && deliverable.pieces.length > 0) {
      setPieces(deliverable.pieces);
      if (!deliverable.pieces.some(p => p.id === selectedPieceId)) {
        setSelectedPieceId(deliverable.pieces[0].id);
      }
    }
  }, [deliverable.id]);

  const selectedPiece = pieces.find(p => p.id === selectedPieceId) || pieces[0] || defaultPieces[0];
  const readyPieces = pieces.filter(p => p.status === 'ready').length;
  const totalPieces = pieces.length;

  const persistUpdatedPieces = (updatedPieces: DeliverablePiece[], design?: Deliverable['design']) => {
    setPieces(updatedPieces);
    const hasReady = updatedPieces.some(p => p.status === 'ready');
    const totalPages = updatedPieces.reduce((acc, p) => acc + (p.pages?.length || p.pagesCount || 0), 0);
    const updatedDeliverable: Deliverable = {
      ...deliverable,
      ...(design ? { design } : {}),
      pieces: updatedPieces,
      totalPages,
      status: hasReady ? 'ready' : (deliverable.status || 'draft')
    };
    onUpdateDeliverable(updatedDeliverable);
  };

  const handleSelectPiece = (id: string) => {
    setSelectedPieceId(id);
    setGenerationError('');
  };

  // Generate a single piece using AI
  const handleGeneratePiece = async (pieceId: string) => {
    const target = pieces.find(p => p.id === pieceId);
    if (!target) return;

    setIsGenerating(true);
    setGenerationError('');
    const totalPages = target.pagesCount || 6;
    setGeneratingProgress({ current: 1, total: totalPages });

    const interval = setInterval(() => {
      setGeneratingProgress(prev => {
        if (!prev) return null;
        if (prev.current < prev.total) {
          return { ...prev, current: prev.current + 1 };
        }
        return prev;
      });
    }, 450);

    try {
      const res = await api.generatePiece({
        offer,
        pieceId,
        pieceCategory: target.category,
        pieceTitle: target.title,
        pagesCount: totalPages
      });

      clearInterval(interval);
      if (!Array.isArray(res?.pages) || res.pages.length === 0) {
        throw new Error('A IA não retornou páginas válidas para este entregável. Tente novamente.');
      }

      const generatedPages: DeliverablePage[] = res.pages.map((p: any, i: number) => ({
        pageNumber: i + 1,
        title: p.title || `${target.title} - Página ${i + 1}`,
        subtitle: p.subtitle || '',
        content: p.content || '',
        imageUrl: p.imageUrl || '',
        visualPrompt: p.visualPrompt || '',
        visualType: p.visualType || (i === 0 ? 'cover' : i === res.pages.length - 1 ? 'summary' : 'lesson'),
        callouts: Array.isArray(p.callouts) ? p.callouts.slice(0, 3) : []
      }));

      const updatedPieces = pieces.map(p => {
        if (p.id === pieceId) {
          return {
            ...p,
            status: 'ready' as const,
            pages: generatedPages,
            pagesCount: generatedPages.length
          };
        }
        return p;
      });

      persistUpdatedPieces(updatedPieces, res.design);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      console.error('generatePiece error:', err);
      clearInterval(interval);
      setGenerationError(err instanceof Error ? err.message : 'Falha ao gerar entregável. Tente novamente.');
    } finally {
      setIsGenerating(false);
      setGeneratingProgress(null);
    }
  };

  // Generate all pending pieces sequentially
  const handleGenerateAllPending = async () => {
    const pendingPieces = pieces.filter(p => p.status !== 'ready');
    if (pendingPieces.length === 0) return;

    setGeneratingAll(true);
    setGenerationError('');

    try {
      let currentList = [...pieces];
      for (const target of pendingPieces) {
        setSelectedPieceId(target.id);
        setIsGenerating(true);
        const totalPages = target.pagesCount || 6;
        setGeneratingProgress({ current: 1, total: totalPages });

        const res = await api.generatePiece({
          offer,
          pieceId: target.id,
          pieceCategory: target.category,
          pieceTitle: target.title,
          pagesCount: totalPages
        });

        if (Array.isArray(res?.pages) && res.pages.length > 0) {
          const generatedPages: DeliverablePage[] = res.pages.map((p: any, i: number) => ({
            pageNumber: i + 1,
            title: p.title || `${target.title} - Página ${i + 1}`,
            subtitle: p.subtitle || '',
            content: p.content || '',
            imageUrl: p.imageUrl || '',
            visualPrompt: p.visualPrompt || '',
            visualType: p.visualType || (i === 0 ? 'cover' : i === res.pages.length - 1 ? 'summary' : 'lesson'),
            callouts: Array.isArray(p.callouts) ? p.callouts.slice(0, 3) : []
          }));

          currentList = currentList.map(p => {
            if (p.id === target.id) {
              return {
                ...p,
                status: 'ready' as const,
                pages: generatedPages,
                pagesCount: generatedPages.length
              };
            }
            return p;
          });

          persistUpdatedPieces(currentList, res.design);
        }
      }
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
    } catch (err) {
      console.error('Failed to generate all pieces:', err);
      setGenerationError('Ocorreu um erro durante a geração em lote.');
    } finally {
      setIsGenerating(false);
      setGeneratingAll(false);
      setGeneratingProgress(null);
    }
  };

  // Add a new blank page to the current piece
  const handleAddPageToPiece = () => {
    if (!selectedPiece) return;
    const currentPages = selectedPiece.pages || [];
    const newPageNum = currentPages.length + 1;
    const newPage: DeliverablePage = {
      pageNumber: newPageNum,
      title: `Página ${newPageNum}: Guia de Aplicação Prática`,
      subtitle: `Instruções complementares para ${selectedPiece.title}`,
      content: `Insira aqui o passo a passo detalhado, checklists ou exercícios práticos para o seu cliente.\n\n1. Passo inicial de configuração;\n2. Execução das atividades recomendadas;\n3. Validação e próximos passos.`
    };

    const updatedPages = [...currentPages, newPage];
    const updatedPieces = pieces.map(p => {
      if (p.id === selectedPiece.id) {
        return {
          ...p,
          status: 'ready' as const,
          pages: updatedPages,
          pagesCount: updatedPages.length
        };
      }
      return p;
    });

    persistUpdatedPieces(updatedPieces);
    setEditingPage({ index: updatedPages.length - 1, page: newPage });
  };

  // Save changes to an edited page
  const handleSavePageEdit = (updatedPage: DeliverablePage, index: number) => {
    if (!selectedPiece) return;
    const updatedPages = [...selectedPiece.pages];
    updatedPages[index] = updatedPage;

    const updatedPieces = pieces.map(p => {
      if (p.id === selectedPiece.id) {
        return { ...p, pages: updatedPages };
      }
      return p;
    });

    persistUpdatedPieces(updatedPieces);
    setEditingPage(null);
    if (zoomPage && zoomPage.pageNumber === updatedPage.pageNumber) {
      setZoomPage(updatedPage);
    }
  };

  // Delete a page from the current piece
  const handleDeletePage = (index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedPiece || selectedPiece.pages.length <= 1) {
      alert('A peça precisa ter pelo menos 1 página.');
      return;
    }

    const updatedPages = selectedPiece.pages
      .filter((_, i) => i !== index)
      .map((p, i) => ({ ...p, pageNumber: i + 1 }));

    const updatedPieces = pieces.map(p => {
      if (p.id === selectedPiece.id) {
        return {
          ...p,
          pages: updatedPages,
          pagesCount: updatedPages.length
        };
      }
      return p;
    });

    persistUpdatedPieces(updatedPieces);
    if (zoomPage && zoomPage.pageNumber === index + 1) {
      setZoomPage(null);
    }
  };

  // Move page up or down
  const handleMovePage = (index: number, direction: 'up' | 'down', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedPiece) return;
    const pages = [...selectedPiece.pages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pages.length) return;

    const temp = pages[index];
    pages[index] = pages[targetIndex];
    pages[targetIndex] = temp;

    const renumbered = pages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
    const updatedPieces = pieces.map(p => {
      if (p.id === selectedPiece.id) {
        return { ...p, pages: renumbered };
      }
      return p;
    });

    persistUpdatedPieces(updatedPieces);
  };

  // Add custom piece
  const handleAddCustomPiece = () => {
    if (!newPieceTitle.trim()) return;

    const newPiece: DeliverablePiece = {
      id: `piece-custom-${Date.now()}`,
      category: newPieceCategory,
      title: newPieceTitle.trim(),
      badge: newPieceCategory === 'main' ? 'Produto' : newPieceCategory === 'bonus' ? 'Bônus' : newPieceCategory === 'order_bump' ? 'Order bump' : 'Upsell',
      pagesCount: newPiecePagesCount,
      status: 'not_generated',
      pages: []
    };

    const updatedPieces = [...pieces, newPiece];
    persistUpdatedPieces(updatedPieces);
    setSelectedPieceId(newPiece.id);
    setIsAddPieceModalOpen(false);
    setNewPieceTitle('');
  };

  // Delete custom piece
  const handleDeletePiece = (pieceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (pieces.length <= 1) {
      alert('O entregável precisa conter pelo menos 1 peça.');
      return;
    }

    if (!confirm('Tem certeza de que deseja remover esta peça do entregável?')) return;

    const updatedPieces = pieces.filter(p => p.id !== pieceId);
    persistUpdatedPieces(updatedPieces);
    if (selectedPieceId === pieceId) {
      setSelectedPieceId(updatedPieces[0].id);
    }
  };

  const handleGenerateGammaPdf = async () => {
    if (readyPieces === 0) {
      setGammaMessage('Gere pelo menos uma peça antes de exportar pelo Gamma.');
      return;
    }
    setIsGeneratingGamma(true);
    setGammaMessage('Enviando o entregável para o Gamma...');
    try {
      const gammaDeliverable: Deliverable = {
        ...deliverable,
        pieces,
        totalPages: pieces.reduce((total, piece) => total + (piece.pages?.length || 0), 0),
        status: 'ready'
      };
      const generation = await api.generateGammaDeliverable(gammaDeliverable);
      const updated = { ...gammaDeliverable, gammaGenerationId: generation.generationId };
      onUpdateDeliverable(updated);
      await api.saveDeliverable(updated);
      for (let attempt = 0; attempt < 60; attempt += 1) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        const status = await api.getGammaGenerationStatus(generation.generationId);
        if (status.status === 'completed') {
          const completed = { ...updated, gammaUrl: status.gammaUrl, gammaExportUrl: status.exportUrl };
          onUpdateDeliverable(completed);
          await api.saveDeliverable(completed);
          setGammaMessage('PDF gerado no Gamma com sucesso.');
          return;
        }
        if (status.status === 'failed') throw new Error(status.error || 'O Gamma não conseguiu concluir o PDF.');
        setGammaMessage(`Gerando no Gamma... tentativa ${attempt + 1}/60`);
      }
      throw new Error('O Gamma demorou mais que o esperado para concluir o PDF.');
    } catch (error) {
      setGammaMessage(error instanceof Error ? error.message : 'Não foi possível gerar o PDF no Gamma.');
    } finally {
      setIsGeneratingGamma(false);
    }
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfExportMessage, setPdfExportMessage] = useState<string | null>(null);

  const handleExportFullPdf = async () => {
    setIsExportingPdf(true);
    try {
      const fullDeliverable: Deliverable = {
        ...deliverable,
        pieces,
        totalPages: pieces.reduce((total, p) => total + (p.pages?.length || p.pagesCount || 0), 0)
      };
      await exportDeliverableToPdf(fullDeliverable, { offerTitle: offer.title });
      setPdfExportMessage('PDF baixado com sucesso!');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setTimeout(() => setPdfExportMessage(null), 4000);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Erro ao gerar o PDF. Tente novamente.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportSelectedPiecePdf = async () => {
    if (!selectedPiece) return;
    setIsExportingPdf(true);
    try {
      await exportDeliverablePieceToPdf(deliverable, selectedPiece);
      setPdfExportMessage(`PDF de "${selectedPiece.title}" baixado com sucesso!`);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
      setTimeout(() => setPdfExportMessage(null), 4000);
    } catch (err) {
      console.error('Failed to export piece PDF:', err);
      alert('Erro ao gerar o PDF da peça.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full min-w-0 overflow-y-auto select-none transition-colors p-6 md:p-8 space-y-6 ${
      isBlack ? 'bg-[#090A0F] text-[#E2E4E9]' : 'bg-[#F8F9FA] text-[#111827]'
    }`}>
      {/* 1. Header Banner */}
      <div className={`p-4 px-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs ${
        isBlack ? 'bg-[#10121C] border-[#1E2336]' : 'bg-white border-[#E5E7EB]'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-neutral-900 dark:text-white">
              Kit de Entregáveis da Oferta
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {readyPieces} de {totalPieces} peças prontas
            </span>
          </div>
          <p className="text-xs text-neutral-500 max-w-2xl leading-relaxed">
            Exporte materiais em PDF formatado ou gere documentos integrados via Gamma.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          <button
            onClick={handleExportFullPdf}
            disabled={isExportingPdf}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
              isBlack
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            title="Baixar entregável completo em PDF formatado"
          >
            {isExportingPdf ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Gerando PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Exportar PDF Formatado</span>
              </>
            )}
          </button>

          {readyPieces > 0 && (
            <button
              onClick={handleGenerateGammaPdf}
              disabled={isGeneratingGamma}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                isBlack ? 'border-[#262C42] hover:bg-[#161826] text-neutral-200' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'
              }`}
              title="Gerar o PDF no Gamma"
            >
              <FileCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>{isGeneratingGamma ? 'Gerando no Gamma...' : 'Gerar no Gamma'}</span>
            </button>
          )}

          {readyPieces < totalPieces && (
            <button
              onClick={handleGenerateAllPending}
              disabled={isGenerating || generatingAll}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                isBlack ? 'bg-white hover:bg-neutral-200 text-black' : 'bg-black hover:bg-neutral-800 text-white'
              }`}
            >
              {generatingAll ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                  <span>Gerando Kit Completo...</span>
                </>
              ) : (
                <>
                  <span>Gerar Peças Pendentes ({totalPieces - readyPieces})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
      {gammaMessage && (
        <div className={`rounded-xl border px-3 py-2 text-xs ${
          isBlack ? 'border-[#29304A] bg-[#141827] text-neutral-300' : 'border-blue-100 bg-blue-50 text-blue-700'
        }`}>
          {gammaMessage}
        </div>
      )}
      {pdfExportMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="text-xs font-semibold">{pdfExportMessage}</span>
        </div>
      )}

      {/* 2. Main Columns Layout: Left Pieces Sidebar, Right Page Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Pieces List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              COMPONENTES DO KIT
            </span>
            <button
              onClick={() => setIsAddPieceModalOpen(true)}
              className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Adicionar Peça</span>
            </button>
          </div>

          <div className="space-y-2">
            {pieces.map(p => {
              const isSelected = p.id === selectedPieceId;
              const isReady = p.status === 'ready';

              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPiece(p.id)}
                  className={`group relative p-3 rounded-2xl border text-xs transition-all flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? isBlack
                        ? 'bg-[#1C2032] border-[#313854] text-white shadow-xs font-bold'
                        : 'bg-white border-neutral-300 text-neutral-900 shadow-xs font-bold'
                      : isBlack
                        ? 'bg-[#10121C] border-[#1C2030] text-neutral-400 hover:bg-[#161928]'
                        : 'bg-white/80 border-[#E5E7EB] text-neutral-600 hover:bg-white'
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 ${isReady ? 'text-emerald-500' : 'text-neutral-400'}`}>
                    {isReady ? <CheckCircle2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="truncate block font-semibold text-xs">
                        {p.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                        p.category === 'main'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : p.category === 'bonus'
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {p.badge || p.category}
                      </span>
                      <span>
                        {isReady ? `${p.pages?.length || 0} pág. prontas` : `${p.pagesCount || 6} páginas`}
                      </span>
                    </div>
                  </div>

                  {/* Actions inside piece card */}
                  <div className="absolute right-2.5 top-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {pieces.length > 1 && (
                      <button
                        onClick={(e) => handleDeletePiece(p.id, e)}
                        className="p-1 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-[#202538] transition-colors"
                        title="Remover peça"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setIsAddPieceModalOpen(true)}
            className={`w-full py-2.5 px-3 rounded-2xl border-2 border-dashed text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              isBlack ? 'border-[#262C42] hover:border-neutral-500 text-neutral-400 hover:text-white' : 'border-neutral-300 hover:border-neutral-500 text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Peça / Bônus Extra</span>
          </button>
        </div>

        {/* Right Main Panel: Selected Piece Detail & Pages Grid */}
        <div className="lg:col-span-3 space-y-4">
          <div className={`p-6 rounded-3xl border shadow-xs ${
            isBlack ? 'bg-[#10121C] border-[#1E2336]' : 'bg-white border-[#E5E7EB]'
          }`}>
            {/* Header of piece */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-[#1E2336]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    selectedPiece.category === 'main'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                      : selectedPiece.category === 'bonus'
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  }`}>
                    {selectedPiece.badge || selectedPiece.category}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {selectedPiece.status === 'ready' 
                      ? `${selectedPiece.pages?.length || 0} páginas diagramadas` 
                      : `planejado para ${selectedPiece.pagesCount || 6} páginas`}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-neutral-900 dark:text-white font-display">
                  {selectedPiece.title}
                </h2>
                <p className="text-xs text-neutral-500 mt-1 max-w-xl">
                  {selectedPiece.category === 'main'
                    ? `Conteúdo do produto principal referente à oferta: "${offer.title}". Diagramado para leitura clara e rápida aplicação.`
                    : selectedPiece.category === 'bonus'
                      ? `Bônus de alto valor percebido para aumentar a conversão e percepção de entrega da oferta.`
                      : selectedPiece.category === 'order_bump'
                        ? `Material prático de consumo rápido adicionado pelo cliente no momento do checkout.`
                        : `Material pós-compra aprofundado para gerar valor superior e elevar o LTV.`
                  }
                </p>
              </div>

              {/* Top Action buttons */}
              <div className="flex items-center flex-wrap gap-2 shrink-0">
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-[#181B2A] text-xs font-semibold flex items-center gap-2">
                      <RotateCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                      <span>Gerando {generatingProgress?.current || 1}/{generatingProgress?.total || 6}</span>
                    </span>
                    <button
                      onClick={() => setIsGenerating(false)}
                      className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-[#262C42] text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-[#161826]"
                    >
                      Parar
                    </button>
                  </div>
                ) : selectedPiece.status === 'ready' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAddPageToPiece}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isBlack ? 'border-[#262C42] hover:bg-[#161826] text-neutral-200' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'
                      }`}
                      title="Adicionar uma nova página em branco a esta peça"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nova Página</span>
                    </button>

                    <button
                      onClick={() => handleGeneratePiece(selectedPiece.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isBlack ? 'border-[#262C42] hover:bg-[#161826] text-neutral-200' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'
                      }`}
                      title="Regenerar páginas"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Refazer peça</span>
                    </button>

                    <button
                      onClick={handleExportSelectedPiecePdf}
                      disabled={isExportingPdf}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 ${
                        isBlack ? 'border-[#262C42] hover:bg-[#161826] text-neutral-200' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'
                      }`}
                      title="Baixar apenas esta peça em PDF formatado"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-500" />
                      <span>Baixar Peça (PDF)</span>
                    </button>

                    <button
                      onClick={handleGenerateGammaPdf}
                      disabled={isGeneratingGamma}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                        isBlack ? 'border-[#262C42] hover:bg-[#161826] text-neutral-200' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'
                      }`}
                      title="Exportar via Gamma"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-blue-500" />
                      <span>{isGeneratingGamma ? 'Gerando...' : 'Gamma'}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleGeneratePiece(selectedPiece.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
                      isBlack ? 'bg-white hover:bg-neutral-200 text-black' : 'bg-black hover:bg-neutral-800 text-white'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Gerar esta peça</span>
                  </button>
                )}
              </div>
            </div>

            {/* Error banner if any */}
            {generationError && (
              <div role="alert" className="mt-4 p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-xs text-red-600 dark:text-red-400 flex items-center justify-between">
                <span>{generationError}</span>
                <button onClick={() => setGenerationError('')} className="p-1 hover:opacity-70">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Content: Not generated yet */}
            {selectedPiece.status !== 'ready' && !isGenerating && (
              <div className="py-16 text-center space-y-4 max-w-lg mx-auto">
                <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${
                  isBlack ? 'bg-[#181B28] text-white border border-[#292F47]' : 'bg-neutral-100 text-neutral-800'
                }`}>
                  <FileText className="w-6 h-6 text-neutral-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                    Conteúdo aguardando geração
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed mt-1">
                    Serão criadas <strong>{selectedPiece.pagesCount || 6} páginas instrucionais</strong> completas, com introdução, passos práticos e checklists.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => handleGeneratePiece(selectedPiece.id)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer ${
                      isBlack ? 'bg-white hover:bg-neutral-200 text-black' : 'bg-black hover:bg-neutral-800 text-white'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Gerar esta peça</span>
                  </button>

                  <button
                    onClick={handleAddPageToPiece}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all inline-flex items-center gap-2 cursor-pointer ${
                      isBlack ? 'border-[#262C42] hover:bg-[#161826] text-neutral-200' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Criar Páginas Manualmente</span>
                  </button>
                </div>
              </div>
            )}

            {/* Content: Generating State */}
            {isGenerating && (
              <div className="py-16 text-center space-y-3">
                <RotateCw className="w-8 h-8 animate-spin mx-auto text-amber-500" />
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Gerando páginas reais com inteligência artificial...
                </p>
                <p className="text-xs text-neutral-400">
                  Estruturando conteúdo didático, checklists e formatação A4.
                </p>
              </div>
            )}

            {/* Content: Pages grid */}
            {selectedPiece.status === 'ready' && selectedPiece.pages && selectedPiece.pages.length > 0 && (
              <div className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {selectedPiece.pages.map((p, idx) => {
                    const pageType = p.visualType || (idx === 0 ? 'cover' : idx === selectedPiece.pages.length - 1 ? 'summary' : 'lesson');
                    return (
                    <div
                      key={p.pageNumber || idx}
                      onClick={() => setZoomPage(p)}
                      className={`group rounded-2xl border p-3 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-all ${
                        isBlack ? 'bg-[#141624] border-[#22283E]' : 'bg-[#FAF8F5] border-[#E8E4DD]'
                      }`}
                    >
                      {/* Page Mockup Preview Canvas */}
                      <div style={deliverablePageStyle} className={`aspect-[3/4] rounded-xl border shadow-xs p-3.5 flex flex-col justify-between overflow-hidden relative text-[9px] leading-snug ${deliverableVisualClass}`}>
                        {/* Page Header */}
                        <div>
                          <div className="deliverable-muted text-[8px] font-bold uppercase tracking-widest border-b pb-1 mb-1.5 flex justify-between">
                            <span className="truncate max-w-[110px]">{selectedPiece.title}</span>
                            <span>Pág. {p.pageNumber}</span>
                          </div>

                          <h4 className="font-extrabold deliverable-text text-[11px] leading-tight mb-1 line-clamp-2">
                            {p.title}
                          </h4>

                          {p.subtitle && (
                            <p className="deliverable-muted text-[8px] line-clamp-2 mb-1.5">
                              {p.subtitle}
                            </p>
                          )}
                        </div>

                        <div className={`mb-2 h-16 overflow-hidden rounded-lg border ${
                          pageType === 'cover'
                            ? 'bg-gradient-to-br from-amber-200 via-orange-100 to-emerald-100'
                            : pageType === 'checklist'
                              ? 'bg-gradient-to-br from-emerald-100 to-cyan-50'
                              : pageType === 'recipe'
                                ? 'bg-gradient-to-br from-orange-100 to-rose-50'
                                : pageType === 'worksheet'
                                  ? 'bg-gradient-to-br from-sky-100 to-indigo-50'
                                  : 'bg-gradient-to-br from-violet-100 to-fuchsia-50'
                        }`}>
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-between gap-2 px-3">
                              <div className="space-y-1">
                                <div className="h-1.5 w-16 rounded-full bg-white/80" />
                                <div className="h-1.5 w-24 rounded-full bg-white/60" />
                                <div className="h-1.5 w-10 rounded-full bg-white/50" />
                              </div>
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/75 text-neutral-700 shadow-sm">
                                {pageType === 'cover' ? <Sparkles className="h-4 w-4" /> : pageType === 'checklist' ? <ListChecks className="h-4 w-4" /> : pageType === 'worksheet' ? <PenLine className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Page snippet */}
                        <div className="my-auto py-1">
                          <p className="deliverable-muted text-[8px] line-clamp-6 whitespace-pre-line leading-relaxed">
                            {p.content}
                          </p>
                          {p.callouts && p.callouts.length > 0 && (
                            <div className="mt-1.5 space-y-1">
                              {p.callouts.slice(0, 2).map((callout, calloutIndex) => (
                                <div key={`${p.pageNumber}-callout-${calloutIndex}`} className="rounded bg-white/60 px-1.5 py-0.5 text-[7px] font-semibold deliverable-text truncate">
                                  {callout}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Card bottom branding */}
                        <div className="deliverable-muted pt-1 border-t border-neutral-100 flex items-center justify-between text-[7px]">
                          <span>LowStack Digital</span>
                          <span>Folha A4</span>
                        </div>
                      </div>

                      {/* Footer label with quick controls */}
                      <div className="pt-2.5 flex items-center justify-between text-[11px] text-neutral-500">
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300 truncate max-w-[130px]">
                          {p.pageNumber}. {p.title}
                        </span>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {idx > 0 && (
                            <button
                              onClick={(e) => handleMovePage(idx, 'up', e)}
                              className="p-1 hover:text-black dark:hover:text-white"
                              title="Mover para cima"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                          )}

                          {idx < selectedPiece.pages.length - 1 && (
                            <button
                              onClick={(e) => handleMovePage(idx, 'down', e)}
                              className="p-1 hover:text-black dark:hover:text-white"
                              title="Mover para baixo"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPage({ index: idx, page: p });
                            }}
                            className="p-1 hover:text-black dark:hover:text-white"
                            title="Editar página"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>

                          <button
                            onClick={(e) => handleDeletePage(idx, e)}
                            className="p-1 hover:text-red-500"
                            title="Excluir página"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    );
                  })}

                  {/* Add Page Card */}
                  <button
                    onClick={handleAddPageToPiece}
                    className={`aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center transition-all cursor-pointer ${
                      isBlack
                        ? 'border-[#22273D] hover:border-neutral-500 bg-[#0E1018]/50 hover:bg-[#121422]'
                        : 'border-[#D1D5DB] hover:border-neutral-600 bg-white/50 hover:bg-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${
                      isBlack ? 'bg-[#181B28] text-white' : 'bg-neutral-100 text-neutral-800'
                    }`}>
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                      Nova Página
                    </span>
                    <span className="text-[10px] text-neutral-400 mt-0.5">
                      Adicionar conteúdo
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Page Zoom / Full Inspection Modal */}
      {zoomPage && !editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white text-neutral-900 rounded-3xl w-full max-w-xl border border-neutral-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 px-6 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-neutral-500" />
                <span className="font-bold text-sm">
                  Página {zoomPage.pageNumber} • {zoomPage.title}
                </span>
              </div>
              <button
                onClick={() => setZoomPage(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="aspect-[3/4] w-full max-w-md mx-auto rounded-2xl bg-[#FAF8F5] border border-[#E8E4DD] p-6 shadow-md flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b pb-1.5 mb-3 flex justify-between">
                    <span>{selectedPiece.title}</span>
                    <span>Pág. {zoomPage.pageNumber}</span>
                  </div>

                  <h3 className="font-bold text-base text-neutral-900 mb-1 leading-snug">
                    {zoomPage.title}
                  </h3>

                  {zoomPage.subtitle && (
                    <p className="text-xs text-neutral-600 mb-4">{zoomPage.subtitle}</p>
                  )}

                  <p className="text-xs text-neutral-700 leading-relaxed whitespace-pre-line">
                    {zoomPage.content}
                  </p>
                </div>

                <div className="pt-4 border-t text-[10px] text-neutral-400 flex justify-between">
                  <span>{offer.title}</span>
                  <span>LowStack Digital • Folha A4</span>
                </div>
              </div>
            </div>

            <div className="p-4 px-6 border-t border-neutral-100 flex items-center justify-between">
              <button
                onClick={() => {
                  const idx = selectedPiece.pages.findIndex(p => p.pageNumber === zoomPage.pageNumber);
                  if (idx >= 0) {
                    setEditingPage({ index: idx, page: zoomPage });
                  }
                }}
                className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Conteúdo</span>
              </button>

              <button
                onClick={handleGenerateGammaPdf}
                disabled={isGeneratingGamma}
                className="px-4 py-2 rounded-xl bg-black text-white text-xs font-bold flex items-center gap-2 cursor-pointer hover:bg-neutral-800"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>{isGeneratingGamma ? 'Gerando...' : 'Exportar PDF · Gamma'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Edit Page Modal */}
      {editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className={`w-full max-w-xl rounded-3xl border shadow-2xl p-6 space-y-4 ${
            isBlack ? 'bg-[#10121C] border-[#22273D] text-white' : 'bg-white border-[#E5E7EB] text-neutral-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm">
                  Editar Página {editingPage.page.pageNumber}
                </h3>
              </div>
              <button onClick={() => setEditingPage(null)} className="text-neutral-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Título da Página</label>
                <input
                  type="text"
                  value={editingPage.page.title}
                  onChange={(e) => setEditingPage({
                    ...editingPage,
                    page: { ...editingPage.page, title: e.target.value }
                  })}
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none ${
                    isBlack ? 'bg-[#181B2A] border-[#292F47] text-white' : 'bg-neutral-50 border-neutral-300'
                  }`}
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Subtítulo ou Objetivo Prático</label>
                <input
                  type="text"
                  value={editingPage.page.subtitle || ''}
                  onChange={(e) => setEditingPage({
                    ...editingPage,
                    page: { ...editingPage.page, subtitle: e.target.value }
                  })}
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none ${
                    isBlack ? 'bg-[#181B2A] border-[#292F47] text-white' : 'bg-neutral-50 border-neutral-300'
                  }`}
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Conteúdo Instrucional (Texto e Passos)</label>
                <textarea
                  value={editingPage.page.content}
                  onChange={(e) => setEditingPage({
                    ...editingPage,
                    page: { ...editingPage.page, content: e.target.value }
                  })}
                  rows={8}
                  className={`w-full p-2.5 rounded-xl border text-xs leading-relaxed focus:outline-none font-mono ${
                    isBlack ? 'bg-[#181B2A] border-[#292F47] text-white' : 'bg-neutral-50 border-neutral-300'
                  }`}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingPage(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-500 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSavePageEdit(editingPage.page, editingPage.index)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
                  isBlack ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Add Custom Piece Modal */}
      {isAddPieceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 space-y-4 ${
            isBlack ? 'bg-[#10121C] border-[#22273D] text-white' : 'bg-white border-[#E5E7EB] text-neutral-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-500" />
                <h3 className="font-bold text-sm">Adicionar Peça ao Kit</h3>
              </div>
              <button onClick={() => setIsAddPieceModalOpen(false)} className="text-neutral-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Título da Peça ou Material</label>
                <input
                  type="text"
                  value={newPieceTitle}
                  onChange={(e) => setNewPieceTitle(e.target.value)}
                  placeholder="Ex: Checklist de Execução Rápida, Fichas de Treino..."
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none ${
                    isBlack ? 'bg-[#181B2A] border-[#292F47] text-white' : 'bg-neutral-50 border-neutral-300'
                  }`}
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Categoria</label>
                <select
                  value={newPieceCategory}
                  onChange={(e) => setNewPieceCategory(e.target.value as any)}
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none ${
                    isBlack ? 'bg-[#181B2A] border-[#292F47] text-white' : 'bg-neutral-50 border-neutral-300'
                  }`}
                >
                  <option value="bonus">Bônus Exclusivo</option>
                  <option value="main">Produto Principal Adicional</option>
                  <option value="order_bump">Order Bump</option>
                  <option value="upsell">Upsell / Pós-Venda</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Meta de Páginas</label>
                <div className="flex items-center gap-2">
                  {[4, 6, 8, 12].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNewPiecePagesCount(n)}
                      className={`flex-1 py-1.5 rounded-xl border font-bold text-xs cursor-pointer ${
                        newPiecePagesCount === n
                          ? isBlack ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                          : isBlack ? 'border-[#292F47] text-neutral-400' : 'border-neutral-300 text-neutral-600'
                      }`}
                    >
                      {n} pág.
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsAddPieceModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-500 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddCustomPiece}
                disabled={!newPieceTitle.trim()}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                  isBlack ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Peça</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
