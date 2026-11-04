import React, { useEffect, useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ThumbsUp, 
  X, 
  Trash2, 
  ArrowRight, 
  User, 
  Store, 
  Check, 
  Copy, 
  RotateCw, 
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Link as LinkIcon,
  ShoppingBag,
  TrendingUp,
  Flame,
  CheckCircle2,
  Undo2,
  Sun,
  Moon
} from 'lucide-react';
import { OfferBriefing, SeasonalEventContext } from '../../types';
import { api } from '../../services/api';
import { CountryFlag } from '../common/CountryFlag';
import confetti from 'canvas-confetti';

export interface SeasonalIdeaCard {
  id: string;
  title: string;
  country?: 'Brasil' | 'Moçambique' | 'Espanha' | 'Portugal';
  countryFlag?: string;
  audienceType: 'b2c' | 'b2b';
  audienceLabel: string;
  eventDate: string;
  eventName: string;
  month: string;
  targetAudience: string;
  description: string;
  priceRange: string;
  suggestedPrice: string;
  regularPrice: string;
  orderBump: string;
  hook: string;
  productType: string;
  whyItConverts: string;
  status: 'new' | 'approved' | 'archived';
  createdAt: string;
  expiresAt: string;
}

interface SeasonalCalendarProps {
  onCreateOfferFromSeasonality: (briefing: Partial<OfferBriefing>, title: string) => void;
  initialEvent?: SeasonalEventContext | null;
  onInitialEventHandled?: () => void;
  creditsBalance?: number;
  onCreditsUsed?: (amount: number, action: string) => void;
  theme?: 'black' | 'white';
  onToggleTheme?: () => void;
}

// Available Dates for the Modal (including Brasil, Moçambique, Espanha, Portugal)
interface ModalDateOption {
  id: string;
  day: string;
  name: string;
  category: string;
  country: 'Brasil' | 'Moçambique' | 'Espanha' | 'Portugal';
  flag: string;
  month?: number;
  year?: number;
}

