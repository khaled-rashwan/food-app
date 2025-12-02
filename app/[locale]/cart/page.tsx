'use client';

import { useCartStore } from '@/lib/store/cartStore';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import S3Image from '@/app/components/S3Image';

export default function CartPage() {
  const locale = useLocale();
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gray-800 rounded-xl p-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-24 h-24 mx-auto text-gray-600 mb-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-white mb-4">
                {locale === 'ar' ? 'سلة التسوق فارغة' : 'Your cart is empty'}
              </h2>
              <p className="text-gray-400 mb-8">
                {locale === 'ar'
                  ? 'أضف بعض العناصر من قائمتنا'
                  : 'Add some items from our menu'}
              </p>
              <Link
                href={`/${locale}`}
                className="inline-block px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
              >
                {locale === 'ar' ? 'تصفح القائمة' : 'Browse Menu'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const total = getTotal();

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              {locale === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}
            </h1>
            <button
              onClick={clearCart}
              className="text-red-500 hover:text-red-400 text-sm font-medium"
            >
              {locale === 'ar' ? 'إفراغ السلة' : 'Clear Cart'}
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const itemTotal = item.price * item.quantity;
                const extrasTotal = item.extras.reduce(
                  (sum, extra) => sum + extra.price * extra.quantity,
                  0
                );
                const lineTotal = itemTotal + extrasTotal;

                return (
                  <div
                    key={item.id}
                    className="bg-gray-800 rounded-xl p-4 flex gap-4"
                  >
                    {/* Image */}
                    <div className="w-24 h-24 flex-shrink-0 bg-gray-700 rounded-lg overflow-hidden">
                      {item.image ? (
                        <S3Image
                          path={item.image}
                          alt={locale === 'ar' ? item.nameAr : item.nameEn}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                          {locale === 'ar' ? 'لا توجد صورة' : 'No image'}
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {locale === 'ar' ? item.nameAr : item.nameEn}
                      </h3>
                      <p className="text-orange-500 font-semibold mb-2">
                        {item.price.toFixed(3)} {locale === 'ar' ? 'د.ك' : 'KWD'}
                      </p>

                      {/* Extras */}
                      {item.extras.length > 0 && (
                        <div className="mb-2">
                          {item.extras.map((extra, idx) => (
                            <p key={idx} className="text-sm text-gray-400">
                              + {locale === 'ar' ? extra.nameAr : extra.nameEn} (
                              {extra.quantity}x {extra.price.toFixed(3)}{' '}
                              {locale === 'ar' ? 'د.ك' : 'KWD'})
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Special Instructions */}
                      {item.specialInstructions && (
                        <p className="text-sm text-gray-400 italic mb-2">
                          "{item.specialInstructions}"
                        </p>
                      )}

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-gray-700 rounded-lg">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="px-3 py-1 text-white hover:bg-gray-600 rounded-s-lg"
                          >
                            −
                          </button>
                          <span className="px-4 py-1 text-white font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="px-3 py-1 text-white hover:bg-gray-600 rounded-e-lg"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-400 text-sm"
                        >
                          {locale === 'ar' ? 'حذف' : 'Remove'}
                        </button>
                      </div>
                    </div>

                    {/* Line Total */}
                    <div className="text-end">
                      <p className="text-xl font-bold text-white">
                        {lineTotal.toFixed(3)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {locale === 'ar' ? 'د.ك' : 'KWD'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-xl p-6 sticky top-24">
                <h2 className="text-xl font-bold text-white mb-6">
                  {locale === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-300">
                    <span>{locale === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span>
                      {total.toFixed(3)} {locale === 'ar' ? 'د.ك' : 'KWD'}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>{locale === 'ar' ? 'رسوم التوصيل' : 'Delivery Fee'}</span>
                    <span className="text-green-500">
                      {locale === 'ar' ? 'مجاناً' : 'Free'}
                    </span>
                  </div>
                  <div className="border-t border-gray-700 pt-3 flex justify-between text-white font-bold text-lg">
                    <span>{locale === 'ar' ? 'الإجمالي' : 'Total'}</span>
                    <span>
                      {total.toFixed(3)} {locale === 'ar' ? 'د.ك' : 'KWD'}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/${locale}/checkout`}
                  className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg text-center transition-colors"
                >
                  {locale === 'ar' ? 'إتمام الطلب' : 'Proceed to Checkout'}
                </Link>

                <Link
                  href={`/${locale}`}
                  className="block w-full mt-3 border-2 border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-semibold py-3 rounded-lg text-center transition-colors"
                >
                  {locale === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
