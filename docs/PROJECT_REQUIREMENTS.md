# Kuwait Food Delivery & Catering E-Commerce Platform

> **AI Development Guide** — This document serves as the primary reference for AI-assisted development of this project. All AI assistants should read this document thoroughly before making any changes to the codebase.

---

## Project Overview

**Project Type:** Full-stack E-Commerce Web Application  
**Domain:** Food Delivery & Catering Services (Kuwait Market)  
**Development Approach:** AI-Assisted Development (No purchased templates)  
**Primary Language Support:** Arabic (RTL) and English (LTR)

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+ (App Router) |
| Backend | AWS Amplify Gen 2 |
| Authentication | Amazon Cognito (with WhatsApp OTP integration) |
| API | AWS AppSync (GraphQL) |
| Database | Amazon DynamoDB |
| Storage | Amazon S3 |
| Serverless Functions | AWS Lambda |
| Workflows | AWS Step Functions |
| Email Marketing | Mailchimp API Integration |
| Payment Gateway | Kuwait-compatible gateway (KNET, Tap Payments, or MyFatoorah) |
| Hosting | AWS Amplify Hosting |

---

## Architecture Principles

1. **Serverless-First:** All backend logic runs on Lambda functions triggered by AppSync resolvers or Step Functions.
2. **Event-Driven:** Order state changes trigger Step Functions workflows for kitchen and delivery coordination.
3. **Multi-Tenant Ready:** Database schema supports future multi-vendor expansion.
4. **Bilingual by Default:** All user-facing content supports Arabic (RTL) and English (LTR) with i18n from day one.
5. **Mobile-First Design:** UI components prioritize mobile experience with responsive desktop layouts.

---

## Data Models (DynamoDB Tables)

> **Note for AI:** When generating Amplify Gen 2 schema definitions, use these models as reference. All models should include `createdAt` and `updatedAt` timestamps.

### User

```
User {
  id: ID!
  cognitoId: String!
  firstName: String!
  lastName: String!
  email: AWSEmail
  phone: AWSPhone!  # Primary identifier (WhatsApp)
  addresses: [Address]
  preferredLanguage: Language! # EN | AR
  loyaltyPoints: Int
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

Address {
  id: ID!
  label: String  # "Home", "Work", etc.
  area: String!
  block: String!
  street: String!
  building: String!
  floor: String
  apartment: String
  additionalDirections: String
  isDefault: Boolean
}
```

### Product (Menu Items)

```
Product {
  id: ID!
  type: ProductType!  # MEAL | CATERING
  nameEn: String!
  nameAr: String!
  descriptionEn: String
  descriptionAr: String
  price: Float!
  images: [String]  # S3 URLs
  category: Category! @belongsTo
  extras: [Extra]  # Available add-ons
  isAvailable: Boolean!
  preparationTimeMinutes: Int!
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

Extra {
  id: ID!
  nameEn: String!
  nameAr: String!
  price: Float!
  isAvailable: Boolean!
}
```

### Catering Package

```
CateringPackage {
  id: ID!
  nameEn: String!
  nameAr: String!
  descriptionEn: String
  descriptionAr: String
  servingSize: Int!  # 15, 25, 50 persons
  basePrice: Float!
  images: [String]
  includedItems: [CateringItem]
  optionalExtras: [Extra]
  preparationTimeMinutes: Int!
  advanceOrderHours: Int!  # Minimum hours before delivery
  isAvailable: Boolean!
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

CateringItem {
  product: Product! @belongsTo
  quantity: Int!
  isCustomizable: Boolean
}
```

### Order

