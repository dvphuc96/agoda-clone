# VietStay Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Laravel 13 API backend for VietStay hotel booking platform — auth, hotels, bookings, payments, seed data.

**Architecture:** Monolith Laravel 13 project. API-only (JSON responses). Sanctum for SPA auth. MySQL 8 database. Payment integration via VNPay + MoMo SDK.

**Tech Stack:** Laravel 13, PHP 8.3+, MySQL 8, Laravel Sanctum, vnpay/php-vnpay (or manual integration), momo/momo-payment (or manual integration)

**Design Spec:** `docs/superpowers/specs/2026-05-28-vietstay-booking-design.md`

---

### Task 1: Scaffold Laravel Project

**Files:**
- Create: entire Laravel project via composer

- [ ] **Step 1: Create Laravel project**

```bash
cd /Users/dvphuc/dev/project/agoda-clone
composer create-project laravel/laravel . --prefer-dist
```

If composer asks to overwrite existing files (AGENTS.md, README.md, docs/, scripts/), choose NOT to overwrite. Move harness files to temp, create Laravel, then move harness files back.

```bash
# If needed:
cp -r AGENTS.md docs scripts README.md .gitignore /tmp/harness-backup/
composer create-project laravel/laravel . --prefer-dist
# Restore harness files
cp /tmp/harness-backup/* . -rf
```

- [ ] **Step 2: Configure .env database**

Edit `.env`:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vietstay
DB_USERNAME=root
DB_PASSWORD=
```

- [ ] **Step 3: Install Sanctum**

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

- [ ] **Step 4: Configure Sanctum for SPA auth**

Edit `bootstrap/app.php` or `config/sanctum.php` — ensure:
- `stateful` domains include `localhost:5173` (Vite dev server)
- CORS configured for `localhost:5173`

Edit `config/cors.php`:
```php
'allowed_origins' => ['http://localhost:5173'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

- [ ] **Step 5: Verify Laravel runs**

```bash
php artisan serve
```

Expected: Laravel welcome page at http://localhost:8000

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Laravel 13 project with Sanctum"
```

---

### Task 2: Database Migrations — All 7 Tables

**Files:**
- Create: `database/migrations/2026_05_28_000001_create_destinations_table.php`
- Create: `database/migrations/2026_05_28_000002_create_hotels_table.php`
- Create: `database/migrations/2026_05_28_000003_create_room_types_table.php`
- Create: `database/migrations/2026_05_28_000004_create_hotel_images_table.php`
- Create: `database/migrations/2026_05_28_000005_update_users_table.php`
- Create: `database/migrations/2026_05_28_000006_create_bookings_table.php`
- Create: `database/migrations/2026_05_28_000007_create_payments_table.php`

- [ ] **Step 1: Create destinations migration**

```bash
php artisan make:migration create_destinations_table
```

```php
// database/migrations/..._create_destinations_table.php
Schema::create('destinations', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('slug')->unique();
    $table->string('image')->nullable();
    $table->text('description')->nullable();
    $table->enum('region', ['mien_bac', 'mien_trung', 'mien_nam']);
    $table->timestamps();
});
```

- [ ] **Step 2: Create hotels migration**

```php
Schema::create('hotels', function (Blueprint $table) {
    $table->id();
    $table->foreignId('destination_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->string('slug')->unique();
    $table->text('description')->nullable();
    $table->string('address');
    $table->tinyInteger('star_rating')->unsigned();
    $table->decimal('latitude', 10, 8)->nullable();
    $table->decimal('longitude', 11, 8)->nullable();
    $table->string('phone')->nullable();
    $table->string('email')->nullable();
    $table->time('checkin_time')->default('14:00');
    $table->time('checkout_time')->default('12:00');
    $table->json('amenities')->nullable();
    $table->enum('status', ['active', 'inactive'])->default('active');
    $table->timestamps();
    $table->softDeletes();
});
```

- [ ] **Step 3: Create room_types migration**

```php
Schema::create('room_types', function (Blueprint $table) {
    $table->id();
    $table->foreignId('hotel_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->text('description')->nullable();
    $table->integer('max_guests')->default(2);
    $table->enum('bed_type', ['single', 'double', 'twin', 'king']);
    $table->decimal('size_sqm', 6, 2)->nullable();
    $table->decimal('price_per_night', 12, 2);
    $table->json('amenities')->nullable();
    $table->integer('total_rooms')->default(1);
    $table->timestamps();
});
```

- [ ] **Step 4: Create hotel_images migration**

```php
Schema::create('hotel_images', function (Blueprint $table) {
    $table->id();
    $table->foreignId('hotel_id')->constrained()->cascadeOnDelete();
    $table->foreignId('room_type_id')->nullable()->constrained()->nullOnDelete();
    $table->string('image_path');
    $table->string('caption')->nullable();
    $table->integer('sort_order')->default(0);
    $table->timestamps();
});
```

- [ ] **Step 5: Update users table migration**

```bash
php artisan make:migration update_users_table_add_role_phone
```

```php
Schema::table('users', function (Blueprint $table) {
    $table->string('phone')->nullable()->after('email');
    $table->string('avatar')->nullable()->after('phone');
    $table->enum('role', ['user', 'admin'])->default('user')->after('avatar');
    $table->softDeletes();
});
```

- [ ] **Step 6: Create bookings migration**

```php
Schema::create('bookings', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('room_type_id')->constrained()->cascadeOnDelete();
    $table->string('booking_code', 10)->unique();
    $table->date('check_in');
    $table->date('check_out');
    $table->integer('guests')->default(1);
    $table->text('special_requests')->nullable();
    $table->decimal('total_price', 12, 2);
    $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed'])->default('pending');
    $table->timestamps();
    $table->softDeletes();
});
```

- [ ] **Step 7: Create payments migration**

```php
Schema::create('payments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
    $table->enum('payment_method', ['vnpay', 'momo']);
    $table->string('transaction_id')->nullable();
    $table->decimal('amount', 12, 2);
    $table->string('currency', 3)->default('VND');
    $table->enum('status', ['pending', 'success', 'failed', 'refunded'])->default('pending');
    $table->timestamp('paid_at')->nullable();
    $table->json('gateway_response')->nullable();
    $table->timestamps();
});
```

- [ ] **Step 8: Run migrations**

```bash
php artisan migrate
```

Expected: All 7 tables created successfully.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add all database migrations for VietStay"
```

---

### Task 3: Eloquent Models

