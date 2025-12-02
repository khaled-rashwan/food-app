import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import Navbar from "@/src/components/home/Navbar";
import HeroSection from "@/src/components/home/HeroSection";
import AnatomySection from "@/src/components/home/AnatomySection";
import DeliverySection from "@/src/components/home/DeliverySection";

export default function HomePage() {
  return (
    <div className="bg-gray-900">
      <Navbar />
      <main>
        <HeroSection />
        <AnatomySection />
        <DeliverySection />
      </main>

      <Footer />
    </div>
  );
}

function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();
  
  return (
    <footer className="bg-gray-900 text-white py-8 text-center border-t border-gray-800">
      <p className="mb-2">{t('copyright')}</p>
      <p className="mt-2">
        <Link
          href={`/${locale}/admin/login`}
          className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
        >
          {t('staffLogin')}
        </Link>
      </p>
    </footer>
  );
}
