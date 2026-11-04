import React, { useEffect, useState } from 'react';
import { 
  Search, 
  ExternalLink, 
} from 'lucide-react';
import { MinedAd } from '../../types';
import { api } from '../../services/api';
import { MiningCardSkeleton } from '../common/Skeleton';

interface AdMiningLibraryProps {
  onCreateOfferFromAd: (ad: MinedAd) => void;
  theme?: 'black' | 'white';
}

export const AdMiningLibrary: React.FC<AdMiningLibraryProps> = ({
  onCreateOfferFromAd,
  theme = 'white'
}) => {
  const isBlack = theme === 'black';
  const [selectedNiche, setSelectedNiche] = useState<string>('all');
  const [isMiningReal, setIsMiningReal] = useState(false);
  const [realSearchQuery, setRealSearchQuery] = useState('');
  const [realSearchResults, setRealSearchResults] = useState<MinedAd[]>([]);
  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isDailyLoading, setIsDailyLoading] = useState(true);
  const [dailyCached, setDailyCached] = useState(false);

  useEffect(() => {
    let active = true;
    setIsDailyLoading(true);
    setSearchError('');
    api.getDailyMinedAds()
      .then(({ results, cached }) => {
        if (!active) return;
        setRealSearchResults(results);
        setDailyCached(cached);
        setHasSearched(true);
      })
      .catch((err) => {
        if (!active) return;
        setSearchError(err instanceof Error ? err.message : 'Falha ao carregar as ofertas escaladas do dia.');
      })
      .finally(() => {
        if (active) setIsDailyLoading(false);
      });
    return () => { active = false; };
  }, []);

  const niches = ['all', ...Array.from(new Set(realSearchResults.map(ad => ad.niche).filter(Boolean)))];

  const filteredAds = realSearchResults.filter(ad => {
    const matchesNiche = selectedNiche === 'all' || ad.niche === selectedNiche;
    return matchesNiche;
  });

  const handleSearchRealAds = async (searchTerm = realSearchQuery) => {
    const term = searchTerm.trim();
    if (!term) return;
    setIsMiningReal(true);
    setSearchError('');
    setHasSearched(true);
    try {
      const results = await api.searchRealMinedAds(term, 10);
      setRealSearchResults(results);
      setDailyCached(false);
    } catch (err) {
      console.error('Error searching real ads:', err);
      setRealSearchResults([]);
      setSearchError(err instanceof Error ? err.message : 'Falha ao buscar anúncios reais.');
    } finally {
      setIsMiningReal(false);
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-8 space-y-6 select-none transition-colors ${
      isBlack ? 'bg-[#090A0F] text-[#E2E4E9]' : 'bg-[#F8F9FA] text-[#111827]'
    }`}>
      {/* Top Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b transition-colors ${
        isBlack ? 'border-[#1A1D2B]' : 'border-[#E5E7EB]'
      }`}>
        <div>
          <h1 className={`text-xl font-bold font-display transition-colors ${
            isBlack ? 'text-white' : 'text-neutral-900'
          }`}>
            Mineração de Anúncios na Meta
          </h1>
          <p className={`text-xs transition-colors ${
            isBlack ? 'text-neutral-400' : 'text-neutral-500'
          }`}>
            Ofertas escaladas de PDFs low ticket, atualizadas uma vez por dia e salvas no cache.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => void handleSearchRealAds()}
            disabled={isMiningReal || !realSearchQuery.trim()}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              isBlack
                ? 'bg-white hover:bg-neutral-200 text-black shadow-md'
                : 'bg-black hover:bg-neutral-800 text-white shadow-xs'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isMiningReal ? 'Buscando anúncios...' : 'Buscar 10 anúncios reais'}</span>
          </button>

          <a
            href="https://www.facebook.com/ads/library/"
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-semibold shadow-xs transition-all ${
              isBlack
                ? 'border-[#272D42] bg-[#141624] hover:bg-[#1C2032] text-white'
                : 'border-[#E5E7EB] bg-white hover:bg-neutral-100 text-neutral-800'
            }`}
          >
            <span>Abrir Meta Ad Library</span>
            <ExternalLink className={`w-3.5 h-3.5 ${isBlack ? 'text-white' : 'text-neutral-700'}`} />
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className={`w-3.5 h-3.5 absolute left-3 top-3 ${
            isBlack ? 'text-neutral-400' : 'text-neutral-500'
          }`} />
          <input
            type="text"
            placeholder="Ex.: organização financeira"
            value={realSearchQuery}
            onChange={(e) => setRealSearchQuery(e.target.value)}
            className={`w-full rounded-full pl-9 pr-9 py-2 text-xs transition-colors outline-none border ${
              isBlack
                ? 'bg-[#12141F] border-[#23273D] text-white placeholder-neutral-500 focus:border-white'
                : 'bg-white border-[#E5E7EB] text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 shadow-xs'
            }`}
          />
          <button
            type="button"
            onClick={() => void handleSearchRealAds()}
            disabled={isMiningReal || !realSearchQuery.trim()}
            className={`absolute right-1 top-1 rounded-full p-1.5 disabled:opacity-50 ${isBlack ? 'text-neutral-300' : 'text-neutral-700'}`}
            title="Buscar 10 anúncios reais"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {niches.map(n => {
            const isActive = selectedNiche === n;
            return (
              <button
                key={n}
                onClick={() => setSelectedNiche(n)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? isBlack
                      ? 'bg-white text-black shadow-xs font-bold'
                      : 'bg-black text-white shadow-xs font-bold'
                    : isBlack
                      ? 'bg-[#12141F] text-neutral-400 hover:text-white border border-[#23273D]'
                      : 'bg-white text-neutral-600 hover:text-neutral-900 border border-[#E5E7EB] shadow-xs'
                }`}
              >
                {n === 'all' ? 'Todos os Nichos' : n}
              </button>
            );
          })}
        </div>
      </div>

      <div aria-live="polite" className={`text-xs ${isBlack ? 'text-neutral-400' : 'text-neutral-500'}`}>
          {isDailyLoading
          ? 'Carregando as ofertas escaladas de hoje...'
          : isMiningReal
          ? 'Buscando anúncios reais na Meta Ad Library...'
          : searchError
            ? searchError
            : realSearchResults.length
              ? `${dailyCached ? 'Ofertas escaladas de hoje salvas no cache. ' : ''}Exibindo ${filteredAds.length} de ${realSearchResults.length} anúncios reais.`
            : hasSearched
              ? 'Nenhum anúncio real encontrado para esta busca.'
              : 'Digite uma palavra-chave para pesquisar na Biblioteca de Anúncios da Meta.'}
      </div>

      {/* Ad Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {isDailyLoading ? Array.from({ length: 6 }, (_, index) => <MiningCardSkeleton key={`mining-skeleton-${index}`} />) : filteredAds.map((ad) => (
          <div
            key={ad.id}
            className={`rounded-3xl border overflow-hidden transition-all flex flex-col justify-between ${
              isBlack
                ? 'bg-[#10121A] border-[#1E2232] shadow-xl hover:border-[#2F3652]'
                : 'bg-white border-[#E5E7EB] shadow-xs hover:border-neutral-300 hover:shadow-md'
            }`}
          >
            {/* Top Action Header */}
            <div className={`p-3 flex items-center justify-between text-xs font-medium border-b transition-colors ${
              isBlack ? 'bg-[#161826] text-white border-[#23273D]' : 'bg-[#F9FAFB] text-neutral-700 border-[#E5E7EB]'
            }`}>
              <div className="flex min-w-0 items-center gap-2">
                {ad.advertiserAvatar && <img src={ad.advertiserAvatar} alt="" className="h-8 w-8 rounded-full border object-cover shrink-0" />}
                <span className={`truncate text-[11px] font-semibold ${isBlack ? 'text-neutral-300' : 'text-neutral-700'}`}>{ad.advertiser}</span>
              </div>
              {ad.sourceUrl && (
                <a href={ad.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold hover:underline">
                  Biblioteca Meta <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Card Body */}
            <div className="p-4 space-y-3.5">
              {/* Status row */}
              {ad.activeStatus && <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                  isBlack
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {ad.activeStatus}
                </span>
                {ad.activeCountBadge && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    isBlack
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {ad.activeCountBadge}
                  </span>
                )}
              </div>}

              {ad.collationCount && ad.collationCount > 0 && (
                <div className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                  isBlack ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : 'border-amber-200 bg-amber-50 text-amber-800'
                }`}>
                  {ad.collationCount} anúncios ativos neste grupo
                </div>
              )}

              {ad.observedDate && <div className={`text-[11px] font-medium ${isBlack ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Início da veiculação: {new Date(ad.observedDate).toLocaleDateString('pt-BR')}
              </div>}

              {/* Platforms row */}
              {ad.platformsList?.length ? <div className={`text-[11px] ${isBlack ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Plataformas: {ad.platformsList.join(', ')}
              </div> : null}

              {/* Copy snippet */}
              {ad.copy && <p className={`text-xs line-clamp-4 leading-relaxed ${isBlack ? 'text-neutral-300' : 'text-neutral-700'}`}>{ad.copy}</p>}

              {ad.cta && <div className={`text-[11px] ${isBlack ? 'text-neutral-300' : 'text-neutral-700'}`}>Botão do anúncio: <strong>{ad.cta}</strong></div>}

              {ad.destinationUrl && (
                <div className={`space-y-1 border-t pt-3 text-[11px] ${isBlack ? 'border-[#23273D] text-neutral-400' : 'border-neutral-200 text-neutral-500'}`}>
                  <div className="font-semibold">Site de destino</div>
                  <a href={ad.destinationUrl} target="_blank" rel="noreferrer" className={`inline-flex max-w-full items-center gap-1 font-semibold hover:underline ${isBlack ? 'text-white' : 'text-neutral-900'}`}>
                    <span className="truncate">{ad.destinationDomain || ad.destinationUrl}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>
              )}

              {ad.videoUrl ? (
                <div className={`relative overflow-hidden rounded-2xl border ${isBlack ? 'border-[#23273A] bg-[#161824]' : 'border-neutral-200 bg-neutral-100'}`}>
                  <video
                    src={ad.videoUrl}
                    poster={ad.imageUrl || ad.imageUrls?.[0]}
                    controls
                    playsInline
                    preload="metadata"
                    className="aspect-4/5 h-full w-full object-cover"
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-black/75 px-2 py-1 text-[10px] font-semibold text-white">
                    Vídeo
                  </span>
                </div>
              ) : (ad.imageUrl || ad.imageUrls?.length) ? (
                <div className={`relative aspect-4/5 overflow-hidden rounded-2xl border ${isBlack ? 'border-[#23273A] bg-[#161824]' : 'border-neutral-200 bg-neutral-100'}`}>
                  <img src={ad.imageUrl || ad.imageUrls?.[0]} alt={ad.title} className="h-full w-full object-cover" loading="lazy" />
                  {ad.isVideo && (
                    <span className="absolute left-2 top-2 rounded-full bg-black/75 px-2 py-1 text-[10px] font-semibold text-white">
                      Vídeo detectado
                    </span>
                  )}
                  {ad.creativeCount && ad.creativeCount > 1 && (
                    <span className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-1 text-[10px] font-semibold text-white">
                      {ad.creativeCount} criativos
                    </span>
                  )}
                </div>
              ) : (
                <div className={`rounded-2xl border p-5 text-center ${isBlack ? 'border-[#23273A] bg-[#161824]' : 'border-neutral-200 bg-neutral-100'}`}>
                  <div className={`text-xs font-semibold ${isBlack ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Mídia não disponibilizada pela fonte
                  </div>
                  <p className={`mt-1 text-[11px] ${isBlack ? 'text-neutral-500' : 'text-neutral-500'}`}>
                    O anúncio foi encontrado, mas a Meta não forneceu uma imagem ou vídeo nesta consulta.
                  </p>
                  {ad.sourceUrl && (
                    <a href={ad.sourceUrl} target="_blank" rel="noreferrer" className={`mt-3 inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${isBlack ? 'border-[#23273D] text-neutral-300 hover:bg-[#161824]' : 'border-neutral-200 text-neutral-700 hover:bg-white'}`}>
                      Abrir criativo na Biblioteca Meta <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              )}

              {/* Notes if available */}
            </div>

            {/* Bottom Actions Row */}
            <div className={`p-3 border-t space-y-2 transition-colors ${
              isBlack ? 'bg-[#0D0F17] border-[#1C2030]' : 'bg-[#F9FAFB] border-[#E5E7EB]'
            }`}>
              <button
                onClick={() => onCreateOfferFromAd(ad)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isBlack
                    ? 'bg-white hover:bg-neutral-200 text-black shadow-md'
                    : 'bg-black hover:bg-neutral-800 text-white shadow-xs'
                }`}
              >
                <span>Transformar em Nova Oferta</span>
              </button>
            </div>
          </div>
        ))}
        {!isDailyLoading && !filteredAds.length && !searchError && (
          <div className={`md:col-span-2 lg:col-span-3 rounded-3xl border border-dashed p-10 text-center ${isBlack ? 'border-[#2A3047] bg-[#10121A]' : 'border-neutral-300 bg-white'}`}>
            <h3 className={`text-sm font-bold ${isBlack ? 'text-white' : 'text-neutral-900'}`}>Nenhuma oferta encontrada</h3>
            <p className={`mx-auto mt-1 max-w-md text-xs ${isBlack ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Tente outra palavra-chave ou aguarde a próxima atualização diária da mineração.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
