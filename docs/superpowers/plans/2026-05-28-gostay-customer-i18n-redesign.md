# GoStay Customer i18n Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a frontend i18n foundation with Vietnamese as the default language, English as a switchable locale, and polish all existing customer-facing GoStay pages with properly accented UI copy.

**Architecture:** Keep localization frontend-only for this slice. Add a shared `I18nProvider` near the app root, route static display copy through typed dictionaries, and preserve backend API contracts/data as-is. Visual polish stays within existing client components and shared UI helpers.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router, TanStack Query, lucide-react.

---

## File Structure

Create:

- `frontend/src/shared/i18n/locales/vi.ts`: Vietnamese translation dictionary.
- `frontend/src/shared/i18n/locales/en.ts`: English dictionary typed from Vietnamese keys.
- `frontend/src/shared/i18n/types.ts`: locale types, nested dictionary type, translation key helpers.
- `frontend/src/shared/i18n/I18nProvider.tsx`: locale state, localStorage persistence, translation helper, context provider.
- `frontend/src/shared/i18n/useI18n.ts`: hook export for components.
- `frontend/src/shared/i18n/index.ts`: public exports.
- `frontend/src/shared/i18n/format.ts`: locale-aware VND/date/status/amenity helpers.

Modify:

- `frontend/src/App.tsx`: wrap routes in `I18nProvider`.
- `frontend/src/shared/ui/travel.ts`: move user-facing labels/formatting behind locale-aware helpers or remove duplicated labels.
- `frontend/src/client/components/layout/Navbar.tsx`: translated nav and language switcher.
- `frontend/src/client/components/layout/Footer.tsx`: translated footer.
- `frontend/src/client/components/home/HeroSearch.tsx`: translated search hero copy and controls.
- `frontend/src/client/components/home/LocationGrid.tsx`: translated headings/states.
- `frontend/src/client/components/home/FeaturedHotels.tsx`: translated headings/states.
- `frontend/src/client/components/home/HotelCard.tsx`: translated labels and CTA.
- `frontend/src/client/components/search/SearchFilters.tsx`: translated filter labels/options.
- `frontend/src/client/components/search/SortBar.tsx`: translated sort labels/options.
- `frontend/src/client/components/search/SearchResults.tsx`: translated loading/error/empty/result copy.
- `frontend/src/client/components/search/HotelSearchCard.tsx`: translated labels and CTA.
- `frontend/src/client/pages/SearchPage.tsx`: translated page shell copy.
- `frontend/src/client/pages/HotelDetailPage.tsx`: translated detail sections/states.
- `frontend/src/client/components/hotel/HotelInfo.tsx`: translated labels.
- `frontend/src/client/components/hotel/ImageGallery.tsx`: translated image alt/fallback copy.
- `frontend/src/client/components/hotel/RoomTypeCard.tsx`: translated room labels and CTA.
- `frontend/src/client/pages/LoginPage.tsx`: translated form copy and polished layout.
- `frontend/src/client/pages/RegisterPage.tsx`: translated form copy and polished layout.
- `frontend/src/client/pages/BookingPage.tsx`: translated booking shell/states.
- `frontend/src/client/components/booking/BookingForm.tsx`: translated form labels/errors.
- `frontend/src/client/components/booking/PriceSummary.tsx`: translated price labels.
- `frontend/src/client/pages/PaymentPage.tsx`: translated payment flow and status labels.
- `frontend/src/client/pages/MyBookingsPage.tsx`: translated booking list/status/empty states.
- `frontend/src/client/pages/BookingDetailPage.tsx`: translated booking detail/status/action copy.
- `frontend/src/index.css`: refine global tokens only if needed for Vietnamese text fit.

Validation:

- `npm run build` from `frontend/`.
- `rg -n "Khach|Diem|Uu|Dang|Dat phong|Lien he|Ho boi|Nha hang|Bai do|Gan bien|Loading|Dashboard|Hotels|Bookings|Users|Admin Panel" frontend/src/client frontend/src/shared frontend/src/App.tsx` should return no customer UI hardcoded strings except deliberate backend data, admin placeholders, or dictionary entries.
- Manual smoke routes: `/`, `/search`, `/login`, `/register`, one `/hotel/:slug`, booking/payment where seeded data permits, `/bookings` where auth permits.

---

### Task 1: Add Frontend i18n Foundation

**Files:**

- Create: `frontend/src/shared/i18n/types.ts`
- Create: `frontend/src/shared/i18n/locales/vi.ts`
- Create: `frontend/src/shared/i18n/locales/en.ts`
- Create: `frontend/src/shared/i18n/I18nProvider.tsx`
- Create: `frontend/src/shared/i18n/useI18n.ts`
- Create: `frontend/src/shared/i18n/index.ts`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Create typed i18n utility types**

Create `frontend/src/shared/i18n/types.ts`:

