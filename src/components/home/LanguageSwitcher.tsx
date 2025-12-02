"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: string) => {
    startTransition(() => {
      // Replace the current locale in the pathname
      const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
      router.replace(newPathname);
    });
  };

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={() => switchLocale('en')}
        disabled={isPending}
        className={`px-3 py-1 rounded transition-colors ${
          locale === 'en'
            ? 'bg-[#D4AF37] text-gray-900 font-semibold'
            : 'bg-transparent text-gray-300 hover:text-white border border-gray-600'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => switchLocale('ar')}
        disabled={isPending}
        className={`px-3 py-1 rounded transition-colors ${
          locale === 'ar'
            ? 'bg-[#D4AF37] text-gray-900 font-semibold'
            : 'bg-transparent text-gray-300 hover:text-white border border-gray-600'
        }`}
      >
        AR
      </button>
    </div>
  );
}