**Files:**
- Create: `app/Models/Destination.php`
- Create: `app/Models/Hotel.php`
- Create: `app/Models/RoomType.php`
- Create: `app/Models/HotelImage.php`
- Create: `app/Models/Booking.php`
- Create: `app/Models/Payment.php`
- Modify: `app/Models/User.php`

- [ ] **Step 1: Update User model**

```php
// app/Models/User.php — add to existing class:
protected $fillable = [
    'name', 'email', 'password', 'phone', 'avatar', 'role',
];

protected $hidden = ['password', 'remember_token'];

protected function casts(): array
{
    return [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];
}

public function bookings(): HasMany
{
    return $this->hasMany(Booking::class);
}
```

- [ ] **Step 2: Create Destination model**

```php
// app/Models/Destination.php
class Destination extends Model
{
    protected $fillable = ['name', 'slug', 'image', 'description', 'region'];

    public function hotels(): HasMany
    {
        return $this->hasMany(Hotel::class);
    }
}
```

- [ ] **Step 3: Create Hotel model**

```php
// app/Models/Hotel.php
class Hotel extends Model
{
    protected $fillable = [
        'destination_id', 'name', 'slug', 'description', 'address',
        'star_rating', 'latitude', 'longitude', 'phone', 'email',
        'checkin_time', 'checkout_time', 'amenities', 'status',
    ];

    protected function casts(): array
    {
        return [
            'amenities' => 'array',
            'checkin_time' => 'datetime:H:i',
            'checkout_time' => 'datetime:H:i',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Hotel $hotel) {
            $hotel->slug = $hotel->slug ?? Str::slug($hotel->name);
        });
    }

    public function destination(): BelongsTo
    {
        return $this->belongsTo(Destination::class);
    }

    public function roomTypes(): HasMany
    {
        return $this->hasMany(RoomType::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(HotelImage::class);
    }
}
```

- [ ] **Step 4: Create RoomType model**

```php
// app/Models/RoomType.php
class RoomType extends Model
{
    protected $fillable = [
        'hotel_id', 'name', 'description', 'max_guests',
        'bed_type', 'size_sqm', 'price_per_night', 'amenities', 'total_rooms',
    ];

    protected function casts(): array
    {
        return [
            'amenities' => 'array',
            'price_per_night' => 'decimal:2',
        ];
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(HotelImage::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function getAvailableRoomsCount(string $checkIn, string $checkOut): int
    {
        $bookedCount = Booking::where('room_type_id', $this->id)
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($checkIn, $checkOut) {
                $query->where('check_in', '<', $checkOut)
                      ->where('check_out', '>', $checkIn);
            })
            ->sum('guests');

        return max(0, $this->total_rooms - $bookedCount);
    }
}
```

- [ ] **Step 5: Create HotelImage model**

```php
// app/Models/HotelImage.php
class HotelImage extends Model
{
    protected $fillable = ['hotel_id', 'room_type_id', 'image_path', 'caption', 'sort_order'];

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }
}
```

- [ ] **Step 6: Create Booking model**

```php
// app/Models/Booking.php
class Booking extends Model
{
    protected $fillable = [
        'user_id', 'room_type_id', 'booking_code', 'check_in', 'check_out',
        'guests', 'special_requests', 'total_price', 'status',
    ];

    protected function casts(): array
    {
        return [
            'check_in' => 'date',
            'check_out' => 'date',
            'total_price' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Booking $booking) {
            $booking->booking_code = 'BK' . strtoupper(Str::random(6));
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
```

- [ ] **Step 7: Create Payment model**

```php
// app/Models/Payment.php
class Payment extends Model
{
    protected $fillable = [
        'booking_id', 'payment_method', 'transaction_id', 'amount',
        'currency', 'status', 'paid_at', 'gateway_response',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'datetime',
            'gateway_response' => 'array',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add all Eloquent models with relationships"
```

---

### Task 4: Auth Controllers (Register, Login, Logout, Me)

**Files:**
- Create: `app/Http/Controllers/Api/AuthController.php`
- Create: `app/Http/Requests/RegisterRequest.php`
- Create: `app/Http/Requests/LoginRequest.php`
- Modify: `routes/api.php`

- [ ] **Step 1: Create RegisterRequest**

```php
// app/Http/Requests/RegisterRequest.php
class RegisterRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }
}
```

- [ ] **Step 2: Create LoginRequest**

```php
// app/Http/Requests/LoginRequest.php
class LoginRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ];
    }
}
```

- [ ] **Step 3: Create AuthController**

```php
// app/Http/Controllers/Api/AuthController.php
class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create($request->validated());
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->validated())) {
            return response()->json(['message' => 'Thông tin đăng nhập không chính xác'], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Đăng xuất thành công']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }
}
```

- [ ] **Step 4: Add auth routes**

```php
// routes/api.php
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});
```

- [ ] **Step 5: Test auth endpoints with curl**

```bash
php artisan serve &
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"password123","password_confirmation":"password123"}'
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

Expected: JSON with user data and token.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add auth endpoints (register, login, logout, me)"
```

---

### Task 5: Destination & Hotel Controllers

**Files:**
- Create: `app/Http/Controllers/Api/DestinationController.php`
- Create: `app/Http/Controllers/Api/HotelController.php`
- Create: `app/Http/Resources/DestinationResource.php`
- Create: `app/Http/Resources/HotelResource.php`
- Create: `app/Http/Resources/RoomTypeResource.php`
- Create: `app/Http/Requests/HotelSearchRequest.php`
- Modify: `routes/api.php`

- [ ] **Step 1: Create API Resources**

```php
// app/Http/Resources/DestinationResource.php
class DestinationResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'image' => $this->image,
            'description' => $this->description,
            'region' => $this->region,
            'hotels_count' => $this->whenCounted('hotels'),
        ];
    }
}
```

```php
// app/Http/Resources/HotelResource.php
class HotelResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'address' => $this->address,
            'star_rating' => $this->star_rating,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'phone' => $this->phone,
            'email' => $this->email,
            'checkin_time' => $this->checkin_time,
            'checkout_time' => $this->checkout_time,
            'amenities' => $this->amenities,
            'status' => $this->status,
            'destination' => new DestinationResource($this->whenLoaded('destination')),
            'images' => HotelImageResource::collection($this->whenLoaded('images')),
            'room_types' => RoomTypeResource::collection($this->whenLoaded('roomTypes')),
            'min_price' => $this->whenLoaded('roomTypes', function () {
                return $this->roomTypes->min('price_per_night');
            }),
        ];
    }
}
```

