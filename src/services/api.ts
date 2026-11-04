import { AppState, Offer, SalesPage, Deliverable, MinedAd, AdCreative } from '../types';

export const api = {
  async getStore(): Promise<AppState> {
    const res = await fetch('/api/store');
    if (!res.ok) throw new Error('Falha ao carregar dados do servidor');
    return res.json();
  },

  async analyzeBriefing(params: {
    promptText: string;
    targetMarket?: string;
    customPrice?: string;
    improvements?: string;
    sourceType?: string;
  }): Promise<any> {
    const res = await fetch('/api/ai/analyze-briefing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro na análise de briefing');
    return data.data;
  },

  async extractOfferDocuments(documents: Array<{
    name: string;
    contentBase64: string;
  }>): Promise<{ text: string; filenames: string[] }> {
    const res = await fetch('/api/documents/extract-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documents }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Não foi possível ler os documentos');
    return data;
  },

  async extractOfferPage(url: string): Promise<{ text: string; title: string; url: string }> {
    const res = await fetch('/api/pages/extract-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Não foi possível ler a página');
    return data;
  },

  async generateOffer(briefing: Offer['briefing']): Promise<Partial<Offer>> {
    const res = await fetch('/api/ai/generate-offer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ briefing }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro na geração de oferta');
    return data.data;
  },

  async regenerateSection(section: string, offerContext: Partial<Offer>): Promise<any> {
    const res = await fetch('/api/ai/regenerate-section', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, offerContext }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao regenerar secção');
    return data.data;
  },

  async generatePage(
    offer: Offer,
    currentTheme?: SalesPage['theme'],
    currentDesign?: SalesPage['design']
  ): Promise<any> {
    const res = await fetch('/api/ai/generate-page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offer, currentTheme, currentDesign }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao gerar página de vendas');
    return data.data;
  },

  async editPageWithAi(offer: Offer, page: SalesPage, instruction: string): Promise<{ page: SalesPage; reply: string }> {
    const res = await fetch('/api/ai/page-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offer, page, instruction }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Não foi possível atualizar a página');
    return data.data;
  },

  async generateDeliverable(offer: Offer): Promise<Partial<Deliverable>> {
    const res = await fetch('/api/ai/generate-deliverable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offer }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao gerar entregável');
    return data.data;
  },

  async generateCreatives(offer: Offer, count = 4): Promise<AdCreative[]> {
    const res = await fetch('/api/ai/generate-creatives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offer, count })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao gerar criativos');
    return data.data.creatives;
  },

  async saveCreative(creative: AdCreative): Promise<void> {
    await fetch('/api/creatives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creative)
    });
  },

  async deleteCreative(id: string): Promise<void> {
    await fetch(`/api/creatives/${id}`, { method: 'DELETE' });
  },

  async generateGammaDeliverable(deliverable: Deliverable): Promise<{ generationId: string; status: string }> {
    const res = await fetch('/api/gamma/generate-deliverable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliverable }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao iniciar geração no Gamma');
    return data;
  },

  async getGammaGenerationStatus(generationId: string): Promise<any> {
    const res = await fetch(`/api/gamma/generations/${encodeURIComponent(generationId)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao consultar geração no Gamma');
    return data;
  },

  async saveOffer(offer: Offer): Promise<void> {
    await fetch('/api/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offer),
    });
  },

  async deleteOffer(id: string): Promise<void> {
    await fetch(`/api/offers/${id}`, { method: 'DELETE' });
  },

  async savePage(page: SalesPage): Promise<void> {
    await fetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(page),
    });
  },

  async saveDeliverable(deliverable: Deliverable): Promise<void> {
    await fetch('/api/deliverables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deliverable),
    });
  },

  async deleteDeliverable(id: string): Promise<void> {
    await fetch(`/api/deliverables/${id}`, { method: 'DELETE' });
  },

  async saveMinedAd(ad: MinedAd): Promise<void> {
    await fetch('/api/mined-ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ad),
    });
  },

  async deleteMinedAd(id: string): Promise<void> {
    await fetch(`/api/mined-ads/${id}`, { method: 'DELETE' });
  },

  async syncMetaCampaign(campaignId: string, newPurchases?: number, newSpend?: number): Promise<void> {
    await fetch('/api/meta-ads/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId, newPurchases, newSpend }),
    });
  },

  async generateSeasonalIdeas(params: {
    event: string;
    eventCategory?: string;
    audienceType: 'b2c' | 'mixed' | 'b2b';
    count: number;
    testNotes?: string;
  }): Promise<any[]> {
    const res = await fetch('/api/ai/generate-seasonal-ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao gerar ideias sazonais');
    return data.ideas || [];
  },

  async generatePiece(params: {
    offer: Offer;
    pieceId: string;
    pieceCategory: string;
    pieceTitle: string;
    pagesCount?: number;
  }): Promise<{ pages: any[]; design?: any }> {
    const res = await fetch('/api/ai/generate-piece', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao gerar páginas da peça');
    return data;
  },

  async analyzeMinedAd(params: {
    rawCopy: string;
    title?: string;
    advertiser?: string;
    sourceUrl?: string;
  }): Promise<{ analysis: any }> {
    const res = await fetch('/api/ai/analyze-ad', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao analisar anúncio');
    return data;
  },

  async searchRealMinedAds(keyword: string, limit = 5): Promise<MinedAd[]> {
    const res = await fetch('/api/meta-ads/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword, limit }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao buscar anúncios reais');
    return Array.isArray(data.results) ? data.results : [];
  },

  async getDailyMinedAds(): Promise<{ results: MinedAd[]; cached: boolean; date: string }> {
    const res = await fetch('/api/meta-ads/daily');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao carregar as ofertas escaladas do dia');
    return {
      results: Array.isArray(data.results) ? data.results : [],
      cached: Boolean(data.cached),
      date: typeof data.date === 'string' ? data.date : '',
    };
  },

  async resetStore(): Promise<AppState> {
    const res = await fetch('/api/store/reset', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao redefinir');
    return data.store;
  },

  async restoreStore(newStore: AppState): Promise<AppState> {
    const res = await fetch('/api/store/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStore),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao restaurar');
    return data.store;
  },

  async loginWithEmail(email: string, password: string): Promise<any> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Falha na autenticação.');
    return data.user;
  },

  async registerWithEmail(name: string, email: string, password: string): Promise<any> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Falha ao registrar.');
    return data.user;
  }
};