```
Order {
  id: ID!
  orderNumber: String!  # Human-readable (e.g., "KW-20241201-001")
  user: User! @belongsTo
  type: OrderType!  # DELIVERY | CATERING
  status: OrderStatus!
  items: [OrderItem]
  subtotal: Float!
  deliveryFee: Float!
  discount: Float
  total: Float!
  paymentMethod: PaymentMethod!
  paymentStatus: PaymentStatus!
  promoCode: PromoCode @belongsTo
  deliveryAddress: Address!
  scheduledDeliveryTime: AWSDateTime
  specialInstructions: String
  
  # Timestamps for tracking
  confirmedAt: AWSDateTime
  preparationStartedAt: AWSDateTime
  readyForDeliveryAt: AWSDateTime
  outForDeliveryAt: AWSDateTime
  deliveredAt: AWSDateTime
  
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

OrderItem {
  product: Product! @belongsTo
  quantity: Int!
  unitPrice: Float!
  selectedExtras: [SelectedExtra]
  specialInstructions: String
}

SelectedExtra {
  extra: Extra!
  quantity: Int!
}

enum OrderStatus {
  PENDING_PAYMENT
  CONFIRMED
  PREPARING
  READY_FOR_DELIVERY
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}
```

### Review

```
Review {
  id: ID!
  order: Order! @belongsTo
  user: User! @belongsTo
  rating: Int!  # 1-5
  comment: String
  isApproved: Boolean
  createdAt: AWSDateTime!
}
```

### PromoCode

```
PromoCode {
  id: ID!
  code: String! @unique
  type: PromoType!  # PERCENTAGE | FIXED_AMOUNT | POINTS
  value: Float!
  minOrderValue: Float
  maxDiscount: Float
  usageLimit: Int
  usedCount: Int
  validFrom: AWSDateTime!
  validUntil: AWSDateTime!
  isActive: Boolean!
  applicableTo: ApplicableTo!  # ALL | MEALS | CATERING
}
```

### LoyaltyTransaction

```
LoyaltyTransaction {
  id: ID!
  user: User! @belongsTo
  order: Order @belongsTo
  type: LoyaltyType!  # EARNED | REDEEMED | BONUS | GAME_WIN
  points: Int!
  description: String
  createdAt: AWSDateTime!
}
```

---

## Feature Requirements

### Phase 1: Core E-Commerce (MVP)

#### 1.1 Authentication System

**Requirements:**
- WhatsApp-based OTP login/registration (primary)
- Email/password as secondary option
- Social login (Google) as optional
- Session management with Cognito

**AWS Implementation:**
- Cognito User Pool with custom attributes (phone as username)
- Lambda trigger for WhatsApp OTP via third-party provider (Twilio/MessageBird)
- Custom authentication flow for OTP verification

**User Stories:**
- As a customer, I can sign up using my WhatsApp number
- As a customer, I receive an OTP on WhatsApp to verify my identity
- As a customer, I stay logged in across sessions

#### 1.2 Product Catalog

**Requirements:**
- Display ready meals with images, descriptions, prices
- Display catering packages by serving size (15/25/50 persons)
- Support product extras/add-ons (e.g., extra salad)
- Category-based navigation
- Search functionality
- Arabic/English content switching

**AWS Implementation:**
- AppSync queries for product listing with pagination
- S3 for product images with CloudFront CDN
- DynamoDB GSI for category-based queries

**User Stories:**
- As a customer, I can browse meals by category
- As a customer, I can view catering packages filtered by number of persons
- As a customer, I can add extras to my order
- As a customer, I can switch between Arabic and English

#### 1.3 Shopping Cart

**Requirements:**
- Add/remove items with quantity adjustment
- Add extras to individual items
- Persistent cart (survives page refresh and re-login)
- Special instructions per item
- Cart summary with subtotal

**AWS Implementation:**
- Cart stored in DynamoDB linked to user/session
- AppSync mutations for cart operations
- Lambda resolver for price calculations

#### 1.4 Checkout & Payment

**Requirements:**
- Address selection/management
- Delivery time scheduling (immediate or scheduled)
- Promo code application
- Payment gateway integration (KNET/Tap/MyFatoorah)
- Order confirmation with order number

**AWS Implementation:**
- Step Functions workflow for order processing
- Lambda function for payment gateway integration
- AppSync subscription for payment status updates

**User Stories:**
- As a customer, I can select a saved delivery address or add new one
- As a customer, I can apply a promo code for discount
- As a customer, I can pay securely via KNET or card
- As a customer, I receive order confirmation on screen and via WhatsApp

#### 1.5 Order Tracking (Customer)

**Requirements:**
- Real-time order status updates
- Three visible stages: Confirmed → Preparing → Out for Delivery
- Push notifications for status changes

