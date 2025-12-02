import Link from "next/link";
import Navbar from "@/src/components/home/Navbar";
import HeroSection from "@/src/components/home/HeroSection";
import AnatomySection from "@/src/components/home/AnatomySection";
import DeliverySection from "@/src/components/home/DeliverySection";

export default function HomePage() {
  // For now, using English. We'll add language switching later
  const locale = "en";

  return (
    <div className="bg-gray-900">
      <Navbar locale={locale} />
      <main>
        <HeroSection locale={locale} />
        <AnatomySection locale={locale} />
        <DeliverySection locale={locale} />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 text-center border-t border-gray-800">
        <p className="mb-2">© 2025 Gourmet Kuwait. All rights reserved.</p>
        <p className="mt-2">
          <Link
            href="/admin/login"
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            Staff Login
          </Link>
        </p>
      </footer>
    </div>
  );
}
