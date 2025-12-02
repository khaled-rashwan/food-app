"use client";

import { useState } from "react";
import { mockMeals } from "@/src/lib/mock-data";
import Image from "next/image";

interface AnatomySectionProps {
  locale?: "en" | "ar";
}

export default function AnatomySection({ locale = "en" }: AnatomySectionProps) {
  const [isExploded, setIsExploded] = useState(false);
  const isArabic = locale === "ar";
  const meal = mockMeals[0]; // Using first meal as signature dish

  const content = {
    title: { en: "The Anatomy of Flavor", ar: "تشريح النكهة" },
    subtitle: {
      en: `Click to deconstruct our signature ${meal.nameEn}.`,
      ar: `انقر لتفكيك ${meal.nameAr} المميز.`,
    },
  };

  const title = isArabic ? content.title.ar : content.title.en;
  const subtitle = isArabic ? content.subtitle.ar : content.subtitle.en;

  return (
    <section
      id="anatomy"
      className="min-h-[90vh] flex flex-col justify-center items-center px-4 py-16 bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] text-white text-center"
    >
      <div className="mb-12">
        <h2 className="font-serif text-4xl md:text-5xl text-[#D4AF37] mb-4">
          {title}
        </h2>
        <p className="text-gray-400 italic text-lg">{subtitle}</p>
      </div>

      <div className="w-full max-w-4xl px-4">
        <div
          className="relative w-full max-w-3xl mx-auto h-[500px] cursor-pointer rounded-3xl overflow-visible shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_50px_rgba(212,175,55,0.3)]"
          onClick={() => setIsExploded(!isExploded)}
        >
          {/* Complete Dish */}
          <Image
            src={meal.mainImage}
            alt={isArabic ? meal.nameAr : meal.nameEn}
            fill
            className={`object-contain transition-opacity duration-600 ${
              isExploded ? "opacity-0" : "opacity-100"
            }`}
            style={{ zIndex: 2 }}
            priority
          />

          {/* Anatomy Diagram */}
          <Image
            src={meal.anatomyImage}
            alt={`${isArabic ? meal.nameAr : meal.nameEn} Anatomy`}
            fill
            className={`object-contain transition-opacity duration-600 ${
              isExploded ? "opacity-100" : "opacity-0"
            }`}
            style={{ zIndex: 1 }}
          />
        </div>

        <p className="mt-8 text-gray-400 text-sm">
          {isArabic
            ? "انقر على الصورة للتبديل بين العرض الكامل والتفاصيل"
            : "Click the image to toggle between complete and anatomy view"}
        </p>
      </div>
    </section>
  );
}