```ts
export const locales = ['vi', 'en'] as const;

export type Locale = (typeof locales)[number];

export type Messages = {
  common: {
    brand: string;
    loading: string;
    error: string;
    retry: string;
    search: string;
    bookNow: string;
    viewDetails: string;
    contact: string;
    perNight: string;
    from: string;
    close: string;
    menu: string;
    language: string;
  };
  nav: {
    hotels: string;
    destinations: string;
    deals: string;
    myBookings: string;
    login: string;
    logout: string;
  };
  home: {
    eyebrow: string;
    title: string;
    subtitle: string;
    destinationTitle: string;
    destinationSubtitle: string;
    featuredTitle: string;
    featuredSubtitle: string;
  };
  searchForm: {
    destination: string;
    destinationPlaceholder: string;
    checkIn: string;
    checkOut: string;
    guests: string;
    guestsSingular: string;
    guestsPlural: string;
  };
  search: {
    title: string;
    subtitle: string;
    filters: string;
    priceRange: string;
    starRating: string;
    sortBy: string;
    sortRecommended: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    resultsCount: string;
    emptyTitle: string;
    emptyBody: string;
  };
  hotel: {
    amenities: string;
    overview: string;
    location: string;
    rooms: string;
    checkIn: string;
    checkOut: string;
    guests: string;
    maxGuests: string;
    bedType: string;
    roomSize: string;
    availableRooms: string;
    chooseRoom: string;
    noRooms: string;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    loginAction: string;
    registerAction: string;
    noAccount: string;
    hasAccount: string;
    createAccount: string;
    loginInstead: string;
    loginError: string;
    registerError: string;
  };
  booking: {
    title: string;
    subtitle: string;
    guestInfo: string;
    specialRequests: string;
    specialRequestsPlaceholder: string;
    priceSummary: string;
    nights: string;
    taxes: string;
    total: string;
    confirm: string;
    bookingCode: string;
    status: string;
    createdAt: string;
    cancel: string;
    emptyTitle: string;
    emptyBody: string;
    exploreHotels: string;
  };
  payment: {
    title: string;
    subtitle: string;
    method: string;
    payWithVnpay: string;
    payWithMomo: string;
    continuePayment: string;
    success: string;
    pending: string;
    failed: string;
  };
  footer: {
    tagline: string;
    company: string;
    support: string;
    terms: string;
    privacy: string;
  };
  status: {
    pending: string;
    confirmed: string;
    cancelled: string;
    completed: string;
    success: string;
    failed: string;
    refunded: string;
  };
  amenities: Record<string, string>;
};

type Join<K, P> = K extends string
  ? P extends string
    ? `${K}.${P}`
    : never
  : never;

export type TranslationKey<T = Messages> = T extends string
  ? never
  : {
      [K in keyof T]: T[K] extends string ? K & string : Join<K & string, TranslationKey<T[K]>>;
    }[keyof T];
```

- [ ] **Step 2: Create Vietnamese dictionary**

Create `frontend/src/shared/i18n/locales/vi.ts`:

```ts
import type { Messages } from '../types';

export const vi: Messages = {
  common: {
    brand: 'GoStay',
    loading: 'Đang tải...',
    error: 'Đã có lỗi xảy ra',
    retry: 'Thử lại',
    search: 'Tìm kiếm',
    bookNow: 'Đặt ngay',
    viewDetails: 'Xem chi tiết',
    contact: 'Liên hệ',
    perNight: '/ đêm',
    from: 'Từ',
    close: 'Đóng',
    menu: 'Mở menu',
    language: 'Ngôn ngữ',
  },
  nav: {
    hotels: 'Khách sạn',
    destinations: 'Điểm đến',
    deals: 'Ưu đãi',
    myBookings: 'Đơn đặt phòng',
    login: 'Đăng nhập',
    logout: 'Đăng xuất',
  },
  home: {
    eyebrow: 'Lưu trú chọn lọc tại Việt Nam',
    title: 'Tìm nơi nghỉ phù hợp cho chuyến đi tiếp theo',
    subtitle: 'Khám phá khách sạn, resort và căn hộ nghỉ dưỡng được tuyển chọn tại các điểm đến được yêu thích.',
    destinationTitle: 'Điểm đến nổi bật',
    destinationSubtitle: 'Những thành phố và vùng nghỉ dưỡng được du khách GoStay tìm kiếm nhiều nhất.',
    featuredTitle: 'Khách sạn được đề xuất',
    featuredSubtitle: 'Các lựa chọn có vị trí tốt, tiện nghi rõ ràng và giá dễ so sánh.',
  },
  searchForm: {
    destination: 'Điểm đến',
    destinationPlaceholder: 'Bạn muốn đi đâu?',
    checkIn: 'Ngày nhận phòng',
    checkOut: 'Ngày trả phòng',
    guests: 'Khách',
    guestsSingular: '1 khách',
    guestsPlural: '{{count}} khách',
  },
  search: {
    title: 'Tìm khách sạn',
    subtitle: 'Lọc theo điểm đến, ngày ở, hạng sao và ngân sách của bạn.',
    filters: 'Bộ lọc',
    priceRange: 'Khoảng giá',
    starRating: 'Hạng sao',
    sortBy: 'Sắp xếp',
    sortRecommended: 'Đề xuất',
    sortPriceAsc: 'Giá thấp đến cao',
    sortPriceDesc: 'Giá cao đến thấp',
    resultsCount: '{{count}} khách sạn phù hợp',
    emptyTitle: 'Chưa tìm thấy khách sạn phù hợp',
    emptyBody: 'Hãy thử đổi điểm đến, ngày ở hoặc khoảng giá để xem thêm lựa chọn.',
  },
  hotel: {
    amenities: 'Tiện nghi',
    overview: 'Tổng quan',
    location: 'Vị trí',
    rooms: 'Phòng còn trống',
    checkIn: 'Nhận phòng',
    checkOut: 'Trả phòng',
    guests: 'Số khách',
    maxGuests: 'Tối đa {{count}} khách',
    bedType: 'Loại giường',
    roomSize: '{{size}} m²',
    availableRooms: 'Còn {{count}} phòng',
    chooseRoom: 'Chọn phòng',
    noRooms: 'Chưa có phòng phù hợp với ngày đã chọn.',
  },
  auth: {
    loginTitle: 'Đăng nhập GoStay',
    loginSubtitle: 'Quản lý đặt phòng và tiếp tục thanh toán nhanh hơn.',
    registerTitle: 'Tạo tài khoản GoStay',
    registerSubtitle: 'Lưu thông tin chuyến đi và theo dõi đơn đặt phòng của bạn.',
    name: 'Họ và tên',
    email: 'Email',
    phone: 'Số điện thoại',
    password: 'Mật khẩu',
    confirmPassword: 'Xác nhận mật khẩu',
    loginAction: 'Đăng nhập',
    registerAction: 'Tạo tài khoản',
    noAccount: 'Chưa có tài khoản?',
    hasAccount: 'Đã có tài khoản?',
    createAccount: 'Đăng ký ngay',
    loginInstead: 'Đăng nhập',
    loginError: 'Không thể đăng nhập. Vui lòng kiểm tra lại thông tin.',
    registerError: 'Không thể tạo tài khoản. Vui lòng thử lại.',
  },
  booking: {
    title: 'Hoàn tất đặt phòng',
    subtitle: 'Kiểm tra thông tin lưu trú trước khi xác nhận.',
    guestInfo: 'Thông tin khách',
    specialRequests: 'Yêu cầu đặc biệt',
    specialRequestsPlaceholder: 'Ví dụ: tầng cao, giường đôi, nhận phòng muộn...',
    priceSummary: 'Tóm tắt giá',
    nights: '{{count}} đêm',
    taxes: 'Thuế và phí',
    total: 'Tổng cộng',
    confirm: 'Xác nhận đặt phòng',
    bookingCode: 'Mã đặt phòng',
    status: 'Trạng thái',
    createdAt: 'Ngày tạo',
    cancel: 'Hủy đặt phòng',
    emptyTitle: 'Bạn chưa có đơn đặt phòng',
    emptyBody: 'Khám phá các khách sạn phù hợp và đặt chuyến đi đầu tiên của bạn.',
    exploreHotels: 'Tìm khách sạn',
  },
  payment: {
    title: 'Thanh toán',
    subtitle: 'Chọn phương thức thanh toán để hoàn tất đơn đặt phòng.',
    method: 'Phương thức thanh toán',
    payWithVnpay: 'Thanh toán qua VNPAY',
    payWithMomo: 'Thanh toán qua MoMo',
    continuePayment: 'Tiếp tục thanh toán',
    success: 'Thanh toán thành công',
    pending: 'Đang chờ thanh toán',
    failed: 'Thanh toán thất bại',
  },
  footer: {
    tagline: 'Nền tảng đặt lưu trú dành cho những chuyến đi chỉn chu tại Việt Nam.',
    company: 'Công ty',
    support: 'Hỗ trợ',
    terms: 'Điều khoản',
    privacy: 'Quyền riêng tư',
  },
  status: {
    pending: 'Đang chờ',
    confirmed: 'Đã xác nhận',
    cancelled: 'Đã hủy',
    completed: 'Hoàn tất',
    success: 'Thành công',
    failed: 'Thất bại',
    refunded: 'Đã hoàn tiền',
  },
  amenities: {
    wifi: 'WiFi',
    pool: 'Hồ bơi',
    spa: 'Spa',
    restaurant: 'Nhà hàng',
    gym: 'Phòng gym',
    parking: 'Bãi đỗ xe',
    beach: 'Gần biển',
  },
};
```