const MODAL_DATE_OPTIONS: ModalDateOption[] = [
  // Brasil (🇧🇷)
  { id: 'br-volta-aulas', day: '15', name: 'Volta às Aulas & Estudos', category: 'Educação & Família', country: 'Brasil', flag: '🇧🇷' },
  { id: 'br-carnaval', day: '17', name: 'Carnaval & Festas de Rua', category: 'Festividade & Moda', country: 'Brasil', flag: '🇧🇷' },
  { id: 'br-pascoa', day: '05', name: 'Páscoa & Ovos Artesanais', category: 'Confeitaria & Família', country: 'Brasil', flag: '🇧🇷' },
  { id: 'br-maes', day: '10', name: 'Dia das Mães', category: 'Pico Comercial', country: 'Brasil', flag: '🇧🇷' },
  { id: 'br-namorados', day: '12', name: 'Dia dos Namorados', category: 'Romance & Presentes', country: 'Brasil', flag: '🇧🇷' },
  { id: 'br-criancas', day: '12', name: 'Dia das Crianças', category: 'Infantil & Família', country: 'Brasil', flag: '🇧🇷' },
  { id: 'br-professores', day: '15', name: 'Dia dos Professores', category: 'Educação', country: 'Brasil', flag: '🇧🇷' },
  { id: 'br-medico', day: '18', name: 'Dia do Médico', category: 'Dia da profissão', country: 'Brasil', flag: '🇧🇷' },
  { id: 'br-eleicoes-2t', day: '25', name: 'Eleições: 2º turno', category: 'Eleições', country: 'Brasil', flag: '🇧🇷' },
  { id: 'br-dentista', day: '25', name: 'Dia do Dentista', category: 'Dia da profissão', country: 'Brasil', flag: '🇧🇷' },
  { id: 'br-halloween', day: '31', name: 'Halloween', category: 'Data comercial', country: 'Brasil', flag: '🇧🇷' },
  { id: 'br-black-friday', day: '28', name: 'Black Friday', category: 'Data comercial', country: 'Brasil', flag: '🇧🇷' },
  { id: 'br-natal', day: '25', name: 'Natal & Fim de Ano', category: 'Festividade', country: 'Brasil', flag: '🇧🇷' },

  // Moçambique (🇲🇿)
  { id: 'mz-ano-escolar', day: '18', name: 'Abertura do Ano Escolar', category: 'Educação & Família', country: 'Moçambique', flag: '🇲🇿' },
  { id: 'mz-mulher-nac', day: '07', name: 'Dia da Mulher Moçambicana (Josina Machel)', category: 'Feriado Nacional', country: 'Moçambique', flag: '🇲🇿' },
  { id: 'mz-trabalho', day: '01', name: 'Dia dos Trabalhadores', category: 'Feriado Nacional', country: 'Moçambique', flag: '🇲🇿' },
  { id: 'mz-independencia', day: '25', name: 'Dia da Independência Nacional', category: 'Feriado Nacional', country: 'Moçambique', flag: '🇲🇿' },
  { id: 'mz-vitoria', day: '07', name: 'Dia da Vitória (Acordos de Lusaka)', category: 'Feriado Nacional', country: 'Moçambique', flag: '🇲🇿' },
  { id: 'mz-paz', day: '04', name: 'Dia da Paz e Reconciliação', category: 'Feriado Nacional', country: 'Moçambique', flag: '🇲🇿' },
  { id: 'mz-professores', day: '12', name: 'Dia dos Professores em Moçambique', category: 'Educação', country: 'Moçambique', flag: '🇲🇿' },
  { id: 'mz-alimentacao', day: '16', name: 'Dia Mundial da Alimentação', category: 'Agronegócio & Nutrição', country: 'Moçambique', flag: '🇲🇿' },
  { id: 'mz-cooperacao', day: '24', name: 'Dia da Cooperação & ONGs', category: 'Projetos Sociais', country: 'Moçambique', flag: '🇲🇿' },
  { id: 'mz-comercio', day: '31', name: 'Planejamento Comercial de Verão', category: 'Comércio & Finanças', country: 'Moçambique', flag: '🇲🇿' },

  // Espanha (🇪🇸)
  { id: 'es-reyes', day: '06', name: 'Día de los Reyes Magos', category: 'Navidad & Regalos', country: 'Espanha', flag: '🇪🇸' },
  { id: 'es-sant-jordi', day: '23', name: 'Día del Libro & Sant Jordi', category: 'Literatura & Cultura', country: 'Espanha', flag: '🇪🇸' },
  { id: 'es-san-juan', day: '24', name: 'Noche de San Juan & Hogueras', category: 'Fiesta Popular', country: 'Espanha', flag: '🇪🇸' },
  { id: 'es-rebajas', day: '07', name: 'Rebajas de Verano & San Fermín', category: 'Moda & Compras', country: 'Espanha', flag: '🇪🇸' },
  { id: 'es-vuelta-cole', day: '08', name: 'Vuelta al Cole & Rutinas', category: 'Educación & Familia', country: 'Espanha', flag: '🇪🇸' },
  { id: 'es-hispanidad', day: '12', name: 'Fiesta Nacional de España', category: 'Fiesta Nacional', country: 'Espanha', flag: '🇪🇸' },
  { id: 'es-cancer-mama', day: '19', name: 'Día Contra el Cáncer de Mama', category: 'Salud & Bienestar', country: 'Espanha', flag: '🇪🇸' },
  { id: 'es-bibliotecas', day: '24', name: 'Día de las Bibliotecas', category: 'Educación & Lectura', country: 'Espanha', flag: '🇪🇸' },
  { id: 'es-castanada', day: '31', name: 'Halloween & La Castañada / Magosto', category: 'Tradición & Fiestas', country: 'Espanha', flag: '🇪🇸' },

  // Portugal (🇵🇹)
  { id: 'pt-carnaval', day: '17', name: 'Carnaval em Portugal', category: 'Festividade & Tradição', country: 'Portugal', flag: '🇵🇹' },
  { id: 'pt-liberdade', day: '25', name: 'Dia da Liberdade (25 de Abril)', category: 'História & Cidadania', country: 'Portugal', flag: '🇵🇹' },
  { id: 'pt-santos-populares', day: '13', name: 'Festas dos Santos Populares', category: 'Tradição & Gastronomia', country: 'Portugal', flag: '🇵🇹' },
  { id: 'pt-avos', day: '26', name: 'Dia dos Avós em Portugal', category: 'Família & Memórias', country: 'Portugal', flag: '🇵🇹' },
  { id: 'pt-regresso-aulas', day: '15', name: 'Regresso às Aulas & Organização', category: 'Educação & Família', country: 'Portugal', flag: '🇵🇹' },
  { id: 'pt-republica', day: '05', name: 'Implantação da República', category: 'Feriado Nacional', country: 'Portugal', flag: '🇵🇹' },
  { id: 'pt-vindimas', day: '12', name: 'Vindimas & Sabores de Outono', category: 'Gastronomia & Enoturismo', country: 'Portugal', flag: '🇵🇹' },
  { id: 'pt-medico', day: '18', name: 'Dia de São Lucas / Dia do Médico', category: 'Profissional', country: 'Portugal', flag: '🇵🇹' },
  { id: 'pt-bruxas', day: '31', name: 'Noite das Bruxas & Magusto', category: 'Tradição Popular', country: 'Portugal', flag: '🇵🇹' },
  { id: 'pt-martinho', day: '11', name: 'Dia de São Martinho (Magusto)', category: 'Tradição & Castanhas', country: 'Portugal', flag: '🇵🇹' }
];

