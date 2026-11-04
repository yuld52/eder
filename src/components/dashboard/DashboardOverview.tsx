import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Filter, 
  Rocket, 
  Layers, 
  Pickaxe, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ArrowUpRight, 
  Check, 
  Globe 
} from 'lucide-react';
import { Offer, SeasonalEventContext, AppState, AppTab } from '../../types';
import { CountryFlag } from '../common/CountryFlag';

export type CountryType = 'Brasil' | 'Mocambique' | 'Espanha' | 'Portugal';

interface CountryConfig {
  id: CountryType;
  label: string;
  flag: string;
  currency: string;
}

const COUNTRIES: CountryConfig[] = [
  { id: 'Brasil', label: 'Brasil', flag: '🇧🇷', currency: 'R$' },
  { id: 'Mocambique', label: 'Moçambique', flag: '🇲🇿', currency: 'MT' },
  { id: 'Espanha', label: 'Espanha', flag: '🇪🇸', currency: '€' },
  { id: 'Portugal', label: 'Portugal', flag: '🇵🇹', currency: '€' },
];

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

interface SeasonalEvent {
  id: string;
  month: number; // 0 to 11 (0=Jan, 9=Out, 10=Nov, 11=Dez)
  day: number;
  weekday: string;
  title: string;
  badge: string;
  badgeVariant?: 'amber' | 'neutral' | 'emerald';
  category: string;
  description: string;
  isNicheDate?: boolean;
}

type SeasonalEventDefinition = [
  month: number,
  day: number,
  title: string,
  category: string,
  description: string,
  badgeVariant?: SeasonalEvent['badgeVariant']
];