- [ ] **Step 3: Create English dictionary**

Create `frontend/src/shared/i18n/locales/en.ts` with the same keys:

```ts
import type { Messages } from '../types';

export const en: Messages = {
  common: {
    brand: 'GoStay',
    loading: 'Loading...',
    error: 'Something went wrong',
    retry: 'Try again',
    search: 'Search',
    bookNow: 'Book now',
    viewDetails: 'View details',
    contact: 'Contact',
    perNight: '/ night',
    from: 'From',
    close: 'Close',
    menu: 'Open menu',
    language: 'Language',
  },
  nav: {
    hotels: 'Hotels',
    destinations: 'Destinations',
    deals: 'Deals',
    myBookings: 'My bookings',
    login: 'Log in',
    logout: 'Log out',
  },
  home: {
    eyebrow: 'Curated stays in Vietnam',
    title: 'Find the right stay for your next trip',
    subtitle: 'Explore selected hotels, resorts, and vacation stays across favorite destinations.',
    destinationTitle: 'Featured destinations',
    destinationSubtitle: 'Cities and retreats GoStay travelers search for most.',
    featuredTitle: 'Recommended hotels',
    featuredSubtitle: 'Well-located stays with clear amenities and easy-to-compare rates.',
  },
  searchForm: {
    destination: 'Destination',
    destinationPlaceholder: 'Where are you going?',
    checkIn: 'Check-in date',
    checkOut: 'Check-out date',
    guests: 'Guests',
    guestsSingular: '1 guest',
    guestsPlural: '{{count}} guests',
  },
  search: {
    title: 'Find hotels',
    subtitle: 'Filter by destination, dates, star rating, and budget.',
    filters: 'Filters',
    priceRange: 'Price range',
    starRating: 'Star rating',
    sortBy: 'Sort by',
    sortRecommended: 'Recommended',
    sortPriceAsc: 'Lowest price first',
    sortPriceDesc: 'Highest price first',
    resultsCount: '{{count}} matching hotels',
    emptyTitle: 'No matching hotels yet',
    emptyBody: 'Try changing the destination, dates, or price range to see more options.',
  },
  hotel: {
    amenities: 'Amenities',
    overview: 'Overview',
    location: 'Location',
    rooms: 'Available rooms',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    guests: 'Guests',
    maxGuests: 'Up to {{count}} guests',
    bedType: 'Bed type',
    roomSize: '{{size}} sqm',
    availableRooms: '{{count}} rooms left',
    chooseRoom: 'Choose room',
    noRooms: 'No rooms match the selected dates yet.',
  },
  auth: {
    loginTitle: 'Log in to GoStay',
    loginSubtitle: 'Manage bookings and continue payment faster.',
    registerTitle: 'Create your GoStay account',
    registerSubtitle: 'Save trip details and track your bookings.',
    name: 'Full name',
    email: 'Email',
    phone: 'Phone number',
    password: 'Password',
    confirmPassword: 'Confirm password',
    loginAction: 'Log in',
    registerAction: 'Create account',
    noAccount: 'No account yet?',
    hasAccount: 'Already have an account?',
    createAccount: 'Register now',
    loginInstead: 'Log in',
    loginError: 'Unable to log in. Please check your details.',
    registerError: 'Unable to create account. Please try again.',
  },
  booking: {
    title: 'Complete your booking',
    subtitle: 'Review your stay details before confirming.',
    guestInfo: 'Guest information',
    specialRequests: 'Special requests',
    specialRequestsPlaceholder: 'Example: high floor, double bed, late check-in...',
    priceSummary: 'Price summary',
    nights: '{{count}} nights',
    taxes: 'Taxes and fees',
    total: 'Total',
    confirm: 'Confirm booking',
    bookingCode: 'Booking code',
    status: 'Status',
    createdAt: 'Created at',
    cancel: 'Cancel booking',
    emptyTitle: 'You have no bookings yet',
    emptyBody: 'Explore matching hotels and book your first trip.',
    exploreHotels: 'Find hotels',
  },
  payment: {
    title: 'Payment',
    subtitle: 'Choose a payment method to complete your booking.',
    method: 'Payment method',
    payWithVnpay: 'Pay with VNPAY',
    payWithMomo: 'Pay with MoMo',
    continuePayment: 'Continue payment',
    success: 'Payment successful',
    pending: 'Payment pending',
    failed: 'Payment failed',
  },
  footer: {
    tagline: 'A stay-booking platform for thoughtful trips across Vietnam.',
    company: 'Company',
    support: 'Support',
    terms: 'Terms',
    privacy: 'Privacy',
  },
  status: {
    pending: 'Pending',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    completed: 'Completed',
    success: 'Success',
    failed: 'Failed',
    refunded: 'Refunded',
  },
  amenities: {
    wifi: 'WiFi',
    pool: 'Pool',
    spa: 'Spa',
    restaurant: 'Restaurant',
    gym: 'Gym',
    parking: 'Parking',
    beach: 'Near beach',
  },
};
```

