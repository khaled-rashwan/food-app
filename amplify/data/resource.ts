import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/**
 * Kuwait Food Delivery & Catering Platform - Data Schema
 * Amplify Gen 2 - AppSync GraphQL Schema Definition
 */

const schema = a.schema({
  // ==================== ENUMS ====================
  Language: a.enum(["EN", "AR"]),
  ProductType: a.enum(["MEAL", "CATERING"]),
  OrderType: a.enum(["DELIVERY", "CATERING"]),
  OrderStatus: a.enum([
    "PENDING_PAYMENT",
    "CONFIRMED",
    "PREPARING",
    "READY_FOR_DELIVERY",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ]),
  PaymentStatus: a.enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED"]),
  PaymentMethod: a.enum(["KNET", "CARD", "CASH"]),
  PromoType: a.enum(["PERCENTAGE", "FIXED_AMOUNT", "POINTS"]),
  ApplicableTo: a.enum(["ALL", "MEALS", "CATERING"]),
  LoyaltyType: a.enum(["EARNED", "REDEEMED", "BONUS", "GAME_WIN"]),

  // ==================== CUSTOM TYPES (Not Models) ====================
  Address: a.customType({
    id: a.id().required(),
    label: a.string(), // "Home", "Work", etc.
    area: a.string().required(),
    block: a.string().required(),
    street: a.string().required(),
    building: a.string().required(),
    floor: a.string(),
    apartment: a.string(),
    additionalDirections: a.string(),
    isDefault: a.boolean(),
  }),

  Extra: a.customType({
    id: a.id().required(),
    nameEn: a.string().required(),
    nameAr: a.string().required(),
    price: a.float().required(),
    isAvailable: a.boolean().required(),
  }),

  CateringItem: a.customType({
    productId: a.id().required(),
    quantity: a.integer().required(),
    isCustomizable: a.boolean(),
  }),

  SelectedExtra: a.customType({
    extraId: a.id().required(),
    nameEn: a.string().required(),
    nameAr: a.string().required(),
    price: a.float().required(),
    quantity: a.integer().required(),
  }),

  OrderItem: a.customType({
    productId: a.id().required(),
    productNameEn: a.string().required(),
    productNameAr: a.string().required(),
    quantity: a.integer().required(),
    unitPrice: a.float().required(),
    selectedExtras: a.ref("SelectedExtra").array(),
    specialInstructions: a.string(),
  }),

  DeliveryAddress: a.customType({
    area: a.string().required(),
    block: a.string().required(),
    street: a.string().required(),
    building: a.string().required(),
    floor: a.string(),
    apartment: a.string(),
    additionalDirections: a.string(),
  }),

  // ==================== MODELS ====================

  // Category Model
  Category: a
    .model({
      nameEn: a.string().required(),
      nameAr: a.string().required(),
      descriptionEn: a.string(),
      descriptionAr: a.string(),
      imageUrl: a.string(),
      sortOrder: a.integer(),
      isActive: a.boolean(),
      products: a.hasMany("Product", "categoryId"),
    })
    .authorization((allow) => [
      allow.authenticated().to(["read"]),
      allow.group("admins"),
    ]),

  // Product Model (Menu Items)
  Product: a
    .model({
      type: a.ref("ProductType").required(),
      nameEn: a.string().required(),
      nameAr: a.string().required(),
      descriptionEn: a.string(),
      descriptionAr: a.string(),
      price: a.float().required(),
      images: a.string().array(), // S3 URLs
      categoryId: a.id().required(),
      category: a.belongsTo("Category", "categoryId"),
      extras: a.ref("Extra").array(),
      isAvailable: a.boolean(),
      preparationTimeMinutes: a.integer().required(),
      sortOrder: a.integer(),
    })
    .authorization((allow) => [
      allow.authenticated().to(["read"]),
      allow.group("admins"),
    ]),

  // Catering Package Model
  CateringPackage: a
    .model({
      nameEn: a.string().required(),
      nameAr: a.string().required(),
      descriptionEn: a.string(),
      descriptionAr: a.string(),
      servingSize: a.integer().required(), // 15, 25, 50 persons
      basePrice: a.float().required(),
      images: a.string().array(),
      includedItems: a.ref("CateringItem").array(),
      optionalExtras: a.ref("Extra").array(),
      preparationTimeMinutes: a.integer().required(),
      advanceOrderHours: a.integer().required(), // Minimum hours before delivery
      isAvailable: a.boolean(),
      sortOrder: a.integer(),
    })
    .authorization((allow) => [
      allow.authenticated().to(["read"]),
      allow.group("admins"),
    ]),

  // User Profile Model (extends Cognito user)
  UserProfile: a
    .model({
      cognitoId: a.string().required(),
      firstName: a.string(),
      lastName: a.string(),
      email: a.email(),
      phone: a.phone().required(),
      addresses: a.ref("Address").array(),
      preferredLanguage: a.ref("Language"),
      loyaltyPoints: a.integer(),
      lastSpinDate: a.date(),
      orders: a.hasMany("Order", "userProfileId"),
      reviews: a.hasMany("Review", "userProfileId"),
      loyaltyTransactions: a.hasMany("LoyaltyTransaction", "userProfileId"),
    })
    .authorization((allow) => [
      allow.owner().to(["read", "update"]),
      allow.group("admins"),
    ]),

  // Cart Model
  Cart: a
    .model({
      userProfileId: a.id(),
      sessionId: a.string(), // For guest carts
      items: a.ref("OrderItem").array(),
      subtotal: a.float(),
      expiresAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(["read", "create", "update", "delete"]),
    ]),

  // Order Model
  Order: a
    .model({
      orderNumber: a.string().required(),
      userProfileId: a.id().required(),
      userProfile: a.belongsTo("UserProfile", "userProfileId"),
      type: a.ref("OrderType").required(),
      status: a.ref("OrderStatus"),
      items: a.ref("OrderItem").required().array(),
      subtotal: a.float().required(),
      deliveryFee: a.float().required(),
      discount: a.float(),
      total: a.float().required(),
      paymentMethod: a.ref("PaymentMethod").required(),
      paymentStatus: a.ref("PaymentStatus"),
      promoCodeId: a.id(),
      promoCode: a.belongsTo("PromoCode", "promoCodeId"),
      deliveryAddress: a.ref("DeliveryAddress").required(),
      scheduledDeliveryTime: a.datetime(),
      specialInstructions: a.string(),
      
      // Status timestamps
      confirmedAt: a.datetime(),
      preparationStartedAt: a.datetime(),
      readyForDeliveryAt: a.datetime(),
      outForDeliveryAt: a.datetime(),
      deliveredAt: a.datetime(),
      cancelledAt: a.datetime(),
      
      reviews: a.hasMany("Review", "orderId"),
      loyaltyTransactions: a.hasMany("LoyaltyTransaction", "orderId"),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.group("admins"),
      allow.group("kitchen").to(["read", "update"]),
      allow.group("delivery").to(["read", "update"]),
    ]),

  // Review Model
  Review: a
    .model({
      orderId: a.id().required(),
      order: a.belongsTo("Order", "orderId"),
      userProfileId: a.id().required(),
      userProfile: a.belongsTo("UserProfile", "userProfileId"),
      rating: a.integer().required(), // 1-5
      comment: a.string(),
      isApproved: a.boolean(),
    })
    .authorization((allow) => [
      allow.owner().to(["create", "read"]),
      allow.group("admins"),
      allow.authenticated().to(["read"]), // Anyone can read approved reviews
    ]),

  // Promo Code Model
  PromoCode: a
    .model({
      code: a.string().required(),
      type: a.ref("PromoType").required(),
      value: a.float().required(),
      minOrderValue: a.float(),
      maxDiscount: a.float(),
      usageLimit: a.integer(),
      usedCount: a.integer(),
      validFrom: a.datetime().required(),
      validUntil: a.datetime().required(),
      isActive: a.boolean(),
      applicableTo: a.ref("ApplicableTo"),
      orders: a.hasMany("Order", "promoCodeId"),
    })
    .authorization((allow) => [
      allow.authenticated().to(["read"]),
      allow.group("admins"),
    ]),

  // Loyalty Transaction Model
  LoyaltyTransaction: a
    .model({
      userProfileId: a.id().required(),
      userProfile: a.belongsTo("UserProfile", "userProfileId"),
      orderId: a.id(),
      order: a.belongsTo("Order", "orderId"),
      type: a.ref("LoyaltyType").required(),
      points: a.integer().required(),
      description: a.string(),
    })
    .authorization((allow) => [
      allow.owner().to(["read"]),
      allow.group("admins"),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/**
 * Usage in Next.js:
 * 
 * Server Components / Server Actions:
 * import { cookieBasedClient } from '@/lib/amplify/server-utils';
 * const { data } = await cookieBasedClient.models.Product.list();
 * 
 * Client Components:
 * "use client"
 * import { generateClient } from "aws-amplify/data";
 * import type { Schema } from "@/amplify/data/resource";
 * const client = generateClient<Schema>();
 * const { data } = await client.models.Product.list();
 */