const SEASONAL_EVENT_DEFINITIONS: Record<CountryType, SeasonalEventDefinition[]> = {
  Brasil: [
    [0, 1, 'Confraternização Universal', 'Feriado nacional', 'Feriado nacional no Brasil.', 'neutral'],
    [1, 14, 'Dia dos Namorados', 'Data comercial', 'Data comemorativa internacional; no Brasil, a principal data dos namorados é 12 de junho.'],
    [1, 16, 'Carnaval', 'Ponto facultativo', 'Segunda-feira de Carnaval de 2026; ponto facultativo no calendário federal.'],
    [1, 17, 'Carnaval', 'Ponto facultativo', 'Terça-feira de Carnaval de 2026; ponto facultativo no calendário federal.'],
    [2, 8, 'Dia Internacional da Mulher', 'Data comemorativa', 'Data internacional comemorada em 8 de março.'],
    [3, 3, 'Sexta-feira Santa', 'Feriado religioso', 'Data religiosa; confirme o reconhecimento e funcionamento no município.', 'neutral'],
    [3, 5, 'Domingo de Páscoa', 'Data religiosa', 'Páscoa em 2026.'],
    [3, 21, 'Dia de Tiradentes', 'Feriado nacional', 'Feriado nacional no Brasil.', 'neutral'],
    [4, 1, 'Dia do Trabalhador', 'Feriado nacional', 'Feriado nacional no Brasil.', 'neutral'],
    [4, 10, 'Dia das Mães', 'Data comercial', 'Segundo domingo de maio no Brasil em 2026.'],
    [5, 4, 'Corpus Christi', 'Ponto facultativo', 'Ponto facultativo no calendário federal; a condição de feriado depende de legislação local.'],
    [5, 12, 'Dia dos Namorados', 'Data comercial', 'Data comemorativa celebrada em 12 de junho no Brasil.'],
    [5, 24, 'Festas Juninas / São João', 'Data sazonal', 'As festas juninas acontecem ao longo de junho; São João é celebrado em 24 de junho.'],
    [7, 9, 'Dia dos Pais', 'Data comercial', 'Segundo domingo de agosto no Brasil em 2026.'],
    [8, 7, 'Independência do Brasil', 'Feriado nacional', 'Feriado nacional no Brasil.', 'neutral'],
    [9, 12, 'Nossa Senhora Aparecida / Dia das Crianças', 'Feriado nacional e data comemorativa', 'Nossa Senhora Aparecida é feriado nacional; Dia das Crianças é comemorado na mesma data.', 'neutral'],
    [9, 15, 'Dia dos Professores', 'Data comemorativa', 'Data comemorativa da área da educação no Brasil.'],
    [9, 31, 'Halloween', 'Data cultural', 'Data cultural observada em 31 de outubro.'],
    [10, 2, 'Dia de Finados', 'Feriado nacional', 'Feriado nacional no Brasil.', 'neutral'],
    [10, 15, 'Proclamação da República', 'Feriado nacional', 'Feriado nacional no Brasil.', 'neutral'],
    [10, 20, 'Dia da Consciência Negra', 'Feriado nacional', 'Feriado nacional no Brasil.', 'neutral'],
    [10, 27, 'Black Friday', 'Data comercial', 'Black Friday de 2026.'],
    [10, 30, 'Cyber Monday', 'Data comercial', 'Cyber Monday de 2026.'],
    [11, 25, 'Natal', 'Feriado nacional', 'Feriado nacional no Brasil.', 'neutral'],
  ],
  Mocambique: [
    [0, 1, 'Dia de Ano Novo', 'Feriado nacional', 'Feriado nacional em Moçambique.', 'neutral'],
    [1, 3, 'Dia dos Heróis Moçambicanos', 'Feriado nacional', 'Feriado nacional em Moçambique.', 'neutral'],
    [1, 14, 'Dia dos Namorados', 'Data comemorativa', 'Data comemorativa observada em 14 de fevereiro.'],
    [2, 8, 'Dia Internacional da Mulher', 'Data comemorativa', 'Data internacional comemorada em 8 de março.'],
    [3, 7, 'Dia da Mulher Moçambicana', 'Feriado nacional', 'Feriado nacional em Moçambique.', 'neutral'],
    [4, 1, 'Dia do Trabalhador', 'Feriado nacional', 'Feriado nacional em Moçambique.', 'neutral'],
    [4, 10, 'Dia das Mães', 'Data comemorativa', 'Segundo domingo de maio em 2026; a data pode variar nas celebrações locais.'],
    [4, 25, 'Dia de África', 'Data comemorativa', 'Data comemorativa da fundação da Organização da Unidade Africana.'],
    [5, 1, 'Dia Internacional da Criança', 'Data comemorativa', 'Data comemorativa observada em Moçambique em 1 de junho.'],
    [5, 16, 'Dia da Criança Africana', 'Data comemorativa', 'Data continental comemorada em 16 de junho.'],
    [5, 25, 'Dia da Independência', 'Feriado nacional', 'Dia da Independência Nacional de Moçambique.', 'neutral'],
    [7, 12, 'Dia Internacional da Juventude', 'Data comemorativa', 'Data internacional comemorada em 12 de agosto.'],
    [8, 7, 'Dia da Vitória', 'Feriado nacional', 'Feriado nacional em Moçambique.', 'neutral'],
    [8, 25, 'Dia das Forças Armadas', 'Feriado nacional', 'Feriado nacional em Moçambique.', 'neutral'],
    [9, 4, 'Dia da Paz e Reconciliação', 'Feriado nacional', 'Feriado nacional em Moçambique.', 'neutral'],
    [9, 31, 'Halloween', 'Data cultural', 'Data cultural observada em 31 de outubro.'],
    [10, 11, 'Singles’ Day', 'Data comercial', 'Data comercial observada internacionalmente em 11 de novembro.'],
    [10, 27, 'Black Friday', 'Data comercial', 'Black Friday de 2026.'],
    [10, 30, 'Cyber Monday', 'Data comercial', 'Cyber Monday de 2026.'],
    [11, 25, 'Dia da Família / Natal', 'Feriado nacional', 'Feriado nacional celebrado em 25 de dezembro.', 'neutral'],
  ],
  Espanha: [
    [0, 1, 'Año Nuevo', 'Feriado nacional', 'Feriado nacional na Espanha.', 'neutral'],
    [0, 6, 'Día de Reyes', 'Feriado', 'Epifania; feriado celebrado em todo o país.', 'neutral'],
    [1, 14, 'San Valentín', 'Data comercial', 'Data comemorativa observada em 14 de fevereiro.'],
    [1, 28, 'Día de Andalucía', 'Feriado autonômico', 'Feriado da comunidade autónoma da Andaluzia.', 'neutral'],
    [2, 19, 'Día del Padre / San José', 'Data comemorativa', 'Data comemorativa; também é feriado em algumas comunidades autónomas.'],
    [3, 2, 'Jueves Santo', 'Feriado autonômico', 'Feriado em várias comunidades; a observância varia conforme a comunidade autónoma.', 'neutral'],
    [3, 3, 'Viernes Santo', 'Feriado nacional', 'Feriado observado em todo o país em 2026.', 'neutral'],
    [3, 6, 'Lunes de Pascua', 'Feriado autonômico', 'Feriado em algumas comunidades autónomas; confirme a localidade.', 'neutral'],
    [3, 23, 'Día de Aragón / Sant Jordi', 'Feriado autonômico', 'Feriado em Aragón; Sant Jordi é celebrado especialmente na Catalunha.', 'neutral'],
    [3, 23, 'Día de Castilla y León', 'Feriado autonômico', 'Feriado da comunidade autónoma de Castilla y León.', 'neutral'],
    [3, 23, 'Día del Libro', 'Data cultural', 'Dia Internacional do Livro; associado a Sant Jordi na Catalunha.'],
    [4, 1, 'Fiesta del Trabajo', 'Feriado nacional', 'Feriado nacional na Espanha.', 'neutral'],
    [4, 2, 'Fiesta de la Comunidad de Madrid', 'Feriado autonômico', 'Feriado da comunidade autónoma de Madrid.', 'neutral'],
    [4, 3, 'Día de la Madre', 'Data comercial', 'Primeiro domingo de maio na Espanha em 2026.'],
    [4, 17, 'Día de las Letras Gallegas', 'Data cultural', 'Data cultural celebrada na Galiza.'],
    [4, 30, 'Día de Canarias', 'Feriado autonômico', 'Feriado da comunidade autónoma das Canárias.', 'neutral'],
    [5, 4, 'Corpus Christi', 'Feriado autonômico', 'Feriado em Castilla-La Mancha; a observância varia por comunidade.', 'neutral'],
    [5, 9, 'Día de La Rioja / Región de Murcia', 'Feriado autonômico', 'Feriado nas comunidades autónomas de La Rioja e Murcia.', 'neutral'],
    [5, 24, 'Sant Joan', 'Feriado autonômico', 'Feriado em algumas comunidades, incluindo Catalunha; confirme a localidade.', 'neutral'],
    [6, 25, 'Santiago Apóstol', 'Feriado autonômico', 'Feriado na Galiza e em algumas outras comunidades autónomas.', 'neutral'],
    [7, 15, 'Asunción de la Virgen', 'Feriado nacional', 'Feriado nacional na Espanha.', 'neutral'],
    [8, 8, 'Día de Asturias / Extremadura', 'Feriado autonômico', 'Feriado nas comunidades autónomas das Astúrias e Extremadura.', 'neutral'],
    [8, 11, 'Diada Nacional de Catalunya', 'Feriado autonômico', 'Feriado da comunidade autónoma da Catalunha.', 'neutral'],
    [8, 15, 'La Bien Aparecida', 'Feriado autonômico', 'Feriado da comunidade autónoma da Cantábria.', 'neutral'],
    [9, 9, 'Día de la Comunitat Valenciana', 'Feriado autonômico', 'Feriado da comunidade autónoma de Valência.', 'neutral'],
    [9, 12, 'Fiesta Nacional de España', 'Feriado nacional', 'Feriado nacional na Espanha.', 'neutral'],
    [9, 31, 'Halloween', 'Data cultural', 'Data cultural observada em 31 de outubro.'],
    [10, 1, 'Día de Todos los Santos', 'Feriado nacional', 'Feriado nacional; em 2026 cai num domingo e a observância substitutiva pode variar por comunidade.', 'neutral'],
    [10, 11, 'Singles’ Day', 'Data comercial', 'Data comercial observada internacionalmente em 11 de novembro.'],
    [10, 27, 'Black Friday', 'Data comercial', 'Black Friday de 2026.'],
    [10, 30, 'Cyber Monday', 'Data comercial', 'Cyber Monday de 2026.'],
    [11, 6, 'Día de la Constitución', 'Feriado nacional', 'Feriado nacional; em 2026 cai num domingo e a observância substitutiva pode variar por comunidade.', 'neutral'],
    [11, 8, 'Inmaculada Concepción', 'Feriado nacional', 'Feriado nacional na Espanha.', 'neutral'],
    [11, 25, 'Navidad', 'Feriado nacional', 'Feriado nacional na Espanha.', 'neutral'],
    [11, 26, 'Sant Esteve', 'Feriado autonômico', 'Feriado na Catalunha; confirme a observância local.', 'neutral'],
  ],
  Portugal: [
    [0, 1, 'Ano Novo', 'Feriado nacional', 'Feriado nacional em Portugal.', 'neutral'],
    [1, 14, 'Dia dos Namorados', 'Data comercial', 'Data comemorativa observada em 14 de fevereiro.'],
    [1, 17, 'Carnaval', 'Tolerância de ponto', 'Carnaval de 2026; eventual tolerância de ponto não é feriado nacional obrigatório.'],
    [2, 8, 'Dia Internacional da Mulher', 'Data comemorativa', 'Data internacional comemorada em 8 de março.'],
    [2, 19, 'Dia do Pai / São José', 'Data comemorativa', 'Data comemorativa celebrada em 19 de março.'],
    [3, 3, 'Sexta-feira Santa', 'Feriado nacional', 'Feriado nacional em 2026.', 'neutral'],
    [3, 5, 'Domingo de Páscoa', 'Data religiosa', 'Páscoa em 2026.'],
    [3, 23, 'Dia Mundial do Livro', 'Data cultural', 'Data internacional celebrada em 23 de abril.'],
    [3, 25, 'Dia da Liberdade', 'Feriado nacional', 'Feriado nacional em Portugal.', 'neutral'],
    [4, 1, 'Dia do Trabalhador', 'Feriado nacional', 'Feriado nacional em Portugal.', 'neutral'],
    [4, 3, 'Dia da Mãe', 'Data comercial', 'Primeiro domingo de maio em Portugal em 2026.'],
    [4, 25, 'Dia da Região Autónoma dos Açores', 'Feriado regional', 'Celebração regional na segunda-feira após o Pentecostes; data de 2026.', 'neutral'],
    [5, 4, 'Corpo de Deus', 'Feriado nacional', 'Feriado nacional em 2026.', 'neutral'],
    [5, 10, 'Dia de Portugal', 'Feriado nacional', 'Dia de Portugal, de Camões e das Comunidades Portuguesas.', 'neutral'],
    [5, 13, 'Santo António', 'Festa popular/local', 'Festas de Lisboa; feriado municipal em Lisboa.', 'emerald'],
    [5, 24, 'São João', 'Festa popular/local', 'Festas de São João; feriado municipal no Porto e em outras localidades.', 'emerald'],
    [5, 29, 'São Pedro', 'Festa popular/local', 'Festas populares e feriados municipais em algumas localidades.', 'emerald'],
    [6, 1, 'Dia da Região Autónoma da Madeira', 'Feriado regional', 'Feriado regional na Madeira.', 'neutral'],
    [7, 15, 'Assunção de Nossa Senhora', 'Feriado nacional', 'Feriado nacional em Portugal.', 'neutral'],
    [9, 5, 'Implantação da República', 'Feriado nacional', 'Feriado nacional em Portugal.', 'neutral'],
    [9, 31, 'Halloween', 'Data cultural', 'Data cultural observada em 31 de outubro.'],
    [10, 1, 'Dia de Todos-os-Santos', 'Feriado nacional', 'Feriado nacional em Portugal.', 'neutral'],
    [10, 11, 'Singles’ Day', 'Data comercial', 'Data comercial observada internacionalmente em 11 de novembro.'],
    [10, 27, 'Black Friday', 'Data comercial', 'Black Friday de 2026.'],
    [10, 30, 'Cyber Monday', 'Data comercial', 'Cyber Monday de 2026.'],
    [11, 1, 'Restauração da Independência', 'Feriado nacional', 'Feriado nacional em Portugal.', 'neutral'],
    [11, 8, 'Imaculada Conceição', 'Feriado nacional', 'Feriado nacional em Portugal.', 'neutral'],
    [11, 25, 'Natal', 'Feriado nacional', 'Feriado nacional em Portugal.', 'neutral'],
  ],
};