**AWS Implementation:**
- AppSync subscriptions for real-time updates
- Lambda trigger for push notifications (SNS/WhatsApp)
- Order status stored in DynamoDB with timestamp history

**User Stories:**
- As a customer, I can see my order status in real-time
- As a customer, I receive notifications when my order status changes

#### 1.6 Customer Account Area

**Requirements:**
- View order history with invoices
- Track current orders
- Manage profile (name, email, phone)
- Manage addresses
- Change password
- View loyalty points balance

**User Stories:**
- As a customer, I can view my past orders
- As a customer, I can download/view order invoices
- As a customer, I can update my profile information

---

### Phase 2: Operations Dashboard

#### 2.1 Admin Dashboard

**Requirements:**
- Secure admin authentication (separate Cognito User Pool or group)
- Role-based access control (Admin, Kitchen, Delivery)

**Roles:**
- **Admin:** Full access to all features
- **Kitchen Staff:** View incoming orders, update preparation status
- **Delivery Team:** View ready orders, update delivery status

#### 2.2 Order Management

**Requirements:**
- Real-time order queue for kitchen
- Order assignment to delivery personnel
- Estimated preparation time per order
- Delivery time slot management
- Order status workflow

**AWS Implementation:**
- AppSync subscriptions for real-time order updates
- Step Functions for order state machine:
  ```
  Order Placed → Payment Confirmed → Sent to Kitchen → Preparation Started → 
  Ready for Delivery → Assigned to Driver → Out for Delivery → Delivered
  ```
- Lambda functions for notifications to kitchen/delivery displays

**Workflow Details:**
- When order is confirmed: Notify kitchen display + start preparation timer
- When preparation complete: Notify delivery team + assign driver
- When out for delivery: Start delivery timer + notify customer

#### 2.3 Kitchen Display System

**Requirements:**
- Live queue of orders to prepare
- Order details with items and special instructions
- One-click status updates (Start Preparation, Ready)
- Time tracking per order
- Audio/visual alerts for new orders

#### 2.4 Delivery Management

**Requirements:**
- List of orders ready for delivery
- Driver assignment
- Delivery address and customer contact
- One-click status updates (Picked Up, Delivered)
- Delivery time tracking

#### 2.5 Customer Management

**Requirements:**
- View/search all customers
- Customer profile details
- Order history per customer
- Add/edit/delete customers (admin only)
- Export customer list (CSV)

**AWS Implementation:**
- AppSync queries with search/filter
- Lambda function for CSV export to S3

#### 2.6 Product Management

**Requirements:**
- CRUD operations for meals and catering packages
- Image upload to S3
- Category management
- Availability toggle
- Bulk operations

#### 2.7 Reporting Module

**Reports Required:**
- **Product Report:** Sales by product, inventory if applicable
- **Best Selling Items:** Ranking by quantity sold and revenue
- **Catering Analytics:** Most ordered catering packages, popular serving sizes
- **Customer Value Report:** Order count and total value per customer
- **Daily/Weekly/Monthly Sales:** Revenue trends

**AWS Implementation:**
- Lambda functions for report generation
- S3 for report storage/download
- Optional: Amazon QuickSight for advanced analytics

---

### Phase 3: Marketing & Engagement

#### 3.1 Loyalty Points System

**Requirements:**
- Points earned on catering orders (configurable rate, e.g., 1 point per 1 KWD)
- Points redemption at checkout
- Points balance visible in customer account
- Transaction history

**AWS Implementation:**
- DynamoDB table for loyalty transactions
- Lambda function for points calculation on order completion
- AppSync mutations for redemption

#### 3.2 Promotional Game (Spin Wheel)

**Requirements:**
- Interactive spin wheel on homepage
- Prizes: discount percentages or loyalty points
- Configurable prize pool with odds
- Limit: One spin per X days per customer
- Prize automatically applied or saved

**AWS Implementation:**
- React component for wheel animation
- Lambda function for prize selection (server-side randomization)
- DynamoDB tracking for spin eligibility

#### 3.3 Promo Code System

