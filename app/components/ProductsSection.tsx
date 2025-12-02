'use client';

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import S3Image from '@/app/components/S3Image';
import { useCartStore } from '@/lib/store/cartStore';
import { useLocale } from 'next-intl';
import toast, { Toaster } from 'react-hot-toast';

Amplify.configure(outputs, { ssr: true });
const client = generateClient<Schema>();

interface ProductCardProps {
  locale: string;
}

export default function ProductsSection({ locale }: ProductCardProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        client.models.Category.list({
          filter: { isActive: { eq: true } },
        }),
        client.models.Product.list({
          filter: { isAvailable: { eq: true } },
        }),
      ]);

      setCategories(categoriesRes.data || []);
      setProducts(productsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      nameEn: product.nameEn,
      nameAr: product.nameAr,
      price: product.price,
      quantity: 1,
      image: product.images?.[0],
      extras: [],
    });
    
    toast.success(
      locale === 'ar' ? 'تمت الإضافة إلى السلة' : 'Added to cart',
      {
        duration: 2000,
        position: locale === 'ar' ? 'top-left' : 'top-right',
      }
    );
  };

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.categoryId === selectedCategory);

  if (loading) {
    return (
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">Loading products...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-900">
      <Toaster />
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            {locale === 'ar' ? 'قائمتنا' : 'Our Menu'}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {locale === 'ar'
              ? 'اكتشف أطباقنا الشهية المحضرة بمكونات طازجة'
              : 'Discover our delicious dishes made with fresh ingredients'}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-2 rounded-full transition-all ${
              selectedCategory === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {locale === 'ar' ? 'الكل' : 'All'}
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full transition-all ${
                selectedCategory === category.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {locale === 'ar' ? category.nameAr : category.nameEn}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-12">
              {locale === 'ar' ? 'لا توجد منتجات متاحة' : 'No products available'}
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow"
              >
                {/* Product Image */}
                {product.images && product.images.length > 0 ? (
                  <div className="h-48 bg-gray-700">
                    <S3Image
                      path={product.images[0]}
                      alt={locale === 'ar' ? product.nameAr : product.nameEn}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500">
                      {locale === 'ar' ? 'لا توجد صورة' : 'No image'}
                    </span>
                  </div>
                )}

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {locale === 'ar' ? product.nameAr : product.nameEn}
                  </h3>
                  {product.descriptionEn && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {locale === 'ar' ? product.descriptionAr : product.descriptionEn}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-orange-500">
                      {product.price.toFixed(3)} {locale === 'ar' ? 'د.ك' : 'KWD'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {product.preparationTimeMinutes} {locale === 'ar' ? 'دقيقة' : 'min'}
                    </span>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    {locale === 'ar' ? 'أضف إلى السلة' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
