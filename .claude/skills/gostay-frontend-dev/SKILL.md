---
name: gostay-frontend-dev
description: Frontend development skill cho GoStay. Hướng dẫn implement React components, pages, API integration, i18n, quality checks, và premium UI design. Dùng khi cần tạo/sửa UI components, pages, forms, state, routing, styling, redesign. Triggers: "frontend", "UI", "component", "page", "React", "CSS", "Tailwind", "styling", "form", "modal", "table", "design", "redesign", "premium UI", "upgrade UI", "visual".
---

# Frontend Dev Skill

## Design Skills Integration

GoStay có 4 design skill chuyên dụng. Frontend dev phải biết khi nào dùng skill nào:

### Phân loại theo UI zone

| Zone | Skill áp dụng | KHÔNG áp dụng |
|------|--------------|---------------|
| **Client-facing** (home, search, hotel detail, booking, payment) | taste-skill, soft-skill, redesign-skill, stitch-skill | — |
| **Admin panel** (/admin/*) | redesign-skill (chỉ audit phần layout/UX) | taste-skill, soft-skill (dành cho premium UI, không phải dashboard) |
| **New screen** (tạo page mới) | stitch-skill → taste-skill → implement | — |
| **Existing page upgrade** | redesign-skill → soft-skill → fix | — |

### Khi nào dùng skill nào

**taste-skill (design-taste-frontend):** Dùng TRƯỚC KHI code client page mới. Thiết lập 3 dials (DESIGN_VARIANCE, MOTION_INTENSITY, VISUAL_DENSITY) và kiểm tra pre-flight checklist. Không dùng cho admin — admin cần functional, không cần premium aesthetic.

**soft-skill (high-end-visual-design):** Dùng khi implement client-facing UI components. Áp dụng Double-Bezel architecture, variance engine, spring physics motion, staggered animations. Tạo cảm giác "$150k agency build".

**redesign-skill (redesign-existing-projects):** Dùng khi nâng cấp page cũ. Chạy design audit checklist (typography, color, layout, interactivity, content, components, iconography, code quality). Fix theo priority: font swap → color cleanup → hover states → layout → components → states → typography polish.

**stitch-skill (stitch-design-taste):** Dùng khi cần tạo DESIGN.md cho Google Stitch. Chứa design tokens, color palette, typography rules, component stylings, layout principles, motion philosophy, và anti-patterns. Tạo trước khi generate screens qua Stitch.

### Workflow với design skills

**Tạo client page mới:**
1. Đọc taste-skill → xác định dial values cho page
2. (Optional) Dùng stitch-skill → tạo DESIGN.md nếu dùng Google Stitch
3. Code với soft-skill guidelines → Double-Bezel, spring physics, staggered reveals
4. Quality gates → react-doctor, tsc

**Nâng cấp client page cũ:**
1. Đọc redesign-skill → chạy design audit
2. Fix theo priority order (font → color → hover → layout → components → states → typography)
3. Áp dụng soft-skill cho component-level upgrades
4. Quality gates

**Code admin page:**
1. Follow admin pattern dưới đây — không cần design skills
2. Focus vào functionality, data density, table performance
3. Quality gates

## Workflow

### 1. Before Coding
- Kiểm tra `frontend/src/shared/api/` cho API types và methods đã có
- Kiểm tra `frontend/src/admin/components/` hoặc `frontend/src/client/components/` cho reusable components
- Kiểm tra `frontend/src/shared/i18n/` cho existing translation keys
- **Nếu là client page**: đọc taste-skill pre-flight checklist trước

### 2. Component Patterns

#### Admin Page Pattern
```
page/
├── SomeListPage.tsx    — Danh sách + filters + DataTable
└── components/        — Page-specific components (nếu cần)
```

Admin list page structure:
```tsx
export default function SomeListPage() {
  const [params, setParams] = useState({ search: '', status: '' });
  const data = useQuery({ queryKey: ['admin', 'somethings', params], queryFn: ... });
  const mutation = useMutation({ ..., onSuccess: () => queryClient.invalidateQueries(...) });
  const columns = useMemo<ColumnDef<Type>[]>(() => [...], []);
  return (
    <div>
      {pageTitle('Title', 'Description')}
      {/* Filters + actions */}
      <DataTable data={data.data?.data ?? []} columns={columns} />
    </div>
  );
}
```

#### Modal Pattern
Dùng `AdminModal` component:
```tsx
<AdminModal open={showModal} onClose={() => setShowModal(false)} title="Title">
  {/* Form content */}
