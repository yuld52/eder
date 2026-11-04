const COUNTRY_FLAGS: Record<string, string> = {
  Brasil: '🇧🇷',
  'Estados Unidos': '🇺🇸',
  Moçambique: '🇲🇿',
  Mocambique: '🇲🇿',
  Espanha: '🇪🇸',
  Portugal: '🇵🇹',
  Angola: '🇦🇴',
  'Reino Unido': '🇬🇧',
  França: '🇫🇷',
  Alemanha: '🇩🇪',
  Itália: '🇮🇹',
};

const COUNTRY_CODES: Record<string, string> = {
  Brasil: 'br',
  'Estados Unidos': 'us',
  Moçambique: 'mz',
  Mocambique: 'mz',
  Espanha: 'es',
  Portugal: 'pt',
  Angola: 'ao',
  'Reino Unido': 'gb',
  França: 'fr',
  Alemanha: 'de',
  Itália: 'it',
};

export function getCountryName(value?: string): string | undefined {
  if (!value) return undefined;
  const country = Object.keys(COUNTRY_FLAGS).find(name => value.toLocaleLowerCase().includes(name.toLocaleLowerCase()));
  return country;
}

export function getCountryFlag(value?: string): string {
  const country = getCountryName(value);
  return country ? COUNTRY_FLAGS[country] : '🌍';
}

export function getCountryFlagImage(value?: string): string | undefined {
  const country = getCountryName(value);
  return country ? `https://flagcdn.com/w40/${COUNTRY_CODES[country]}.png` : undefined;
}
