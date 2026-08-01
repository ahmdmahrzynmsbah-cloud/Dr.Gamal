/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
  className?: string;
}

export default function ThemeToggle({ isDarkMode, onToggle, className = '' }: ThemeToggleProps) {
  return (
    <div
      className={`inline-flex items-center p-1 rounded-full border transition-all duration-300 select-none ${
        isDarkMode
          ? 'bg-slate-900/90 border-slate-700/80 shadow-inner'
          : 'bg-slate-200/80 border-slate-300/80 shadow-inner'
      } ${className}`}
    >
      {/* Light Mode Button */}
      <button
        type="button"
        onClick={() => {
          if (isDarkMode) onToggle();
        }}
        className={`relative px-3 py-1 text-xs font-bold rounded-full transition-colors duration-200 cursor-pointer flex items-center gap-1.5 ${
          !isDarkMode ? 'text-white' : 'text-slate-400 hover:text-slate-200'
        }`}
        title="التبديل للوضع المضيء"
      >
        {!isDarkMode && (
          <motion.div
            layoutId="active-theme-pill"
            className="absolute inset-0 bg-[#0D5C8C] rounded-full shadow-xs"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <Sun className={`relative z-10 w-3.5 h-3.5 ${!isDarkMode ? 'text-white' : 'text-slate-400'}`} />
        <span className="relative z-10 font-sans text-[11px]">مضيء</span>
      </button>

      {/* Dark Mode Button */}
      <button
        type="button"
        onClick={() => {
          if (!isDarkMode) onToggle();
        }}
        className={`relative px-3 py-1 text-xs font-bold rounded-full transition-colors duration-200 cursor-pointer flex items-center gap-1.5 ${
          isDarkMode ? 'text-slate-950 font-black' : 'text-slate-600 hover:text-slate-900'
        }`}
        title="التبديل للوضع المظلم"
      >
        {isDarkMode && (
          <motion.div
            layoutId="active-theme-pill"
            className="absolute inset-0 bg-amber-400 rounded-full shadow-xs"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <Moon className={`relative z-10 w-3.5 h-3.5 ${isDarkMode ? 'text-slate-950 fill-current' : 'text-slate-500'}`} />
        <span className="relative z-10 font-sans text-[11px]">مظلم</span>
      </button>
    </div>
  );
}