export const SeasonalCalendar: React.FC<SeasonalCalendarProps> = ({
  onCreateOfferFromSeasonality,
  initialEvent,
  onInitialEventHandled,
  creditsBalance = 50,
  onCreditsUsed,
  theme = 'white',
  onToggleTheme
}) => {
  const isBlack = theme === 'black';

  // Navigation Tabs state: 'novas' | 'aprovadas' | 'arquivo'
  const [activeTab, setActiveTab] = useState<'novas' | 'aprovadas' | 'arquivo'>('novas');

  const [modalCountryFilter, setModalCountryFilter] = useState<'all' | 'Brasil' | 'Moçambique' | 'Espanha' | 'Portugal'>('all');

  // Ideas store
  const [ideas, setIdeas] = useState<SeasonalIdeaCard[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('lowstack_seasonal_ideas') || '[]');
      if (!Array.isArray(stored)) return [];
      const now = Date.now();
      return stored
        .map((idea: SeasonalIdeaCard) => {
          const createdAt = idea.createdAt || new Date(now).toISOString();
          const expiresAt = idea.expiresAt || new Date(new Date(createdAt).getTime() + 10 * 24 * 60 * 60 * 1000).toISOString();
          return { ...idea, createdAt, expiresAt };
        })
        .filter((idea: SeasonalIdeaCard) => new Date(idea.expiresAt).getTime() > now);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const removeExpiredIdeas = () => {
      const now = Date.now();
      setIdeas(previous => previous.filter(idea => new Date(idea.expiresAt).getTime() > now));
    };
    removeExpiredIdeas();
    const timer = window.setInterval(removeExpiredIdeas, 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('lowstack_seasonal_ideas', JSON.stringify(ideas));
  }, [ideas]);

  // Modal: Gerar ideias sazonais
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedDateIds, setSelectedDateIds] = useState<string[]>([]);
  const [dashboardEventOption, setDashboardEventOption] = useState<ModalDateOption | null>(null);
  const [ideasCount, setIdeasCount] = useState<number>(10);
  const [audienceType, setAudienceType] = useState<'b2c' | 'mixed' | 'b2b'>('b2c');
  const [testNotes, setTestNotes] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [audienceDropdownOpen, setAudienceDropdownOpen] = useState(false);

  const initialEventOption: ModalDateOption | null = initialEvent
    ? {
        id: `dashboard-${initialEvent.country}-${initialEvent.year}-${initialEvent.month}-${initialEvent.day}`,
        day: String(initialEvent.day).padStart(2, '0'),
        name: initialEvent.title,
        category: initialEvent.category,
        country: initialEvent.country,
        flag: {
          Brasil: '🇧🇷',
          Moçambique: '🇲🇿',
          Espanha: '🇪🇸',
          Portugal: '🇵🇹'
        }[initialEvent.country],
        month: initialEvent.month,
        year: initialEvent.year
      }
    : null;
  const availableDateOptions = dashboardEventOption
    ? [dashboardEventOption, ...MODAL_DATE_OPTIONS]
    : MODAL_DATE_OPTIONS;

  useEffect(() => {
    if (!initialEventOption) return;
    setDashboardEventOption(initialEventOption);
    setModalCountryFilter(initialEventOption.country);
    setSelectedDateIds([initialEventOption.id]);
    setGenerationError('');
    setIsGenerateModalOpen(true);
    onInitialEventHandled?.();
  }, [initialEventOption?.id]);

  // Modal: Ver detalhes
  const [detailIdea, setDetailIdea] = useState<SeasonalIdeaCard | null>(null);
  const [copiedHook, setCopiedHook] = useState(false);

  // Filter ideas by current tab status
  const currentTabIdeas = ideas.filter(item => {
    if (activeTab === 'novas' && item.status !== 'new') return false;
    if (activeTab === 'aprovadas' && item.status !== 'approved') return false;
    if (activeTab === 'arquivo' && item.status !== 'archived') return false;
    return true;
  });

  const countNovas = ideas.filter(i => i.status === 'new').length;
  const countAprovadas = ideas.filter(i => i.status === 'approved').length;
  const countArquivo = ideas.filter(i => i.status === 'archived').length;

  // Handler: Approve idea (thumbs up)
  const handleApproveIdea = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIdeas(prev => prev.map(item => item.id === id ? { ...item, status: 'approved' } : item));
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#000000', '#22C55E', '#FFFFFF']
      });
    } catch {}
  };

  // Handler: Dismiss / Archive idea (X or Trash)
  const handleArchiveIdea = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIdeas(prev => prev.map(item => item.id === id ? { ...item, status: 'archived' } : item));
  };

  // Handler: Restore from archive
  const handleRestoreIdea = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIdeas(prev => prev.map(item => item.id === id ? { ...item, status: 'new' } : item));
  };

  // Handler: Convert idea into application Offer
  const handleLaunchOffer = (idea: SeasonalIdeaCard, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const briefing: Partial<OfferBriefing> = {
      productName: idea.title,
      productType: idea.productType || 'Guia Prático Passo a Passo + Fichas e Templates',
      targetAudience: idea.targetAudience,
      coreProblem: idea.description,
      price: idea.suggestedPrice || idea.priceRange.split('-')[0].trim(),
      regularPrice: idea.regularPrice || 'R$ 77,00',
      niche: idea.eventName,
    };
    onCreateOfferFromSeasonality(briefing, idea.title);
  };

  // Handler: Generate seasonal ideas
  const handleGenerateIdeas = async () => {
    const selectedEvents = availableDateOptions.filter(d => selectedDateIds.includes(d.id));
    if (selectedEvents.length === 0) {
      setGenerationError('Selecione pelo menos uma data sazonal.');
      return;
    }

    setIsGenerating(true);
    setGenerationError('');
    try {
      const mainEvent = selectedEvents[0];
      const evCountry = mainEvent.country;
      const evFlag = mainEvent.flag;

      const generated = await api.generateSeasonalIdeas({
        event: `${mainEvent.name} (${evCountry})${mainEvent.month !== undefined && mainEvent.year !== undefined
          ? ` — ${mainEvent.day} de ${new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(mainEvent.year, mainEvent.month, 1))} de ${mainEvent.year}`
          : ''}`,
        eventCategory: mainEvent.category,
        audienceType,
        count: ideasCount,
        testNotes: testNotes.trim() ? `${testNotes} [País: ${evCountry}]` : `[País: ${evCountry}]`
      });

      if (!generated.length) {
        throw new Error('A IA não retornou ideias. Revise os dados e tente novamente.');
      }

      const formatted: SeasonalIdeaCard[] = generated.map((item: any, idx: number) => {
        if (!item || typeof item.title !== 'string' || !item.title.trim()) {
          throw new Error('A IA retornou uma ideia sem título. Tente gerar novamente.');
        }

        const isB2b = item.audienceType === 'b2b';
        const price = typeof item.price === 'string' ? item.price : '';
        return {
          id: `gen-${Date.now()}-${idx}`,
          title: item.title.trim(),
          country: evCountry,
          countryFlag: evFlag,
          audienceType: isB2b ? 'b2b' : 'b2c',
          audienceLabel: isB2b ? 'Vende para profissional' : 'Consumidor final',
          eventDate: `${mainEvent.name} · ${mainEvent.day}${mainEvent.month !== undefined && mainEvent.year !== undefined
            ? ` de ${new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(mainEvent.year, mainEvent.month, 1))} de ${mainEvent.year}`
            : ''}`,
          eventName: mainEvent.name,
          month: '',
          targetAudience: typeof item.targetAudience === 'string' ? item.targetAudience : '',
          description: typeof item.coreProblem === 'string' ? item.coreProblem : '',
          priceRange: price,
          suggestedPrice: price,
          regularPrice: typeof item.regularPrice === 'string' ? item.regularPrice : '',
          orderBump: typeof item.orderBumpSuggestion === 'string' ? item.orderBumpSuggestion : '',
          hook: typeof item.hookSuggestion === 'string' ? item.hookSuggestion : '',
          productType: typeof item.productType === 'string' ? item.productType : '',
          whyItConverts: typeof item.whyItConverts === 'string' ? item.whyItConverts : '',
          status: 'new',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
        };
      });

      setIdeas(prev => [...formatted, ...prev]);
      setActiveTab('novas');
      setIsGenerateModalOpen(false);
      setSelectedDateIds([]);
      setDashboardEventOption(null);

      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {}

      if (onCreditsUsed) {
        onCreditsUsed(2, `Geração de Ideias Sazonais: ${mainEvent.name} (${evCountry})`);
      }
    } catch (err) {
      console.error('Error generating seasonal ideas:', err);
      setGenerationError(err instanceof Error ? err.message : 'Não foi possível gerar ideias sazonais.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleDateSelection = (id: string) => {
    if (selectedDateIds.includes(id)) {
      if (selectedDateIds.length > 1) {
        setSelectedDateIds(selectedDateIds.filter(x => x !== id));
      }
    } else {
      setSelectedDateIds([...selectedDateIds, id]);
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto flex flex-col min-h-screen transition-colors bg-transparent ${
      isBlack ? 'text-[#E2E4E9]' : 'text-[#111827]'
    }`}>
      {/* 1. Page Header (Matching Screenshot 2) */}
      <div className={`w-full px-6 md:px-8 pt-6 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b transition-colors bg-transparent ${
        isBlack ? 'border-[#1C2030]' : 'border-[#E5E7EB]'
      }`}>
        
        {/* Left: Icon + Title */}
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs transition-colors ${
            isBlack ? 'bg-white text-black' : 'bg-black text-white'
          }`}>
            <CalendarIcon className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className={`text-xl md:text-2xl font-bold tracking-tight font-display transition-colors ${
              isBlack ? 'text-white' : 'text-neutral-900'
            }`}>
              Sazonalidade
            </h1>
          </div>
        </div>

        {/* Right: Tabs Pills + Theme Switcher + Gerar ideias button */}
        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          
          {/* Black & White Background Switcher */}
          {onToggleTheme && (
            <div className={`flex items-center p-1 rounded-xl border transition-colors ${
              isBlack ? 'bg-[#151825] border-[#252B3E]' : 'bg-[#F1F3F5] border-[#E5E7EB]'
            }`}>
              <button
                type="button"
                onClick={() => { if (isBlack) onToggleTheme(); }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  !isBlack 
                    ? 'bg-white text-black shadow-xs font-bold' 
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Fundo White (Claro)"
              >
                <Sun className="w-3.5 h-3.5" />
                <span>White</span>
              </button>
              <button
                type="button"
                onClick={() => { if (!isBlack) onToggleTheme(); }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isBlack 
                    ? 'bg-white text-black shadow-xs font-bold' 
                    : 'text-neutral-500 hover:text-black'
                }`}
                title="Fundo Black (Escuro)"
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Black</span>
              </button>
            </div>
          )}

          {/* Tabs Pill Group */}
          <div className={`flex items-center p-1 rounded-xl border transition-colors ${
            isBlack ? 'bg-[#151825] border-[#252B3E]' : 'bg-[#F1F3F5] border-[#E5E7EB]'
          }`}>
            <button
              onClick={() => setActiveTab('novas')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'novas'
                  ? isBlack ? 'bg-[#22273C] text-white shadow-xs font-bold' : 'bg-white text-neutral-900 shadow-xs font-bold'
                  : isBlack ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Novas ({countNovas})
            </button>
            <button
              onClick={() => setActiveTab('aprovadas')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'aprovadas'
                  ? isBlack ? 'bg-[#22273C] text-white shadow-xs font-bold' : 'bg-white text-neutral-900 shadow-xs font-bold'
                  : isBlack ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Aprovadas ({countAprovadas})
            </button>
            <button
              onClick={() => setActiveTab('arquivo')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'arquivo'
                  ? isBlack ? 'bg-[#22273C] text-white shadow-xs font-bold' : 'bg-white text-neutral-900 shadow-xs font-bold'
                  : isBlack ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Arquivo ({countArquivo})
            </button>
          </div>

          {/* Gerar ideias ↗ Button */}
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isBlack ? 'bg-white hover:bg-neutral-200 text-black' : 'bg-black hover:bg-neutral-800 text-white'
            }`}
          >
            <span>Gerar ideias</span>
            <span className="text-sm font-normal">↗</span>
          </button>

        </div>
      </div>

      {/* 2. Main Content Grid (Matching Screenshot 2: 4-columns layout) */}
      <div className="flex-1 p-6 md:p-8">
        
        {currentTabIdeas.length === 0 ? (
          <div className={`p-12 text-center rounded-2xl max-w-lg mx-auto space-y-3 shadow-xs border transition-colors ${
            isBlack ? 'bg-[#11131C] border-[#1F2437] text-white' : 'bg-white border-neutral-200 text-neutral-900'
          }`}>
            <h3 className="text-sm font-bold">
              {activeTab === 'novas' && 'Nenhuma nova ideia no momento'}
              {activeTab === 'aprovadas' && 'Nenhuma ideia aprovada ainda'}
              {activeTab === 'arquivo' && 'Nenhuma ideia no arquivo'}
            </h3>
            <p className={`text-xs ${isBlack ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {activeTab === 'novas' && 'Clique em "Gerar ideias ↗" para descobrir novas oportunidades de validação rápida.'}
              {activeTab === 'aprovadas' && 'Curta com o botão 👍 qualquer card na aba "Novas" para salvar sua aprovação.'}
              {activeTab === 'arquivo' && 'Ideias descartadas ou excluídas aparecerão aqui.'}
            </p>
            {activeTab === 'novas' && (
              <button
                onClick={() => setIsGenerateModalOpen(true)}
                className={`mt-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isBlack ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
                }`}
              >
                Gerar Ideias Sazonais
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentTabIdeas.map((idea) => {
              return (
                <div
                  key={idea.id}
                  className={`rounded-2xl p-4 flex flex-col justify-between transition-all group relative border ${
                    isBlack
                      ? 'bg-[#11131C] border-[#1F2437] hover:border-neutral-500 text-white shadow-xl hover:shadow-2xl'
                      : 'bg-white border-[#E5E7EB] hover:border-neutral-400 shadow-xs hover:shadow-md text-[#111827]'
                  }`}
                >
                  <div className="space-y-2.5">
                    
                    {/* Top Row: Tags */}
                    <div className="flex items-center justify-between gap-2">
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                        isBlack ? 'bg-[#181B28] border-[#2A3047] text-neutral-300' : 'bg-[#F4F5F7] border-[#E5E7EB] text-neutral-600'
                      }`}>
                        {idea.audienceType === 'b2c' ? (
                          <>
                            <User className={`w-3 h-3 ${isBlack ? 'text-neutral-400' : 'text-neutral-500'}`} />
                            <span>Consumidor final</span>
                          </>
                        ) : (
                          <>
                            <Store className={`w-3 h-3 ${isBlack ? 'text-neutral-400' : 'text-neutral-500'}`} />
                            <span>Vende para profissional</span>
                          </>
                        )}
                      </div>

                      <span className={`text-[11px] font-medium flex items-center gap-1 ${isBlack ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        <CountryFlag country={idea.country} />
                        <span>{idea.eventDate}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className={`text-sm font-bold leading-snug line-clamp-2 min-h-[38px] transition-colors ${
                        isBlack ? 'text-white group-hover:text-neutral-100' : 'text-neutral-900 group-hover:text-black'
                      }`}>
                        {idea.title}
                      </h3>
                    </div>

                    {/* Target Audience Line */}
                    <div>
                      <p className={`text-xs line-clamp-2 min-h-[32px] leading-relaxed ${
                        isBlack ? 'text-neutral-400' : 'text-neutral-500'
                      }`}>
                        {idea.targetAudience}
                      </p>
                    </div>

                    {/* Description / Promise Line */}
                    <div>
                      <p className={`text-xs line-clamp-3 min-h-[48px] leading-relaxed ${
                        isBlack ? 'text-neutral-300' : 'text-neutral-700'
                      }`}>
                        {idea.description}
                      </p>
                    </div>

                  </div>

                  {/* Bottom Half: Price + Actions Row */}
                  <div className={`mt-4 pt-3 border-t space-y-3 ${
                    isBlack ? 'border-[#1E2335]' : 'border-[#F1F3F5]'
                  }`}>
                    
                    {/* Price and 👍 ✕ 🗑️ icons */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold font-mono ${
                        isBlack ? 'text-white' : 'text-neutral-900'
                      }`}>
                        {idea.priceRange}
                      </span>

                      {/* Quick action icons */}
                      <div className="flex items-center gap-1">
                        {idea.status === 'archived' ? (
                          <button
                            onClick={(e) => handleRestoreIdea(idea.id, e)}
                            title="Restaurar para Novas"
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isBlack ? 'border-[#272D42] bg-[#161926] hover:bg-[#202538] text-neutral-300' : 'border-[#E5E7EB] bg-white hover:bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            <Undo2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={(e) => handleApproveIdea(idea.id, e)}
                              title="Aprovar ideia"
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                idea.status === 'approved'
                                  ? isBlack ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400' : 'bg-emerald-50 border-emerald-300 text-emerald-600'
                                  : isBlack ? 'border-[#272D42] bg-[#161926] hover:bg-[#202538] text-neutral-400 hover:text-white' : 'border-[#E5E7EB] bg-white hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900'
                              }`}
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={(e) => handleArchiveIdea(idea.id, e)}
                              title="Descartar"
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isBlack ? 'border-[#272D42] bg-[#161926] hover:bg-[#202538] text-neutral-400 hover:text-white' : 'border-[#E5E7EB] bg-white hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700'
                              }`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={(e) => handleArchiveIdea(idea.id, e)}
                              title="Mover para arquivo"
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isBlack ? 'border-[#272D42] bg-[#161926] hover:bg-[#202538] text-neutral-400 hover:text-white' : 'border-[#E5E7EB] bg-white hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Bar: "Ver detalhes >" and "Montar oferta [Grátis]" */}
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => setDetailIdea(idea)}
                        className={`text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                          isBlack ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'
                        }`}
                      >
                        <span>Ver detalhes</span>
                        <span>&gt;</span>
                      </button>

                      <button
                        onClick={(e) => handleLaunchOffer(idea, e)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                          isBlack ? 'bg-white hover:bg-neutral-200 text-black font-bold' : 'bg-black hover:bg-neutral-800 text-white'
                        }`}
                      >
                        <span>Montar oferta</span>
                        <span className={`text-[10px] px-1 py-0.2 rounded font-normal ${
                          isBlack ? 'bg-neutral-200 text-neutral-800' : 'bg-neutral-800 text-neutral-300'
                        }`}>
                          Grátis
                        </span>
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* 3. MODAL: "Gerar ideias sazonais" (Matching Screenshot 1) */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className={`rounded-2xl max-w-lg w-full p-6 shadow-2xl border space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto transition-colors ${
            isBlack ? 'bg-[#11131C] border-[#252B42] text-white' : 'bg-white border-neutral-200 text-neutral-900'
          }`}>
            
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                  isBlack ? 'bg-[#181B28] border-[#2E354F] text-white' : 'bg-neutral-100 border-neutral-200 text-neutral-800'
                }`}>
                  <CalendarIcon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${isBlack ? 'text-white' : 'text-neutral-900'}`}>
                    Gerar ideias sazonais
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  isBlack ? 'text-neutral-400 hover:text-white hover:bg-[#1A1E2D]' : 'text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Subtitle */}
            <p className={`text-xs leading-relaxed ${isBlack ? 'text-neutral-400' : 'text-neutral-500'}`}>
              O LowStack busca micro-nichos pouco óbvios para os meses escolhidos. A oferta só sai com esses meses marcados, sem extrapolar pra outros períodos.
            </p>

            {generationError && (
              <div role="alert" className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
                {generationError}
              </div>
            )}

            {/* Modal Country Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'Todos', flag: '🌍' },
                { id: 'Brasil', label: 'Brasil', flag: '🇧🇷' },
                { id: 'Moçambique', label: 'Moçambique', flag: '🇲🇿' },
                { id: 'Espanha', label: 'Espanha', flag: '🇪🇸' },
                { id: 'Portugal', label: 'Portugal', flag: '🇵🇹' }
              ].map((c) => {
                const isSelected = modalCountryFilter === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setModalCountryFilter(c.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                      isSelected
                        ? isBlack
                          ? 'bg-white text-black border-white shadow-2xs font-bold'
                          : 'bg-black text-white border-black shadow-2xs font-bold'
                        : isBlack
                          ? 'border-[#242A3E] bg-[#141624] text-neutral-400 hover:text-white'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:text-black'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {c.id === 'all' ? <span>🌍</span> : <CountryFlag country={c.label} />}
                      <span>{c.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selectable Dates List (Matching Screenshot 1) */}
            <div className={`space-y-2 border rounded-xl p-2 max-h-56 overflow-y-auto ${
              isBlack ? 'bg-[#0B0D14] border-[#202538]' : 'bg-[#FAFAFA] border-neutral-200'
            }`}>
              {availableDateOptions
                .filter(item => modalCountryFilter === 'all' || item.country === modalCountryFilter)
                .map((item) => {
                  const isSelected = selectedDateIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleDateSelection(item.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? isBlack ? 'bg-[#181B29] border-white shadow-xs' : 'bg-white border-neutral-900 shadow-xs'
                          : isBlack ? 'bg-[#11131C] border-[#202538] hover:border-neutral-500' : 'bg-white border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold font-mono ${
                          isSelected 
                            ? isBlack ? 'bg-white text-black' : 'bg-black text-white' 
                            : isBlack ? 'bg-[#1B1F2E] text-neutral-300' : 'bg-neutral-100 text-neutral-700'
                        }`}>
                          {item.day}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <CountryFlag country={item.country} />
                          <span className={`text-xs font-semibold ${isBlack ? 'text-white' : 'text-neutral-900'}`}>
                            {item.name}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] ${isBlack ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          {item.category}
                        </span>
                        {isSelected && (
                          <Check className={`w-4 h-4 stroke-[2.5] ${isBlack ? 'text-white' : 'text-neutral-900'}`} />
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Inputs: Quantidade de ideias + Tipo de público */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Quantidade de ideias */}
              <div className="space-y-1.5">
                <label className={`text-xs font-semibold block ${isBlack ? 'text-neutral-200' : 'text-neutral-900'}`}>
                  Quantidade de ideias
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={ideasCount}
                  onChange={(e) => setIdeasCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className={`w-full px-3 py-2 border rounded-xl text-xs font-mono focus:outline-hidden ${
                    isBlack ? 'bg-[#0E1018] border-[#242A3E] text-white focus:border-white' : 'bg-white border-neutral-200 text-neutral-900 focus:border-neutral-900'
                  }`}
                />
                <span className={`text-[10px] block leading-tight ${isBlack ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Cada ideia vira um card pra aprovar ou descartar.
                </span>
              </div>

              {/* Tipo de público */}
              <div className="space-y-1.5 relative">
                <label className={`text-xs font-semibold block ${isBlack ? 'text-neutral-200' : 'text-neutral-900'}`}>
                  Tipo de público
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAudienceDropdownOpen(!audienceDropdownOpen)}
                    className={`w-full px-3 py-2 border rounded-xl text-xs flex items-center justify-between focus:outline-hidden cursor-pointer ${
                      isBlack ? 'bg-[#0E1018] border-[#242A3E] text-white focus:border-white' : 'bg-white border-neutral-200 text-neutral-900 focus:border-neutral-900'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      {audienceType === 'b2c' && (
                        <>
                          <span>Cliente final</span>
                          <span className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                            isBlack ? 'bg-white/10 text-neutral-200 border border-white/20' : 'bg-neutral-100 text-neutral-700'
                          }`}>
                            RECOMENDADO
                          </span>
                        </>
                      )}
                      {audienceType === 'mixed' && <span>Misturar os dois</span>}
                      {audienceType === 'b2b' && <span>Só profissional (B2B)</span>}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 shrink-0 ${isBlack ? 'text-neutral-400' : 'text-neutral-500'}`} />
                  </button>

                  {audienceDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setAudienceDropdownOpen(false)} 
                      />
                      <div className={`absolute left-0 right-0 top-full mt-1 border rounded-xl shadow-xl z-20 py-1 text-xs ${
                        isBlack ? 'bg-[#151825] border-[#242A3E] text-white' : 'bg-white border-neutral-200 text-neutral-900'
                      }`}>
                        <button
                          type="button"
                          onClick={() => {
                            setAudienceType('b2c');
                            setAudienceDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors ${
                            isBlack ? 'hover:bg-[#1E2336]' : 'hover:bg-neutral-50'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span>Cliente final</span>
                            <span className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                              isBlack ? 'bg-white/10 text-neutral-200 border border-white/20' : 'bg-neutral-100 text-neutral-700'
                            }`}>
                              RECOMENDADO
                            </span>
                          </span>
                          {audienceType === 'b2c' && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAudienceType('mixed');
                            setAudienceDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors ${
                            isBlack ? 'hover:bg-[#1E2336]' : 'hover:bg-neutral-50'
                          }`}
                        >
                          <span>Misturar os dois</span>
                          {audienceType === 'mixed' && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAudienceType('b2b');
                            setAudienceDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors ${
                            isBlack ? 'hover:bg-[#1E2336]' : 'hover:bg-neutral-50'
                          }`}
                        >
                          <span>Só profissional (B2B)</span>
                          {audienceType === 'b2b' && <Check className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* O que você quer testar nessa leva? (Opcional) */}
            <div className="space-y-1.5">
              <label className={`text-xs font-semibold flex items-center gap-1.5 ${isBlack ? 'text-neutral-200' : 'text-neutral-900'}`}>
                <span>O que você quer testar nessa leva?</span>
                <span className="text-[10px] text-neutral-400 font-normal uppercase">OPCIONAL</span>
              </label>
              <textarea
                rows={2}
                value={testNotes}
                onChange={(e) => setTestNotes(e.target.value)}
                placeholder="Ex.: nichos de baixa concorrência de anúncio, ou um ângulo específico pra validar..."
                className={`w-full px-3 py-2.5 border rounded-xl text-xs placeholder-neutral-500 focus:outline-hidden resize-none transition-all ${
                  isBlack ? 'bg-[#0E1018] border-[#242A3E] text-white focus:border-white' : 'bg-white border-neutral-200 text-neutral-900 focus:border-neutral-900'
                }`}
              />
            </div>

            {/* Modal Footer (Matching Screenshot 1) */}
            <div className={`pt-3 border-t flex items-center justify-between ${
              isBlack ? 'border-[#202538]' : 'border-neutral-200'
            }`}>
              <div className="flex items-center gap-1 text-xs text-neutral-400 font-medium">
                <LinkIcon className="w-3.5 h-3.5 rotate-45" />
                <span>Não gasta tokens</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  disabled={isGenerating}
                  className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    isBlack ? 'border-[#252B3E] text-neutral-300 hover:bg-[#181B28]' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleGenerateIdeas}
                  disabled={isGenerating || selectedDateIds.length === 0}
                  className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50 ${
                    isBlack ? 'bg-white hover:bg-neutral-200 text-black' : 'bg-black hover:bg-neutral-800 text-white'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Gerando...</span>
                    </>
                  ) : (
                    <>
                      <span>Gerar ideias</span>
                      <span className="text-sm font-normal">↗</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4. MODAL: "Ver detalhes" */}
      {detailIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className={`rounded-2xl max-w-lg w-full p-6 shadow-2xl border space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto ${
            isBlack ? 'bg-[#11131C] border-[#252B42] text-white' : 'bg-white border-neutral-200 text-neutral-900'
          }`}>
            
            {/* Header */}
            <div className={`flex items-start justify-between border-b pb-3 ${
              isBlack ? 'border-[#1E2335]' : 'border-neutral-100'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase border ${
                    isBlack ? 'bg-[#181B28] text-neutral-300 border-[#2A3047]' : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                  }`}>
                    {detailIdea.audienceLabel}
                  </span>
                  <span className={`text-[11px] font-medium flex items-center gap-1 ${isBlack ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    <CountryFlag country={detailIdea.country} />
                    <span>{detailIdea.eventDate}</span>
                  </span>
                </div>
                <h3 className={`text-base font-bold leading-snug ${isBlack ? 'text-white' : 'text-neutral-900'}`}>
                  {detailIdea.title}
                </h3>
              </div>

              <button
                onClick={() => setDetailIdea(null)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  isBlack ? 'text-neutral-400 hover:text-white hover:bg-[#1A1E2D]' : 'text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Details Content */}
            <div className={`space-y-3.5 text-xs ${isBlack ? 'text-neutral-300' : 'text-neutral-700'}`}>
              
              {/* Formato & Preço */}
              <div className={`grid grid-cols-2 gap-3 p-3 rounded-xl border ${
                isBlack ? 'bg-[#0E1018] border-[#202538]' : 'bg-neutral-50 border-neutral-100'
              }`}>
                <div>
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase block">Faixa de Preço</span>
                  <span className={`text-sm font-bold font-mono mt-0.5 block ${isBlack ? 'text-white' : 'text-neutral-900'}`}>{detailIdea.priceRange}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase block">Formato Entregável</span>
                  <span className={`text-xs font-medium mt-0.5 block truncate ${isBlack ? 'text-neutral-200' : 'text-neutral-800'}`}>{detailIdea.productType}</span>
                </div>
              </div>

              {/* Público-Alvo */}
              <div>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Público-Alvo:</span>
                <p className={`mt-0.5 leading-relaxed ${isBlack ? 'text-neutral-200' : 'text-neutral-800'}`}>{detailIdea.targetAudience}</p>
              </div>

              {/* Dor Central */}
              <div>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Dor Central & Oportunidade:</span>
                <p className={`mt-0.5 leading-relaxed ${isBlack ? 'text-neutral-200' : 'text-neutral-800'}`}>{detailIdea.description}</p>
              </div>

              {/* Order Bump */}
              <div className={`p-3 rounded-xl border ${
                isBlack ? 'bg-[#0E1018] border-[#202538]' : 'bg-neutral-50 border-neutral-100'
              }`}>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Order Bump Recomendado:</span>
                <p className={`font-medium mt-0.5 ${isBlack ? 'text-white' : 'text-neutral-900'}`}>{detailIdea.orderBump}</p>
              </div>

              {/* Gancho de Anúncio / Hook */}
              <div className={`p-3 rounded-xl space-y-1.5 ${
                isBlack ? 'bg-[#181B28] border border-[#272D42]' : 'bg-neutral-900 text-white'
              }`}>
                <div className="flex items-center justify-between text-[10px] text-neutral-400">
                  <span className="font-semibold text-neutral-300">Gancho de Anúncio Testado:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(detailIdea.hook);
                      setCopiedHook(true);
                      setTimeout(() => setCopiedHook(false), 2000);
                    }}
                    className="flex items-center gap-1 text-white hover:text-neutral-300 transition-colors cursor-pointer"
                  >
                    {copiedHook ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-neutral-100 italic leading-relaxed">
                  "{detailIdea.hook}"
                </p>
              </div>

              {/* Por que Converte */}
              <div>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Por que Converte:</span>
                <p className={`mt-0.5 leading-relaxed ${isBlack ? 'text-neutral-400' : 'text-neutral-600'}`}>{detailIdea.whyItConverts}</p>
              </div>

            </div>

            {/* Modal Actions */}
            <div className={`pt-3 border-t flex items-center justify-between gap-3 ${
              isBlack ? 'border-[#1E2335]' : 'border-neutral-100'
            }`}>
              <button
                onClick={() => setDetailIdea(null)}
                className={`px-4 py-2 border text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                  isBlack ? 'border-[#252B3E] text-neutral-300 hover:bg-[#1A1E2D]' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                Fechar
              </button>

              <button
                onClick={() => {
                  handleLaunchOffer(detailIdea);
                  setDetailIdea(null);
                }}
                className={`px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                  isBlack ? 'bg-white hover:bg-neutral-200 text-black' : 'bg-black hover:bg-neutral-800 text-white'
                }`}
              >
                <span>Montar oferta</span>
                <span className={`text-[10px] px-1 py-0.2 rounded font-normal ${
                  isBlack ? 'bg-neutral-200 text-neutral-800' : 'bg-neutral-800 text-neutral-300'
                }`}>
                  Grátis
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