- [ ] **Step 4: Create provider and hook**

Create `frontend/src/shared/i18n/I18nProvider.tsx`:

```tsx
import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import { en } from './locales/en';
import { vi } from './locales/vi';
import { locales, type Locale, type Messages, type TranslationKey } from './types';

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

const messages: Record<Locale, Messages> = { vi, en };
const storageKey = 'gostay_locale';

function isLocale(value: string | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

function readInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'vi';
  const stored = window.localStorage.getItem(storageKey);
  return isLocale(stored) ? stored : 'vi';
}

function readPath(source: Messages, key: TranslationKey): string {
  const value = key.split('.').reduce<unknown>((node, part) => {
    if (node && typeof node === 'object' && part in node) {
      return (node as Record<string, unknown>)[part];
    }
    return undefined;
  }, source);

  return typeof value === 'string' ? value : key;
}

function interpolate(text: string, values?: Record<string, string | number>) {
  if (!values) return text;

  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
    text,
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem(storageKey, nextLocale);
  }, []);

  const t = useCallback(
    (key: TranslationKey, values?: Record<string, string | number>) => interpolate(readPath(messages[locale], key), values),
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
```

Create `frontend/src/shared/i18n/useI18n.ts`:

```ts
import { useContext } from 'react';
import { I18nContext } from './I18nProvider';

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}
```

Create `frontend/src/shared/i18n/index.ts`:

```ts
export { I18nProvider } from './I18nProvider';
export { useI18n } from './useI18n';
export type { Locale, TranslationKey } from './types';
```

- [ ] **Step 5: Wrap the app**

Modify `frontend/src/App.tsx` so `I18nProvider` wraps the existing `AuthProvider`:

```tsx
import { I18nProvider } from './shared/i18n';
```

The provider nesting should become:

```tsx
<QueryClientProvider client={queryClient}>
  <I18nProvider>
    <AuthProvider>
      <BrowserRouter>
        {/* existing routes */}
      </BrowserRouter>
    </AuthProvider>
  </I18nProvider>
</QueryClientProvider>
```

Also replace the admin lazy fallback text with neutral translated-independent UI:

```tsx
<Suspense fallback={<div className="flex min-h-screen items-center justify-center">...</div>}>
  <AdminLayout />
</Suspense>
```

- [ ] **Step 6: Run build and fix type issues in i18n foundation**

Run:

```bash
cd frontend
npm run build
```

Expected: build may fail only for typing issues introduced in this task. Fix i18n type errors before moving on.

---

### Task 2: Add Locale-Aware Shared Formatting

**Files:**

- Create: `frontend/src/shared/i18n/format.ts`
- Modify: `frontend/src/shared/ui/travel.ts`

- [ ] **Step 1: Create shared display helpers**

Create `frontend/src/shared/i18n/format.ts`:

```ts
import type { Locale } from './types';

export function formatVndForLocale(price: string | number | null | undefined, locale: Locale) {
  const value = Number(price ?? 0);
  if (value <= 0) return locale === 'vi' ? 'Liên hệ' : 'Contact';

  return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateForLocale(value: string | null | undefined, locale: Locale) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function statusLabel(status: string | null | undefined, labels: Record<string, string>) {
  if (!status) return '';
  return labels[status] || status;
}
```

- [ ] **Step 2: Keep imagery helpers and remove hardcoded Vietnamese labels from `travel.ts`**

Modify `frontend/src/shared/ui/travel.ts`:

```ts
export function formatVnd(price: string | number | null | undefined) {
  const value = Number(price ?? 0);
  return value > 0 ? `${value.toLocaleString('vi-VN')}đ` : 'Liên hệ';
}

export function amenityLabel(amenity: string, labels?: Record<string, string>) {
  return labels?.[amenity] || amenity;
}
```

Keep existing image/backdrop helpers unchanged. This maintains compatibility while allowing translated callers to pass `t`-backed labels.

- [ ] **Step 3: Run build**

Run:

```bash
cd frontend
npm run build
```

Expected: PASS or only failures from later untouched hardcoded imports. Fix this task's helper exports before moving on.

---

### Task 3: Translate Layout, Navbar, and Footer

**Files:**

- Modify: `frontend/src/client/components/layout/Navbar.tsx`
- Modify: `frontend/src/client/components/layout/Footer.tsx`

- [ ] **Step 1: Add language switcher and translated nav**

Modify `Navbar.tsx` to import and use i18n:

```tsx
import { Globe2, Menu, UserRound, X } from 'lucide-react';
import { useI18n, type Locale } from '../../../shared/i18n';
```

Inside the component:

```tsx
const { locale, setLocale, t } = useI18n();
const switchLocale = (nextLocale: Locale) => {
  setLocale(nextLocale);
  setMenuOpen(false);
};
```

Replace visible copy:

```tsx
<Link to="/search" className="transition-colors hover:text-primary">{t('nav.hotels')}</Link>
<a href="#destinations" className="transition-colors hover:text-primary">{t('nav.destinations')}</a>
<a href="#featured" className="transition-colors hover:text-primary">{t('nav.deals')}</a>
<Link to="/bookings" className="text-sm font-medium text-text-secondary transition-colors hover:text-primary">{t('nav.myBookings')}</Link>
<button ...>{t('nav.logout')}</button>
<Link ...>{t('nav.login')}</Link>
```

Add desktop language switcher before the auth block:

```tsx
<div className="inline-flex items-center gap-1 rounded-md border border-border bg-white p-1 text-xs font-semibold text-text-secondary">
  <Globe2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
  {(['vi', 'en'] as const).map((item) => (
    <button
      key={item}
      type="button"
      onClick={() => switchLocale(item)}
      className={`rounded px-2 py-1 transition-colors ${locale === item ? 'bg-navy text-white' : 'hover:bg-tab'}`}
      aria-label={`${t('common.language')}: ${item.toUpperCase()}`}
    >
      {item.toUpperCase()}
    </button>
  ))}
</div>
```

Add the same switcher in the mobile menu using full-width-safe classes:

```tsx
<div className="flex items-center gap-2 px-2 py-2">
  <span className="text-xs font-semibold uppercase text-text-secondary">{t('common.language')}</span>
  {(['vi', 'en'] as const).map((item) => (
    <button
      key={item}
      type="button"
      onClick={() => switchLocale(item)}
      className={`rounded-md px-3 py-1.5 text-xs font-semibold ${locale === item ? 'bg-navy text-white' : 'bg-white text-text'}`}
    >
      {item.toUpperCase()}
    </button>
  ))}
</div>
```

Change menu button label:

```tsx
aria-label={t('common.menu')}
```

- [ ] **Step 2: Translate footer**

Modify `Footer.tsx` to use:

```tsx
import { useI18n } from '../../../shared/i18n';
```

Replace visible copy with:

```tsx
const { t } = useI18n();
```

Use these labels:

```tsx
{t('footer.tagline')}
{t('footer.company')}
{t('footer.support')}
{t('footer.terms')}
{t('footer.privacy')}
```

- [ ] **Step 3: Run hardcoded-copy scan for layout**

Run:

```bash
rg -n "Khach|Diem|Uu|Dang|Dat phong|Loading|Lien he" frontend/src/client/components/layout frontend/src/App.tsx
```

Expected: no matches except none. Fix any layout string found.

---

### Task 4: Translate and Polish Homepage Components

**Files:**

- Modify: `frontend/src/client/components/home/HeroSearch.tsx`
- Modify: `frontend/src/client/components/home/LocationGrid.tsx`
- Modify: `frontend/src/client/components/home/FeaturedHotels.tsx`
- Modify: `frontend/src/client/components/home/HotelCard.tsx`

- [ ] **Step 1: Update `HeroSearch.tsx` copy**

Import:

```tsx
import { useI18n } from '../../../shared/i18n';
```

Inside component:

```tsx
const { t } = useI18n();
```

Replace hero/search strings with:

```tsx
{t('home.eyebrow')}
{t('home.title')}
{t('home.subtitle')}
{t('searchForm.destination')}
{t('searchForm.destinationPlaceholder')}
{t('searchForm.checkIn')}
{t('searchForm.checkOut')}
{t('searchForm.guests')}
{t('common.search')}
```

For guest display:

```tsx
{guests === 1 ? t('searchForm.guestsSingular') : t('searchForm.guestsPlural', { count: guests })}
```

Keep current search params and navigation behavior unchanged.

- [ ] **Step 2: Update `LocationGrid.tsx` copy and states**

Import `useI18n`, then replace section labels:

