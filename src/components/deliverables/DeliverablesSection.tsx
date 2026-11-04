import React, { useState } from 'react';
import { 
  Package, 
  RotateCw, 
  FileText, 
  CheckCircle2, 
  Plus, 
  Search, 
  ArrowLeft, 
  X,
  Trash2,
  Copy,
  BookOpen,
  Check,
  AlertCircle,
  Download
} from 'lucide-react';
import { Deliverable, Offer, DeliverablePiece, DeliverablePage } from '../../types';
import { DeliverableBuilder } from './DeliverableBuilder';
import { api } from '../../services/api';
import { exportDeliverableToPdf } from '../../utils/pdfExport';
import confetti from 'canvas-confetti';

interface DeliverablesSectionProps {
  deliverables: Deliverable[];
  offers: Offer[];
  onUpdateDeliverable: (del: Deliverable) => void;
  onDeleteDeliverable?: (id: string) => void;
  creditsBalance: number;
  theme?: 'black' | 'white';
}

export const DeliverablesSection: React.FC<DeliverablesSectionProps> = ({
  deliverables,
  offers,
  onUpdateDeliverable,
  onDeleteDeliverable,
  creditsBalance,
  theme = 'white'
}) => {
  const isBlack = theme === 'black';

  const [activeDeliverableId, setActiveDeliverableId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'ready' | 'draft' | 'linked' | 'standalone'>('all');
  
  // Modal for New Deliverable
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [delTitle, setDelTitle] = useState('');
  const [delNiche, setDelNiche] = useState('Geral');
  const [delFormat, setDelFormat] = useState('PDF Imprimível em Folha A4');
  const [delTopic, setDelTopic] = useState('');
  const [delAudience, setDelAudience] = useState('');
  const [delTone, setDelTone] = useState('Prático & Passo a Passo');
  const [pagesCount, setPagesCount] = useState<number>(8);
  const [selectedOfferId, setSelectedOfferId] = useState<string>('standalone');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const generateInGamma = true;
  const [gammaMessage, setGammaMessage] = useState('');
  const [exportingDelId, setExportingDelId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleExportPdf = async (del: Deliverable, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExportingDelId(del.id);
    try {
      const linkedOffer = offers.find(o => o.id === del.offerId);
      await exportDeliverableToPdf(del, {
        offerTitle: linkedOffer?.title
      });
      setToastMessage(`PDF de "${del.title}" exportado com sucesso!`);
      confetti({ particleCount: 50, spread: 65, origin: { y: 0.65 } });
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to export deliverable as PDF:', err);
      alert('Não foi possível gerar o arquivo PDF. Tente novamente.');
    } finally {
      setExportingDelId(null);
    }
  };

  const selectedDeliverable = deliverables.find(d => d.id === activeDeliverableId);

  // If a deliverable is selected, render DeliverableBuilder with back navigation
  if (selectedDeliverable) {
    const associatedOffer: Offer = offers.find(o => o.id === selectedDeliverable.offerId) || {
      id: selectedDeliverable.offerId || 'standalone',
      title: selectedDeliverable.title,
      niche: 'Geral',
      status: 'Aprovada',
      version: 1,
      lastModified: new Date().toISOString(),
      briefing: {
        productName: selectedDeliverable.title,
        productType: selectedDeliverable.format,
        targetAudience: 'Compradores qualificados',
        coreProblem: 'Solução prática de consumo imediato',
        price: 'R$ 27,90',
        regularPrice: 'R$ 97,00',
        niche: 'Geral'
      },
      promise: `Domine ${selectedDeliverable.title} com um método prático e direto ao ponto.`,
      mechanism: 'Manual Prático Ilustrado',
      benefits: ['Acesso imediato', 'Conteúdo 100% digital', 'Garantia de 7 dias'],
      bonuses: [],
      orderBump: { active: false, title: '', price: '', description: '' },
      upsell: { active: false, title: '', price: '', description: '' },
      faqs: []
    };

    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent">
        {/* Top return bar */}
        <div className={`px-6 py-3 border-b flex items-center justify-between shrink-0 transition-colors ${
          isBlack ? 'border-[#1C2030] bg-[#0E1017]' : 'border-[#E5E7EB] bg-white'
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveDeliverableId(null)}
              className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isBlack ? 'border-[#262B42] hover:bg-[#161826] text-neutral-300' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para Lista de Entregáveis</span>
            </button>
            <span className="text-xs text-neutral-400">|</span>
            <span className="text-xs font-bold text-neutral-900 dark:text-white truncate max-w-md">
              {selectedDeliverable.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportPdf(selectedDeliverable)}
              disabled={exportingDelId === selectedDeliverable.id}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                isBlack
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              title="Baixar entregável em PDF formatado"
            >
              {exportingDelId === selectedDeliverable.id ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Gerando PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar PDF</span>
                </>
              )}
            </button>

            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              selectedDeliverable.offerId && selectedDeliverable.offerId !== 'standalone'
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
            }`}>
              {selectedDeliverable.offerId && selectedDeliverable.offerId !== 'standalone'
                ? `Oferta: ${offers.find(o => o.id === selectedDeliverable.offerId)?.title.slice(0, 25) || 'Vinculada'}...`
                : 'Entregável Avulso'
              }
            </span>
          </div>
        </div>

        {/* Embedded DeliverableBuilder */}
        <div className="flex-1 overflow-hidden">
          <DeliverableBuilder
            offer={associatedOffer}
            deliverable={selectedDeliverable}
            onUpdateDeliverable={onUpdateDeliverable}
            creditsBalance={creditsBalance}
            theme={theme}
          />
        </div>
      </div>
    );
  }

  // Filter list
  const filteredDeliverables = deliverables.filter(d => {
    const matchesSearch = 
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.format && d.format.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (filterType === 'ready') return d.status === 'ready';
    if (filterType === 'draft') return d.status !== 'ready';
    if (filterType === 'linked') return d.offerId && d.offerId !== 'standalone';
    if (filterType === 'standalone') return !d.offerId || d.offerId === 'standalone';
    return true;
  });

  const handleCreateDeliverable = async () => {
    if (!delTitle.trim()) return;

    setIsGenerating(true);
    setErrorMessage('');
    setGammaMessage('');

    try {
      const linkedOffer = offers.find(o => o.id === selectedOfferId);
      const targetOffer: Offer = linkedOffer || {
        id: selectedOfferId,
        title: delTitle,
        promise: delTopic ? `Domine ${delTitle}: ${delTopic}` : `Aprenda e aplique tudo sobre ${delTitle}`,
        mechanism: delFormat.includes('Checklist') ? 'Protocolo de Ação e Checklists' : 'Guia Prático Passo a Passo',
        niche: delNiche || 'Geral',
        status: 'Aprovada',
        version: 1,
        lastModified: new Date().toISOString(),
        briefing: {
          productName: delTitle,
          productType: delFormat,
          targetAudience: delAudience || 'Profissionais e interessados',
          coreProblem: delTopic || 'Economia de tempo e material didático pronto',
          price: 'R$ 27,90',
          regularPrice: 'R$ 97,00',
          niche: delNiche || 'Geral'
        },
        benefits: ['Instruções diretas', 'Checklists imprimíveis', 'Conteúdo atualizado e aplicável'],
        bonuses: [],
        orderBump: { active: false, title: '', price: '', description: '' },
        upsell: { active: false, title: '', price: '', description: '' },
        faqs: []
      };

      const res = await api.generatePiece({
        offer: targetOffer,
        pieceId: `piece-${Date.now()}`,
        pieceCategory: 'main',
        pieceTitle: delTitle,
        pagesCount
      });

      const generatedPages: DeliverablePage[] = res?.pages?.length ? res.pages : [
        {
          pageNumber: 1,
          title: `${delTitle}: Capa Oficial & Guia de Aplicação`,
          subtitle: 'Arquivo Oficial Pronto para Estudo e Impressão Direta em Folha A4',
          content: 'Apresentação detalhada com passo a passo, método estruturado e instruções práticas para obtenção de resultados imediatos.'
        }
      ];

      const newDel: Deliverable = {
        id: `del-${Date.now()}`,
        offerId: selectedOfferId,
        offerTitle: selectedOfferId !== 'standalone' ? linkedOffer?.title : undefined,
        title: delTitle,
        format: delFormat,
        totalPages: generatedPages.length,
        status: 'ready',
        design: res?.design,
        chapters: [
          { id: 'c1', title: 'Capítulo 1: Fundamentos & Apresentação', content: 'Introdução e metodologia aplicada.' },
          { id: 'c2', title: 'Capítulo 2: Execução Prática', content: 'Passo a passo com exemplos reais e checklists.' }
        ],
        pieces: [
          {
            id: `piece-main-${Date.now()}`,
            category: 'main',
            title: delTitle,
            badge: 'Produto',
            pagesCount: generatedPages.length,
            status: 'ready',
            pages: generatedPages
          },
          {
            id: `piece-bonus-${Date.now()}`,
            category: 'bonus',
            title: `Checklist Rápido: 10 Passos para ${delTitle}`,
            badge: 'Bônus',
            pagesCount: 4,
            status: 'not_generated',
            pages: []
          }
        ]
      };

      onUpdateDeliverable(newDel);
      await api.saveDeliverable(newDel);

      if (generateInGamma) {
        setGammaMessage('Enviando o conteúdo para o Gamma...');
        const gammaStart = await api.generateGammaDeliverable(newDel);
        newDel.gammaGenerationId = gammaStart.generationId;
        await api.saveDeliverable(newDel);

        for (let attempt = 0; attempt < 60; attempt += 1) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          const gammaStatus = await api.getGammaGenerationStatus(gammaStart.generationId);
          if (gammaStatus.status === 'completed') {
            newDel.gammaUrl = gammaStatus.gammaUrl;
            newDel.gammaExportUrl = gammaStatus.exportUrl;
            await api.saveDeliverable(newDel);
            setGammaMessage('Entregável criado no Gamma com sucesso.');
            break;
          }
          if (gammaStatus.status === 'failed') {
            throw new Error(gammaStatus.error || 'O Gamma não conseguiu concluir o entregável.');
          }
          setGammaMessage(`Gerando no Gamma... tentativa ${attempt + 1}/60`);
        }
      }
      setIsModalOpen(false);
      setDelTitle('');
      setDelTopic('');
      setDelAudience('');
      setActiveDeliverableId(newDel.id);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      console.error('Failed to create deliverable:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Falha ao gerar entregável.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDuplicateDeliverable = async (del: Deliverable, e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicated: Deliverable = {
      ...del,
      id: `del-${Date.now()}`,
      title: `${del.title} (Cópia)`,
      offerId: 'standalone',
      offerTitle: undefined,
    };
    onUpdateDeliverable(duplicated);
    try {
      await api.saveDeliverable(duplicated);
    } catch (err) {
      console.error('Failed to duplicate deliverable:', err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Tem certeza que deseja excluir este entregável?')) return;
    if (onDeleteDeliverable) {
      onDeleteDeliverable(id);
    }
    try {
      await api.deleteDeliverable(id);
    } catch (err) {
      console.error('Failed to delete deliverable:', err);
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-8 select-none transition-colors ${
      isBlack ? 'bg-[#090A0F] text-[#E2E4E9]' : 'bg-[#F8F9FA] text-[#111827]'
    }`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${
            isBlack ? 'bg-white text-black' : 'bg-black text-white'
          }`}>
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold tracking-tight font-display ${
              isBlack ? 'text-white' : 'text-neutral-900'
            }`}>
              Entregáveis & Produtos Digitais
            </h1>
            <p className="text-xs text-neutral-500">
              Crie livros didáticos em PDF, checklists e kits para entregar após a compra.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer ${
            isBlack ? 'bg-white hover:bg-neutral-200 text-black' : 'bg-black hover:bg-neutral-800 text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
                  <span>Novo Entregável em PDF</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className={`flex items-center flex-wrap gap-1 p-1 rounded-full border transition-colors ${
          isBlack ? 'bg-[#12141F] border-[#202538]' : 'bg-[#ECEEF2] border-[#E2E4E9]'
        }`}>
          {[
            { id: 'all', label: 'Todos', count: deliverables.length },
            { id: 'ready', label: 'Prontos para PDF', count: deliverables.filter(d => d.status === 'ready').length },
            { id: 'draft', label: 'Rascunhos', count: deliverables.filter(d => d.status !== 'ready').length },
            { id: 'linked', label: 'Das Ofertas', count: deliverables.filter(d => d.offerId && d.offerId !== 'standalone').length },
            { id: 'standalone', label: 'Avulsos', count: deliverables.filter(d => !d.offerId || d.offerId === 'standalone').length },
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

        {/* Search Input */}
        <div className="relative min-w-[280px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar entregáveis por título ou formato..."
            className={`w-full pl-9 pr-4 py-1.5 rounded-xl border text-xs focus:outline-none transition-colors ${
              isBlack ? 'bg-[#10121C] border-[#22273D] text-white' : 'bg-white border-[#E5E7EB] text-neutral-900'
            }`}
          />
        </div>
      </div>

      {/* Deliverables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dashed "+ Criar Novo Entregável" Card */}
        <button
          onClick={() => setIsModalOpen(true)}
          className={`h-64 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all group cursor-pointer ${
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
          <span className={`text-sm font-bold block mb-1 ${
            isBlack ? 'text-white' : 'text-neutral-900'
          }`}>
            Criar Entregável em PDF
          </span>
          <span className={`text-xs max-w-xs ${
            isBlack ? 'text-neutral-400' : 'text-neutral-500'
          }`}>
            Gere materiais didáticos diagramados com capa, sumário e páginas práticas.
          </span>
        </button>

        {/* Existing Deliverables */}
        {filteredDeliverables.map(del => {
          const associatedOffer = offers.find(o => o.id === del.offerId);
          const isStandalone = !del.offerId || del.offerId === 'standalone';
          const pagesCount = del.totalPages || (del.pieces ? del.pieces.reduce((acc, p) => acc + (p.pages?.length || p.pagesCount || 0), 0) : 8) || 8;

          return (
            <div
              key={del.id}
              className={`ui-card-hover rounded-3xl border p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl relative group ${
                isBlack 
                  ? 'bg-[#10121C] border-[#1E2336] hover:border-[#2E3652] shadow-md' 
                  : 'bg-white border-[#E5E7EB] hover:border-neutral-300 shadow-xs'
              }`}
            >
              <div>
                {/* Badges bar */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    del.status === 'ready'
                      ? isBlack 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isBlack 
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {del.status === 'ready' ? 'Pronto para Download' : 'Rascunho'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border truncate max-w-[150px] ${
                      isStandalone
                        ? isBlack 
                          ? 'bg-purple-500/10 text-purple-300 border-purple-500/25' 
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                        : isBlack 
                          ? 'bg-blue-500/10 text-blue-300 border-blue-500/25' 
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                    title={isStandalone ? 'Entregável Avulso' : (associatedOffer?.title || 'Oferta Vinculada')}
                    >
                      {isStandalone ? 'Entregável Avulso' : `Oferta: ${associatedOffer?.title.slice(0, 14) || 'Vinculada'}...`}
                    </span>

                    {/* Quick duplicate / delete buttons */}
                    <button
                      onClick={(e) => handleDuplicateDeliverable(del, e)}
                      className={`p-1 rounded-lg transition-colors cursor-pointer ${
                        isBlack ? 'text-neutral-400 hover:text-white hover:bg-[#1C2030]' : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100'
                      }`}
                      title="Duplicar entregável"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(del.id, e)}
                      className={`p-1 rounded-lg transition-colors cursor-pointer ${
                        isBlack ? 'text-neutral-400 hover:text-red-400 hover:bg-red-500/10' : 'text-neutral-400 hover:text-red-600 hover:bg-red-50'
                      }`}
                      title="Excluir entregável"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Hero / Visual Document Header */}
                <div className={`my-3 p-3.5 rounded-2xl border flex items-center gap-3.5 transition-colors ${
                  isBlack ? 'bg-[#141724] border-[#22273D]' : 'bg-gradient-to-r from-neutral-50 to-neutral-100/60 border-neutral-200/80'
                }`}>
                  <div className={`w-12 h-14 rounded-xl border flex flex-col items-center justify-center shrink-0 shadow-xs relative overflow-hidden ${
                    isBlack ? 'bg-[#1C2032] border-[#2E3550] text-amber-400' : 'bg-white border-neutral-200 text-amber-500'
                  }`}>
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-indigo-500" />
                    <BookOpen className="w-5 h-5 mb-0.5" />
                    <span className="text-[8px] font-bold tracking-tighter uppercase font-mono opacity-80">A4 PDF</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                      isBlack ? 'text-neutral-400' : 'text-neutral-500'
                    }`}>
                      Formato: {del.format || 'E-book Passo a Passo'}
                    </span>
                    <h3 className={`min-h-[38px] font-bold text-base tracking-tight line-clamp-2 leading-snug ${
                      isBlack ? 'text-white' : 'text-neutral-900'
                    }`}
                    title={del.title}
                    >
                      {del.title || 'Entregável Sem Título'}
                    </h3>
                  </div>
                </div>

                {/* Metadata & Included Pieces */}
                <div className="space-y-2 mb-2">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className={`flex items-center gap-1.5 ${isBlack ? 'text-neutral-300' : 'text-neutral-700'}`}>
                      <FileText className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{pagesCount} páginas diagramadas</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                      isBlack ? 'bg-[#181B28] border-[#252A40] text-neutral-300' : 'bg-neutral-100 border-neutral-200 text-neutral-700'
                    }`}>
                      {del.pieces?.length || 1} {del.pieces?.length === 1 ? 'peça' : 'peças'}
                    </span>
                  </div>

                  {/* Piece title tags */}
                  {del.pieces && del.pieces.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {del.pieces.slice(0, 3).map((p, idx) => (
                        <span
                          key={p.id || idx}
                          className={`text-[10px] px-2 py-0.5 rounded-md border truncate max-w-[160px] ${
                            isBlack 
                              ? 'bg-[#161926] border-[#242A40] text-neutral-400' 
                              : 'bg-white border-neutral-200 text-neutral-600 shadow-2xs'
                          }`}
                          title={p.title}
                        >
                          {p.category === 'main' ? '★ ' : '• '}{p.title}
                        </span>
                      ))}
                      {del.pieces.length > 3 && (
                        <span className="text-[10px] text-neutral-400 self-center">
                          +{del.pieces.length - 3} mais
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`pt-3.5 mt-3 border-t flex items-center justify-between gap-2 ${
                isBlack ? 'border-[#1C2030]' : 'border-neutral-100'
              }`}>
                <button
                  onClick={() => setActiveDeliverableId(del.id)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                    isBlack
                      ? 'bg-white hover:bg-neutral-200 text-black'
                      : 'bg-black hover:bg-neutral-800 text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Ver & Editar</span>
                </button>

                <button
                  onClick={(e) => handleExportPdf(del, e)}
                  disabled={exportingDelId === del.id}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 ${
                    isBlack
                      ? 'border-[#272D44] bg-[#141624] hover:bg-[#1C2034] text-neutral-200 hover:text-white'
                      : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 hover:text-neutral-900'
                  }`}
                  title="Exportar como PDF formatado"
                >
                  {exportingDelId === del.id ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
                      <span>Gerando...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-blue-500" />
                      <span>Baixar PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating success toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Modal: Novo Entregável */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 space-y-4 ${
            isBlack ? 'bg-[#10121C] border-[#22273D] text-white' : 'bg-white border-[#E5E7EB] text-neutral-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
                </div>
                <div>
                  <h3 className="font-bold text-sm">Criar Novo Entregável</h3>
                  <p className="text-[11px] text-neutral-400">Diagramação didática pronta para exportar em PDF</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-xs text-red-600 dark:text-red-400">
                {errorMessage}
              </div>
            )}

            {gammaMessage && (
              <div className="p-2.5 rounded-xl border border-violet-500/20 bg-violet-500/10 text-xs text-violet-700 dark:text-violet-300">
                {gammaMessage}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Título do Produto Digital *</label>
                <input
                  type="text"
                  value={delTitle}
                  onChange={(e) => setDelTitle(e.target.value)}
                  placeholder="Ex: Manual de Aplicação Prática, Guia de Sobrancelhas Fio a Fio..."
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none ${
                    isBlack ? 'bg-[#181B2A] border-[#292F47] text-white' : 'bg-neutral-50 border-neutral-300'
                  }`}
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Tema Central & Objetivo do Conteúdo</label>
                <textarea
                  value={delTopic}
                  onChange={(e) => setDelTopic(e.target.value)}
                  placeholder="Descreva o que o leitor vai aprender, o método a ser ensinado ou os exercícios inclusos..."
                  rows={2}
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none resize-none ${
                    isBlack ? 'bg-[#181B2A] border-[#292F47] text-white' : 'bg-neutral-50 border-neutral-300'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Nicho / Área</label>
                  <input
                    type="text"
                    value={delNiche}
                    onChange={(e) => setDelNiche(e.target.value)}
                    placeholder="Ex: Beleza, Saúde, Negócios, Educação..."
                    className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none ${
                      isBlack ? 'bg-[#181B2A] border-[#292F47] text-white' : 'bg-neutral-50 border-neutral-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Público-Alvo</label>
                  <input
                    type="text"
                    value={delAudience}
                    onChange={(e) => setDelAudience(e.target.value)}
                    placeholder="Ex: Mulheres iniciantes, Estudantes..."
                    className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none ${
                      isBlack ? 'bg-[#181B2A] border-[#292F47] text-white' : 'bg-neutral-50 border-neutral-300'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Formato</label>
                  <select
                    value={delFormat}
                    onChange={(e) => setDelFormat(e.target.value)}
                    className={`w-full p-2 rounded-xl border text-xs focus:outline-none ${
                      isBlack ? 'bg-[#181B2A] border-[#292F47] text-white' : 'bg-neutral-50 border-neutral-300'
                    }`}
                  >
                    <option value="PDF Imprimível em Folha A4">PDF Imprimível em Folha A4</option>
                    <option value="E-book Passo a Passo">E-book Passo a Passo</option>
                    <option value="Checklist & Fichas Técnicas">Checklist & Fichas Técnicas</option>
                    <option value="Pack de Modelos e Templates">Pack de Modelos</option>
                    <option value="Workbook de Exercícios">Workbook de Exercícios</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Vincular a Oferta</label>
                  <select
                    value={selectedOfferId}
                    onChange={(e) => {
                      setSelectedOfferId(e.target.value);
                      if (e.target.value !== 'standalone') {
                        const ofr = offers.find(o => o.id === e.target.value);
                        if (ofr) {
                          if (!delTitle) setDelTitle(ofr.title);
                          if (!delNiche) setDelNiche(ofr.niche || 'Geral');
                          if (!delAudience) setDelAudience(ofr.briefing?.targetAudience || '');
                        }
                      }
                    }}
                    className={`w-full p-2 rounded-xl border text-xs focus:outline-none ${
                      isBlack ? 'bg-[#181B2A] border-[#292F47] text-white' : 'bg-neutral-50 border-neutral-300'
                    }`}
                  >
                    <option value="standalone">Nenhuma (Entregável Avulso)</option>
                    {offers.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.title.slice(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Tom & Profundidade</label>
                <select
                  value={delTone}
                  onChange={(e) => setDelTone(e.target.value)}
                  className={`w-full p-2 rounded-xl border text-xs focus:outline-none ${
                    isBlack ? 'bg-[#181B2A] border-[#292F47] text-white' : 'bg-neutral-50 border-neutral-300'
                  }`}
                >
                  <option value="Prático & Passo a Passo">Prático & Passo a Passo (Mais recomendado)</option>
                  <option value="Didático para Iniciantes">Didático para Iniciantes (Linguagem simples)</option>
                  <option value="Técnico & Aprofundado">Técnico & Aprofundado (Profissional)</option>
                  <option value="Checklist & Fichas de Aplicação">Checklist & Fichas de Aplicação Rápida</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Número de Páginas Ilustradas a Gerar</label>
                <div className="flex items-center gap-2">
                  {[4, 6, 8, 12, 16].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPagesCount(n)}
                      className={`flex-1 py-1.5 rounded-xl border font-bold text-xs cursor-pointer ${
                        pagesCount === n
                          ? isBlack ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                          : isBlack ? 'border-[#292F47] text-neutral-400' : 'border-neutral-300 text-neutral-600'
                      }`}
                    >
                      {n} Pág.
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={`rounded-xl border p-3 text-xs ${
              isBlack ? 'border-[#292F47] bg-[#181B2A] text-neutral-300' : 'border-neutral-200 bg-neutral-50 text-neutral-700'
            }`}>
              <strong>PDF gerado exclusivamente no Gamma</strong>
              <span className="block mt-0.5 text-[11px] opacity-70">O conteúdo será enviado ao Gamma automaticamente para diagramação e exportação.</span>
            </div>

            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-500 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateDeliverable}
                disabled={isGenerating || !delTitle.trim()}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                  isBlack ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                }`}
              >
                {isGenerating ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Gerando Entregável Real...</span>
                  </>
                ) : (
                  <>
                    <span>Gerar Entregável</span>
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