```php
// app/Http/Resources/RoomTypeResource.php
class RoomTypeResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'max_guests' => $this->max_guests,
            'bed_type' => $this->bed_type,
            'size_sqm' => $this->size_sqm,
            'price_per_night' => $this->price_per_night,
            'amenities' => $this->amenities,
            'total_rooms' => $this->total_rooms,
            'images' => HotelImageResource::collection($this->whenLoaded('images')),
            'available_rooms' => $this->when(
                $this->check_in && $this->check_out,
                fn() => $this->getAvailableRoomsCount($this->check_in, $this->check_out)
            ),
        ];
    }
}
```

- [ ] **Step 2: Create HotelSearchRequest**

```php
// app/Http/Requests/HotelSearchRequest.php
class HotelSearchRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'destination' => ['nullable', 'string'],
            'check_in' => ['nullable', 'date', 'after_or_equal:today'],
            'check_out' => ['nullable', 'date', 'after:check_in'],
            'guests' => ['nullable', 'integer', 'min:1'],
            'star' => ['nullable', 'integer', 'between:1,5'],
            'price_min' => ['nullable', 'numeric', 'min:0'],
            'price_max' => ['nullable', 'numeric', 'gt:price_min'],
            'sort' => ['nullable', 'in:popular,price_asc,price_desc,rating'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
```

- [ ] **Step 3: Create DestinationController**

```php
// app/Http/Controllers/Api/DestinationController.php
class DestinationController extends Controller
{
    public function index(): JsonResponse
    {
        $destinations = Destination::withCount('hotels')->get();
        return response()->json(DestinationResource::collection($destinations));
    }

    public function hotels(string $slug): JsonResponse
    {
        $destination = Destination::where('slug', $slug)->firstOrFail();
        $hotels = Hotel::where('destination_id', $destination->id)
            ->where('status', 'active')
            ->with(['destination', 'images'])
            ->withMin('roomTypes', 'price_per_night')
            ->paginate(12);

        return response()->json(HotelResource::collection($hotels));
    }
}
```

- [ ] **Step 4: Create HotelController**

```php
// app/Http/Controllers/Api/HotelController.php
class HotelController extends Controller
{
    public function index(HotelSearchRequest $request): JsonResponse
    {
        $query = Hotel::where('status', 'active')
            ->with(['destination', 'images']);

        if ($request->destination) {
            $query->whereHas('destination', function ($q) use ($request) {
                $q->where('slug', $request->destination)
                  ->orWhere('name', 'like', "%{$request->destination}%");
            });
        }

        if ($request->star) {
            $query->where('star_rating', $request->star);
        }

        if ($request->filled(['price_min', 'price_max'])) {
            $query->whereHas('roomTypes', function ($q) use ($request) {
                $q->whereBetween('price_per_night', [$request->price_min, $request->price_max]);
            });
        }

        match ($request->sort) {
            'price_asc' => $query->join('room_types', 'hotels.id', '=', 'room_types.hotel_id')
                ->orderBy('room_types.price_per_night', 'asc'),
            'price_desc' => $query->join('room_types', 'hotels.id', '=', 'room_types.hotel_id')
                ->orderBy('room_types.price_per_night', 'desc'),
            'rating' => $query->orderBy('star_rating', 'desc'),
            default => $query->orderBy('created_at', 'desc'),
        };

        $hotels = $query->paginate(12);
        return response()->json(HotelResource::collection($hotels));
    }

    public function show(string $slug): JsonResponse
    {
        $hotel = Hotel::where('slug', $slug)
            ->where('status', 'active')
            ->with(['destination', 'images', 'roomTypes.images'])
            ->firstOrFail();

        return response()->json(new HotelResource($hotel));
    }

    public function rooms(string $slug, Request $request): JsonResponse
    {
        $request->validate([
            'check_in' => ['required', 'date', 'after_or_equal:today'],
            'check_out' => ['required', 'date', 'after:check_in'],
        ]);

        $hotel = Hotel::where('slug', $slug)->where('status', 'active')->firstOrFail();

        $roomTypes = $hotel->roomTypes()->with('images')->get()->map(function ($roomType) use ($request) {
            $roomType->check_in = $request->check_in;
            $roomType->check_out = $request->check_out;
            return $roomType;
        });

        return response()->json(RoomTypeResource::collection($roomTypes));
    }

    public function featured(): JsonResponse
    {
        $hotels = Hotel::where('status', 'active')
            ->with(['destination', 'images'])
            ->inRandomOrder()
            ->limit(6)
            ->get();

        return response()->json(HotelResource::collection($hotels));
    }
}
```

- [ ] **Step 5: Add hotel & destination routes**

```php
// routes/api.php — add after auth routes:
Route::get('/destinations', [DestinationController::class, 'index']);
Route::get('/destinations/{slug}/hotels', [DestinationController::class, 'hotels']);
Route::get('/hotels', [HotelController::class, 'index']);
Route::get('/hotels/featured', [HotelController::class, 'featured']);
Route::get('/hotels/{slug}', [HotelController::class, 'show']);
Route::get('/hotels/{slug}/rooms', [HotelController::class, 'rooms']);
```

- [ ] **Step 6: Create HotelImageResource**

```php
// app/Http/Resources/HotelImageResource.php
class HotelImageResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'image_path' => $this->image_path,
            'caption' => $this->caption,
            'sort_order' => $this->sort_order,
        ];
    }
}
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add destination and hotel API endpoints with search/filter"
```

---

### Task 6: Booking Controller

**Files:**
- Create: `app/Http/Controllers/Api/BookingController.php`
- Create: `app/Http/Resources/BookingResource.php`
- Create: `app/Http/Requests/StoreBookingRequest.php`
- Create: `app/Services/BookingService.php`
- Modify: `routes/api.php`

- [ ] **Step 1: Create BookingService**

