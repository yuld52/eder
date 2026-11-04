import { MinedAd } from './src/types';

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as JsonRecord
    : {};
}

function firstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function stringFromArray(value: unknown): string {
  if (!Array.isArray(value)) return '';
  return firstString(...value);
}

function stringList(...values: unknown[]): string[] {
  for (const value of values) {
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()));
    }
  }
  return [];
}

function normalizeAd(value: unknown, index: number, searchUrl: string): MinedAd {
  const ad = asRecord(value);
  const snapshot = asRecord(ad.snapshot);
  const cards = Array.isArray(snapshot.cards) ? snapshot.cards.map(asRecord) : [];
  const firstCard = cards[0] || {};
  const body = asRecord(snapshot.body);
  const cardBody = asRecord(firstCard.body);
  const adId = firstString(ad.ad_archive_id, ad.adArchiveId, ad.id, ad.ad_id);
  const advertiser = firstString(ad.page_name, ad.pageName, ad.advertiser, snapshot.page_name);
  const copy = firstString(
    stringFromArray(ad.ad_creative_bodies),
    body.text,
    cardBody.text,
    firstCard.body,
    ad.body,
    ad.adText,
    ad.ad_copy,
    ad.text,
    ad.copy
  );
  const title = firstString(
    stringFromArray(ad.ad_creative_link_titles),
    firstCard.title,
    snapshot.title,
    ad.headline,
    ad.creativeTitle,
    ad.title,
    copy.slice(0, 90),
    advertiser
  ) || `Anúncio sem título ${index + 1}`;
  const imageUrls = [
    firstString(ad.imageUrl, ad.image_url, ad.thumbnailUrl, ad.thumbnail_url),
    ...stringList(ad.imageUrls, ad.image_urls, ad.images),
    ...cards.flatMap(card => [
      firstString(card.resized_image_url, card.resizedImageUrl),
      firstString(card.original_image_url, card.originalImageUrl),
      firstString(card.image_url, card.imageUrl),
      firstString(card.video_preview_image_url, card.videoPreviewImageUrl)
    ]),
    firstString(snapshot.images)
  ].filter((url, urlIndex, urls) => Boolean(url) && urls.indexOf(url) === urlIndex);
  const destinationUrl = firstString(
    firstCard.link_url,
    firstCard.linkUrl,
    snapshot.link_url,
    snapshot.linkUrl,
    ad.destinationUrl,
    ad.destination_url
  );
  const explicitSourceUrl = firstString(
    ad.sourceUrl,
    ad.source_url,
    ad.adLibraryUrl,
    ad.ad_library_url,
    ad.url,
    ad.page_url
  );
  const publisherPlatforms = stringList(ad.publisher_platform, ad.publisherPlatform, ad.platformsList);
  const rawActiveStatus = ad.is_active ?? ad.isActive ?? ad.active_status ?? ad.activeStatus;
  const activeStatus = typeof rawActiveStatus === 'boolean'
    ? rawActiveStatus ? 'Ativo' : 'Inativo'
    : firstString(rawActiveStatus);
  const observedDate = firstString(
    ad.ad_delivery_start_time,
    ad.startDate,
    ad.start_date,
    ad.ad_delivery_stop_time,
    ad.endDate,
    ad.end_date
  );
  const imageUrl = imageUrls[0] || '';
  const videoUrl = firstString(
    firstCard.video_hd_url,
    firstCard.videoHdUrl,
    firstCard.video_sd_url,
    firstCard.videoSdUrl,
    firstCard.video_url,
    firstCard.videoUrl,
    snapshot.video_hd_url,
    snapshot.videoHdUrl,
    ad.video_hd_url,
    ad.videoHdUrl,
    ad.video_sd_url,
    ad.videoSdUrl,
    ad.video_url,
    ad.videoUrl
  );

  return {
    id: `apify-${adId || `${index}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}`,
    title,
    sourceUrl: adId
      ? `https://www.facebook.com/ads/library/?id=${encodeURIComponent(adId)}`
      : explicitSourceUrl || searchUrl,
    platform: 'Meta Ad Library',
    advertiser,
    advertiserAvatar: firstString(snapshot.page_profile_picture_url, snapshot.pageProfilePictureUrl, ad.advertiserAvatar),
    observedDate,
    niche: firstString(ad.niche, snapshot.page_categories) || stringList(snapshot.page_categories).join(', ') || 'Produtos Digitais',
    copy,
    cta: firstString(
      firstCard.cta_text,
      firstCard.ctaText,
      snapshot.cta_text,
      snapshot.ctaText,
      ad.callToAction,
      ad.cta
    ),
    imageUrl,
    imageUrls,
    videoUrl,
    notes: '',
    activeStatus: activeStatus || 'Ativo',
    platformsList: publisherPlatforms,
    destinationUrl,
    destinationDomain: (() => {
      try {
        return destinationUrl ? new URL(destinationUrl).hostname.replace(/^www\./, '') : '';
      } catch {
        return '';
      }
    })(),
    creativeCount: cards.length || imageUrls.length || undefined,
    collationCount: Number(ad.collation_count ?? ad.collationCount) || undefined,
    isVideo: Boolean(videoUrl || firstString(ad.video))
  };
}

