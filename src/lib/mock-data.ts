/**
 * Mock data for development - will be replaced with real API data later
 */

export interface MealData {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  mainImage: string;
  anatomyImage: string;
  price: number;
}

export const mockMeals: MealData[] = [
  {
    id: "1",
    nameEn: "Signature Machboos",
    nameAr: "مجبوس مميز",
    descriptionEn: "Traditional Kuwaiti spiced rice with tender lamb, aromatic herbs, and our secret blend of spices.",
    descriptionAr: "أرز كويتي تقليدي متبل مع لحم الضأن الطري والأعشاب العطرية ومزيجنا السري من التوابل.",
    mainImage: "/images/meals/machboos_main.png",
    anatomyImage: "/images/meals/anatomy.png",
    price: 12.5,
  },
];

export interface HeroContent {
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  ctaTextEn: string;
  ctaTextAr: string;
  backgroundImage: string;
}

export const heroContent: HeroContent = {
  titleEn: "Taste the Tradition, Reimagined.",
  titleAr: "تذوق التقليد، بطريقة جديدة.",
  subtitleEn: "Premium catering and swift delivery across Kuwait.",
  subtitleAr: "تقديم طعام فاخر وتوصيل سريع في جميع أنحاء الكويت.",
  ctaTextEn: "Explore Menu",
  ctaTextAr: "استكشف القائمة",
  backgroundImage: "/images/hero_bg.png",
};

export interface DeliveryStep {
  iconEn: string;
  iconAr: string;
  labelEn: string;
  labelAr: string;
  step: number;
}

export const deliverySteps: DeliveryStep[] = [
  {
    iconEn: "🍳",
    iconAr: "🍳",
    labelEn: "Preparing",
    labelAr: "جاري التحضير",
    step: 1,
  },
  {
    iconEn: "📦",
    iconAr: "📦",
    labelEn: "Ready",
    labelAr: "جاهز",
    step: 2,
  },
  {
    iconEn: "🛵",
    iconAr: "🛵",
    labelEn: "On the Way",
    labelAr: "في الطريق",
    step: 3,
  },
  {
    iconEn: "🏠",
    iconAr: "🏠",
    labelEn: "Delivered",
    labelAr: "تم التوصيل",
    step: 4,
  },
];
