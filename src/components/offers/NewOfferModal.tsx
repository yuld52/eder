import React, { useState, useEffect } from 'react';
import { 
  X, 
  RotateCw, 
  ArrowLeft, 
  ArrowRight, 
  Zap, 
  HelpCircle,
  FileText,
  Link as LinkIcon,
  Layers,
  ChevronDown,
  Check
} from 'lucide-react';
import { Offer, OfferBriefing } from '../../types';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';
import { CountryFlag } from '../common/CountryFlag';

interface NewOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOfferCreated: (newOffer: Offer) => void;
  creditsBalance: number;
  initialBriefing?: Partial<OfferBriefing>;
}

export const NewOfferModal: React.FC<NewOfferModalProps> = ({
  isOpen,
  onClose,
  onOfferCreated,
  creditsBalance,
  initialBriefing
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [sourceType, setSourceType] = useState<'prompt' | 'link' | 'docs'>('prompt');
  
  // Step 1 Form Data
  const [promptText, setPromptText] = useState('');
  const [documentNames, setDocumentNames] = useState<string[]>([]);
  const [isExtractingDocuments, setIsExtractingDocuments] = useState(false);
  const [documentError, setDocumentError] = useState('');
  const [pageUrl, setPageUrl] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [isReadingPage, setIsReadingPage] = useState(false);
  const [pageError, setPageError] = useState('');
  const [targetMarket, setTargetMarket] = useState('Brasil • Português, R$');
  const [isTargetMarketOpen, setIsTargetMarketOpen] = useState(false);
  const [customPrice, setCustomPrice] = useState('');
  const [improvements, setImprovements] = useState('');
  const [continueMode, setContinueMode] = useState<'auto' | 'ask'>('ask');
  const [variationsCount, setVariationsCount] = useState<number>(1);
  const [isBuildingOffer, setIsBuildingOffer] = useState(false);
  const [aiError, setAiError] = useState('');

  // Step 2 Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    titleBadge: string;
    nicheBadge: string;
    summary: string;
    preliminaryAudience: string;
    hasAmbiguities: boolean;
  } | null>(null);
  const [generatedData, setGeneratedData] = useState<any>(null);

  const handleSelectSource = (source: 'prompt' | 'link' | 'docs') => {
    setSourceType(source);
    setPromptText('');
    setDocumentNames([]);
    setDocumentError('');
    setPageTitle('');
    setPageError('');
    setPageUrl('');
  };

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsAnalyzing(false);
      setAnalysisResult(null);
      setGeneratedData(null);
      setAiError('');
      setDocumentNames([]);
      setDocumentError('');
      setIsExtractingDocuments(false);
      setPageUrl('');
      setPageTitle('');
      setIsReadingPage(false);
      setPageError('');

      const briefingLines = [
        initialBriefing?.productName && `Produto ou ideia: ${initialBriefing.productName}`,
        initialBriefing?.productType && `Tipo: ${initialBriefing.productType}`,
        initialBriefing?.targetAudience && `Público: ${initialBriefing.targetAudience}`,
        initialBriefing?.coreProblem && `Problema que resolve: ${initialBriefing.coreProblem}`,
        initialBriefing?.niche && `Tema ou nicho: ${initialBriefing.niche}`,
        initialBriefing?.price && `Preço definido: ${initialBriefing.price}`,
        initialBriefing?.regularPrice && `Preço regular: ${initialBriefing.regularPrice}`
      ].filter(Boolean);
      setPromptText(briefingLines.join('\n'));
      setCustomPrice(initialBriefing?.price || '');
    }
  }, [isOpen, initialBriefing]);

  if (!isOpen) return null;

  const handleReadPage = async () => {
    if (!pageUrl.trim()) {
      setPageError('Informe o endereço da página que deseja analisar.');
      return;
    }

    setIsReadingPage(true);
    setPageError('');
    setPageTitle('');
    try {
      const page = await api.extractOfferPage(pageUrl.trim());
      setPageUrl(page.url);
      setPageTitle(page.title);
      setPromptText(`Página analisada: ${page.title}\nURL: ${page.url}\n\n${page.text}`);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Não foi possível ler essa página.');
    } finally {
      setIsReadingPage(false);
    }
  };

  const handleDocumentSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.currentTarget.files || []);
    event.currentTarget.value = '';
    if (selectedFiles.length === 0) return;

    if (selectedFiles.length > 5) {
      setDocumentError('Selecione no máximo 5 arquivos por vez.');
      return;
    }

    const totalBytes = selectedFiles.reduce((total, file) => total + file.size, 0);
    if (totalBytes > 15 * 1024 * 1024) {
      setDocumentError('O tamanho total dos arquivos não pode exceder 15 MB.');
      return;
    }

    setIsExtractingDocuments(true);
    setDocumentError('');
    try {
      const documents = await Promise.all(selectedFiles.map(async file => {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => typeof reader.result === 'string'
            ? resolve(reader.result)
            : reject(new Error(`Não foi possível ler ${file.name}.`));
          reader.onerror = () => reject(new Error(`Não foi possível ler ${file.name}.`));
          reader.readAsDataURL(file);
        });
        const contentBase64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
        return { name: file.name, contentBase64 };
      }));

      const extracted = await api.extractOfferDocuments(documents);
      setPromptText(extracted.text);
      setDocumentNames(extracted.filenames);
    } catch (error) {
      setDocumentError(error instanceof Error ? error.message : 'Não foi possível ler os arquivos selecionados.');
    } finally {
      setIsExtractingDocuments(false);
    }
  };

  // Analyze the briefing with Gemini before moving to Step 2.
  const handleProceedToStep2 = async () => {
    if (!promptText.trim() || isExtractingDocuments) return;

    setStep(2);
    setIsAnalyzing(true);
    setAiError('');

    try {
      const result = await api.analyzeBriefing({
        promptText,
        targetMarket,
        customPrice,
        improvements,
        sourceType
      });

      if (result) {
        setGeneratedData(result);
        setAnalysisResult({
          titleBadge: result.titleBadge || promptText.slice(0, 25).toUpperCase(),
          nicheBadge: result.nicheBadge || 'Produtos Digitais',
          summary: result.summary,
          preliminaryAudience: result.preliminaryAudience,
          hasAmbiguities: false
        });
      }
    } catch (err) {
      console.error('Error analyzing briefing with Gemini:', err);
      setAnalysisResult(null);
      setAiError(err instanceof Error ? err.message : 'A análise com Gemini falhou. Revise o briefing e tente novamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Build Full Offer and finalize
  const handleBuildCompleteOffer = (generatedOverride?: any) => {
    const rawTitle = generatedOverride?.title?.trim() || generatedData?.formattedTitle || generatedData?.titleBadge || (promptText.trim().length > 0 ? (promptText.length > 55 ? promptText.slice(0, 55) + '...' : promptText) : 'Nova Oferta Digital Validada');
    const formattedTitle = rawTitle.replace(/^["']|["']$/g, '').trim();

    const currentPrice = customPrice ? (customPrice.startsWith('R$') ? customPrice : `R$ ${customPrice}`) : (generatedData?.priceGuarantee?.frontendPrice ? (generatedData.priceGuarantee.frontendPrice.startsWith('R$') ? generatedData.priceGuarantee.frontendPrice : `R$ ${generatedData.priceGuarantee.frontendPrice}`) : 'R$ 27,90');
    const rawNumberPrice = currentPrice.replace(/[^0-9,.]/g, '').trim() || '27,90';

    const niche = generatedData?.nicheBadge || analysisResult?.nicheBadge || 'Produtos Digitais';
    const promise = generatedOverride?.promise || generatedData?.promise || `Alcance resultados práticos e comprovados com ${formattedTitle} em tempo recorde e sem complicações.`;
    const mechanism = generatedOverride?.mechanism || generatedData?.mechanism || `Método ${formattedTitle.split(' ')[0] || 'Acelerador'} de Aplicação Direta`;

    const avatar = generatedData?.avatar || {
      ageRange: '25-45',
      incomeProfile: 'Classe B/C',
      behavior: 'Profissional ou consumidor focado em soluções práticas, imediatas e sem perda de tempo.',
      purchaseTrigger: 'A necessidade de resolver um problema específico com segurança, rapidez e custo acessível.',
      mainPain: `Dificuldade e perda de tempo tentando organizar ou executar ${formattedTitle} do zero sem orientação.`,
      mainDesire: `Dominar o processo com agilidade e ver os resultados acontecerem de forma consistente.`
    };

    const kitComposition = generatedData?.kitComposition || {
      format: 'Pack de modelos, guias e templates digitais em PDF',
      referenceUrl: '',
      items: [
        `Guia completo de execução do ${formattedTitle} em PDF`,
        'Modelos e templates práticos 100% prontos para usar',
        'Checklist de implementação acelerada'
      ]
    };

    const priceGuarantee = generatedData?.priceGuarantee || {
      frontendPrice: rawNumberPrice,
      justification: `Preço estratégico de entrada para maximizar o volume de compradores e alimentar a esteira de produtos.`
    };

    const orderBumpsList = generatedData?.orderBumpsList || [
      {
        id: 'ob-1',
        title: `Checklist & Planilha de Apoio Exclusiva para ${formattedTitle}`,
        price: 9.9,
        takeRate: 35,
        impact: 3.46
      }
    ];

    const upsellsList = generatedData?.upsellsList || [
      {
        id: 'up-1',
        title: `Acesso VIP: Acervo Master com Atualizações Contínuas`,
        description: `Receba todas as atualizações futuras e versões estendidas sem custo adicional.`,
        price: 47.0,
        takeRate: 35,
        impact: 16.45
      }
    ];

    const copyOverview = generatedData?.copyOverview || {
      headline: `Descubra Como Obter Resultados Concretos Com ${formattedTitle}`,
      subheadline: `O passo a passo direto ao ponto para conquistar seus objetivos de forma simples, rápida e validada.`,
      ctaText: `Quero Acesso Imediato Agora Por Apenas ${currentPrice}!`,
      benefits: [
        `Acesso imediato e vitalício a todo o material de ${formattedTitle}.`,
        'Conteúdo 100% digital e pronto para colocar em prática hoje mesmo.',
        'Economize horas de esforço com modelos validados e diretos ao ponto.',
        'Garantia incondicional de 7 dias com devolução integral se não amar.'
      ],
      painAgitation: `Você se esforça e gasta tempo, mas muitas vezes fica travado por falta de um método simples e estruturado para seguir.`,
      solutionPresentation: `${formattedTitle} foi desenvolvido especialmente para eliminar as incertezas e entregar um roteiro pronto para executar.`,
      socialProofNote: 'Validação comprovada e depoimentos práticos de usuários.',
      sampleTestimonials: [
        {
          author: 'Mariana S.',
          role: 'Cliente Verificada',
          quote: 'Material direto ao ponto e sem enrolação. Consegui aplicar no mesmo dia!'
        }
      ]
    };

    const benefits = generatedOverride?.benefits || generatedData?.copyOverview?.benefits || [
      `Acesso imediato e vitalício a todo o material de ${formattedTitle}.`,
      'Conteúdo 100% digital e pronto para colocar em prática hoje mesmo.',
      'Economize dezenas de horas com modelos validados e diretos ao ponto.',
      'Garantia incondicional de 7 dias com risco zero.'
    ];

    const bonuses = generatedOverride?.bonuses || generatedData?.bonuses || [
      {
        title: 'Bônus 1: Checklist de Implementação Rápida',
        value: 'R$ 27,00',
        description: 'Roteiro visual passo a passo para acelerar a execução.'
      },
      {
        title: 'Bônus 2: Guia de Resolução de Erros Comuns',
        value: 'R$ 19,00',
        description: 'As principais dúvidas e armadilhas respondidas de forma simples.'
      }
    ];

    const firstBump = orderBumpsList[0];
    const orderBump = generatedOverride?.orderBump || {
      active: true,
      title: firstBump?.title || `Checklist de Implementação Acelerada para ${formattedTitle}`,
      price: typeof firstBump?.price === 'number' ? `R$ ${firstBump.price.toFixed(2).replace('.', ',')}` : (firstBump?.price || 'R$ 9,90'),
      description: 'Marque a caixinha acima para incluir este complemento prático por uma fração do preço.'
    };

    const firstUpsell = upsellsList[0];
    const upsell = generatedOverride?.upsell || {
      active: true,
      title: firstUpsell?.title || 'Upgrade para o Pacote Master VIP',
      price: typeof firstUpsell?.price === 'number' ? `R$ ${firstUpsell.price.toFixed(2).replace('.', ',')}` : (firstUpsell?.price || 'R$ 47,00'),
      description: firstUpsell?.description || 'Receba o acervo estendido completo com desconto exclusivo.'
    };

    const faqs = generatedOverride?.faqs || generatedData?.faqs || [
      {
        question: 'Como recebo o acesso ao material?',
        answer: 'O envio é imediato! Assim que o pagamento for aprovado, você recebe as credenciais e links de download por e-mail e WhatsApp.'
      },
      {
        question: 'Qual é a garantia?',
        answer: 'Você conta com 7 dias de garantia incondicional. Se não gostar do conteúdo, devolvemos 100% do seu dinheiro com apenas um clique.'
      },
      {
        question: 'Preciso de conhecimento prévio para aplicar?',
        answer: 'Não! O conteúdo foi desenvolvido do zero ao prático, para qualquer pessoa aplicar facilmente.'
      }
    ];

    const newOffer: Offer = {
      id: `offer-${Date.now()}`,
      title: formattedTitle,
      niche,
      status: 'Aprovada',
      businessType: 'B2C',
      targetMarket: targetMarket || 'Brasil • Português, R$',
      version: 1,
      lastModified: new Date().toISOString(),
      briefing: {
        productName: formattedTitle,
        productType: kitComposition.format,
        targetAudience: generatedData?.preliminaryAudience || analysisResult?.preliminaryAudience || avatar.behavior,
        coreProblem: avatar.mainPain,
        price: currentPrice,
        regularPrice: 'R$ 67,90',
        niche
      },
      promise,
      mechanism,
      avatar,
      kitComposition,
      priceGuarantee,
      orderBumpsList,
      upsellsList,
      copyOverview,
      benefits,
      bonuses,
      orderBump,
      upsell,
      faqs,
      pageDesign: generatedData?.pageDesign,
      pageTheme: generatedData?.pageDesign?.theme
    };

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    onOfferCreated(newOffer);
    onClose();
  };

  const handleBuildOfferWithAi = async () => {
    setIsBuildingOffer(true);
    setAiError('');
    try {
      if (generatedData) {
        try {
          const generated = await api.generateOffer({
            productName: generatedData.formattedTitle || promptText.slice(0, 80),
            productType: generatedData.kitComposition?.format || '',
            targetAudience: generatedData.preliminaryAudience || '',
            coreProblem: generatedData.avatar?.mainPain || '',
            price: customPrice || generatedData.priceGuarantee?.frontendPrice || '',
            regularPrice: generatedData.priceGuarantee?.regularPrice || '',
            competitorUrl: generatedData.kitComposition?.referenceUrl || undefined,
            niche: generatedData.nicheBadge || ''
          });

          if (generated?.title?.trim() && generated?.promise?.trim()) {
            handleBuildCompleteOffer(generated);
            return;
          }
        } catch (innerErr) {
          console.warn('api.generateOffer optional step had error, using analyzed data directly:', innerErr);
        }
      }

      // If generateOffer had any issue or analysis is already complete, build seamlessly
      handleBuildCompleteOffer();
    } catch (err) {
      console.error('Offer creation error:', err);
      // Even on outer error, build from current inputs so user is never blocked
      handleBuildCompleteOffer();
    } finally {
      setIsBuildingOffer(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white text-neutral-900 rounded-3xl w-full max-w-2xl border border-neutral-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Step 1: "Construir oferta" */}
        {step === 1 && (
          <>
            {/* Header */}
            <div className="p-6 pb-4 border-b border-neutral-100 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-5 h-5 text-neutral-700" />
                  <h2 className="text-xl font-bold tracking-tight text-neutral-900 font-display">
                    Construir oferta
                  </h2>
                </div>
                <p className="text-xs text-neutral-500">
                  Escolha a fonte e descreva a oferta com o que você já souber.
                </p>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* How do you want to build this offer? */}
              <div>
                <label className="block font-bold text-neutral-800 mb-2">
                  Como você quer construir essa oferta?
                </label>
                <div className="flex items-center gap-2 p-1 bg-neutral-100 rounded-xl mb-3">
                  <button
                    type="button"
                    onClick={() => handleSelectSource('prompt')}
                    className={`flex-1 py-1.5 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      sourceType === 'prompt' ? 'bg-white shadow-xs text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    <span>✏️ Prompt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectSource('link')}
                    className={`flex-1 py-1.5 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      sourceType === 'link' ? 'bg-white shadow-xs text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    <span>🔗 Link de Página</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectSource('docs')}
                    className={`flex-1 py-1.5 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      sourceType === 'docs' ? 'bg-white shadow-xs text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    <span>📄 PDFs ou Docs</span>
                  </button>
                </div>

                {sourceType === 'link' && (
                  <div className="mb-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                    <label className="mb-2 block font-semibold text-neutral-800" htmlFor="offer-page-url">
                      Link da página de vendas
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="offer-page-url"
                        type="url"
                        inputMode="url"
                        autoComplete="url"
                        value={pageUrl}
                        onChange={(event) => {
                          setPageUrl(event.target.value);
                          setPageError('');
                          setPageTitle('');
                          setPromptText('');
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            void handleReadPage();
                          }
                        }}
                        placeholder="https://exemplo.com/pagina-de-vendas"
                        className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 outline-none focus:border-neutral-900"
                      />
                      <button
                        type="button"
                        onClick={() => void handleReadPage()}
                        disabled={isReadingPage || !pageUrl.trim()}
                        className="shrink-0 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
                      >
                        {isReadingPage ? 'Lendo...' : 'Ler página'}
                      </button>
                    </div>
                    <p className="mt-2 text-[11px] text-neutral-500">
                      Lemos o texto público da página para preparar o briefing. Páginas privadas, protegidas ou que bloqueiam leitura podem não funcionar.
                    </p>
                    {isReadingPage && (
                      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-neutral-600" role="status">
                        <RotateCw className="h-3.5 w-3.5 animate-spin" />
                        Extraindo o conteúdo da página...
                      </p>
                    )}
                    {pageTitle && !isReadingPage && (
                      <p className="mt-2 text-[11px] text-emerald-700" role="status">
                        Página lida: {pageTitle}
                      </p>
                    )}
                    {pageError && <p className="mt-2 text-[11px] text-red-600" role="alert">{pageError}</p>}
                  </div>
                )}

                {sourceType === 'docs' && (
                  <div className="mb-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4">
                    <label className="block font-semibold text-neutral-800 mb-2" htmlFor="offer-documents">
                      Envie documentos para extrair o briefing
                    </label>
                    <input
                      id="offer-documents"
                      type="file"
                      multiple
                      accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
                      onChange={handleDocumentSelection}
                      disabled={isExtractingDocuments}
                      className="block w-full text-xs text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-neutral-700 disabled:opacity-50"
                    />
                    <p className="mt-2 text-[11px] text-neutral-500">
                      PDF, DOCX, TXT ou MD · até 5 arquivos e 15 MB no total. PDFs digitalizados como imagem precisam de OCR.
                    </p>
                    {isExtractingDocuments && (
                      <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-neutral-600" role="status">
                        <RotateCw className="h-3.5 w-3.5 animate-spin" />
                        Lendo os documentos...
                      </p>
                    )}
                    {documentNames.length > 0 && !isExtractingDocuments && (
                      <p className="mt-2 text-[11px] text-emerald-700" role="status">
                        Documentos lidos: {documentNames.join(', ')}
                      </p>
                    )}
                    {documentError && (
                      <p className="mt-2 text-[11px] text-red-600" role="alert">{documentError}</p>
                    )}
                  </div>
                )}

                <div className="relative">
                  <label className="mb-1.5 block font-semibold text-neutral-700">
                    {sourceType === 'link'
                      ? 'Conteúdo extraído da página'
                      : sourceType === 'docs'
                          ? 'Briefing extraído dos documentos'
                          : 'Descreva o produto ou a ideia'}
                  </label>
                  <textarea
                    rows={4}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder={
                      sourceType === 'docs'
                        ? 'O texto extraído aparecerá aqui. Você também pode complementar ou editar o briefing.'
                        : sourceType === 'link'
                          ? 'Depois de ler a página, o texto extraído aparecerá aqui. Você pode revisar ou complementar.'
                            : 'Ex.: "Consultoria de organização financeira pessoal. Plano básico R$97, plano completo R$297 com acompanhamento mensal." Descreva o produto, preço e pra quem é.'
                    }
                    className="w-full p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50/60 text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-neutral-900 outline-none transition-all leading-relaxed"
                  />
                  <div className="flex justify-end gap-1.5 mt-1.5">
                    {sourceType === 'prompt' && (
                      <button
                        type="button"
                        onClick={() => setPromptText('Kit de atividades digitais "Passa ou Repassa Bíblico" com 70 perguntas bíblicas prontas para imprimir, com versões para público evangélico e católico. Preço R$ 10,90 (Básico com 20 perguntas) e R$ 27,90 (Premium com 70 perguntas + 8 jogos bônus). Público: professores de EBD e pais cristãos.')}
                        className="text-[11px] text-neutral-500 hover:text-neutral-900 font-semibold underline underline-offset-2"
                      >
                        Preencher com Passa ou Repassa Bíblico
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Pra quem você vai vender? */}
              <div>
                <label className="block font-bold text-neutral-800 mb-1.5">
                  Pra quem você vai vender?
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsTargetMarketOpen(prev => !prev)}
                    className="w-full p-3 rounded-xl border border-neutral-200 bg-white text-neutral-800 font-medium flex items-center justify-between outline-none"
                  >
                    <span className="flex items-center gap-2">
                      <CountryFlag country={targetMarket} />
                      <span>{targetMarket}</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isTargetMarketOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isTargetMarketOpen && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-neutral-200 bg-white p-1 shadow-xl">
                      {[
                        'Brasil • Português, R$',
                        'Estados Unidos • Inglês, US$',
                        'Espanha e Latam • Espanhol, € / US$',
                        'Portugal • Português (PT), €'
                      ].map((market) => (
                        <button
                          key={market}
                          type="button"
                          onClick={() => {
                            setTargetMarket(market);
                            setIsTargetMarketOpen(false);
                          }}
                          className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-neutral-800 hover:bg-neutral-100"
                        >
                          <span className="flex items-center gap-2">
                            <CountryFlag country={market} />
                            <span>{market}</span>
                          </span>
                          {targetMarket === market && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Português do Brasil, cobrando em real.
                </p>
              </div>

              {/* Qual valor dessa oferta? and Quer melhorar algo? */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <label className="font-bold text-neutral-800">Qual valor dessa oferta?</label>
                    <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                      OPCIONAL
                    </span>
                  </div>
                  <input
                    type="text"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="Deixe em branco pra sugerir um va..."
                    className="w-full p-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder-neutral-400 outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <label className="font-bold text-neutral-800">Quer melhorar algo?</label>
                    <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                      OPCIONAL
                    </span>
                  </div>
                  <input
                    type="text"
                    value={improvements}
                    onChange={(e) => setImprovements(e.target.value)}
                    placeholder="Ex.: foco em quem presta serviço, nã..."
                    className="w-full p-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder-neutral-400 outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              {/* Como você quer continuar? */}
              <div>
                <label className="block font-bold text-neutral-800 mb-2">
                  Como você quer continuar?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setContinueMode('auto')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      continueMode === 'auto'
                        ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                        <span>Automático</span>
                      </span>
                      <input
                        type="radio"
                        checked={continueMode === 'auto'}
                        onChange={() => setContinueMode('auto')}
                        className="accent-black"
                      />
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      Cria todos os módulos direto sem etapas intermediárias.
                    </p>
                  </div>

                  <div
                    onClick={() => setContinueMode('ask')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      continueMode === 'ask'
                        ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-neutral-900">Responder perguntas</span>
                        <span className="text-[9px] font-bold bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded uppercase">
                          RECOMENDADO
                        </span>
                      </div>
                      <input
                        type="radio"
                        checked={continueMode === 'ask'}
                        onChange={() => setContinueMode('ask')}
                        className="accent-black"
                      />
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      Primeiro mostra o que já entendeu, e só pergunta o que for realmente ambíguo antes de construir.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quantas variações dessa oferta você quer comparar? */}
              <div className="flex items-center justify-between pt-2">
                <span className="font-medium text-neutral-700">
                  Quantas variações dessa oferta você quer comparar?
                </span>
                <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setVariationsCount(num)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        variationsCount === num ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 px-6 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                <Zap className="w-3.5 h-3.5 text-neutral-700" />
                <span>Não gasta tokens</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleProceedToStep2}
                  disabled={
                    !promptText.trim() ||
                    isExtractingDocuments ||
                    isReadingPage ||
                    (sourceType === 'link' && !pageTitle)
                  }
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-black text-white shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Step 2: "O que já entendemos até agora" (Image 2 & 4) */}
        {step === 2 && (
          <>
            {/* Header */}
            <div className="p-6 pb-4 border-b border-neutral-100 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <HelpCircle className="w-5 h-5 text-neutral-700" />
                  <h2 className="text-xl font-bold tracking-tight text-neutral-900 font-display">
                    O que já entendemos até agora
                  </h2>
                </div>
                <p className="text-xs text-neutral-500">
                  Confira o entendimento e resolva só o que for ambíguo de verdade.
                </p>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {aiError && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                  {aiError}
                </div>
              )}
              {isAnalyzing ? (
                <div className="min-h-[260px] flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <RotateCw className="w-6 h-6 animate-spin text-neutral-700" />
                  <p className="text-neutral-500 text-xs font-medium">
                    Lendo o material antes de perguntar qualquer coisa...
                  </p>
                </div>
              ) : (
                analysisResult && (
                  <div className="space-y-4">
                    {/* Synthesis Container Card matching Image 4 */}
                    <div className="p-5 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 space-y-4">
                      {/* Top Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-full bg-black text-white font-bold text-[11px] uppercase tracking-wider">
                          {analysisResult.titleBadge}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-neutral-200 text-neutral-700 font-medium text-[11px]">
                          {analysisResult.nicheBadge}
                        </span>
                      </div>

                      {/* Main Paragraph */}
                      <p className="text-neutral-700 text-xs leading-relaxed font-normal">
                        {analysisResult.summary}
                      </p>

                      {/* Preliminary Audience Section */}
                      <div className="pt-2 border-t border-neutral-200/60">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">
                          👤 PÚBLICO (PRELIMINAR)
                        </span>
                        <p className="text-neutral-800 text-xs leading-relaxed">
                          {analysisResult.preliminaryAudience}
                        </p>
                      </div>
                    </div>

                    {/* No Doubts Notice Box */}
                    <div className="p-3.5 rounded-xl border border-neutral-200 bg-white text-center text-neutral-600 font-medium text-xs">
                      Sem dúvidas reais além do que já está acima. Pode seguir direto pra construção.
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Footer */}
            <div className="p-4 px-6 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar</span>
              </button>

              <button
                type="button"
                onClick={handleBuildOfferWithAi}
                disabled={isAnalyzing || isBuildingOffer}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-black text-white shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isBuildingOffer ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                <span>{isBuildingOffer ? 'Gerando oferta...' : 'Construir oferta completa'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
