"use client";

import Link from "next/link";
import { useState } from "react";

interface NavbarProps {
  locale?: "en" | "ar";
}

export default function Navbar({ locale = "en" }: NavbarProps) {
  const isArabic = locale === "ar";

  const navContent = {
    logo: {
      en: "Gourmet Kuwait",
      ar: "ذواق الكويت",
    },
    links: {
      home: { en: "Home", ar: "الرئيسية" },
      signature: { en: "Our Signature", ar: "طبقنا المميز" },
      track: { en: "Track Order", ar: "تتبع الطلب" },
    },
    cta: { en: "Order Now", ar: "اطلب الآن" },
  };

  const t = (key: any) => key[locale];

  return (
    <header className="fixed w-full z-50 bg-gray-900 border-b-[3px] border-[#D4AF37] shadow-lg">
      <nav className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="logo text-2xl font-bold text-[#D4AF37] tracking-wide font-serif">
            {t(navContent.logo)}
          </div>

          <ul className="hidden md:flex gap-8 items-center">
            <li>
              <a
                href="#hero"
                className="text-gray-200 font-medium hover:text-[#D4AF37] transition-colors duration-300 relative pb-1 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-[#D4AF37] hover:after:w-full after:transition-all"
              >
                {t(navContent.links.home)}
              </a>
            </li>
            <li>
              <a
                href="#anatomy"
                className="text-gray-200 font-medium hover:text-[#D4AF37] transition-colors duration-300 relative pb-1 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-[#D4AF37] hover:after:w-full after:transition-all"
              >
                {t(navContent.links.signature)}
              </a>
            </li>
            <li>
              <a
                href="#delivery"
                className="text-gray-200 font-medium hover:text-[#D4AF37] transition-colors duration-300 relative pb-1 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-[#D4AF37] hover:after:w-full after:transition-all"
              >
                {t(navContent.links.track)}
              </a>
            </li>
          </ul>

          <button className="px-6 py-3 border-2 border-[#D4AF37] bg-[#D4AF37] text-gray-900 font-semibold rounded-full hover:bg-transparent hover:text-[#D4AF37] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_5px_20px_rgba(212,175,55,0.3)]">
            {t(navContent.cta)}
          </button>
        </div>
      </nav>
    </header>
  );
}
