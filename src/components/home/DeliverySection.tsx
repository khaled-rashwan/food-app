"use client";

import { useState, useEffect } from "react";
import { deliverySteps } from "@/src/lib/mock-data";

interface DeliverySectionProps {
  locale?: "en" | "ar";
}

export default function DeliverySection({
  locale = "en",
}: DeliverySectionProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const isArabic = locale === "ar";

  const content = {
    title: { en: "Live Delivery Tracking", ar: "تتبع التوصيل المباشر" },
    subtitle: {
      en: "From our kitchen to your doorstep.",
      ar: "من مطبخنا إلى عتبة بابك.",
    },
    buttonText: { en: "Simulate Delivery", ar: "محاكاة التوصيل" },
  };

  const title = isArabic ? content.title.ar : content.title.en;
  const subtitle = isArabic ? content.subtitle.ar : content.subtitle.en;
  const buttonText = isArabic ? content.buttonText.ar : content.buttonText.en;

  const handleSimulate = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setCurrentStep(0);

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next >= deliverySteps.length) {
          clearInterval(interval);
          setIsSimulating(false);
          return prev;
        }
        return next;
      });
    }, 1500);
  };

  const progress = (currentStep / (deliverySteps.length - 1)) * 100;

  return (
    <section
      id="delivery"
      className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-16 bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] text-white text-center"
    >
      <div className="mb-12">
        <h2 className="font-serif text-4xl md:text-5xl text-[#D4AF37] mb-4">
          {title}
        </h2>
        <p className="text-gray-400 italic text-lg mb-12">{subtitle}</p>
      </div>

      <div className="w-full max-w-4xl bg-white/5 backdrop-blur-lg p-8 md:p-12 rounded-3xl border border-[#D4AF37]/20 shadow-2xl">
        {/* Progress Line */}
        <div className="relative mb-16">
          <div className="absolute top-8 left-20 right-20 h-1 bg-white/10 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#228B22] rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(212,175,55,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Steps */}
          <div className="flex justify-between items-start px-10 gap-4 relative z-10">
            {deliverySteps.map((step, index) => {
              const isActive = index <= currentStep;
              const icon = isArabic ? step.iconAr : step.iconEn;
              const label = isArabic ? step.labelAr : step.labelEn;

              return (
                <div
                  key={step.step}
                  className={`flex flex-col items-center flex-1 min-w-[80px] transition-all duration-300 ${
                    isActive ? "opacity-100 scale-105" : "opacity-40"
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-4 transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-br from-[#D4AF37] to-[#b8941f] border-2 border-[#D4AF37] text-gray-900 shadow-[0_5px_20px_rgba(212,175,55,0.4)]"
                        : "bg-gray-900/90 border-2 border-white/20"
                    }`}
                  >
                    {icon}
                  </div>
                  <div
                    className={`font-medium text-sm text-center px-2 transition-all duration-300 ${
                      isActive
                        ? "text-white font-semibold"
                        : "text-white/60"
                    }`}
                  >
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map Visualization */}
        <div className="relative h-48 bg-black/30 rounded-2xl mb-8 border border-white/10 overflow-hidden flex items-center px-5">
          <div
            className="text-5xl transition-all duration-1000 ease-linear"
            style={{
              transform: isArabic ? "scaleX(1)" : "scaleX(-1)",
              marginLeft: `${progress}%`,
            }}
          >
            🛵
          </div>
        </div>

        {/* Simulate Button */}
        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          className="px-8 py-3 border-2 border-[#D4AF37] text-[#D4AF37] font-semibold rounded-full hover:bg-[#D4AF37] hover:text-gray-900 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_5px_20px_rgba(212,175,55,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {buttonText}
        </button>
      </div>
    </section>
  );
}