```tsx
const { t } = useI18n();
```

Use:

```tsx
{t('home.destinationTitle')}
{t('home.destinationSubtitle')}
{t('common.loading')}
{t('common.viewDetails')}
```

Keep API collection normalization unchanged.

- [ ] **Step 3: Update `FeaturedHotels.tsx` copy and states**

Import `useI18n`, then replace section labels:

```tsx
{t('home.featuredTitle')}
{t('home.featuredSubtitle')}
{t('common.loading')}
```

Pass translated formatting inputs down to `HotelCard` if needed, but do not change API behavior.

- [ ] **Step 4: Update `HotelCard.tsx` labels**

Import:

```tsx
import { useI18n } from '../../../shared/i18n';
import { formatVndForLocale } from '../../../shared/i18n/format';
```

Inside component:

```tsx
const { locale, t } = useI18n();
const price = formatVndForLocale(hotel.min_price, locale);
```

Use:

```tsx
{t('common.from')} {price}
{t('common.perNight')}
{t('common.viewDetails')}
```

If amenity labels render here, use:

```tsx
{amenityLabel(amenity, {
  wifi: t('amenities.wifi'),
  pool: t('amenities.pool'),
  spa: t('amenities.spa'),
  restaurant: t('amenities.restaurant'),
  gym: t('amenities.gym'),
  parking: t('amenities.parking'),
  beach: t('amenities.beach'),
})}
```

- [ ] **Step 5: Build and scan homepage**

Run:

```bash
cd frontend
npm run build
```

Then:

```bash
rg -n "Khach|Diem|Uu|Dang|Dat phong|Lien he|Ho boi|Nha hang|Bai do|Gan bien" frontend/src/client/components/home frontend/src/shared/ui/travel.ts
```

Expected: no customer component matches outside dictionary/helper compatibility.

---

### Task 5: Translate Search Experience

**Files:**

- Modify: `frontend/src/client/pages/SearchPage.tsx`
- Modify: `frontend/src/client/components/search/SearchFilters.tsx`
- Modify: `frontend/src/client/components/search/SortBar.tsx`
- Modify: `frontend/src/client/components/search/SearchResults.tsx`
- Modify: `frontend/src/client/components/search/HotelSearchCard.tsx`

- [ ] **Step 1: Translate `SearchPage.tsx` shell**

Import and use:

```tsx
import { useI18n } from '../../shared/i18n';
const { t } = useI18n();
```

Replace page heading/subtitle with:

```tsx
{t('search.title')}
{t('search.subtitle')}
```

- [ ] **Step 2: Translate `SearchFilters.tsx`**

Import `useI18n` and replace labels:

```tsx
{t('search.filters')}
{t('search.priceRange')}
{t('search.starRating')}
{t('searchForm.destination')}
{t('searchForm.checkIn')}
{t('searchForm.checkOut')}
{t('searchForm.guests')}
```

For destination placeholder:

```tsx
placeholder={t('searchForm.destinationPlaceholder')}
```

Keep query param names unchanged.

- [ ] **Step 3: Translate `SortBar.tsx`**

Use:

```tsx
{t('search.sortBy')}
{t('search.sortRecommended')}
{t('search.sortPriceAsc')}
{t('search.sortPriceDesc')}
```

Keep sort values such as `recommended`, `price_asc`, and `price_desc` unchanged.

- [ ] **Step 4: Translate `SearchResults.tsx` states**

Use:

```tsx
{t('common.loading')}
{t('search.emptyTitle')}
{t('search.emptyBody')}
{t('search.resultsCount', { count: hotels.length })}
```

If there is an error block, use:

```tsx
{t('common.error')}
{t('common.retry')}
```

- [ ] **Step 5: Translate `HotelSearchCard.tsx`**

Use the same price and amenity approach as `HotelCard.tsx`:

```tsx
const { locale, t } = useI18n();
const price = formatVndForLocale(hotel.min_price, locale);
```

Replace CTA and labels:

```tsx
{t('common.from')} {price}
{t('common.perNight')}
{t('common.viewDetails')}
{t('common.bookNow')}
```

- [ ] **Step 6: Build and scan search files**

Run:

```bash
cd frontend
npm run build
```

Then:

```bash
rg -n "Khach|Diem|Uu|Dang|Dat phong|Lien he|Ho boi|Nha hang|Bai do|Gan bien|Loading" frontend/src/client/pages/SearchPage.tsx frontend/src/client/components/search
```

Expected: no hardcoded customer copy matches.

---

### Task 6: Translate Hotel Detail Components

**Files:**

- Modify: `frontend/src/client/pages/HotelDetailPage.tsx`
- Modify: `frontend/src/client/components/hotel/HotelInfo.tsx`
- Modify: `frontend/src/client/components/hotel/ImageGallery.tsx`
- Modify: `frontend/src/client/components/hotel/RoomTypeCard.tsx`

- [ ] **Step 1: Translate `HotelDetailPage.tsx` states and section labels**

Import `useI18n`:

```tsx
const { t } = useI18n();
```

Use:

```tsx
{t('common.loading')}
{t('common.error')}
{t('hotel.rooms')}
{t('hotel.noRooms')}
```

Keep room query behavior unchanged.

- [ ] **Step 2: Translate `HotelInfo.tsx` labels**

Use:

```tsx
{t('hotel.overview')}
{t('hotel.amenities')}
{t('hotel.location')}
{t('hotel.checkIn')}
{t('hotel.checkOut')}
```

For amenities:

```tsx
amenityLabel(amenity, {
  wifi: t('amenities.wifi'),
  pool: t('amenities.pool'),
  spa: t('amenities.spa'),
  restaurant: t('amenities.restaurant'),
  gym: t('amenities.gym'),
  parking: t('amenities.parking'),
  beach: t('amenities.beach'),
})
```

- [ ] **Step 3: Translate `ImageGallery.tsx` owned alt/fallback copy**

Use `t('common.brand')` or hotel name for alt text:

```tsx
alt={image.caption || hotelName || t('common.brand')}
```

If fallback text exists, replace it with:

```tsx
{t('common.loading')}
```

- [ ] **Step 4: Translate `RoomTypeCard.tsx`**

Use:

```tsx
{t('hotel.maxGuests', { count: room.max_guests })}
{t('hotel.bedType')}
{room.bed_type}
{room.size_sqm ? t('hotel.roomSize', { size: room.size_sqm }) : null}
{typeof room.available_rooms === 'number' ? t('hotel.availableRooms', { count: room.available_rooms }) : null}
{t('common.from')} {formatVndForLocale(room.price_per_night, locale)}
{t('common.perNight')}
{t('hotel.chooseRoom')}
```

Keep `room.bed_type` as backend data.

- [ ] **Step 5: Build and scan hotel detail**

Run:

```bash
cd frontend
npm run build
```

Then:

```bash
rg -n "Khach|Phong|Dat|Nhan|Tra|Tien nghi|Vi tri|Lien he|Loading" frontend/src/client/pages/HotelDetailPage.tsx frontend/src/client/components/hotel
```

Expected: no hardcoded customer copy matches, except backend field names or dictionary imports.

---

### Task 7: Translate Auth Pages

**Files:**

- Modify: `frontend/src/client/pages/LoginPage.tsx`
- Modify: `frontend/src/client/pages/RegisterPage.tsx`

- [ ] **Step 1: Translate `LoginPage.tsx`**

Import:

```tsx
import { useI18n } from '../../shared/i18n';
```

Inside component:

```tsx
const { t } = useI18n();
```

Replace labels:

```tsx
{t('auth.loginTitle')}
{t('auth.loginSubtitle')}
{t('auth.email')}
{t('auth.password')}
{t('auth.loginAction')}
{t('auth.noAccount')}
{t('auth.createAccount')}
```

Replace frontend-owned error fallback:

```tsx
setError(t('auth.loginError'));
```

Keep server validation messages only if currently displayed from backend; do not translate unknown backend strings.

- [ ] **Step 2: Polish `LoginPage.tsx` layout**

Keep the form centered, but align visual style with the premium customer UI:

```tsx
<div className="min-h-[calc(100vh-160px)] bg-bg px-4 py-12">
  <div className="mx-auto grid max-w-5xl overflow-hidden rounded-lg border border-border bg-white shadow-sm md:grid-cols-[0.95fr_1.05fr]">
    {/* image/editorial panel + form panel */}
  </div>
</div>
```

Use an image-led or warm accent panel, not a gradient-only hero. If no local asset fits, use CSS background plus concise travel copy from translations.

- [ ] **Step 3: Translate `RegisterPage.tsx`**

Use:

```tsx
{t('auth.registerTitle')}
{t('auth.registerSubtitle')}
{t('auth.name')}
{t('auth.email')}
{t('auth.phone')}
{t('auth.password')}
{t('auth.confirmPassword')}
{t('auth.registerAction')}
{t('auth.hasAccount')}
{t('auth.loginInstead')}
```

Replace frontend-owned error fallback:

```tsx
setError(t('auth.registerError'));
```

- [ ] **Step 4: Build and scan auth pages**

Run:

```bash
cd frontend
npm run build
```

Then:

```bash
rg -n "Dang|Nhap|Ky|Mat khau|Tai khoan|Email|Phone|Loading" frontend/src/client/pages/LoginPage.tsx frontend/src/client/pages/RegisterPage.tsx
```

Expected: no hardcoded customer copy matches except field names that are API payload keys.

---

### Task 8: Translate Booking and Payment Flow

**Files:**

- Modify: `frontend/src/client/pages/BookingPage.tsx`
- Modify: `frontend/src/client/components/booking/BookingForm.tsx`
- Modify: `frontend/src/client/components/booking/PriceSummary.tsx`
- Modify: `frontend/src/client/pages/PaymentPage.tsx`

- [ ] **Step 1: Translate `BookingPage.tsx` shell and states**

Use:

```tsx
{t('booking.title')}
{t('booking.subtitle')}
{t('common.loading')}
{t('common.error')}
```

Keep route param and room loading logic unchanged.

- [ ] **Step 2: Translate `BookingForm.tsx`**

Use:

```tsx
{t('booking.guestInfo')}
{t('searchForm.checkIn')}
{t('searchForm.checkOut')}
{t('searchForm.guests')}
{t('booking.specialRequests')}
placeholder={t('booking.specialRequestsPlaceholder')}
{t('booking.confirm')}
```

If form validation messages are frontend-owned, replace them with Vietnamese/English dictionary keys by adding specific keys to `auth` or `booking` dictionaries in both locales before use.

- [ ] **Step 3: Translate `PriceSummary.tsx`**

Use:

```tsx
{t('booking.priceSummary')}
{t('booking.nights', { count: nights })}
{t('booking.taxes')}
{t('booking.total')}
formatVndForLocale(total, locale)
```

Ensure the price layout uses `flex-wrap` or column layout on narrow mobile if Vietnamese text is longer.

- [ ] **Step 4: Translate `PaymentPage.tsx`**

Use:

```tsx
{t('payment.title')}
{t('payment.subtitle')}
{t('payment.method')}
{t('payment.payWithVnpay')}
{t('payment.payWithMomo')}
{t('payment.continuePayment')}
{t('payment.success')}
{t('payment.pending')}
{t('payment.failed')}
{t('booking.bookingCode')}
{t('booking.total')}
```

Translate known payment status values with:

```tsx
const statusLabels = {
  pending: t('status.pending'),
  success: t('status.success'),
  failed: t('status.failed'),
  refunded: t('status.refunded'),
};
```

- [ ] **Step 5: Build and scan booking/payment files**

Run:

```bash
cd frontend
npm run build
```

Then:

```bash
rg -n "Dat|Phong|Thanh toan|Tong|Khach|Ngay|Yeu cau|Loading|Success|Failed|Pending" frontend/src/client/pages/BookingPage.tsx frontend/src/client/components/booking frontend/src/client/pages/PaymentPage.tsx
```

Expected: no hardcoded customer copy matches except API enum values.

---

### Task 9: Translate My Bookings and Booking Detail

**Files:**

- Modify: `frontend/src/client/pages/MyBookingsPage.tsx`
- Modify: `frontend/src/client/pages/BookingDetailPage.tsx`

- [ ] **Step 1: Translate booking list copy**

Use:

```tsx
{t('nav.myBookings')}
{t('booking.emptyTitle')}
{t('booking.emptyBody')}
{t('booking.exploreHotels')}
{t('booking.bookingCode')}
{t('booking.status')}
{t('booking.createdAt')}
{t('booking.total')}
{t('common.viewDetails')}
```

Translate status values:

```tsx
const bookingStatusLabels = {
  pending: t('status.pending'),
  confirmed: t('status.confirmed'),
  cancelled: t('status.cancelled'),
  completed: t('status.completed'),
};
```

Use `formatDateForLocale(booking.created_at, locale)` and `formatVndForLocale(booking.total_price, locale)`.

- [ ] **Step 2: Translate booking detail copy**

Use the same labels as list plus:

```tsx
{t('booking.cancel')}
{t('hotel.checkIn')}
{t('hotel.checkOut')}
{t('hotel.guests')}
{t('payment.method')}
```

Keep cancel booking API behavior unchanged.

- [ ] **Step 3: Build and scan booking account pages**

Run:

```bash
cd frontend
npm run build
```

Then:

```bash
rg -n "Dat|Phong|Trang thai|Tong|Ngay|Huy|Loading|Pending|Confirmed|Cancelled|Completed" frontend/src/client/pages/MyBookingsPage.tsx frontend/src/client/pages/BookingDetailPage.tsx
```

Expected: no hardcoded customer copy matches except API enum values.

---

### Task 10: Final Visual Polish and Verification

**Files:**

- Modify only files already touched in Tasks 1-9 unless verification reveals a localized layout defect.
- Modify: `frontend/src/index.css` only if global text fit or token issues are visible.
- Update: `docs/stories/` or Harness records if required by project workflow.

- [ ] **Step 1: Run full customer hardcoded-copy scan**

Run:

```bash
rg -n "Khach|Diem|Uu|Dang|Nhap|Xuat|Dat phong|Lien he|Ho boi|Nha hang|Bai do|Gan bien|Thanh toan|Loading|Success|Failed|Pending|Confirmed|Cancelled|Completed" frontend/src/client frontend/src/shared frontend/src/App.tsx
```

Expected:

- Matches are allowed inside `frontend/src/shared/i18n/locales/*.ts`.
- Matches are allowed for TypeScript/API enum values if not displayed directly.
- Matches are not allowed as hardcoded JSX user-facing copy in customer components.

- [ ] **Step 2: Run production build**

Run:

```bash
cd frontend
npm run build
```

Expected: PASS.

- [ ] **Step 3: Start or reuse dev server for smoke checks**

Run:

```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

Expected: Vite prints a local URL, usually `http://localhost:5173/`. If port is busy, use the printed alternate port.

- [ ] **Step 4: Manual smoke checklist**

Open the dev URL and check:

```text
/
/search
/login
/register
/hotel/<slug-from-visible-card>
/bookings
```

For each route:

```text
- Vietnamese displays by default.
- VI/EN switcher changes static UI copy without reload.
- No button/card/filter/nav text clips on desktop width.
- No horizontal overflow on mobile width.
- API-backed hotel/location names are displayed as returned.
```

Booking/payment routes:

```text
- Check /booking/<roomTypeId> and /payment/<bookingCode> only when seeded/authenticated data permits.
- If not accessible, record that limitation in final validation notes.
```

- [ ] **Step 5: Record Harness trace**

Run:

```bash
scripts/harness trace --summary "Implemented customer UI i18n redesign with Vietnamese default and English switcher" --outcome "completed"
```

Expected: trace recorded. If implementation is blocked by auth/test data for some manual routes, include that in the outcome text.

---

## Self-Review

Spec coverage:

- Customer layout/nav/footer: Tasks 3 and 10.
- Homepage: Task 4.
- Search: Task 5.
- Hotel detail: Task 6.
- Auth: Task 7.
- Booking/payment: Task 8.
- My bookings/detail: Task 9.
- i18n foundation: Tasks 1 and 2.
- Backend data localization deferred: explicitly preserved in all page tasks.
- Validation: Task 10.

Placeholder scan:

- No `TBD`, `TODO`, `implement later`, or unresolved scope placeholders.
- Every code-changing task lists exact files and concrete code patterns.

Type consistency:

- Locale types are defined in Task 1 and reused by Tasks 2-10.
- Translation keys used in later tasks exist in the dictionaries defined in Task 1.
- Formatting helpers are created in Task 2 before page components import them.
