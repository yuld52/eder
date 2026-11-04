import React from 'react';
import { getCountryFlag, getCountryFlagImage } from '../../utils/country';

interface CountryFlagProps {
  country?: string;
  className?: string;
}

export const CountryFlag: React.FC<CountryFlagProps> = ({ country, className = 'h-3 w-5' }) => {
  const image = getCountryFlagImage(country);
  if (!image) return <span aria-label="País não identificado">{getCountryFlag(country)}</span>;
  return (
    <img
      src={image}
      alt={`Bandeira de ${country}`}
      className={`${className} shrink-0 rounded-[2px] object-cover shadow-sm`}
      loading="eager"
    />
  );
};
