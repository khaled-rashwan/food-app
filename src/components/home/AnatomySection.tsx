"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function AnatomySection() {
  const [isExploded, setIsExploded] = useState(false);
  const t = useTranslations('anatomy');

  return (
    <section
      id="anatomy"
      className="min-h-[90vh] flex flex-col justify-center items-center px-4 py-16 bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] text-white text-center"
    >
      <div className="mb-12">
        <h2 className="font-serif text-4xl md:text-5xl text-[#D4AF37] mb-4">
          {t('title')}
        </h2>
        <p className="text-gray-400 italic text-lg">{t('subtitle')}</p>
      </div>

      <div className="w-full max-w-4xl px-4">
        <div
          className="relative w-full max-w-3xl mx-auto h-[500px] cursor-pointer rounded-3xl overflow-visible shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_50px_rgba(212,175,55,0.3)]"
          onClick={() => setIsExploded(!isExploded)}
        >
          {/* Complete Dish */}
          <Image
            src="/images/meals/machboos_main.png"
            alt={t('title')}
            fill
            className={`object-contain transition-opacity duration-600 ${
              isExploded ? "opacity-0" : "opacity-100"
            }`}
            style={{ zIndex: 2 }}
            priority
          />

          {/* Anatomy Diagram */}
          <Image
            src="/images/meals/anatomy.png"
            alt={`${t('title')} Anatomy`}
            fill
            className={`object-contain transition-opacity duration-600 ${
              isExploded ? "opacity-100" : "opacity-0"
            }`}
            style={{ zIndex: 1 }}
          />
        </div>

        <p className="mt-8 text-gray-400 text-sm">
          {t('clickToToggle')}
        </p>
      </div>
    </section>
  );
}
