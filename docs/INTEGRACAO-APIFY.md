# Integração com a Apify — Mineração de anúncios low-ticket

## O que a integração faz

O app consulta o Facebook Ads Library usando o Actor da Apify `curious_coder~facebook-ads-library-scraper` e normaliza os resultados para a estrutura `MinedAd`.

O filtro atual mantém anúncios que:

- indiquem um produto digital, como PDF, ebook, pack, kit, planner, template ou guia;
- tenham preço entre R$ 9 e R$ 97, ou indiquem explicitamente “low ticket”;
- não apresentem preço acima de R$ 97.

## Chave necessária

Configure no servidor:

```env
APIFY_API_TOKEN=cole_o_seu_token_da_apify_aqui
```

O token deve ser criado no painel da Apify em **Settings → Integrations → API tokens**. Nunca coloque essa chave em variáveis `VITE_*`, no frontend ou em código enviado ao navegador.

Por segurança, a chave real não é incluída nesta documentação nem exposta no chat. No app atual, ela já está configurada localmente no arquivo `.env`; para o outro app, copie o valor da variável `APIFY_API_TOKEN` para o ambiente seguro do servidor.

## Endpoint direto da Apify

```text
POST https://api.apify.com/v2/acts/curious_coder~facebook-ads-library-scraper/run-sync-get-dataset-items?timeout=120&limit=15
```

Headers:

```http
Authorization: Bearer APIFY_API_TOKEN
Content-Type: application/json
Accept: application/json
```

Payload usado pelo app:

```json
{
  "urls": [
    {
      "url": "https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BR&q=low%20ticket&search_type=keyword_unordered&media_type=all"
    }
  ],
  "count": 15,
  "scrapePageAds.period": "",
  "scrapePageAds.activeStatus": "all",
  "scrapePageAds.sortBy": "impressions_desc",
  "scrapePageAds.countryCode": "BR"
}
```

## Endpoints internos do Veltor

### Buscar anúncios

```http
POST /api/meta-ads/search
Content-Type: application/json
```

Body:

```json
{
  "keyword": "planner",
  "limit": 10
}
```

### Carregar mineração diária

```http
GET /api/meta-ads/daily
```

Essa rota consulta os termos `low ticket`, `pdf`, `ebook` e `pack de templates`, remove duplicados, aplica o filtro low-ticket e salva o resultado no cache diário.

## Exemplo de integração em outro backend

```ts
const response = await fetch(
  'https://api.apify.com/v2/acts/curious_coder~facebook-ads-library-scraper/run-sync-get-dataset-items?timeout=120&limit=10',
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.APIFY_API_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      urls: [{ url: facebookAdsLibraryUrl }],
      count: 10,
      'scrapePageAds.period': '',
      'scrapePageAds.activeStatus': 'all',
      'scrapePageAds.sortBy': 'impressions_desc',
      'scrapePageAds.countryCode': 'BR'
    })
  }
);

if (!response.ok) {
  throw new Error(`Apify respondeu HTTP ${response.status}`);
}

const ads = await response.json();
```

## Campos principais retornados

```ts
type MinedAd = {
  id: string;
  title: string;
  copy: string;
  advertiser: string;
  imageUrl: string;
  imageUrls?: string[];
  videoUrl?: string;
  sourceUrl: string;
  destinationUrl?: string;
  activeStatus?: string;
  creativeCount?: number;
  collationCount?: number;
};
```

Alguns anúncios podem ser retornados sem imagem ou vídeo quando a Meta não disponibiliza a mídia na resposta do Actor. Nesses casos, o app mantém o anúncio visível e oferece o link para a Biblioteca de Anúncios da Meta.

## Arquivos da integração neste projeto

- `apifyMetaAds.ts`: chamada ao Actor e normalização dos dados.
- `server.ts`: filtros low-ticket e rotas `/api/meta-ads/search` e `/api/meta-ads/daily`.
- `src/services/api.ts`: chamadas do frontend ao backend.
- `.env.example`: lista das variáveis necessárias.
