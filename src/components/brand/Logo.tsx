import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  theme?: 'black' | 'white';
  className?: string;
  badge?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  theme = 'black',
  className = '',
  badge
}) => {
  const isBlack = theme === 'black';

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Veltor Icon Badge */}
      <div className={`relative ${iconSizes[size]} rounded-xl flex items-center justify-center shrink-0 shadow-md transition-all overflow-hidden p-1.5 ${
        isBlack 
          ? 'bg-[#10121C] border border-[#262C42]' 
          : 'bg-white border border-[#E2E4E9]'
      }`}>
        {/* Ambient Gradient Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-indigo-600/15 to-purple-600/20 pointer-events-none" />

        {/* Vector SVG Monogram */}
        <svg 
          viewBox="0 0 32 32" 
          className="w-full h-full relative z-10 drop-shadow-xs" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logo-v-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="logo-v-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>

          {/* Left Wing Layer */}
          <path 
            d="M6 7 L12.5 7 L16 19.5 L12.5 25 Z" 
            fill="url(#logo-v-grad-1)" 
            opacity="0.95" 
          />

          {/* Right Wing Layer */}
          <path 
            d="M26 7 L19.5 7 L13.5 22.5 L17 25 Z" 
            fill="url(#logo-v-grad-2)" 
          />

          {/* Light reflection accent */}
          <path 
            d="M12.5 15.5 L19.5 7 L22.5 7 L15.5 24 Z" 
            fill="#FFFFFF" 
            opacity="0.3" 
          />

          {/* Core focal spark */}
          <circle cx="16" cy="24" r="1.5" fill="#38BDF8" />
        </svg>
      </div>

      {/* Brand Wordmark Text */}
      {showText && (
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-extrabold font-display tracking-tight ${textSizes[size]} ${
            isBlack ? 'text-white' : 'text-neutral-900'
          }`}>
            Veltor
          </span>

          {badge && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-gradient-to-r from-blue-500/15 to-purple-500/15 text-blue-500 dark:text-blue-400 border border-blue-500/20">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