const SEASONAL_EVENTS = Object.fromEntries(
  Object.entries(SEASONAL_EVENT_DEFINITIONS).map(([country, definitions]) => [
    country,
    definitions.map(([month, day, title, category, description, badgeVariant]) =>
      createSeasonalEvent(
        country as CountryType,
        month,
        day,
        title,
        category,
        description,
        category,
        badgeVariant
      )
    )
  ])
) as Record<CountryType, SeasonalEvent[]>;

function createSeasonalEvent(
  country: CountryType,
  month: number,
  day: number,
  title: string,
  category: string,
  description: string,
  badge: string,
  badgeVariant: SeasonalEvent['badgeVariant'] = 'amber'
): SeasonalEvent {
  const year = 2026;
  const weekday = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][new Date(year, month, day).getDay()];

  return {
    id: `${country}-${year}-${month + 1}-${day}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    month,
    day,
    weekday,
    title,
    badge,
    badgeVariant,
    category,
    description,
    isNicheDate: true
  };
}

interface DashboardOverviewProps {
  appState: AppState;
  onSelectOffer: (offer: Offer) => void;
  onSelectTab: (tab: AppTab) => void;
  onGenerateSeasonalIdeas: (event: SeasonalEventContext) => void;
  theme?: 'black' | 'white';
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  appState,
  onSelectOffer,
  onSelectTab,
  onGenerateSeasonalIdeas,
  theme = 'black'
}) => {
  const isBlack = theme === 'black';
  const [country, setCountry] = useState<CountryType>('Brasil');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(() => new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const activeCountryConfig = COUNTRIES.find(c => c.id === country) || COUNTRIES[0];
  const allEventsForCountry = SEASONAL_EVENTS[country] || [];
  const countryEvents = allEventsForCountry.filter(e => e.month === currentMonthIndex);

  // Filter events if a specific day is clicked, otherwise show all events for the country & month
  const displayedEvents = selectedDay !== null
    ? countryEvents.filter(e => e.day === selectedDay)
    : countryEvents;

  const eventDaysSet = new Set(countryEvents.map(e => e.day));

  // Dynamically compute the calendar from the real current month and year.
  const year = new Date().getFullYear();
  const firstDayOfWeek = new Date(year, currentMonthIndex, 1).getDay(); // 0 = Domingo, 1 = Segunda, ...
  const daysInMonth = new Date(year, currentMonthIndex + 1, 0).getDate(); // 28 to 31
  const today = new Date();
  const isCurrentRealMonth = today.getFullYear() === year && today.getMonth() === currentMonthIndex;
  const realCurrentDay = today.getDate();

  const calendarDays: Array<{
    day: number | null;
    isNiche?: boolean;
    hasEvent?: boolean;
    isToday?: boolean;
  }> = [];

  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push({ day: null });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const hasEv = eventDaysSet.has(d);
    calendarDays.push({
      day: d,
      isNiche: hasEv,
      hasEvent: hasEv,
      isToday: isCurrentRealMonth && d === realCurrentDay
    });
  }

  const handleUseSeasonalDate = (event: SeasonalEvent) => {
    onGenerateSeasonalIdeas({
      country: activeCountryConfig.label as SeasonalEventContext['country'],
      title: event.title,
      category: event.category,
      day: event.day,
      month: event.month,
      year
    });
  };

  const handlePrevMonth = () => {
    setCurrentMonthIndex(prev => (prev === 0 ? 11 : prev - 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex(prev => (prev === 11 ? 0 : prev + 1));
    setSelectedDay(null);
  };

  return (
    <div className={`flex-1 overflow-y-auto px-6 md:px-8 pt-2 pb-8 space-y-6 bg-transparent transition-colors ${
      isBlack ? 'text-[#E2E4E9]' : 'text-[#111827]'
    }`}>
      {/* Top Main Card: Calendário Sazonal */}
      <div className={`w-full rounded-3xl border p-6 md:p-7 shadow-xl space-y-6 transition-colors relative ${
          isBlack ? 'bg-[#10121A] border-[#1E2232]' : 'bg-white border-[#E5E7EB] shadow-xs'
        }`}>
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center border transition-colors ${
                isBlack ? 'bg-[#181B26] border-[#262B3F] text-white' : 'bg-[#F9FAFB] border-[#E5E7EB] text-neutral-900'
              }`}>
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className={`text-base font-bold tracking-tight font-display transition-colors ${
                  isBlack ? 'text-white' : 'text-neutral-900'
                }`}>
                  Calendário sazonal
                </h2>
                <p className={`text-xs ${isBlack ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  As datas que puxam venda ao longo do ano
                </p>
              </div>
            </div>

            {/* Right Controls: Country and Month */}
            <div className="flex items-center gap-2">
              {/* Country Selector Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsCountryDropdownOpen(prev => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                    isBlack ? 'border-[#272D42] bg-[#161824] text-neutral-200 hover:bg-[#1E2233]' : 'border-[#E5E7EB] bg-[#F8F9FA] text-neutral-700 hover:bg-neutral-100 shadow-2xs'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <CountryFlag country={activeCountryConfig.label} />
                    <span>{activeCountryConfig.label}</span>
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCountryDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsCountryDropdownOpen(false)} 
                    />
                    <div className={`absolute right-0 mt-1.5 w-48 rounded-2xl border shadow-2xl py-1.5 z-50 backdrop-blur-md transition-all ${
                      isBlack ? 'bg-[#141624] border-[#293046] text-neutral-200' : 'bg-white border-[#E5E7EB] text-neutral-800'
                    }`}>
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-inherit mb-1">
                        Selecionar País
                      </div>
                    {COUNTRIES.map((c) => {
                      const isSelected = c.id === country;
                      return (
                        <button
                          key={c.id}
                          onClick={() => {
                            setCountry(c.id);
                            setSelectedDay(null);
                            setIsCountryDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer ${
                            isSelected
                              ? isBlack ? 'bg-[#22273C] text-white font-bold' : 'bg-neutral-100 text-neutral-900 font-bold'
                              : isBlack ? 'hover:bg-[#1A1D2D] text-neutral-300' : 'hover:bg-neutral-50 text-neutral-700'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <CountryFlag country={c.label} />
                            <span>{c.label}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="text-[10px] text-neutral-400 font-mono">({c.currency})</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
              </div>

              {/* Month Selector */}
              <div className="relative">
                <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-xs font-semibold ${
                  isBlack ? 'border-[#272D42] bg-[#161824] text-neutral-200' : 'border-[#E5E7EB] bg-[#F8F9FA] text-neutral-700 shadow-2xs'
                }`}>
                  <button 
                    onClick={handlePrevMonth}
                    className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer p-0.5"
                    title="Mês anterior"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsMonthDropdownOpen(prev => !prev)}
                    className="px-1.5 font-medium whitespace-nowrap hover:text-emerald-500 transition-colors cursor-pointer flex items-center gap-1"
                    title="Selecionar mês"
                  >
                    <span>{MONTH_NAMES[currentMonthIndex]} {year}</span>
                    <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform ${isMonthDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <button 
                    onClick={handleNextMonth}
                    className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer p-0.5"
                    title="Próximo mês"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isMonthDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsMonthDropdownOpen(false)} 
                    />
                    <div className={`absolute right-0 mt-1.5 w-44 rounded-2xl border shadow-2xl py-1.5 z-50 max-h-60 overflow-y-auto backdrop-blur-md ${
                      isBlack ? 'bg-[#141624] border-[#293046] text-neutral-200' : 'bg-white border-[#E5E7EB] text-neutral-800'
                    }`}>
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-inherit mb-1">
                        Ano de {year}
                      </div>
                      {MONTH_NAMES.map((mName, mIdx) => {
                        const isCur = mIdx === currentMonthIndex;
                        const evCount = allEventsForCountry.filter(e => e.month === mIdx).length;
                        return (
                          <button
                            key={mIdx}
                            onClick={() => {
                              setCurrentMonthIndex(mIdx);
                              setSelectedDay(null);
                              setIsMonthDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-1.5 flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer ${
                              isCur
                                ? isBlack ? 'bg-[#22273C] text-white font-bold' : 'bg-neutral-100 text-neutral-900 font-bold'
                                : isBlack ? 'hover:bg-[#1A1D2D] text-neutral-300' : 'hover:bg-neutral-50 text-neutral-700'
                            }`}
                          >
                            <span>{mName}</span>
                            <span className="flex items-center gap-1">
                              {evCount > 0 && (
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                  isBlack ? 'bg-white/10 text-neutral-300' : 'bg-neutral-200 text-neutral-700'
                                }`}>
                                  {evCount}
                                </span>
                              )}
                              {isCur && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Calendário Body: Mini Calendar + Event Cards Column */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: Mini Grid */}
            <div className={`md:col-span-5 space-y-4 pr-0 md:pr-4 md:border-r ${
              isBlack ? 'border-[#1C2030]' : 'border-[#E5E7EB]'
            }`}>
              <div className={`grid grid-cols-7 gap-y-2 text-center text-xs font-medium mb-2 ${
                isBlack ? 'text-neutral-400' : 'text-neutral-500'
              }`}>
                <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
              </div>

              <div className="grid grid-cols-7 gap-y-2 text-center text-xs font-medium">
                {calendarDays.map((item, idx) => {
                  if (!item.day) {
                    return <div key={idx} className="h-8" />;
                  }

                  const isSelected = selectedDay === item.day;

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedDay(prev => prev === item.day ? null : item.day);
                      }}
                      className={`h-8 w-8 mx-auto flex items-center justify-center rounded-full transition-all text-xs font-semibold cursor-pointer ${
                        isSelected
                          ? isBlack
                            ? 'bg-[#22273B] text-white font-bold border-2 border-emerald-400 shadow-md scale-105'
                            : 'bg-neutral-900 text-white font-bold border-2 border-emerald-500 shadow-md scale-105'
                          : item.isNiche
                          ? isBlack
                            ? 'bg-white text-black font-bold shadow-xs'
                            : 'bg-neutral-900 text-white font-bold shadow-xs'
                          : item.isToday
                          ? isBlack
                            ? 'border-2 border-white text-white font-bold'
                            : 'border-2 border-neutral-900 text-neutral-900 font-bold'
                          : isBlack
                            ? 'text-neutral-300 hover:bg-[#181B28]'
                            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                      }`}
                      title={item.hasEvent ? `Ver data ${item.day}` : undefined}
                    >
                      {item.day}
                    </button>
                  );
                })}
              </div>

              {/* Bottom Tags */}
              <div className={`flex items-center justify-between pt-2 text-[10px] font-semibold uppercase tracking-wider ${
                isBlack ? 'text-neutral-400' : 'text-neutral-500'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full inline-block ${
                      isBlack ? 'bg-white' : 'bg-neutral-900'
                    }`} />
                    DATA DE NICHO
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full border inline-block ${
                      isBlack ? 'border-white' : 'border-neutral-900'
                    }`} />
                    HOJE
                  </span>
                </div>
                {selectedDay !== null && (
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="text-[10px] text-amber-500 hover:underline cursor-pointer lowercase"
                  >
                    limpar filtro
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Seasonal Opportunities Cards */}
            <div className="md:col-span-7 space-y-3">
              {displayedEvents.length === 0 ? (
                <div className={`p-6 rounded-2xl border text-center space-y-3 ${
                  isBlack ? 'border-[#212638] bg-[#141622] text-neutral-400' : 'border-[#E5E7EB] bg-[#F9FAFB] text-neutral-600'
                }`}>
                  <p className="text-xs">
                    {selectedDay !== null
                      ? `Nenhum evento registrado para o dia ${selectedDay} de ${MONTH_NAMES[currentMonthIndex]} em ${activeCountryConfig.label}.`
                      : `Nenhuma data comemorativa cadastrada para ${MONTH_NAMES[currentMonthIndex]} em ${activeCountryConfig.label}.`}
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                    {selectedDay !== null && (
                      <button
                        onClick={() => setSelectedDay(null)}
                        className="px-3 py-1.5 rounded-xl border text-xs font-bold text-amber-500 hover:bg-amber-500/10 cursor-pointer"
                      >
                        Ver todas as datas de {MONTH_NAMES[currentMonthIndex]}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setCurrentMonthIndex(new Date().getMonth());
                        setSelectedDay(null);
                      }}
                      className="px-3 py-1.5 rounded-xl border text-xs font-semibold hover:underline cursor-pointer"
                    >
                      Ver datas do mês atual (Pico)
                    </button>
                  </div>
                </div>
              ) : (
                displayedEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      selectedDay === evt.day
                        ? isBlack
                          ? 'border-emerald-500/60 bg-[#171B2B] shadow-lg'
                          : 'border-emerald-500 bg-white shadow-md'
                        : isBlack
                        ? 'border-[#212638] bg-[#141622] hover:border-[#323954]'
                        : 'border-[#E5E7EB] bg-[#F9FAFB] hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl border flex flex-col items-center justify-center text-center shrink-0 ${
                          evt.badgeVariant === 'neutral'
                            ? isBlack ? 'bg-white text-black' : 'bg-neutral-900 text-white'
                            : isBlack ? 'border-[#2A314A] bg-[#1A1D2D]' : 'border-[#E5E7EB] bg-white shadow-2xs'
                        }`}>
                          <span className={`text-[9px] font-bold uppercase leading-none ${
                            evt.badgeVariant === 'neutral'
                              ? isBlack ? 'text-neutral-500' : 'text-neutral-400'
                              : 'text-neutral-400'
                          }`}>
                            {evt.weekday}
                          </span>
                          <span className={`text-base font-extrabold font-display leading-tight ${
                            evt.badgeVariant === 'neutral'
                              ? ''
                              : isBlack ? 'text-white' : 'text-neutral-900'
                          }`}>
                            {evt.day}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`text-sm font-bold ${isBlack ? 'text-white' : 'text-neutral-900'}`}>
                              {evt.title}
                            </h3>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                              evt.badgeVariant === 'emerald'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : evt.badgeVariant === 'neutral'
                                ? isBlack ? 'bg-[#1F2436] text-neutral-300 border-[#313954]' : 'bg-neutral-100 text-neutral-700 border-neutral-300'
                                : isBlack ? 'bg-[#1F2436] text-amber-300 border-[#313954]' : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {evt.badge}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mt-0.5">
                            {evt.category}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleUseSeasonalDate(evt)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 shadow-xs cursor-pointer ${
                          evt.badgeVariant === 'neutral'
                            ? isBlack
                              ? 'bg-white hover:bg-neutral-200 text-black font-bold'
                              : 'bg-neutral-900 hover:bg-neutral-800 text-white font-bold'
                            : isBlack
                              ? 'border border-[#2E3652] text-white bg-[#1A1E2D] hover:bg-[#23293D]'
                              : 'border border-[#E5E7EB] text-neutral-900 bg-white hover:bg-neutral-100'
                        }`}
                      >
                        <span>Gerar ideias</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className={`text-xs leading-relaxed pl-14 ${isBlack ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      {evt.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      {/* Bottom Row of 4 Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Aprovar Ideias */}
        <div className={`p-6 rounded-3xl border shadow-lg flex flex-col justify-between space-y-4 transition-colors ${
          isBlack ? 'bg-[#10121A] border-[#1E2232]' : 'bg-white border-[#E5E7EB] shadow-xs'
        }`}>
          <div className="space-y-2">
            <div className={`w-9 h-9 rounded-2xl border flex items-center justify-center text-amber-500 ${
              isBlack ? 'bg-[#181B26] border-[#272D40]' : 'bg-[#F9FAFB] border-[#E5E7EB]'
            }`}>
            </div>
            <h3 className={`font-bold text-sm ${isBlack ? 'text-white' : 'text-neutral-900'}`}>Ideias & Oportunidades</h3>
            <p className={`text-xs leading-relaxed ${isBlack ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Cruze janela sazonal com público e dor latente; é só aprovar o que faz sentido pro seu nicho.
            </p>
          </div>
          <button
            onClick={() => onSelectTab('seasonality')}
            className={`w-full py-2.5 px-4 rounded-full border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs ${
              isBlack ? 'border-[#282F45] text-white bg-[#151824] hover:bg-[#1E2335]' : 'border-[#E5E7EB] text-neutral-900 bg-[#F9FAFB] hover:bg-neutral-100'
            }`}
          >
            <span>Aprovar ideias</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Ofertas */}
        <div className={`p-6 rounded-3xl border shadow-lg flex flex-col justify-between space-y-4 transition-colors ${
          isBlack ? 'bg-[#10121A] border-[#1E2232]' : 'bg-white border-[#E5E7EB] shadow-xs'
        }`}>
          <div className="space-y-2">
            <div className={`w-9 h-9 rounded-2xl border flex items-center justify-center ${
              isBlack ? 'bg-[#181B26] border-[#272D40] text-white' : 'bg-[#F9FAFB] border-[#E5E7EB] text-neutral-900'
            }`}>
              <Rocket className="w-4 h-4" />
            </div>
            <h3 className={`font-bold text-sm ${isBlack ? 'text-white' : 'text-neutral-900'}`}>Ofertas</h3>
            <p className={`text-xs leading-relaxed ${isBlack ? 'text-neutral-400' : 'text-neutral-600'}`}>
              A ideia aprovada vira oferta fechada: promessa, copy, entregáveis e preço prontos pra subir anúncio no mesmo dia.
            </p>
          </div>
          <button
            onClick={() => onSelectTab('offers')}
            className={`w-full py-2.5 px-4 rounded-full border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs ${
              isBlack ? 'border-[#282F45] text-white bg-[#151824] hover:bg-[#1E2335]' : 'border-[#E5E7EB] text-neutral-900 bg-[#F9FAFB] hover:bg-neutral-100'
            }`}
          >
            <span>Montar oferta</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Páginas */}
        <div className={`p-6 rounded-3xl border shadow-lg flex flex-col justify-between space-y-4 transition-colors ${
          isBlack ? 'bg-[#10121A] border-[#1E2232]' : 'bg-white border-[#E5E7EB] shadow-xs'
        }`}>
          <div className="space-y-2">
            <div className={`w-9 h-9 rounded-2xl border flex items-center justify-center text-emerald-500 ${
              isBlack ? 'bg-[#181B26] border-[#272D40]' : 'bg-[#F9FAFB] border-[#E5E7EB]'
            }`}>
              <Layers className="w-4 h-4" />
            </div>
            <h3 className={`font-bold text-sm ${isBlack ? 'text-white' : 'text-neutral-900'}`}>Páginas</h3>
            <p className={`text-xs leading-relaxed ${isBlack ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Página de vendas completa, com direção visual própria e imagens geradas, pronta pra publicar e receber tráfego.
            </p>
          </div>
          <button
            onClick={() => onSelectTab('pages')}
            className={`w-full py-2.5 px-4 rounded-full border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs ${
              isBlack ? 'border-[#282F45] text-white bg-[#151824] hover:bg-[#1E2335]' : 'border-[#E5E7EB] text-neutral-900 bg-[#F9FAFB] hover:bg-neutral-100'
            }`}
          >
            <span>Criar página</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 4: Mineração */}
        <div className={`p-6 rounded-3xl border shadow-lg flex flex-col justify-between space-y-4 transition-colors ${
          isBlack ? 'bg-[#10121A] border-[#1E2232]' : 'bg-white border-[#E5E7EB] shadow-xs'
        }`}>
          <div className="space-y-2">
            <div className={`w-9 h-9 rounded-2xl border flex items-center justify-center text-amber-500 ${
              isBlack ? 'bg-[#181B26] border-[#272D40]' : 'bg-[#F9FAFB] border-[#E5E7EB]'
            }`}>
              <Pickaxe className="w-4 h-4" />
            </div>
            <h3 className={`font-bold text-sm ${isBlack ? 'text-white' : 'text-neutral-900'}`}>Mineração</h3>
            <p className={`text-xs leading-relaxed ${isBlack ? 'text-neutral-400' : 'text-neutral-600'}`}>
              O que já está rodando no seu nicho na biblioteca da Meta, com tempo de veiculação e ângulo de cada anúncio.
            </p>
          </div>
          <button
            onClick={() => onSelectTab('mining')}
            className={`w-full py-2.5 px-4 rounded-full border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs ${
              isBlack ? 'border-[#282F45] text-white bg-[#151824] hover:bg-[#1E2335]' : 'border-[#E5E7EB] text-neutral-900 bg-[#F9FAFB] hover:bg-neutral-100'
            }`}
          >
            <span>Minerar anúncios</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
