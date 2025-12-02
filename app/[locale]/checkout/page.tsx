'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import toast, { Toaster } from 'react-hot-toast';

Amplify.configure(outputs, { ssr: true });
const client = generateClient<Schema>();

type CheckoutStep = 'auth' | 'address' | 'payment' | 'confirmation';

// Validation Schemas
const phoneSchema = z.object({
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number too long')
    .regex(/^\d+$/, 'Phone number must contain only digits'),
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required').optional(),
});

const otpSchema = z.object({
  code: z.string().length(6, 'OTP must be 6 digits'),
});

const addressSchema = z.object({
  area: z.string().min(2, 'Area is required'),
  block: z.string().min(1, 'Block is required'),
  street: z.string().min(1, 'Street is required'),
  building: z.string().min(1, 'Building is required'),
  floor: z.string().optional(),
  apartment: z.string().optional(),
  additionalDirections: z.string().optional(),
});

type PhoneForm = z.infer<typeof phoneSchema>;
type AddressForm = z.infer<typeof addressSchema>;

export default function CheckoutPage() {
  const locale = useLocale();
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('auth');
  const [customerInfo, setCustomerInfo] = useState<PhoneForm | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<AddressForm | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Phone form
  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
  });

  // Address form
  const addressForm = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
  });

  // Check if cart is empty
  if (items.length === 0 && currentStep !== 'confirmation') {
    return (
      <div className="min-h-screen bg-gray-900 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gray-800 rounded-xl p-12">
              <h2 className="text-2xl font-bold text-white mb-4">
                {locale === 'ar' ? 'سلة التسوق فارغة' : 'Your cart is empty'}
              </h2>
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

  // Handle phone submission (Guest checkout for MVP)
  const onSubmitPhone = async (data: PhoneForm) => {
    setCustomerInfo(data);
    setCurrentStep('address');
    toast.success(
      locale === 'ar' ? 'تم حفظ المعلومات' : 'Information saved'
    );
  };

  // Handle address submission
  const onSubmitAddress = (data: AddressForm) => {
    setDeliveryAddress(data);
    setCurrentStep('payment');
  };

  // Handle payment and order creation
  const handlePlaceOrder = async () => {
    if (!deliveryAddress || !customerInfo) return;

    setIsLoading(true);

    try {
      // Generate order number
      const orderNumber = `KW-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

      // Prepare order items
      const orderItems = items.map(item => ({
        productId: item.productId,
        productNameEn: item.nameEn,
        productNameAr: item.nameAr,
        quantity: item.quantity,
        unitPrice: item.price,
        selectedExtras: item.extras.map(extra => ({
          extraId: extra.id,
          nameEn: extra.nameEn,
          nameAr: extra.nameAr,
          price: extra.price,
          quantity: extra.quantity,
        })),
        specialInstructions: item.specialInstructions,
      }));

      // For guest checkout, create order without userProfileId
      // In production, you'd create/link a UserProfile record
      const order = await client.models.Order.create({
        orderNumber,
        userProfileId: 'guest-' + Date.now(), // Temporary guest ID
        type: 'DELIVERY',
        status: 'PENDING_PAYMENT',
        items: orderItems,
        subtotal: total,
        deliveryFee: 0,
        discount: 0,
        total: total,
        paymentMethod: 'KNET',
        paymentStatus: 'PENDING',
        deliveryAddress: {
          area: deliveryAddress.area,
          block: deliveryAddress.block,
          street: deliveryAddress.street,
          building: deliveryAddress.building,
          floor: deliveryAddress.floor || '',
          apartment: deliveryAddress.apartment || '',
          additionalDirections: deliveryAddress.additionalDirections || '',
        },
      });

      if (order.data) {
        setOrderId(order.data.id);
        
        // Clear cart
        clearCart();
        
        // Move to confirmation step
        setCurrentStep('confirmation');
        
        toast.success(
          locale === 'ar' ? 'تم إنشاء الطلب بنجاح!' : 'Order created successfully!'
        );

        // TODO: In production, redirect to payment gateway here
        // Example: window.location.href = paymentGatewayUrl;
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(
        locale === 'ar' ? 'خطأ في إنشاء الطلب' : 'Error creating order'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-12">
      <Toaster />
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-center items-center gap-4">
              {(['auth', 'address', 'payment', 'confirmation'] as CheckoutStep[]).map((step, index) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep === step
                        ? 'bg-orange-500 text-white'
                        : index < (['auth', 'address', 'payment', 'confirmation'] as CheckoutStep[]).indexOf(currentStep)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < 3 && (
                    <div
                      className={`w-16 h-1 ${
                        index < (['auth', 'address', 'payment', 'confirmation'] as CheckoutStep[]).indexOf(currentStep)
                          ? 'bg-green-500'
                          : 'bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-20 mt-2 text-sm text-gray-400">
              <span>{locale === 'ar' ? 'المصادقة' : 'Auth'}</span>
              <span>{locale === 'ar' ? 'العنوان' : 'Address'}</span>
              <span>{locale === 'ar' ? 'الدفع' : 'Payment'}</span>
              <span>{locale === 'ar' ? 'التأكيد' : 'Done'}</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Authentication Step */}
              {currentStep === 'auth' && (
                <div className="bg-gray-800 rounded-xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {locale === 'ar' ? 'معلومات الاتصال' : 'Contact Information'}
                  </h2>
                  <p className="text-gray-400 text-sm mb-6">
                    {locale === 'ar' 
                      ? 'سنستخدم هذه المعلومات للتواصل معك بخصوص طلبك'
                      : 'We\'ll use this to contact you about your order'}
                  </p>

                  <form onSubmit={phoneForm.handleSubmit(onSubmitPhone)}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {locale === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                      </label>
                      <input
                        type="text"
                        placeholder={locale === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                        {...phoneForm.register('name')}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      {phoneForm.formState.errors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {phoneForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {locale === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                      </label>
                      <input
                        type="text"
                        placeholder={locale === 'ar' ? 'أدخل رقم هاتفك' : 'Enter your phone number'}
                        {...phoneForm.register('phone')}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      {phoneForm.formState.errors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {phoneForm.formState.errors.phone.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {locale === 'ar' 
                          ? 'سنرسل تحديثات الطلب عبر واتساب'
                          : 'We\'ll send order updates via WhatsApp'}
                      </p>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {locale === 'ar' ? 'البريد الإلكتروني (اختياري)' : 'Email (Optional)'}
                      </label>
                      <input
                        type="email"
                        placeholder={locale === 'ar' ? 'your@email.com' : 'your@email.com'}
                        {...phoneForm.register('email')}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      {phoneForm.formState.errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {phoneForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {locale === 'ar' ? 'متابعة' : 'Continue'}
                    </button>
                  </form>
                </div>
              )}

              {/* Address Step */}
              {currentStep === 'address' && (
                <div className="bg-gray-800 rounded-xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    {locale === 'ar' ? 'عنوان التوصيل' : 'Delivery Address'}
                  </h2>

                  <form onSubmit={addressForm.handleSubmit(onSubmitAddress)}>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {locale === 'ar' ? 'المنطقة' : 'Area'}
                        </label>
                        <input
                          type="text"
                          {...addressForm.register('area')}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                        />
                        {addressForm.formState.errors.area && (
                          <p className="text-red-500 text-sm mt-1">
                            {addressForm.formState.errors.area.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {locale === 'ar' ? 'القطعة' : 'Block'}
                        </label>
                        <input
                          type="text"
                          {...addressForm.register('block')}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                        />
                        {addressForm.formState.errors.block && (
                          <p className="text-red-500 text-sm mt-1">
                            {addressForm.formState.errors.block.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {locale === 'ar' ? 'الشارع' : 'Street'}
                        </label>
                        <input
                          type="text"
                          {...addressForm.register('street')}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                        />
                        {addressForm.formState.errors.street && (
                          <p className="text-red-500 text-sm mt-1">
                            {addressForm.formState.errors.street.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {locale === 'ar' ? 'المبنى' : 'Building'}
                        </label>
                        <input
                          type="text"
                          {...addressForm.register('building')}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                        />
                        {addressForm.formState.errors.building && (
                          <p className="text-red-500 text-sm mt-1">
                            {addressForm.formState.errors.building.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {locale === 'ar' ? 'الطابق (اختياري)' : 'Floor (Optional)'}
                        </label>
                        <input
                          type="text"
                          {...addressForm.register('floor')}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {locale === 'ar' ? 'الشقة (اختياري)' : 'Apartment (Optional)'}
                        </label>
                        <input
                          type="text"
                          {...addressForm.register('apartment')}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {locale === 'ar' ? 'إرشادات إضافية (اختياري)' : 'Additional Directions (Optional)'}
                      </label>
                      <textarea
                        rows={3}
                        {...addressForm.register('additionalDirections')}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                      {locale === 'ar' ? 'متابعة للدفع' : 'Continue to Payment'}
                    </button>
                  </form>
                </div>
              )}

              {/* Payment Step */}
              {currentStep === 'payment' && (
                <div className="bg-gray-800 rounded-xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    {locale === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="border-2 border-orange-500 bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="payment"
                          id="knet"
                          defaultChecked
                          className="w-5 h-5 text-orange-500"
                        />
                        <label htmlFor="knet" className="ms-3 text-white font-medium">
                          KNET
                        </label>
                      </div>
                    </div>

                    <div className="border border-gray-600 bg-gray-700 rounded-lg p-4 opacity-50">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="payment"
                          id="card"
                          disabled
                          className="w-5 h-5"
                        />
                        <label htmlFor="card" className="ms-3 text-gray-400">
                          {locale === 'ar' ? 'بطاقة ائتمان (قريباً)' : 'Credit Card (Coming Soon)'}
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={isLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoading
                      ? locale === 'ar'
                        ? 'جاري المعالجة...'
                        : 'Processing...'
                      : locale === 'ar'
                      ? 'تأكيد الطلب والدفع'
                      : 'Confirm Order & Pay'}
                  </button>
                </div>
              )}

              {/* Confirmation Step */}
              {currentStep === 'confirmation' && (
                <div className="bg-gray-800 rounded-xl p-8 text-center">
                  <div className="mb-6">
                    <svg
                      className="w-20 h-20 mx-auto text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    {locale === 'ar' ? 'تم إنشاء طلبك!' : 'Order Created!'}
                  </h2>
                  <p className="text-gray-400 mb-2">
                    {locale === 'ar'
                      ? 'رقم الطلب:'
                      : 'Order Number:'}
                  </p>
                  <p className="text-2xl font-bold text-orange-500 mb-6">
                    {orderId}
                  </p>
                  <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mb-6">
                    <p className="text-yellow-400 text-sm">
                      {locale === 'ar'
                        ? '⚠️ ملاحظة: بوابة الدفع قيد التطوير. سيتم إضافة KNET والدفع ببطاقة الائتمان قريباً.'
                        : '⚠️ Note: Payment gateway is under development. KNET and card payments coming soon.'}
                    </p>
                  </div>
                  <p className="text-gray-400 mb-8">
                    {locale === 'ar'
                      ? 'سنتواصل معك قريباً لتأكيد الطلب'
                      : 'We will contact you shortly to confirm your order'}
                  </p>
                  <Link
                    href={`/${locale}`}
                    className="inline-block px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    {locale === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
                  </Link>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-xl p-6 sticky top-24">
                <h3 className="text-xl font-bold text-white mb-4">
                  {locale === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                </h3>

                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-300">
                        {item.quantity}x {locale === 'ar' ? item.nameAr : item.nameEn}
                      </span>
                      <span className="text-white">
                        {(item.price * item.quantity).toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>{locale === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span>{total.toFixed(3)} {locale === 'ar' ? 'د.ك' : 'KWD'}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>{locale === 'ar' ? 'رسوم التوصيل' : 'Delivery'}</span>
                    <span className="text-green-500">{locale === 'ar' ? 'مجاناً' : 'Free'}</span>
                  </div>
                  <div className="border-t border-gray-700 pt-2 flex justify-between text-white font-bold text-lg">
                    <span>{locale === 'ar' ? 'الإجمالي' : 'Total'}</span>
                    <span>{total.toFixed(3)} {locale === 'ar' ? 'د.ك' : 'KWD'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