export class ApifyMetaAdsError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApifyMetaAdsError';
  }
}

export async function searchApifyMetaAds(
  keyword: string,
  limit: number,
  apiToken: string
): Promise<MinedAd[]> {
  const effectiveCount = Math.max(10, limit);
  const params = new URLSearchParams({
    active_status: 'all',
    ad_type: 'all',
    country: 'BR',
    q: keyword,
    search_type: 'keyword_unordered',
    media_type: 'all'
  });
  const searchUrl = `https://www.facebook.com/ads/library/?${params.toString()}`;
  const input = {
    urls: [{ url: searchUrl }],
    count: effectiveCount,
    'scrapePageAds.period': '',
    'scrapePageAds.activeStatus': 'all',
    'scrapePageAds.sortBy': 'impressions_desc',
    'scrapePageAds.countryCode': 'BR'
  };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 125_000);

  try {
    const response = await fetch(
      `https://api.apify.com/v2/acts/curious_coder~facebook-ads-library-scraper/run-sync-get-dataset-items?timeout=120&limit=${effectiveCount}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(input),
        signal: controller.signal
      }
    );

    if (!response.ok) {
      const statusCode = response.status === 408 || response.status === 504 ? 504 : 502;
      throw new ApifyMetaAdsError(
        response.status === 401 || response.status === 403
          ? 'A Apify rejeitou o token. Verifique APIFY_API_TOKEN.'
          : `A busca na Apify falhou (HTTP ${response.status}). Verifique o token, o acesso ao Actor e os créditos da conta.`,
        statusCode
      );
    }

    const items: unknown = await response.json();
    if (!Array.isArray(items)) {
      throw new ApifyMetaAdsError('A Apify retornou um formato de dados inesperado.', 502);
    }
    if (items.length > 0 && typeof (items[0] as any)?.error === 'string') {
      throw new ApifyMetaAdsError((items[0] as any).error, 502);
    }
    const validItems = items.filter(item => item && typeof item === 'object' && !('error' in (item as any)));
    return validItems.slice(0, limit).map((item, index) => normalizeAd(item, index, searchUrl));
  } catch (error) {
    if (error instanceof ApifyMetaAdsError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApifyMetaAdsError('A busca na Apify excedeu o tempo limite. Tente novamente.', 504);
    }
    throw new ApifyMetaAdsError('Não foi possível conectar à Apify para buscar anúncios.', 502);
  } finally {
    clearTimeout(timeout);
  }
}

export async function searchMetaAdsGraphApi(
  keyword: string,
  limit: number,
  accessToken: string
): Promise<MinedAd[]> {
  const params = new URLSearchParams({
    access_token: accessToken,
    ad_reached_countries: JSON.stringify(['BR']),
    ad_type: 'ALL',
    search_terms: keyword,
    fields: 'id,ad_creation_time,ad_delivery_start_time,ad_delivery_stop_time,ad_creative_bodies,ad_creative_link_captions,ad_creative_link_descriptions,ad_creative_link_titles,page_id,page_name,publisher_platforms,bylines',
    limit: String(limit)
  });

  const response = await fetch(`https://graph.facebook.com/v21.0/ads_archive?${params.toString()}`, {
    signal: AbortSignal.timeout(20_000)
  });

  const json: any = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(json?.data)) {
    const errorMsg = json?.error?.message || `Meta API HTTP ${response.status}`;
    throw new Error(errorMsg);
  }

  return json.data.map((item: any) => {
    const bodies = Array.isArray(item.ad_creative_bodies) ? item.ad_creative_bodies : [];
    const titles = Array.isArray(item.ad_creative_link_titles) ? item.ad_creative_link_titles : [];
    const copy = bodies[0] || '';
    const title = titles[0] || (copy ? copy.slice(0, 90) : `Anúncio ${item.id}`);
    const platforms = Array.isArray(item.publisher_platforms) ? item.publisher_platforms : [];

    return {
      id: `meta-${item.id}`,
      title,
      sourceUrl: `https://www.facebook.com/ads/library/?id=${encodeURIComponent(item.id)}`,
      platform: 'Meta Ad Library',
      advertiser: item.page_name || 'Anunciante Meta',
      observedDate: item.ad_delivery_start_time || item.ad_creation_time || new Date().toISOString(),
      niche: 'Digital',
      copy,
      cta: 'Saiba Mais',
      imageUrl: '',
      imageUrls: [],
      notes: '',
      activeStatus: item.ad_delivery_stop_time ? 'Inativo' : 'Ativo',
      platformsList: platforms
    };
  });
}

