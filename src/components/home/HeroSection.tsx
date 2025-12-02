"use client";

import { heroContent } from "@/src/lib/mock-data";

interface HeroSectionProps {
  locale?: "en" | "ar";
}

export default function HeroSection({ locale = "en" }: HeroSectionProps) {
  const isArabic = locale === "ar";

  const title = isArabic ? heroContent.titleAr : heroContent.titleEn;
  const subtitle = isArabic ? heroContent.subtitleAr : heroContent.subtitleEn;
  const ctaText = isArabic ? heroContent.ctaTextAr : heroContent.ctaTextEn;

  // Split title to style "Reimagined" or "بطريقة جديدة" in italic
  const titleParts = title.split(isArabic ? "،" : ",");

  return (
    <section
      id="hero"
      className="relative h-screen flex items-center justify-center pt-20 px-8 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${heroContent.backgroundImage})`,
      }}
    >
      <div className="text-center text-white max-w-4xl">
        <h1 className="font-serif text-5xl md:text-7xl leading-tight mb-6">
          {titleParts[0]}
          {titleParts[1] && (
            <>
              ,<br />
              <em className="italic">{titleParts[1].trim()}</em>
            </>
          )}
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8">{subtitle}</p>
        <button className="px-8 py-4 text-lg border-2 border-[#D4AF37] bg-[#D4AF37] text-gray-900 font-semibold rounded-full hover:bg-transparent hover:text-[#D4AF37] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_5px_20px_rgba(212,175,55,0.3)]">
          {ctaText}
        </button>
      </div>
    </section>
  );
}