```php
// app/Services/BookingService.php
class BookingService
{
    public function createBooking(User $user, array $data): Booking
    {
        $roomType = RoomType::findOrFail($data['room_type_id']);

        $checkIn = Carbon::parse($data['check_in']);
        $checkOut = Carbon::parse($data['check_out']);
        $nights = $checkIn->diffInDays($checkOut);

        if ($nights < 1) {
            throw new \InvalidArgumentException('Ngày trả phòng phải sau ngày nhận phòng');
        }

        $availableRooms = $roomType->getAvailableRoomsCount($data['check_in'], $data['check_out']);
        if ($availableRooms < 1) {
            throw new \InvalidArgumentException('Phòng đã hết trong thời gian bạn chọn');
        }

        $totalPrice = $roomType->price_per_night * $nights;

        return Booking::create([
            'user_id' => $user->id,
            'room_type_id' => $roomType->id,
            'check_in' => $data['check_in'],
            'check_out' => $data['check_out'],
            'guests' => $data['guests'] ?? 1,
            'special_requests' => $data['special_requests'] ?? null,
            'total_price' => $totalPrice,
            'status' => 'pending',
        ]);
    }

    public function cancelBooking(Booking $booking): Booking
    {
        if ($booking->status !== 'pending') {
            throw new \InvalidArgumentException('Chỉ có thể hủy đặt phòng đang chờ xác nhận');
        }

        $booking->update(['status' => 'cancelled']);
        return $booking;
    }
}
```

- [ ] **Step 2: Create StoreBookingRequest**

```php
// app/Http/Requests/StoreBookingRequest.php
class StoreBookingRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'room_type_id' => ['required', 'exists:room_types,id'],
            'check_in' => ['required', 'date', 'after_or_equal:today'],
            'check_out' => ['required', 'date', 'after:check_in'],
            'guests' => ['required', 'integer', 'min:1'],
            'special_requests' => ['nullable', 'string', 'max:500'],
        ];
    }
}
```

- [ ] **Step 3: Create BookingResource**

```php
// app/Http/Resources/BookingResource.php
class BookingResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'booking_code' => $this->booking_code,
            'check_in' => $this->check_in->format('Y-m-d'),
            'check_out' => $this->check_out->format('Y-m-d'),
            'guests' => $this->guests,
            'special_requests' => $this->special_requests,
            'total_price' => $this->total_price,
            'status' => $this->status,
            'nights' => $this->check_in->diffInDays($this->check_out),
            'room_type' => new RoomTypeResource($this->whenLoaded('roomType')),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
```

- [ ] **Step 4: Create BookingController**

```php
// app/Http/Controllers/Api/BookingController.php
class BookingController extends Controller
{
    public function __construct(private BookingService $bookingService) {}

    public function index(Request $request): JsonResponse
    {
        $bookings = $request->user()
            ->bookings()
            ->with(['roomType.hotel.destination', 'payments'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json(BookingResource::collection($bookings));
    }

    public function store(StoreBookingRequest $request): JsonResponse
    {
        try {
            $booking = $this->bookingService->createBooking($request->user(), $request->validated());
            $booking->load(['roomType.hotel.destination']);
            return response()->json(new BookingResource($booking), 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function show(Request $request, string $bookingCode): JsonResponse
    {
        $booking = $request->user()
            ->bookings()
            ->where('booking_code', $bookingCode)
            ->with(['roomType.hotel.destination', 'roomType.images', 'payments'])
            ->firstOrFail();

        return response()->json(new BookingResource($booking));
    }

    public function destroy(Request $request, string $bookingCode): JsonResponse
    {
        $booking = $request->user()
            ->bookings()
            ->where('booking_code', $bookingCode)
            ->firstOrFail();

        try {
            $this->bookingService->cancelBooking($booking);
            return response()->json(['message' => 'Hủy đặt phòng thành công']);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
```

- [ ] **Step 5: Add booking routes**

```php
// routes/api.php — add inside auth:sanctum middleware group:
Route::middleware('auth:sanctum')->group(function () {
    // ... existing auth routes ...
    Route::apiResource('bookings', BookingController::class)->except(['update']);
    Route::get('/bookings/{bookingCode}', [BookingController::class, 'show']);
    Route::delete('/bookings/{bookingCode}', [BookingController::class, 'destroy']);
});
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add booking API with create, list, show, cancel"
```

---

### Task 7: Payment Controller (VNPay + MoMo)

**Files:**
- Create: `app/Http/Controllers/Api/PaymentController.php`
- Create: `app/Services/PaymentService.php`
- Create: `app/Http/Resources/PaymentResource.php`
- Modify: `routes/api.php`

- [ ] **Step 1: Create PaymentResource**

```php
// app/Http/Resources/PaymentResource.php
class PaymentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'booking_id' => $this->booking_id,
            'payment_method' => $this->payment_method,
            'transaction_id' => $this->transaction_id,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'status' => $this->status,
            'paid_at' => $this->paid_at?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
```

- [ ] **Step 2: Create PaymentService**

