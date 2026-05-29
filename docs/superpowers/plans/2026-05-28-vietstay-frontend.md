# GoStay Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the React 19 SPA frontend for GoStay hotel booking platform — all pages, components, API integration, payment flow.

**Architecture:** React 19 SPA inside `frontend/` directory. Vite 6 build. Tailwind CSS 4 + shadcn/ui. TanStack Query v5 for server state. React Router 7 for routing. Axios for HTTP. Build output goes to Laravel `public/` directory.

**Tech Stack:** React 19.2, Vite 6, Tailwind CSS 4, shadcn/ui, TanStack Query v5, React Router 7, Axios

**Design Spec:** `docs/superpowers/specs/2026-05-28-gostay-booking-design.md`

**Backend API runs at:** `http://localhost:8000/api/`

---

### Task 1: Scaffold React + Vite Project

**Files:**
- Create: `frontend/` directory with React + Vite project
- Create: `frontend/vite.config.ts`
- Create: `frontend/tailwind.config.ts`

- [ ] **Step 1: Create React + Vite project**

```bash
cd /Users/dvphuc/dev/project/agoda-clone
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

- [ ] **Step 2: Install dependencies**

```bash
cd /Users/dvphuc/dev/project/agoda-clone/frontend
npm install react-router-dom@7 @tanstack/react-query axios
npm install -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 3: Configure Vite — proxy API to Laravel**

```typescript
// frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

- [ ] **Step 4: Setup Tailwind CSS**

Replace `frontend/src/index.css`:

```css
@import "tailwindcss";

/* GoStay Color Tokens */
@theme {
  --color-navy: #1e40af;
  --color-primary: #0066cc;
  --color-gold: #f59e0b;
  --color-gold-light: #fbbf24;
  --color-bg: #fbfbfd;
  --color-text: #1d1d1f;
  --color-text-secondary: #86868b;
  --color-surface: #ffffff;
  --color-tab: #f5f5f7;
  --color-border: #d2d2d7;
  --color-success: #059669;
  --color-footer: #1d1d1f;
}
```

- [ ] **Step 5: Setup shadcn/ui**

```bash
cd /Users/dvphuc/dev/project/agoda-clone/frontend
npx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Slate
- CSS file: src/index.css
- Components alias: @/components

Then add commonly needed components:

```bash
npx shadcn@latest add button input label dialog select calendar popover card badge
```

- [ ] **Step 6: Verify dev server runs**

```bash
cd /Users/dvphuc/dev/project/agoda-clone/frontend
npm run dev
```

Expected: Vite dev server at http://localhost:5173

- [ ] **Step 7: Commit**

```bash
cd /Users/dvphuc/dev/project/agoda-clone
git add frontend/
git commit -m "chore: scaffold React 19 + Vite + Tailwind + shadcn/ui frontend"
```

---

### Task 2: API Client + Auth Context

**Files:**
- Create: `frontend/src/api/client.ts`
- Create: `frontend/src/api/auth.ts`
- Create: `frontend/src/api/hotels.ts`
- Create: `frontend/src/api/bookings.ts`
- Create: `frontend/src/api/payments.ts`
- Create: `frontend/src/contexts/AuthContext.tsx`
- Create: `frontend/src/hooks/useAuth.ts`

- [ ] **Step 1: Create Axios API client**

```typescript
// frontend/src/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

- [ ] **Step 2: Create auth API**

```typescript
// frontend/src/api/auth.ts
import apiClient from './client';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  register: (data: { name: string; email: string; password: string; password_confirmation: string; phone?: string }) =>
    apiClient.post<AuthResponse>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthResponse>('/auth/login', data),

  logout: () => apiClient.post('/auth/logout'),

  me: () => apiClient.get<User>('/auth/me'),
};
```

- [ ] **Step 3: Create hotels API**

```typescript
// frontend/src/api/hotels.ts
import apiClient from './client';

