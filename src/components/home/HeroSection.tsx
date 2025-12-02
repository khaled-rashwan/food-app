"use client";

import { useTranslations } from "next-intl";

export default function HeroSection() {
  const t = useTranslations('hero');

  return (
    <section
      id="hero"
      className="relative h-screen flex items-center justify-center pt-20 px-8 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(/images/hero_bg.png)`,
      }}
    >
      <div className="text-center text-white max-w-4xl">
        <h1 className="font-serif text-5xl md:text-7xl leading-tight mb-6">
          {t('title')}
          <br />
          <em className="italic">{t('titleItalic')}</em>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8">{t('subtitle')}</p>
        <button className="px-8 py-4 text-lg border-2 border-[#D4AF37] bg-[#D4AF37] text-gray-900 font-semibold rounded-full hover:bg-transparent hover:text-[#D4AF37] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_5px_20px_rgba(212,175,55,0.3)]">
          {t('cta')}
        </button>
      </div>
    </section>
  );
}