```php
// app/Services/PaymentService.php
class PaymentService
{
    public function createPayment(Booking $booking, string $method): array
    {
        $payment = Payment::create([
            'booking_id' => $booking->id,
            'payment_method' => $method,
            'amount' => $booking->total_price,
            'status' => 'pending',
        ]);

        return match ($method) {
            'vnpay' => $this->createVNPayPayment($payment),
            'momo' => $this->createMoMoPayment($payment),
            default => throw new \InvalidArgumentException('Phương thức thanh toán không hợp lệ'),
        };
    }

    private function createVNPayPayment(Payment $payment): array
    {
        $vnp_TmnCode = config('services.vnpay.tmn_code');
        $vnp_HashSecret = config('services.vnpay.hash_secret');
        $vnp_Url = config('services.vnpay.url');
        $vnp_Returnurl = config('services.vnpay.return_url');

        $vnp_TxnRef = $payment->id . '_' . time();
        $vnp_OrderInfo = "Thanh toan dat phong VietStay #" . $payment->booking->booking_code;
        $vnp_OrderType = 'hotelbooking';
        $vnp_Amount = $payment->amount * 100; // VNPay requires amount in VND * 100
        $vnp_Locale = 'vn';
        $vnp_BankCode = '';
        $vnp_IpAddr = request()->ip();

        $inputData = [
            'vnp_Version' => '2.1.0',
            'vnp_TmnCode' => $vnp_TmnCode,
            'vnp_Amount' => $vnp_Amount,
            'vnp_Command' => 'pay',
            'vnp_CreateDate' => date('YmdHis'),
            'vnp_CurrCode' => 'VND',
            'vnp_IpAddr' => $vnp_IpAddr,
            'vnp_Locale' => $vnp_Locale,
            'vnp_OrderInfo' => $vnp_OrderInfo,
            'vnp_OrderType' => $vnp_OrderType,
            'vnp_ReturnUrl' => $vnp_Returnurl,
            'vnp_TxnRef' => $vnp_TxnRef,
        ];

        ksort($inputData);
        $query = '';
        $hashdata = '';
        foreach ($inputData as $key => $value) {
            $hashdata .= ($hashdata ? '&' : '') . urlencode($key) . '=' . urlencode($value);
            $query .= urlencode($key) . '=' . urlencode($value) . '&';
        }

        $vnp_SecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);
        $payment->update(['transaction_id' => $vnp_TxnRef]);

        return [
            'payment_id' => $payment->id,
            'payment_url' => $vnp_Url . '?' . $query . 'vnp_SecureHash=' . $vnp_SecureHash,
        ];
    }

    private function createMoMoPayment(Payment $payment): array
    {
        $partnerCode = config('services.momo.partner_code');
        $accessKey = config('services.momo.access_key');
        $secretKey = config('services.momo.secret_key');
        $endpoint = config('services.momo.endpoint');
        $returnUrl = config('services.momo.return_url');

        $orderId = $payment->id . '_' . time();
        $orderInfo = "Thanh toan dat phong VietStay #" . $payment->booking->booking_code;
        $amount = (string) intval($payment->amount);
        $requestId = (string) Str::uuid();
        $requestType = 'captureWallet';
        $extraData = base64_encode(json_encode(['booking_code' => $payment->booking->booking_code]));

        $rawSignature = "accessKey={$accessKey}&amount={$amount}&extraData={$extraData}&ipnUrl={$returnUrl}&orderId={$orderId}&orderInfo={$orderInfo}&partnerCode={$partnerCode}&redirectUrl={$returnUrl}&requestId={$requestId}&requestType={$requestType}";
        $signature = hash_hmac('sha256', $rawSignature, $secretKey);

        $payment->update(['transaction_id' => $orderId]);

        $response = Http::post($endpoint, [
            'partnerCode' => $partnerCode,
            'accessKey' => $accessKey,
            'requestId' => $requestId,
            'amount' => $amount,
            'orderId' => $orderId,
            'orderInfo' => $orderInfo,
            'redirectUrl' => $returnUrl,
            'ipnUrl' => $returnUrl,
            'extraData' => $extraData,
            'requestType' => $requestType,
            'signature' => $signature,
            'lang' => 'vi',
        ]);

        $data = $response->json();

        return [
            'payment_id' => $payment->id,
            'payment_url' => $data['payUrl'] ?? null,
        ];
    }

    public function handleVNPayCallback(array $data): Payment
    {
        $vnp_HashSecret = config('services.vnpay.hash_secret');
        $inputData = [];
        foreach ($data as $key => $value) {
            if (str_starts_with($key, 'vnp_')) {
                $inputData[$key] = $value;
            }
        }

        unset($inputData['vnp_SecureHash']);
        ksort($inputData);
        $hashData = '';
        foreach ($inputData as $key => $value) {
            $hashData .= ($hashData ? '&' : '') . urlencode($key) . '=' . urlencode($value);
        }

        $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        $payment = Payment::where('transaction_id', $data['vnp_TxnRef'])->firstOrFail();

        if ($secureHash === $data['vnp_SecureHash'] && $data['vnp_ResponseCode'] === '00') {
            $payment->update([
                'status' => 'success',
                'paid_at' => now(),
                'gateway_response' => $data,
            ]);
            $payment->booking->update(['status' => 'confirmed']);
        } else {
            $payment->update([
                'status' => 'failed',
                'gateway_response' => $data,
            ]);
        }

        return $payment;
    }

    public function handleMoMoCallback(array $data): Payment
    {
        $secretKey = config('services.momo.secret_key');

        $rawSignature = "accessKey={$data['accessKey']}&amount={$data['amount']}&extraData={$data['extraData']}&message={$data['message']}&orderId={$data['orderId']}&orderInfo={$data['orderInfo']}&orderType={$data['orderType']}&partnerCode={$data['partnerCode']}&payType={$data['payType']}&requestId={$data['requestId']}&responseTime={$data['responseTime']}&resultCode={$data['resultCode']}&transId={$data['transId']}";

        $signature = hash_hmac('sha256', $rawSignature, $secretKey);

        $payment = Payment::where('transaction_id', $data['orderId'])->firstOrFail();

        if ($signature === $data['signature'] && $data['resultCode'] === 0) {
            $payment->update([
                'status' => 'success',
                'paid_at' => now(),
                'gateway_response' => $data,
            ]);
            $payment->booking->update(['status' => 'confirmed']);
        } else {
            $payment->update([
                'status' => 'failed',
                'gateway_response' => $data,
            ]);
        }

        return $payment;
    }
}
```

- [ ] **Step 3: Create PaymentController**

```php
// app/Http/Controllers/Api/PaymentController.php
class PaymentController extends Controller
{
    public function __construct(private PaymentService $paymentService) {}

    public function create(Request $request): JsonResponse
    {
        $request->validate([
            'booking_id' => ['required', 'exists:bookings,id'],
            'payment_method' => ['required', 'in:vnpay,momo'],
        ]);

        $booking = $request->user()->bookings()->findOrFail($request->booking_id);

        if ($booking->status !== 'pending') {
            return response()->json(['message' => 'Đặt phòng không ở trạng thái chờ thanh toán'], 422);
        }

        try {
            $result = $this->paymentService->createPayment($booking, $request->payment_method);
            return response()->json($result);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function vnpayCallback(Request $request)
    {
        $payment = $this->paymentService->handleVNPayCallback($request->all());
        return redirect(config('app.frontend_url') . '/booking/' . $payment->booking->booking_code . '?payment=' . $payment->status);
    }

    public function momoCallback(Request $request)
    {
        $payment = $this->paymentService->handleMoMoCallback($request->all());
        return redirect(config('app.frontend_url') . '/booking/' . $payment->booking->booking_code . '?payment=' . $payment->status);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $payment = Payment::where('id', $id)
            ->whereHas('booking', fn($q) => $q->where('user_id', $request->user()->id))
            ->firstOrFail();

        return response()->json(new PaymentResource($payment));
    }
}
```

- [ ] **Step 4: Add payment config to config/services.php**

