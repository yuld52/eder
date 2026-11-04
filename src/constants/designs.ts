import { PageDesign, SalesPage } from '../types';

/**
 * Visual design is chosen autonomously by the AI.
 * This helper provides a contextual fallback when an offer has not yet been processed by the AI.
 */
export function getDefaultDesignForOffer(niche = '', title = ''): { theme: SalesPage['theme']; design: PageDesign } {
  const text = `${niche} ${title}`.toLowerCase();

  if (text.match(/bibli|fe\b|crist|igreja|pastor|ebd|evang|culto|orac|deus|gospel|versicul|devocional/i)) {
    return {
      theme: 'warm-cream',
      design: {
        visualConcept: 'Identidade solene em tons de linho, ouro antigo e tipografia editorial inspirada nas Escrituras',
        accentColor: '#b45309',
        backgroundColor: '#faf7f0',
        surfaceColor: '#fffef9',
        textColor: '#291e14',
        mutedTextColor: '#786858',
        fontStyle: 'editorial',
        radius: 'rounded',
        animation: 'fade-up',
        heroLayout: 'immersive',
        backgroundPattern: 'paper',
        heroDecoration: 'rays',
        cardStyle: 'elevated',
        buttonStyle: 'gradient'
      }
    };
  }

  if (text.match(/infantil|kids|crianc|mae|mamae|pai|brincar|ludic|educacao|alfabetiz|pedagog|escola/i)) {
    return {
      theme: 'clean-white',
      design: {
        visualConcept: 'Estética lúdica em marfim solar com toques de coral vivo e cantos suaves',
        accentColor: '#f43f5e',
        backgroundColor: '#fffdf7',
        surfaceColor: '#ffffff',
        textColor: '#2d1e2f',
        mutedTextColor: '#806e83',
        fontStyle: 'soft',
        radius: 'pill',
        animation: 'float',
        heroLayout: 'split',
        backgroundPattern: 'dots',
        heroDecoration: 'blobs',
        cardStyle: 'elevated',
        buttonStyle: 'soft'
      }
    };
  }

  if (text.match(/financ|invest|dinheiro|trader|cripto|planilh|gestao|negocio|b2b|lucro|empres|caixa/i)) {
    return {
      theme: 'midnight-dark',
      design: {
        visualConcept: 'Visual técnico de precisão em carbono escuro com verde esmeralda e grade modular',
        accentColor: '#10b981',
        backgroundColor: '#090d16',
        surfaceColor: '#111827',
        textColor: '#f3f4f6',
        mutedTextColor: '#9ca3af',
        fontStyle: 'technical',
        radius: 'sharp',
        animation: 'slide-in',
        heroLayout: 'split',
        backgroundPattern: 'grid',
        heroDecoration: 'none',
        cardStyle: 'bordered',
        buttonStyle: 'solid'
      }
    };
  }

  if (text.match(/culinari|confeit|gastronom|bolo|doce|pao|cozinha|receita|sabor/i)) {
    return {
      theme: 'warm-cream',
      design: {
        visualConcept: 'Ateliê gourmet acolhedor em caramelo tostado e creme baunilha',
        accentColor: '#c2410c',
        backgroundColor: '#fffbf5',
        surfaceColor: '#ffffff',
        textColor: '#431407',
        mutedTextColor: '#8c5e4f',
        fontStyle: 'editorial',
        radius: 'rounded',
        animation: 'fade-up',
        heroLayout: 'immersive',
        backgroundPattern: 'paper',
        heroDecoration: 'rays',
        cardStyle: 'elevated',
        buttonStyle: 'solid'
      }
    };
  }

  // General modern dynamic default
  return {
    theme: 'clean-white',
    design: {
      visualConcept: 'Design autoral moderno e equilibrado, focado em alta legibilidade e conversão direta',
      accentColor: '#2563eb',
      backgroundColor: '#f8fafc',
      surfaceColor: '#ffffff',
      textColor: '#0f172a',
      mutedTextColor: '#64748b',
      fontStyle: 'modern',
      radius: 'rounded',
      animation: 'fade-up',
      heroLayout: 'split',
      backgroundPattern: 'soft-glow',
      heroDecoration: 'blobs',
      cardStyle: 'bordered',
      buttonStyle: 'solid'
    }
  };
}