</AdminModal>
```

#### Client Page Pattern
- Luôn dùng `useI18n()` cho text
- Loading/error states bắt buộc
- Responsive: mobile-first Tailwind classes

### 3. API Integration
- Tạo method trong `frontend/src/shared/api/` file tương ứng
- Dùng TanStack Query: `useQuery` cho GET, `useMutation` cho POST/PUT/DELETE
- Luôn thêm `onSuccess: () => queryClient.invalidateQueries(...)` cho mutations
- Error handling: `.catch()` hoặc `onError` callback

### 4. i18n
- Client UI: dùng `t('key.path')` — thêm key vào cả `en.ts` và `vi.ts`
- Admin UI: hardcode tiếng Anh
- Pluralization: `t('key', { count: n })`

### 5. After Coding — QUALITY GATES
1. `cd frontend && npx tsc -b --noEmit` — TypeScript phải pass
2. `cd frontend && npx react-doctor@latest --verbose` — score không được giảm
3. Nếu score giảm → fix issues trước khi complete task
4. Verify component renders không lỗi trong browser (nếu possible)

## Common Pitfalls
- Quên `type="button"` trên button elements
- Array index làm key — dùng unique id thay thế
- Context value không memoize — wrap bằng `useMemo`
- Intl.NumberFormat tạo trong function body — hoist lên module scope

## Premium Design Directives (Client-Facing Only)

Các rules dưới đây áp dụng CHO MỌI client-facing page/component. Admin pages KHÔNG áp dụng.

### Typography
- Font chính: `Geist`, `Outfit`, hoặc `Satoshi` — KHÔNG dùng Inter, Roboto, Arial
- Headlines: tight letter-spacing, weight-driven hierarchy (không chỉ to lên)
- Body: line-height 1.6+, max-width ~65ch
- Dùng Medium (500) và SemiBold (600) weights, không chỉ Regular và Bold

### Color
- KHÔNG dùng pure black `#000000` — dùng Zinc-950 `#18181B` hoặc off-black
- Tối đa 1 accent color, saturation < 80%
- KHÔNG dùng purple/blue neon "AI gradient" aesthetic
- Tint shadows theo background hue — không dùng generic black shadow
- Giữ nhất quán 1 gray family (warm hoặc cool, không trộn)

### Layout
- Centered hero BANNED — dùng split-screen, left-aligned, hoặc asymmetric whitespace
- 3 equal card columns BANNED — dùng 2-column zig-zag, asymmetric grid, hoặc horizontal scroll
- Max-width container: 1200-1440px
- Full-height: `min-h-[100dvh]` — KHÔNG dùng `h-screen`
- Section padding: `py-24` đến `py-40` — design phải thở

### Components
- Cards: dùng Double-Bezel (outer shell + inner core với nested border-radius)
- Buttons: fully rounded pills, tactile `-1px translate` on active, button-in-button trailing icon
- Inputs: label trên, error dưới, focus ring accent color
- Loading: skeleton shimmer matching layout — KHÔNG dùng circular spinners

### Motion
- Dùng custom cubic-bezier: `cubic-bezier(0.32, 0.72, 0, 1)` — KHÔNG dùng linear hay ease-in-out
- Staggered cascade reveals cho lists — KHÔNG mount tất cả cùng lúc
- Animate chỉ `transform` và `opacity` — KHÔNG animate top, left, width, height
- `backdrop-blur` chỉ cho fixed/sticky elements — KHÔNG blur scrolling content

### Anti-Patterns (BANNED)
- Emojis trong UI
- "Scroll to explore", "Swipe down", bouncing chevrons
- Generic placeholder names: "John Doe", "Acme Corp"
- AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen"
- Fake round numbers: 99.99%, 50%
- Broken Unsplash links — dùng `picsum.photos` hoặc SVG