```php
// config/services.php — add:
'vnpay' => [
    'tmn_code' => env('VNPAY_TMN_CODE'),
    'hash_secret' => env('VNPAY_HASH_SECRET'),
    'url' => env('VNPAY_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'),
    'return_url' => env('VNPAY_RETURN_URL', 'http://localhost:8000/api/payments/vnpay/callback'),
],
'momo' => [
    'partner_code' => env('MOMO_PARTNER_CODE'),
    'access_key' => env('MOMO_ACCESS_KEY'),
    'secret_key' => env('MOMO_SECRET_KEY'),
    'endpoint' => env('MOMO_ENDPOINT', 'https://test-payment.momo.vn/v2/gateway/api/create'),
    'return_url' => env('MOMO_RETURN_URL', 'http://localhost:8000/api/payments/momo/callback'),
],
```

- [ ] **Step 5: Add .env payment variables**

```
# Add to .env:
FRONTEND_URL=http://localhost:5173
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:8000/api/payments/vnpay/callback
MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
MOMO_SECRET_KEY=
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_RETURN_URL=http://localhost:8000/api/payments/momo/callback
```

- [ ] **Step 6: Add payment routes**

```php
// routes/api.php — add:
Route::middleware('auth:sanctum')->group(function () {
    // ... existing routes ...
    Route::post('/payments/create', [PaymentController::class, 'create']);
    Route::get('/payments/{id}', [PaymentController::class, 'show']);
});
Route::get('/payments/vnpay/callback', [PaymentController::class, 'vnpayCallback']);
Route::get('/payments/momo/callback', [PaymentController::class, 'momoCallback']);
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add VNPay and MoMo payment integration"
```

---

### Task 8: Database Seeders — Destinations + Hotels + Room Types

**Files:**
- Create: `database/seeders/DestinationSeeder.php`
- Create: `database/seeders/HotelSeeder.php`
- Create: `database/seeders/RoomTypeSeeder.php`
- Create: `database/seeders/HotelImageSeeder.php`
- Modify: `database/seeders/DatabaseSeeder.php`

- [ ] **Step 1: Create DestinationSeeder**

```php
// database/seeders/DestinationSeeder.php
class DestinationSeeder extends Seeder
{
    public function run(): void
    {
        $destinations = [
            ['name' => 'Hà Nội', 'slug' => 'ha-noi', 'region' => 'mien_bac', 'description' => 'Thủ đô ngàn năm văn hiến'],
            ['name' => 'Sapa', 'slug' => 'sapa', 'region' => 'mien_bac', 'description' => 'Thị trấn trong mây, ruộng bậc thang'],
            ['name' => 'Huế', 'slug' => 'hue', 'region' => 'mien_trung', 'description' => 'Cố đô thơ mộng, di sản văn hóa'],
            ['name' => 'Đà Nẵng', 'slug' => 'da-nang', 'region' => 'mien_trung', 'description' => 'Thành phố đáng sống nhất Việt Nam'],
            ['name' => 'Hội An', 'slug' => 'hoi-an', 'region' => 'mien_trung', 'description' => 'Phố cổ đèn lồng, di sản thế giới'],
            ['name' => 'Nha Trang', 'slug' => 'nha-trang', 'region' => 'mien_nam', 'description' => 'Vịnh biển tuyệt đẹp, đảo san hô'],
            ['name' => 'TP.HCM', 'slug' => 'tp-hcm', 'region' => 'mien_nam', 'description' => 'Trung tâm kinh tế, năng động'],
            ['name' => 'Phú Quốc', 'slug' => 'phu-quoc', 'region' => 'mien_nam', 'description' => 'Đảo ngọc, biển xanh cát trắng'],
        ];

        foreach ($destinations as $dest) {
            Destination::create($dest);
        }
    }
}
```

- [ ] **Step 2: Create HotelSeeder** — 25 hotels across 8 destinations with realistic Vietnamese names, addresses, amenities

