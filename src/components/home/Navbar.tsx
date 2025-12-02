"use client";

import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations('nav');

  return (
    <header className="fixed w-full z-50 bg-gray-900 border-b-[3px] border-[#D4AF37] shadow-lg">
      <nav className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="logo text-2xl font-bold text-[#D4AF37] tracking-wide font-serif">
            {t('logo')}
          </div>

          <ul className="hidden md:flex gap-8 items-center">
            <li>
              <a
                href="#hero"
                className="text-gray-200 font-medium hover:text-[#D4AF37] transition-colors duration-300 relative pb-1 after:absolute after:bottom-0 after:start-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-[#D4AF37] hover:after:w-full after:transition-all"
              >
                {t('home')}
              </a>
            </li>
            <li>
              <a
                href="#anatomy"
                className="text-gray-200 font-medium hover:text-[#D4AF37] transition-colors duration-300 relative pb-1 after:absolute after:bottom-0 after:start-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-[#D4AF37] hover:after:w-full after:transition-all"
              >
                {t('signature')}
              </a>
            </li>
            <li>
              <a
                href="#delivery"
                className="text-gray-200 font-medium hover:text-[#D4AF37] transition-colors duration-300 relative pb-1 after:absolute after:bottom-0 after:start-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-[#D4AF37] hover:after:w-full after:transition-all"
              >
                {t('track')}
              </a>
            </li>
          </ul>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button className="px-6 py-3 border-2 border-[#D4AF37] bg-[#D4AF37] text-gray-900 font-semibold rounded-full hover:bg-transparent hover:text-[#D4AF37] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_5px_20px_rgba(212,175,55,0.3)]">
              {t('orderNow')}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