**Requirements:**
- Create/manage promo codes
- Types: percentage off, fixed amount, bonus points
- Validity period
- Usage limits (total and per customer)
- Minimum order value
- Applicable to meals, catering, or both

#### 3.4 Email Marketing Integration

**Requirements:**
- Mailchimp integration for subscriber management
- Automatic subscription on registration (with consent)
- Segmentation by customer behavior
- Unsubscribe handling

**AWS Implementation:**
- Lambda function triggered on user registration
- Mailchimp API integration via Lambda

---

### Phase 4: Content Pages

#### 4.1 Static Pages

**Pages Required:**
- **Home:** Hero, featured items, catering showcase, promotional game
- **About Us:** Company story, values, team (bilingual)
- **Contact Us:** Contact form, location map, phone/WhatsApp
- **Services:** Overview of meal delivery and catering services

**Implementation:**
- Next.js static pages with i18n
- Contact form submits to Lambda → SES for email

---

### Phase 5: Customer Reviews

#### 5.1 Review System

**Requirements:**
- Review prompt after order delivered (24-48 hours)
- Star rating (1-5) + optional comment
- Requires authenticated user with completed order
- Admin approval workflow for comments
- Display approved reviews on product pages

**AWS Implementation:**
- DynamoDB table for reviews
- Lambda trigger for review request notification
- AppSync mutations for review submission
- Admin UI for approval queue

---

## Future Phases (Out of Current Scope)

> **Note for AI:** These features are documented for awareness but should NOT be implemented in current development phases. Reference only.

### Phase 6: Inventory Management
- Stock tracking per ingredient
- Low stock alerts
- Automatic menu item availability based on stock

### Phase 7: Finance Module
- Revenue tracking
- Expense management
- Profit/loss reports
- Payment reconciliation

### Phase 8: Multi-Vendor Marketplace
- Vendor onboarding and management
- Vendor-specific dashboards
- Commission management
- Vendor payouts
- Reference: 6ammart model (Codecanyon)

---

## Project Structure

```
project-root/
├── amplify/
│   ├── auth/
│   │   └── resource.ts          # Cognito configuration
│   ├── data/
│   │   └── resource.ts          # AppSync schema & resolvers
│   ├── storage/
│   │   └── resource.ts          # S3 bucket configuration
│   ├── functions/
│   │   ├── orderWorkflow/       # Order processing Lambda
│   │   ├── paymentHandler/      # Payment gateway integration
│   │   ├── notificationSender/  # WhatsApp/Email notifications
│   │   ├── reportGenerator/     # Analytics and reports
│   │   ├── loyaltyProcessor/    # Points calculation
│   │   ├── gameHandler/         # Spin wheel logic
│   │   └── mailchimpSync/       # Email marketing sync
│   └── backend.ts               # Amplify backend definition
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── [locale]/            # i18n locale wrapper
│   │   │   ├── (public)/        # Public pages
│   │   │   │   ├── page.tsx     # Home
│   │   │   │   ├── menu/        # Product catalog
│   │   │   │   ├── catering/    # Catering packages
│   │   │   │   ├── about/       # About us
│   │   │   │   ├── contact/     # Contact us
│   │   │   │   └── services/    # Services
│   │   │   ├── (auth)/          # Auth pages
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (customer)/      # Protected customer area
│   │   │   │   ├── account/
│   │   │   │   ├── orders/
│   │   │   │   └── checkout/
│   │   │   └── (admin)/         # Admin dashboard
│   │   │       ├── dashboard/
│   │   │       ├── orders/
│   │   │       ├── products/
│   │   │       ├── customers/
│   │   │       ├── kitchen/
│   │   │       ├── delivery/
│   │   │       ├── marketing/
│   │   │       └── reports/
│   │   └── api/                 # API routes if needed
│   ├── components/
│   │   ├── ui/                  # Base UI components
│   │   ├── layout/              # Layout components
│   │   ├── product/             # Product-related components
│   │   ├── cart/                # Cart components
│   │   ├── checkout/            # Checkout components
│   │   ├── order/               # Order tracking components
│   │   ├── admin/               # Admin dashboard components
│   │   └── marketing/           # Game, promo components
│   ├── lib/
│   │   ├── amplify/             # Amplify client configuration
│   │   ├── graphql/             # Generated GraphQL operations
│   │   ├── hooks/               # Custom React hooks
│   │   ├── utils/               # Utility functions
│   │   └── i18n/                # Internationalization config
│   ├── styles/                  # Global styles, Tailwind config
│   └── types/                   # TypeScript type definitions
├── public/
│   ├── locales/                 # Translation files
│   │   ├── en/
│   │   └── ar/
│   └── images/
├── docs/                        # Project documentation
│   └── PROJECT_REQUIREMENTS.md  # This file
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── amplify.yml                  # Amplify build settings
```