```php
// database/seeders/HotelSeeder.php
class HotelSeeder extends Seeder
{
    public function run(): void
    {
        $hotels = [
            // Hà Nội (3)
            ['destination_id' => 1, 'name' => 'Sofitel Legend Metropole Hà Nội', 'address' => '15 Ngọ Quyền, Hoàn Kiếm', 'star_rating' => 5, 'phone' => '024-3826-6919', 'email' => 'info@sofitel-hanoi.com', 'amenities' => ['wifi','pool','spa','restaurant','gym','parking'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['destination_id' => 1, 'name' => 'Hanoi La Siesta Hotel & Spa', 'address' => '94 Ma May, Hoàn Kiếm', 'star_rating' => 4, 'phone' => '024-3266-8866', 'email' => 'info@lasiesta-hanoi.com', 'amenities' => ['wifi','spa','restaurant'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['destination_id' => 1, 'name' => 'Hotel du Parc Hanoi', 'address' => '84 Bà Triệu, Hoàn Kiếm', 'star_rating' => 3, 'phone' => '024-3943-8888', 'email' => 'info@duparc-hanoi.com', 'amenities' => ['wifi','restaurant','parking'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            // Sapa (2)
            ['destination_id' => 2, 'name' => 'Hotel de la Coupole - MGallery', 'address' => 'Hoàng Liên, Sapa', 'star_rating' => 5, 'phone' => '020-3868-8888', 'email' => 'info@delacoupole-sapa.com', 'amenities' => ['wifi','pool','spa','restaurant','gym'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['destination_id' => 2, 'name' => 'Sapa Jade Hill Resort', 'address' => 'Mường Hoa, Sapa', 'star_rating' => 4, 'phone' => '020-3878-8888', 'email' => 'info@jadehill-sapa.com', 'amenities' => ['wifi','restaurant','parking'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            // Huế (3)
            ['destination_id' => 3, 'name' => 'Azerai La Residence Huế', 'address' => '5 Lê Lợi, Huế', 'star_rating' => 5, 'phone' => '023-4383-7474', 'email' => 'info@azerai-hue.com', 'amenities' => ['wifi','pool','spa','restaurant','gym','parking'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['destination_id' => 3, 'name' => 'Imperial Hotel Huế', 'address' => '8 Hùng Vương, Huế', 'star_rating' => 4, 'phone' => '023-4382-5555', 'email' => 'info@imperial-hue.com', 'amenities' => ['wifi','pool','restaurant','gym'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['destination_id' => 3, 'name' => 'Vedana Lagoon Resort & Spa', 'address' => 'Laguna Lăng Cô, Huế', 'star_rating' => 5, 'phone' => '023-4369-8888', 'email' => 'info@vedana-hue.com', 'amenities' => ['wifi','pool','spa','restaurant','gym','parking'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            // Đà Nẵng (4)
            ['destination_id' => 4, 'name' => 'InterContinental Danang Sun Peninsula', 'address' => 'Bán đảo Sơn Trà, Đà Nẵng', 'star_rating' => 5, 'phone' => '023-6396-8888', 'email' => 'info@intercontinental-danang.com', 'amenities' => ['wifi','pool','spa','restaurant','gym','parking','beach'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['destination_id' => 4, 'name' => 'Fusion Maia Đà Nẵng', 'address' => 'Trường Sa, Ngũ Hành Sơn, Đà Nẵng', 'star_rating' => 5, 'phone' => '023-6395-5555', 'email' => 'info@fusionmaia-danang.com', 'amenities' => ['wifi','pool','spa','restaurant','gym','beach'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['destination_id' => 4, 'name' => 'Silver Sea Hotel Đà Nẵng', 'address' => '34 Võ Văn Tần, Đà Nẵng', 'star_rating' => 4, 'phone' => '023-6399-8888', 'email' => 'info@silversea-danang.com', 'amenities' => ['wifi','restaurant','parking'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['destination_id' => 4, 'name' => 'A La Carte Đà Nẵng Beach Hotel', 'address' => '220 Võ Nguyên Giáp, Đà Nẵng', 'star_rating' => 4, 'phone' => '023-6392-8888', 'email' => 'info@alacarte-danang.com', 'amenities' => ['wifi','pool','restaurant','gym','beach'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            // Hội An (3)
            ['destination_id' => 5, 'name' => 'Four Seasons Resort Hội An', 'address' => 'Cửa Đại, Hội An', 'star_rating' => 5, 'phone' => '023-5395-8888', 'email' => 'info@fourseasons-hoian.com', 'amenities' => ['wifi','pool','spa','restaurant','gym','parking','beach'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['destination_id' => 5, 'name' => 'Almanity Hội An Wellness Resort', 'address' => '88 Cửa Đại, Hội An', 'star_rating' => 4, 'phone' => '023-5392-8888', 'email' => 'info@almanity-hoian.com', 'amenities' => ['wifi','pool','spa','restaurant'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['destination_id' => 5, 'name' => 'Little Hội An Boutique Hotel', 'address' => '46 Nguyễn Duy Hiệu, Hội An', 'star_rating' => 3, 'phone' => '023-5391-8888', 'email' => 'info@littlehoian.com', 'amenities' => ['wifi','restaurant'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            // Nha Trang (3)
            ['destination_id' => 6, 'name' => 'Sheraton Resort Nha Trang', 'address' => '28 Trần Phú, Nha Trang', 'star_rating' => 5, 'phone' => '025-8388-8888', 'email' => 'info@sheraton-nhatrang.com', 'amenities' => ['wifi','pool','spa','restaurant','gym','beach'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['destination_id' => 6, 'name' => 'Vinpearl Resort Nha Trang', 'address' => 'Đảo Hòn Tre, Nha Trang', 'star_rating' => 5, 'phone' => '025-8388-9999', 'email' => 'info@vinpearl-nhatrang.com', 'amenities' => ['wifi','pool','spa','restaurant','gym','parking','beach'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['destination_id' => 6, 'name' => 'Liberty Central Nha Trang', 'address' => '60 Trần Phú, Nha Trang', 'star_rating' => 4, 'phone' => '025-8388-7777', 'email' => 'info@liberty-nhatrang.com', 'amenities' => ['wifi','pool','restaurant','gym'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            // TP.HCM (3)
            ['destination_id' => 7, 'name' => 'Park Hyatt Sài Gòn', 'address' => '2 Công xã Paris, Quận 1', 'star_rating' => 5, 'phone' => '028-3824-1234', 'email' => 'info@parkhyatt-saigon.com', 'amenities' => ['wifi','pool','spa','restaurant','gym','parking'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['destination_id' => 7, 'name' => 'Hotel Nikko Sài Gòn', 'address' => '235 Nguyễn Văn Cừ, Quận 1', 'star_rating' => 4, 'phone' => '028-3822-5555', 'email' => 'info@nikko-saigon.com', 'amenities' => ['wifi','pool','restaurant','gym','parking'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['destination_id' => 7, 'name' => 'Liberty Central Saigon Citypoint', 'address' => '59 Pasteur, Quận 1', 'star_rating' => 4, 'phone' => '028-3822-8888', 'email' => 'info@liberty-saigon.com', 'amenities' => ['wifi','restaurant','gym'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            // Phú Quốc (4)
            ['destination_id' => 8, 'name' => 'InterContinental Phú Quốc Long Beach', 'address' => 'Bãi Trường, Phú Quốc', 'star_rating' => 5, 'phone' => '029-7386-8888', 'email' => 'info@intercontinental-phuquoc.com', 'amenities' => ['wifi','pool','spa','restaurant','gym','beach'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['destination_id' => 8, 'name' => 'JW Marriott Phú Quốc', 'address' => 'Khmêr, Phú Quốc', 'star_rating' => 5, 'phone' => '029-7386-9999', 'email' => 'info@jwmarriott-phuquoc.com', 'amenities' => ['wifi','pool','spa','restaurant','gym','parking','beach'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['destination_id' => 8, 'name' => 'Mango Bay Resort Phú Quốc', 'address' => 'Ông Lang, Phú Quốc', 'star_rating' => 3, 'phone' => '029-7384-8888', 'email' => 'info@mangobay-phuquoc.com', 'amenities' => ['wifi','restaurant','beach'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
            ['destination_id' => 8, 'name' => 'Novotel Phú Quốc Resort', 'address' => 'Dường Đông, Phú Quốc', 'star_rating' => 4, 'phone' => '029-7384-9999', 'email' => 'info@novotel-phuquoc.com', 'amenities' => ['wifi','pool','restaurant','gym','beach'], 'checkin_time' => '14:00', 'checkout_time' => '12:00'],
        ];

        foreach ($hotels as $hotel) {
            Hotel::create($hotel);
        }
    }
}
```

- [ ] **Step 3: Create RoomTypeSeeder** — 2-4 room types per hotel with realistic VND prices

