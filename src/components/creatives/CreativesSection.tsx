import React, { useMemo, useState } from 'react';
import { Copy, Download, Image as ImageIcon, LoaderCircle, Plus, Trash2, WandSparkles } from 'lucide-react';
import { AdCreative, Offer } from '../../types';
import { api } from '../../services/api';

interface CreativesSectionProps {
  creatives: AdCreative[];
  offers: Offer[];
  onAddCreative: (creative: AdCreative) => void;
  onDeleteCreative: (id: string) => void;
  creditsBalance: number;
  theme?: 'black' | 'white';
}

const fallbackImages = [
  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=900&q=85'
];

export const CreativesSection: React.FC<CreativesSectionProps> = ({
  creatives,
  offers,
  onAddCreative,
  onDeleteCreative,
  creditsBalance,
  theme = 'white'
}) => {
  const isBlack = theme === 'black';
  const [offerId, setOfferId] = useState(offers[0]?.id || '');
  const [filter, setFilter] = useState<'all' | 'feed' | 'stories'>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const selectedOffer = offers.find(offer => offer.id === offerId) || offers[0];
  const visibleCreatives = useMemo(
    () => creatives.filter(creative => filter === 'all' || creative.format === filter),
    [creatives, filter]
  );

  const handleGenerate = async () => {
    if (!selectedOffer) return;
    setIsGenerating(true);
    setError('');
    try {
      const generated = await api.generateCreatives(selectedOffer, 4);
      generated.forEach((creative, index) => onAddCreative({
        ...creative,
        id: creative.id || `creative-${Date.now()}-${index}`,
        offerId: selectedOffer.id,
        imageUrl: creative.imageUrl || fallbackImages[index % fallbackImages.length],
        status: 'ready',
        createdAt: creative.createdAt || new Date().toISOString()
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível gerar os criativos.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyText = async (creative: AdCreative) => {
    await navigator.clipboard?.writeText(`${creative.headline}\n\n${creative.bodyCopy}\n\n${creative.cta}`);
  };

  return (
    <section className={`flex-1 overflow-y-auto p-6 md:p-8 ${isBlack ? 'bg-[#090A0F] text-white' : 'bg-[#F7F8FA] text-neutral-900'}`}>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-[0.18em] ${isBlack ? 'text-emerald-400' : 'text-emerald-600'}`}>Biblioteca de anúncios</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight">Criativos do produto</h1>
            <p className={`mt-1 max-w-2xl text-sm ${isBlack ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Gere variações completas de copy e organize os anúncios prontos para testar no Meta Ads.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={offerId} onChange={event => setOfferId(event.target.value)} className={`rounded-xl border px-3 py-2 text-xs font-semibold outline-none ${isBlack ? 'border-[#29304A] bg-[#141827] text-white' : 'border-neutral-200 bg-white text-neutral-800'}`}>
              {offers.map(offer => <option key={offer.id} value={offer.id}>{offer.title}</option>)}
            </select>
            <button onClick={handleGenerate} disabled={isGenerating || !selectedOffer} className="flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black">
              {isGenerating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
              {isGenerating ? 'Gerando...' : 'Gerar 4 criativos'}
            </button>
          </div>
        </header>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</div>}

        <div className="flex items-center justify-between gap-3">
          <div className={`inline-flex rounded-xl border p-1 ${isBlack ? 'border-[#29304A] bg-[#141827]' : 'border-neutral-200 bg-white'}`}>
            {(['all', 'feed', 'stories'] as const).map(value => <button key={value} onClick={() => setFilter(value)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${filter === value ? 'bg-emerald-500 text-white' : isBlack ? 'text-neutral-400' : 'text-neutral-500'}`}>{value === 'all' ? 'Todos' : value === 'feed' ? 'Feed / Carrossel' : 'Stories'}</button>)}
          </div>
          <span className={`text-xs ${isBlack ? 'text-neutral-500' : 'text-neutral-400'}`}>{visibleCreatives.length} criativos · {creditsBalance} créditos</span>
        </div>

        {visibleCreatives.length === 0 ? (
          <div className={`rounded-2xl border border-dashed p-16 text-center ${isBlack ? 'border-[#29304A] bg-[#10131D]' : 'border-neutral-300 bg-white'}`}>
            <ImageIcon className="mx-auto h-8 w-8 text-neutral-400" />
            <h2 className="mt-3 text-sm font-bold">Nenhum criativo pronto</h2>
            <p className="mx-auto mt-1 max-w-md text-xs text-neutral-500">Escolha um produto e gere quatro variações de anúncio com headline, copy, CTA e formato.</p>
            <button onClick={handleGenerate} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white"><Plus className="h-4 w-4" />Criar primeira rodada</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2">
            {visibleCreatives.map(creative => (
              <article key={creative.id} className={`overflow-hidden rounded-2xl border shadow-sm ${isBlack ? 'border-[#29304A] bg-[#111520]' : 'border-neutral-200 bg-white'}`}>
                <div className="relative aspect-square overflow-hidden bg-neutral-100">
                  <img src={creative.imageUrl || fallbackImages[0]} alt={creative.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-x-3 top-3 flex items-center justify-between"><span className="rounded-full bg-black/75 px-2.5 py-1 text-[10px] font-bold text-white">{creative.hookType}</span><span className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-neutral-800">{creative.format === 'stories' ? '9:16' : '1:1'}</span></div>
                  <div className="absolute inset-x-4 bottom-4 rounded-xl bg-black/70 p-3 text-white backdrop-blur-sm"><p className="line-clamp-2 text-sm font-black leading-tight">{creative.headline}</p><div className="mt-3 rounded-lg bg-emerald-500 px-3 py-1.5 text-center text-[10px] font-black uppercase">{creative.cta}</div></div>
                </div>
                <div className="space-y-3 p-4"><div><h3 className="line-clamp-1 text-sm font-extrabold">{creative.title}</h3><p className={`mt-1 line-clamp-4 whitespace-pre-line text-xs leading-relaxed ${isBlack ? 'text-neutral-400' : 'text-neutral-500'}`}>{creative.bodyCopy}</p></div><div className="flex items-center justify-between border-t pt-3 ${isBlack ? 'border-[#29304A]' : 'border-neutral-100'}"><button onClick={() => copyText(creative)} className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 hover:text-emerald-600"><Copy className="h-3.5 w-3.5" />Copiar copy</button><div className="flex items-center gap-1"><button title="Baixar imagem" className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800"><Download className="h-3.5 w-3.5" /></button><button title="Excluir" onClick={() => onDeleteCreative(creative.id)} className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></div></div></div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
