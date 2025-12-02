"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import { useCartStore } from "@/lib/store/cartStore";

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const itemCount = useCartStore((state) => state.getItemCount());

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
            
            {/* Cart Icon with Counter */}
            <Link 
              href={`/${locale}/cart`}
              className="relative p-2 text-gray-200 hover:text-[#D4AF37] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -end-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            
            <button className="px-6 py-3 border-2 border-[#D4AF37] bg-[#D4AF37] text-gray-900 font-semibold rounded-full hover:bg-transparent hover:text-[#D4AF37] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_5px_20px_rgba(212,175,55,0.3)]">
              {t('orderNow')}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