```php
// database/seeders/RoomTypeSeeder.php
class RoomTypeSeeder extends Seeder
{
    public function run(): void
    {
        // For each hotel, create 2-4 room types
        $hotels = Hotel::all();
        $roomTemplates = [
            ['name' => 'Superior', 'bed_type' => 'double', 'size_sqm' => 28, 'price_base' => 800000, 'amenities' => ['wifi','tv','minibar'], 'total_rooms' => 15],
            ['name' => 'Deluxe', 'bed_type' => 'king', 'size_sqm' => 35, 'price_base' => 1500000, 'amenities' => ['wifi','tv','minibar','bathtub','city_view'], 'total_rooms' => 10],
            ['name' => 'Suite', 'bed_type' => 'king', 'size_sqm' => 55, 'price_base' => 3000000, 'amenities' => ['wifi','tv','minibar','bathtub','living_room','city_view'], 'total_rooms' => 5],
            ['name' => 'Executive Suite', 'bed_type' => 'king', 'size_sqm' => 70, 'price_base' => 5000000, 'amenities' => ['wifi','tv','minibar','bathtub','living_room','kitchenette','sea_view'], 'total_rooms' => 3],
            ['name' => 'Standard', 'bed_type' => 'twin', 'size_sqm' => 24, 'price_base' => 500000, 'amenities' => ['wifi','tv'], 'total_rooms' => 20],
            ['name' => 'Family Room', 'bed_type' => 'king', 'size_sqm' => 45, 'price_base' => 2200000, 'amenities' => ['wifi','tv','minibar','extra_bed'], 'total_rooms' => 8],
        ];

        foreach ($hotels as $hotel) {
            $starMultiplier = $hotel->star_rating * 0.5;
            $numRooms = rand(2, 4);
            $selectedRooms = array_rand($roomTemplates, $numRooms);
            if (!is_array($selectedRooms)) $selectedRooms = [$selectedRooms];

            foreach ($selectedRooms as $idx) {
                $template = $roomTemplates[$idx];
                RoomType::create([
                    'hotel_id' => $hotel->id,
                    'name' => $template['name'],
                    'description' => "Phòng {$template['name']} tại {$hotel->name}, diện tích {$template['size_sqm']}m²",
                    'max_guests' => $template['bed_type'] === 'king' ? 3 : 2,
                    'bed_type' => $template['bed_type'],
                    'size_sqm' => $template['size_sqm'],
                    'price_per_night' => round($template['price_base'] * $starMultiplier),
                    'amenities' => $template['amenities'],
                    'total_rooms' => $template['total_rooms'],
                ]);
            }
        }
    }
}
```

- [ ] **Step 4: Create HotelImageSeeder**

```php
// database/seeders/HotelImageSeeder.php
class HotelImageSeeder extends Seeder
{
    public function run(): void
    {
        $hotels = Hotel::all();
        foreach ($hotels as $hotel) {
            // Create 3-5 hotel-level images
            for ($i = 1; $i <= rand(3, 5); $i++) {
                HotelImage::create([
                    'hotel_id' => $hotel->id,
                    'image_path' => "hotels/{$hotel->slug}/exterior-{$i}.jpg",
                    'caption' => "Ảnh ngoại thất {$i}",
                    'sort_order' => $i,
                ]);
            }
        }

        // Create room-type-level images
        $roomTypes = RoomType::all();
        foreach ($roomTypes as $roomType) {
            for ($i = 1; $i <= 2; $i++) {
                HotelImage::create([
                    'hotel_id' => $roomType->hotel_id,
                    'room_type_id' => $roomType->id,
                    'image_path' => "rooms/{$roomType->id}/room-{$i}.jpg",
                    'caption' => "Phòng {$roomType->name} - Ảnh {$i}",
                    'sort_order' => $i,
                ]);
            }
        }
    }
}
```

- [ ] **Step 5: Update DatabaseSeeder**

```php
// database/seeders/DatabaseSeeder.php
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            DestinationSeeder::class,
            HotelSeeder::class,
            RoomTypeSeeder::class,
            HotelImageSeeder::class,
        ]);
    }
}
```

- [ ] **Step 6: Run seeders**

```bash
php artisan migrate:fresh --seed
```

Expected: 8 destinations, 25 hotels, ~75 room types, ~175 images seeded.

- [ ] **Step 7: Verify with tinker**

```bash
php artisan tinker
>>> Destination::count()  // 8
>>> Hotel::count()        // 25
>>> RoomType::count()     // ~75
>>> HotelImage::count()   // ~175
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add seeders for destinations, hotels, room types, images"
```

---

### Task 9: Final API Routes & CORS Configuration

**Files:**
- Modify: `routes/api.php` (final version)
- Modify: `config/cors.php`
- Modify: `bootstrap/app.php`

- [ ] **Step 1: Final routes/api.php**

```php
<?php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\DestinationController;
use App\Http\Controllers\Api\HotelController;
use App\Http\Controllers\Api\PaymentController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::get('/destinations', [DestinationController::class, 'index']);
Route::get('/destinations/{slug}/hotels', [DestinationController::class, 'hotels']);
Route::get('/hotels', [HotelController::class, 'index']);
Route::get('/hotels/featured', [HotelController::class, 'featured']);
Route::get('/hotels/{slug}', [HotelController::class, 'show']);
Route::get('/hotels/{slug}/rooms', [HotelController::class, 'rooms']);

// Payment callbacks (public — gateway redirects)
Route::get('/payments/vnpay/callback', [PaymentController::class, 'vnpayCallback']);
Route::get('/payments/momo/callback', [PaymentController::class, 'momoCallback']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/{bookingCode}', [BookingController::class, 'show']);
    Route::delete('/bookings/{bookingCode}', [BookingController::class, 'destroy']);

    Route::post('/payments/create', [PaymentController::class, 'create']);
    Route::get('/payments/{id}', [PaymentController::class, 'show']);
});
```

- [ ] **Step 2: Final CORS config**

```php
// config/cors.php
'allowed_origins' => ['http://localhost:5173', 'http://localhost:3000'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

- [ ] **Step 3: Add FRONTEND_URL to .env**

```
FRONTEND_URL=http://localhost:5173
```

- [ ] **Step 4: Test all endpoints**

```bash
# Test destinations
curl http://localhost:8000/api/destinations
# Test hotels
curl http://localhost:8000/api/hotels
# Test featured
curl http://localhost:8000/api/hotels/featured
# Test search with filter
curl "http://localhost:8000/api/hotels?destination=ha-noi&star=5"
# Test hotel detail
curl http://localhost:8000/api/hotels/sofitel-legend-metropole-ha-noi
```

Expected: JSON responses with data.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: finalize API routes, CORS, and config"
```