export interface Destination {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  region: string;
  hotels_count?: number;
}

export interface HotelImage {
  id: number;
  image_path: string;
  caption: string | null;
  sort_order: number;
}

export interface RoomType {
  id: number;
  name: string;
  description: string | null;
  max_guests: number;
  bed_type: string;
  size_sqm: number | null;
  price_per_night: string;
  amenities: string[] | null;
  total_rooms: number;
  images: HotelImage[];
  available_rooms?: number;
}

export interface Hotel {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  star_rating: number;
  latitude: string | null;
  longitude: string | null;
  phone: string | null;
  email: string | null;
  checkin_time: string;
  checkout_time: string;
  amenities: string[] | null;
  status: string;
  destination: Destination;
  images: HotelImage[];
  room_types: RoomType[];
  min_price?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface HotelSearchParams {
  destination?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  star?: number;
  price_min?: number;
  price_max?: number;
  sort?: string;
  page?: number;
}

export const hotelsApi = {
  getDestinations: () => apiClient.get<Destination[]>('/destinations'),

  getDestinationHotels: (slug: string) => apiClient.get<PaginatedResponse<Hotel>>(`/destinations/${slug}/hotels`),

  searchHotels: (params: HotelSearchParams) => apiClient.get<PaginatedResponse<Hotel>>('/hotels', { params }),

  getFeatured: () => apiClient.get<Hotel[]>('/hotels/featured'),

  getHotel: (slug: string) => apiClient.get<Hotel>(`/hotels/${slug}`),

  getRooms: (slug: string, checkIn: string, checkOut: string) =>
    apiClient.get<RoomType[]>(`/hotels/${slug}/rooms`, { params: { check_in: checkIn, check_out: checkOut } }),
};
```

- [ ] **Step 4: Create bookings API**

```typescript
// frontend/src/api/bookings.ts
import apiClient from './client';
import type { Hotel, RoomType } from './hotels';

export interface Payment {
  id: number;
  booking_id: number;
  payment_method: 'vnpay' | 'momo';
  transaction_id: string | null;
  amount: string;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  paid_at: string | null;
  created_at: string;
}

export interface Booking {
  id: number;
  booking_code: string;
  check_in: string;
  check_out: string;
  guests: number;
  special_requests: string | null;
  total_price: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  nights: number;
  room_type: RoomType & { hotel: Hotel };
  payments: Payment[];
  created_at: string;
}

export interface CreateBookingData {
  room_type_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  special_requests?: string;
}

export const bookingsApi = {
  list: () => apiClient.get<{ data: Booking[] }>('/bookings'),

  get: (bookingCode: string) => apiClient.get<Booking>(`/bookings/${bookingCode}`),

  create: (data: CreateBookingData) => apiClient.post<Booking>('/bookings', data),

  cancel: (bookingCode: string) => apiClient.delete(`/bookings/${bookingCode}`),
};
```

- [ ] **Step 5: Create payments API**

```typescript
// frontend/src/api/payments.ts
import apiClient from './client';
import type { Payment } from './bookings';

export const paymentsApi = {
  create: (bookingId: number, paymentMethod: 'vnpay' | 'momo') =>
    apiClient.post<{ payment_id: number; payment_url: string }>('/payments/create', {
      booking_id: bookingId,
      payment_method: paymentMethod,
    }),

  get: (id: number) => apiClient.get<Payment>(`/payments/${id}`),
};
```

- [ ] **Step 6: Create AuthContext**

```tsx
// frontend/src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi, type User } from '../api/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; password_confirmation: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      authApi.me()
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('auth_token', res.data.token);
    localStorage.setItem('auth_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const register = async (data: { name: string; email: string; password: string; password_confirmation: string; phone?: string }) => {
    const res = await authApi.register(data);
    localStorage.setItem('auth_token', res.data.token);
    localStorage.setItem('auth_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

- [ ] **Step 7: Commit**

```bash
cd /Users/dvphuc/dev/project/agoda-clone
git add frontend/
git commit -m "feat: add API client, auth context, and typed API modules"
```

---

### Task 3: App Layout + Router Setup

**Files:**
- Create: `frontend/src/components/layout/Navbar.tsx`
- Create: `frontend/src/components/layout/Footer.tsx`
- Create: `frontend/src/components/layout/Layout.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/main.tsx`

- [ ] **Step 1: Create Navbar**

```tsx
// frontend/src/components/layout/Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-navy text-white px-8 py-3.5 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold tracking-tight">
        Viet<span className="text-gold-light">Stay</span>
      </Link>
      <div className="flex items-center gap-6 text-sm">
        <Link to="/search" className="hover:text-gold-light transition-colors">Khách sạn</Link>
        {isAuthenticated ? (
          <>
            <Link to="/bookings" className="hover:text-gold-light transition-colors">Đặt phòng của tôi</Link>
            <span className="text-sm">{user?.name}</span>
            <button onClick={handleLogout} className="bg-tab text-text-primary px-4 py-1.5 rounded-lg font-medium text-xs">
              Đăng xuất
            </button>
          </>
        ) : (
          <Link to="/login" className="bg-gold text-white px-4 py-1.5 rounded-lg font-semibold text-xs">
            Đăng nhập
          </Link>
        )}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Create Footer**

```tsx
// frontend/src/components/layout/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-footer text-text-secondary py-8 text-center text-sm">
      <div className="text-lg font-bold text-white mb-2">
        Viet<span className="text-gold-light">Stay</span>
      </div>
      <p className="mb-3">Đặt phòng khách sạn & villa nghỉ dưỡng cao cấp tại Việt Nam</p>
      <p className="text-xs text-[#424245]">© 2026 GoStay. All rights reserved.</p>
    </footer>
  );
}
```

- [ ] **Step 3: Create Layout wrapper**

```tsx
// frontend/src/components/layout/Layout.tsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 4: Setup router in App.tsx**

```tsx
// frontend/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import HotelDetailPage from './pages/HotelDetailPage';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyBookingsPage from './pages/MyBookingsPage';
import BookingDetailPage from './pages/BookingDetailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/hotel/:slug" element={<HotelDetailPage />} />
              <Route path="/booking/:roomTypeId" element={<BookingPage />} />
              <Route path="/payment/:bookingCode" element={<PaymentPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/bookings" element={<MyBookingsPage />} />
              <Route path="/bookings/:bookingCode" element={<BookingDetailPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 5: Update main.tsx**

```tsx
// frontend/src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 6: Create placeholder pages** (so router doesn't break)

Create minimal placeholder for each page in `frontend/src/pages/`:

```tsx
// Each placeholder: frontend/src/pages/<Name>Page.tsx
export default function <Name>Page() {
  return <div className="p-8 text-center text-text-secondary"><Name>Page — Coming Soon</div>;
}
```

Create all 9: HomePage, SearchPage, HotelDetailPage, BookingPage, PaymentPage, LoginPage, RegisterPage, MyBookingsPage, BookingDetailPage.

- [ ] **Step 7: Verify app runs**

```bash
cd /Users/dvphuc/dev/project/agoda-clone/frontend
npm run dev
```

Expected: App at http://localhost:5173 with Navbar showing "GoStay" and Footer.

- [ ] **Step 8: Commit**

```bash
cd /Users/dvphuc/dev/project/agoda-clone
git add frontend/
git commit -m "feat: add layout, router, and page placeholders"
```

---

### Task 4: Home Page

**Files:**
- Modify: `frontend/src/pages/HomePage.tsx`
- Create: `frontend/src/components/home/HeroSearch.tsx`
- Create: `frontend/src/components/home/DestinationGrid.tsx`
- Create: `frontend/src/components/home/FeaturedHotels.tsx`
- Create: `frontend/src/components/home/HotelCard.tsx`

- [ ] **Step 1: Create HeroSearch component**

```tsx
// frontend/src/components/home/HeroSearch.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { hotelsApi, type Destination } from '../../api/hotels';

export default function HeroSearch() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  const { data: destinations } = useQuery({
    queryKey: ['destinations'],
    queryFn: () => hotelsApi.getDestinations().then(r => r.data),
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination) params.set('destination', destination);
    if (checkIn) params.set('check_in', checkIn);
    if (checkOut) params.set('check_out', checkOut);
    if (guests) params.set('guests', String(guests));
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="bg-gradient-to-br from-navy via-primary to-blue-400 px-8 py-16 text-center">
      <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Khám phá Việt Nam tuyệt đẹp</h1>
      <p className="text-blue-200 text-base font-light mb-8">Đặt phòng khách sạn, villa nghỉ dưỡng cao cấp tại Việt Nam</p>

      <div className="bg-white rounded-xl p-2 max-w-4xl mx-auto flex gap-1 items-center shadow-lg shadow-black/10">
        <div className="flex-[2.5] px-4 py-3 text-left">
          <label className="text-[10px] text-text-secondary uppercase font-semibold tracking-wide">Điểm đến</label>
          <select
            value={destination}
            onChange={e => setDestination(e.target.value)}
            className="block w-full text-text font-medium text-sm mt-0.5 bg-transparent outline-none"
          >
            <option value="">Tất cả điểm đến</option>
            {destinations?.map((d: Destination) => (
              <option key={d.id} value={d.slug}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-[1.5] px-4 py-3 text-left border-l border-border">
          <label className="text-[10px] text-text-secondary uppercase font-semibold tracking-wide">Nhận phòng</label>
          <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
            className="block w-full text-text font-medium text-sm mt-0.5 outline-none" />
        </div>
        <div className="flex-[1.5] px-4 py-3 text-left border-l border-border">
          <label className="text-[10px] text-text-secondary uppercase font-semibold tracking-wide">Trả phòng</label>
          <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
            className="block w-full text-text font-medium text-sm mt-0.5 outline-none" />
        </div>
        <div className="flex-1 px-4 py-3 text-left border-l border-border">
          <label className="text-[10px] text-text-secondary uppercase font-semibold tracking-wide">Khách</label>
          <select value={guests} onChange={e => setGuests(Number(e.target.value))}
            className="block w-full text-text font-medium text-sm mt-0.5 bg-transparent outline-none">
            <option value={1}>1 người</option>
            <option value={2}>2 người</option>
            <option value={3}>3 người</option>
            <option value={4}>4 người</option>
          </select>
        </div>
        <button onClick={handleSearch}
          className="bg-primary text-white px-6 py-3.5 rounded-lg font-semibold whitespace-nowrap hover:bg-blue-700 transition-colors">
          Tìm kiếm
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create DestinationGrid**

```tsx
// frontend/src/components/home/DestinationGrid.tsx
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { hotelsApi } from '../../api/hotels';

const gradients = [
  'from-navy to-blue-400',
  'from-cyan-600 to-cyan-400',
  'from-violet-600 to-violet-400',
  'from-emerald-600 to-emerald-400',
  'from-amber-600 to-amber-400',
  'from-rose-600 to-rose-400',
  'from-teal-600 to-teal-400',
  'from-sky-600 to-sky-400',
];

export default function DestinationGrid() {
  const { data: destinations } = useQuery({
    queryKey: ['destinations'],
    queryFn: () => hotelsApi.getDestinations().then(r => r.data),
  });

  return (
    <section className="px-8 py-8">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-2xl font-bold text-text tracking-tight">Điểm đến nổi bật</h2>
          <p className="text-sm text-text-secondary mt-0.5">Những nơi được yêu thích nhất</p>
        </div>
        <Link to="/search" className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">
          Tất cả địa điểm →
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {destinations?.slice(0, 8).map((dest, idx) => (
          <Link key={dest.id} to={`/search?destination=${dest.slug}`}
            className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
            <div className={`bg-gradient-to-br ${gradients[idx % gradients.length]} h-36 flex items-end p-4`}>
              <div>
                <div className="text-white font-bold text-lg">{dest.name}</div>
                <div className="text-white/80 text-xs">{dest.hotels_count ?? 0} nơi lưu trú</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create HotelCard**

```tsx
// frontend/src/components/home/HotelCard.tsx
import { Link } from 'react-router-dom';
import type { Hotel } from '../../api/hotels';

const gradients = [
  'from-blue-100 to-blue-300',
  'from-sky-100 to-sky-300',
  'from-amber-100 to-amber-300',
  'from-emerald-100 to-emerald-300',
  'from-violet-100 to-violet-300',
];

export default function HotelCard({ hotel, index }: { hotel: Hotel; index: number }) {
  const formatPrice = (price: string | number) =>
    Number(price).toLocaleString('vi-VN') + 'đ';

  return (
    <Link to={`/hotel/${hotel.slug}`}
      className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-surface group">
      <div className={`bg-gradient-to-br ${gradients[index % gradients.length]} h-40 flex items-center justify-center`}>
        <span className="text-5xl">🏨</span>
      </div>
      <div className="p-4">
        <div className="font-bold text-text">{hotel.name}</div>
        <div className="text-xs text-text-secondary mt-1">
          📍 {hotel.destination?.name} · {'⭐'.repeat(hotel.star_rating)}
        </div>
        <div className="mt-3 flex justify-between items-center">
          <div>
            <span className="text-lg font-bold text-primary">{formatPrice(hotel.min_price ?? hotel.room_types?.[0]?.price_per_night ?? 0)}</span>
            <span className="text-xs text-text-secondary"> /đêm</span>
          </div>
          <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-[11px] font-semibold">
            Đặt ngay
          </span>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Create FeaturedHotels**

```tsx
// frontend/src/components/home/FeaturedHotels.tsx
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { hotelsApi } from '../../api/hotels';
import HotelCard from './HotelCard';

export default function FeaturedHotels() {
  const { data: hotels } = useQuery({
    queryKey: ['featured-hotels'],
    queryFn: () => hotelsApi.getFeatured().then(r => r.data),
  });

  return (
    <section className="px-8 pb-8">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-2xl font-bold text-text tracking-tight">Khách sạn nổi bật</h2>
          <p className="text-sm text-text-secondary mt-0.5">Được đặt nhiều nhất tuần qua</p>
        </div>
        <Link to="/search" className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">
          Khám phá ngay →
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {hotels?.slice(0, 6).map((hotel, idx) => (
          <HotelCard key={hotel.id} hotel={hotel} index={idx} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Assemble HomePage**

```tsx
// frontend/src/pages/HomePage.tsx
import HeroSearch from '../components/home/HeroSearch';
import DestinationGrid from '../components/home/DestinationGrid';
import FeaturedHotels from '../components/home/FeaturedHotels';

export default function HomePage() {
  return (
    <>
      <HeroSearch />
      <DestinationGrid />
      <FeaturedHotels />
    </>
  );
}
```

- [ ] **Step 6: Verify Home page renders**

```bash
cd /Users/dvphuc/dev/project/agoda-clone/frontend
npm run dev
```

Expected: Home page with hero search, destinations grid, featured hotels. All using GoStay color palette.

- [ ] **Step 7: Commit**

```bash
cd /Users/dvphuc/dev/project/agoda-clone
git add frontend/
git commit -m "feat: implement home page with hero, destinations, featured hotels"
```

---

### Task 5: Search Page

**Files:**
- Modify: `frontend/src/pages/SearchPage.tsx`
- Create: `frontend/src/components/search/SearchFilters.tsx`
- Create: `frontend/src/components/search/SearchResults.tsx`
- Create: `frontend/src/components/search/HotelSearchCard.tsx`
- Create: `frontend/src/components/search/SortBar.tsx`

- [ ] **Step 1: Create SearchFilters component**

Sidebar with price range, star rating pills, property type checkboxes, amenities tag chips, and "Áp dụng" button. Uses URL search params to sync state.

```tsx
// frontend/src/components/search/SearchFilters.tsx
// Implement: price range (two inputs), star rating (pill buttons), property type (checkboxes),
// amenities (tag chips), "Áp dụng bộ lọc" button.
// On apply, update URL search params which triggers TanStack Query refetch.
```

- [ ] **Step 2: Create SortBar**

Pill buttons: Phổ biến (default) / Giá thấp nhất / Giá cao nhất / Đánh giá. Updates URL param `sort`.

- [ ] **Step 3: Create HotelSearchCard**

Horizontal card matching the mockup: image left, info center (name, location, star, amenities pills, "Còn X phòng" badge), price/CTA right (rating badge, price, "Xem phòng" gold button).

- [ ] **Step 4: Create SearchResults**

Uses `useQuery` with `hotelsApi.searchHotels(params)` where params come from URL search params. Maps results to HotelSearchCard. Shows pagination at bottom.

- [ ] **Step 5: Assemble SearchPage**

Top bar with search summary chips + "Sửa tìm kiếm". Two-column layout: SearchFilters (260px sidebar) + SearchResults (flex-1).

- [ ] **Step 6: Test search with different filters**

- [ ] **Step 7: Commit**

```bash
git add frontend/
git commit -m "feat: implement search page with filters, sort, pagination"
```

---

### Task 6: Hotel Detail Page

**Files:**
- Modify: `frontend/src/pages/HotelDetailPage.tsx`
- Create: `frontend/src/components/hotel/ImageGallery.tsx`
- Create: `frontend/src/components/hotel/HotelInfo.tsx`
- Create: `frontend/src/components/hotel/RoomTypeCard.tsx`

- [ ] **Step 1: Create ImageGallery**

Grid gallery showing hotel images. Main image large + thumbnails.

- [ ] **Step 2: Create HotelInfo**

Hotel name, star rating, address, description, amenities chips, check-in/out times.

- [ ] **Step 3: Create RoomTypeCard**

Card for each room type: image, name, bed type, max guests, size, amenities, price per night, "Đặt phòng" button (links to `/booking/:roomTypeId`).

- [ ] **Step 4: Assemble HotelDetailPage**

Uses `useQuery` with `hotelsApi.getHotel(slug)` from URL params. Shows ImageGallery, HotelInfo, list of RoomTypeCards. If check-in/check-out in URL params, also shows availability.

- [ ] **Step 5: Test hotel detail page**

- [ ] **Step 6: Commit**

```bash
git add frontend/
git commit -m "feat: implement hotel detail page with gallery, info, room types"
```

---

### Task 7: Login & Register Pages

**Files:**
- Modify: `frontend/src/pages/LoginPage.tsx`
- Modify: `frontend/src/pages/RegisterPage.tsx`

- [ ] **Step 1: Create LoginPage**

Centered card with email/password inputs. Uses `useAuth().login()`. On success, redirect to previous page or home. Link to register page.

- [ ] **Step 2: Create RegisterPage**

Centered card with name, email, phone, password, password confirmation inputs. Uses `useAuth().register()`. On success, redirect to home. Link to login page.

- [ ] **Step 3: Test login/register flow**

- [ ] **Step 4: Commit**

```bash
git add frontend/
git commit -m "feat: implement login and register pages"
```

---

### Task 8: Booking Page

**Files:**
- Modify: `frontend/src/pages/BookingPage.tsx`
- Create: `frontend/src/components/booking/BookingForm.tsx`
- Create: `frontend/src/components/booking/PriceSummary.tsx`

- [ ] **Step 1: Create BookingForm**

Form with: check-in date, check-out date, number of guests, special requests textarea. Pre-fill from URL params if available. Requires auth — redirect to login if not authenticated.

- [ ] **Step 2: Create PriceSummary**

Sidebar card showing: room type name, hotel name, price per night, number of nights, total price. "Xác nhận đặt phòng" button.

- [ ] **Step 3: Assemble BookingPage**

Uses `useQuery` to fetch room type details. Two-column layout: BookingForm left, PriceSummary right. On submit, calls `bookingsApi.create()`. On success, redirect to `/payment/:bookingCode`.

- [ ] **Step 4: Test booking flow**

- [ ] **Step 5: Commit**

```bash
git add frontend/
git commit -m "feat: implement booking page with form and price summary"
```

---

### Task 9: Payment Page

**Files:**
- Modify: `frontend/src/pages/PaymentPage.tsx`

- [ ] **Step 1: Create PaymentPage**

Shows booking summary and two payment method cards (VNPay, MoMo). On select, calls `paymentsApi.create()` then `window.location.href = payment_url` to redirect to gateway.

- [ ] **Step 2: Handle payment callback**

After payment gateway redirects back, the page reads URL params and shows success/failure status.

- [ ] **Step 3: Test payment flow (with sandbox)**

- [ ] **Step 4: Commit**

```bash
git add frontend/
git commit -m "feat: implement payment page with VNPay and MoMo"
```

---

### Task 10: My Bookings & Booking Detail Pages

**Files:**
- Modify: `frontend/src/pages/MyBookingsPage.tsx`
- Modify: `frontend/src/pages/BookingDetailPage.tsx`

- [ ] **Step 1: Create MyBookingsPage**

List of user's bookings. Uses `useQuery` with `bookingsApi.list()`. Each item shows booking code, hotel name, dates, status badge, total price, "Xem chi tiết" link.

- [ ] **Step 2: Create BookingDetailPage**

Full booking details: hotel info, room type, dates, guests, total price, payment status, cancel button (if pending). Uses `useQuery` with `bookingsApi.get(bookingCode)`.

- [ ] **Step 3: Test booking list and detail**

- [ ] **Step 4: Commit**

```bash
git add frontend/
git commit -m "feat: implement my bookings list and booking detail pages"
```

---

### Task 11: Responsive Design Pass

**Files:**
- Modify: all page components

- [ ] **Step 1: Add responsive breakpoints**

Ensure all pages work on mobile (375px), tablet (768px), desktop (1024px+):
- Navbar: hamburger menu on mobile
- Home: 2-col destination grid on tablet, 1-col on mobile
- Search: sidebar becomes collapsible filter on mobile
- Hotel cards: stack vertically on mobile

- [ ] **Step 2: Test on mobile viewport**

- [ ] **Step 3: Commit**

```bash
git add frontend/
git commit -m "feat: add responsive design for mobile and tablet"
```

---

### Task 12: Final Integration & Build

**Files:**
- Modify: `frontend/vite.config.ts` (build output to Laravel public)
- Modify: `frontend/package.json` (build script)

- [ ] **Step 1: Configure Vite build output to Laravel public/**

```typescript
// frontend/vite.config.ts — add build config:
build: {
  outDir: '../public',
  emptyOutDir: false,
}
```

- [ ] **Step 2: Build and verify**

```bash
cd /Users/dvphuc/dev/project/agoda-clone/frontend
npm run build
```

Expected: Built files in `public/` directory.

- [ ] **Step 3: Add Laravel fallback route for SPA**

```php
// routes/web.php — add:
Route::view('/{any}', 'welcome')->where('any', '.*');
```

Or configure Laravel to serve `index.html` from `public/` for all non-API routes.

- [ ] **Step 4: Test full stack together**

```bash
php artisan serve
```

Expected: Laravel serves React SPA at http://localhost:8000, API calls proxied correctly.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: integrate frontend build with Laravel, final polish"
```
