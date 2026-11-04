export type AppTab = 
  | 'dashboard'
  | 'seasonality'
  | 'offers'
  | 'pages'
  | 'creatives'
  | 'deliverables'
  | 'mining'
  | 'analytics'
  | 'settings'
  | 'login';

export interface OfferBriefing {
  productName: string;
  productType: string;
  targetAudience: string;
  coreProblem: string;
  price: string;
  regularPrice: string;
  competitorUrl?: string;
  niche?: string;
}

export interface SeasonalEventContext {
  country: 'Brasil' | 'Moçambique' | 'Espanha' | 'Portugal';
  title: string;
  category: string;
  day: number;
  month: number;
  year: number;
}

export interface BonusItem {
  title: string;
  value: string;
  description: string;
}

export interface OrderBump {
  active: boolean;
  title: string;
  price: string;
  description: string;
}

export interface UpsellItem {
  active: boolean;
  title: string;
  price: string;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Offer {
  id: string;
  title: string;
  niche: string;
  status: 'Rascunho' | 'Em produção' | 'Aprovada' | 'Validado' | 'Escalando' | 'Pausado';
  version: number;
  lastModified: string;
  briefing: OfferBriefing;
  promise: string;
  mechanism: string;
  benefits: string[];
  bonuses: BonusItem[];
  orderBump: OrderBump;
  upsell: UpsellItem;
  faqs: FAQItem[];
  outdatedMaterials?: {
    page: boolean;
    deliverable: boolean;
  };
  businessType?: 'B2B' | 'B2C';
  targetMarket?: string;
  avatar?: {
    ageRange: string;
    incomeProfile: string;
    behavior: string;
    purchaseTrigger: string;
    mainPain: string;
    mainDesire: string;
  };
  kitComposition?: {
    format: string;
    referenceUrl?: string;
    items: string[];
  };
  priceGuarantee?: {
    frontendPrice: string;
    justification: string;
  };
  orderBumpsList?: Array<{
    id: string;
    title: string;
    price: number;
    takeRate: number;
    impact: number;
  }>;
  upsellsList?: Array<{
    id: string;
    title: string;
    description: string;
    price: number;
    takeRate: number;
    impact: number;
  }>;
  copyOverview?: {
    headline: string;
    subheadline: string;
    ctaText: string;
    benefits: string[];
    painAgitation: string;
    solutionPresentation: string;
    socialProofNote: string;
    sampleTestimonials: Array<{ author: string; role: string; quote: string }>;
  };
  pageDesign?: PageDesign;
  pageTheme?: 'warm-cream' | 'midnight-dark' | 'clean-white';
}

export interface PageBlock {
  id: string;
  type: 'hero' | 'problem' | 'mechanism' | 'items' | 'socialProof' | 'offer' | 'faq' | 'guarantee' | 'footer';
  badge?: string;
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  heroImage?: string;
  chips?: string[];
  title?: string;
  description?: string;
  cards?: Array<{ title: string; description: string; icon?: string }>;
  steps?: Array<{ step: string; title: string; text: string }>;
  items?: Array<{ title: string; desc: string; tag: string; image?: string }>;
  regularPrice?: string;
  price?: string;
  urgency?: string;
  guaranteeText?: string;
  testimonials?: Array<{ name: string; text: string; role: string; avatar: string }>;
  animation?: 'none' | 'fade-up' | 'slide-in' | 'zoom-in' | 'float';
}

export interface PageDesign {
  visualConcept: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  fontStyle: 'editorial' | 'modern' | 'technical' | 'soft';
  radius: 'sharp' | 'rounded' | 'pill';
  animation: 'none' | 'fade-up' | 'slide-in' | 'zoom-in' | 'float';
  heroLayout: 'centered' | 'split' | 'immersive';
  backgroundPattern?: 'none' | 'dots' | 'grid' | 'paper' | 'soft-glow';
  heroDecoration?: 'none' | 'blobs' | 'rays' | 'stars' | 'scribbles';
  cardStyle?: 'bordered' | 'elevated' | 'flat' | 'glass';
  buttonStyle?: 'solid' | 'outline' | 'soft' | 'gradient';
}

export interface SalesPage {
  id: string;
  offerId: string;
  offerTitle?: string;
  title: string;
  slug: string;
  published: boolean;
  lastUpdated: string;
  theme: 'warm-cream' | 'midnight-dark' | 'clean-white';
  checkoutUrl: string;
  orderBumpActive?: boolean;
  exitPopupActive?: boolean;
  blocks: PageBlock[];
  design?: PageDesign;
}

export interface AdCreative {
  id: string;
  offerId: string;
  title: string;
  format: 'feed' | 'stories';
  headline: string;
  bodyCopy: string;
  cta: string;
  hookType: string;
  visualPrompt?: string;
  imageUrl: string;
  status: 'draft' | 'ready';
  createdAt: string;
}

export interface DeliverablePage {
  pageNumber: number;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  visualPrompt?: string;
  visualType?: 'cover' | 'lesson' | 'checklist' | 'recipe' | 'worksheet' | 'summary';
  callouts?: string[];
  content: string;
}

export interface DeliverableDesign {
  visualConcept: string;
  accentColor: string;
  pageBackground: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  fontStyle: 'editorial' | 'modern' | 'technical' | 'soft';
  pageStyle: 'editorial' | 'workbook' | 'minimal' | 'playful' | 'executive';
  coverStyle: 'typographic' | 'illustrated' | 'geometric' | 'photo' | 'minimal';
  decoration: 'none' | 'dots' | 'grid' | 'paper' | 'rays' | 'organic';
}

export interface DeliverablePiece {
  id: string;
  category: 'main' | 'bonus' | 'order_bump' | 'upsell';
  title: string;
  badge?: string;
  pagesCount: number;
  status: 'not_generated' | 'generating' | 'ready';
  currentGeneratingPage?: number;
  pages: DeliverablePage[];
}

export interface DeliverableChapter {
  id: string;
  title: string;
  content: string;
  checklist?: string[];
}

export interface Deliverable {
  id: string;
  offerId: string;
  offerTitle?: string;
  title: string;
  format: string;
  totalPages: number;
  lastExported?: string;
  status: 'draft' | 'in_review' | 'ready';
  chapters: DeliverableChapter[];
  design?: DeliverableDesign;
  pieces?: DeliverablePiece[];
  gammaGenerationId?: string;
  gammaUrl?: string;
  gammaExportUrl?: string;
}

export interface MinedAd {
  id: string;
  title: string;
  sourceUrl: string;
  platform: string;
  advertiser: string;
  advertiserAvatar?: string;
  observedDate: string;
  niche: string;
  copy: string;
  cta: string;
  imageUrl: string;
  notes: string;
  priceEstimate?: string;
  activeStatus?: string;
  activeSince?: string;
  activeCountBadge?: string;
  platformsList?: string[];
  destinationDomain?: string;
  destinationUrl?: string;
  imageUrls?: string[];
  videoUrl?: string;
  creativeCount?: number;
  collationCount?: number;
  isVideo?: boolean;
}

export interface MetaCampaign {
  id: string;
  offerId: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'LEARNING';
  spend: number;
  impressions: number;
  clicks: number;
  purchases: number;
  revenue: number;
  cpa: number;
  roas: number;
  connectedAccount: string;
}

export interface CreditHistoryItem {
  id: string;
  date: string;
  action: string;
  amount: number;
  offerId?: string;
}

export interface AppState {
  offers: Offer[];
  pages: SalesPage[];
  creatives: AdCreative[];
  deliverables: Deliverable[];
  minedAds: MinedAd[];
  campaigns: MetaCampaign[];
  credits: {
    balance: number;
    history: CreditHistoryItem[];
  };
  funnel?: {
    ideiasAguardando: number;
    aprovadas: number;
    emProducao: number;
    emTeste: number;
    escalando: number;
  };
}