---

## Development Guidelines for AI Assistants

### Code Standards

1. **TypeScript:** All code must be TypeScript with strict mode enabled
2. **Styling:** Use Tailwind CSS; follow mobile-first responsive design
3. **Components:** Use React Server Components where possible; client components only when needed
4. **State Management:** Use React Query (TanStack Query) for server state; Zustand for client state if needed
5. **Forms:** Use React Hook Form with Zod validation
6. **i18n:** Use next-intl for internationalization; all user-facing strings must be translatable

### RTL Support

Arabic language requires right-to-left (RTL) layout:
- Use Tailwind's RTL plugin
- Use logical properties (`start`/`end` instead of `left`/`right`)
- Test all components in both LTR and RTL modes

### Amplify Gen 2 Conventions

- Define data models in `amplify/data/resource.ts`
- Use TypeScript for all Lambda functions
- Leverage Amplify's generated GraphQL operations
- Use Amplify UI components where appropriate

### Testing Requirements

- Unit tests for utility functions
- Integration tests for critical flows (checkout, payment)
- E2E tests for customer journey

### Security Considerations

- Validate all inputs server-side
- Use Cognito groups for role-based access
- Sanitize user-generated content
- Implement rate limiting on sensitive endpoints
- PCI compliance for payment handling (use payment gateway's hosted solution)

---

## API Integrations

### Payment Gateway

**Recommended Options (Kuwait):**
1. **Tap Payments** — Popular in GCC, good documentation
2. **MyFatoorah** — Kuwait-based, supports KNET
3. **Upayments** — Local Kuwait provider

**Integration Pattern:**
- Create payment session via Lambda
- Redirect to hosted payment page
- Handle webhook callback for payment confirmation
- Update order status via Step Functions

### WhatsApp Integration

**Options:**
1. **Twilio WhatsApp API** — Enterprise, reliable
2. **MessageBird** — Good GCC coverage
3. **360dialog** — Official WhatsApp BSP

**Use Cases:**
- OTP for authentication
- Order confirmation
- Status updates
- Delivery notifications

### Email (Mailchimp)

**Integration Points:**
- Subscribe on registration
- Tag customers by behavior
- Trigger automations (welcome series, re-engagement)

---

## Deployment Configuration

### Amplify Build Settings (amplify.yml)

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### Environment Variables

```
# Amplify Gen 2 auto-generates most config
# Add these manually in Amplify Console:

NEXT_PUBLIC_APP_NAME="Your Brand Name"
NEXT_PUBLIC_DEFAULT_LOCALE="ar"
NEXT_PUBLIC_SUPPORTED_LOCALES="ar,en"

# Payment Gateway (store in SSM Parameter Store)
PAYMENT_GATEWAY_API_KEY=***
PAYMENT_GATEWAY_SECRET=***

# WhatsApp Provider
WHATSAPP_API_KEY=***
WHATSAPP_PHONE_NUMBER_ID=***

# Mailchimp
MAILCHIMP_API_KEY=***
MAILCHIMP_LIST_ID=***
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Page Load Time | < 3 seconds |
| Checkout Completion Rate | > 70% |
| Order Placement to Kitchen | < 30 seconds |
| Mobile Responsiveness | 100% |
| Lighthouse Performance Score | > 80 |
| API Response Time | < 500ms |

---

## Document Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2024-12-02 | 1.0 | Initial requirements document created |

---

**End of Document**

*This document should be updated as requirements evolve. AI assistants should treat this as the source of truth for project scope and implementation details.*
