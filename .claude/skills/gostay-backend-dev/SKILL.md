---
name: gostay-backend-dev
description: Backend development skill cho GoStay. Hướng dẫn implement Laravel controllers, services, models, migrations, API resources, routes, và testing. Dùng khi cần tạo/sửa API endpoints, database schema, business logic, authentication. Triggers: "backend", "API", "endpoint", "controller", "model", "migration", "database", "Laravel", "PHP", "route".
---

# Backend Dev Skill

## Workflow

### 1. Before Coding
- Kiểm tra `app/Models/` cho model đã có và relationships
- Kiểm tra `app/Http/Resources/` cho Resource đã có
- Kiểm tra `routes/api.php` cho existing endpoints
- Kiểm tra `app/Services/` cho business logic đã implement

### 2. New Endpoint Checklist
1. **Migration** (nếu cần table/column mới): `database/migrations/`
2. **Model**: `app/Models/` — thêm relationships, fillable, casts
3. **Form Request**: `app/Http/Requests/` — validation rules
4. **API Resource**: `app/Http/Resources/` — response transformation
5. **Service** (nếu có business logic): `app/Services/`
6. **Controller**: `app/Http/Controllers/Api/` hoặc `Api/Admin/`
7. **Route**: `routes/api.php`
8. **Test**: `tests/Feature/`

### 3. API Resource Pattern
```php
class SomethingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'created_at' => $this->created_at?->toISOString(),
            // Relations chỉ khi loaded
            'relation' => RelationResource::make($this->whenLoaded('relation')),
        ];
    }
}
```

### 4. Controller Pattern
```php
// Admin list endpoint
public function index(Request $request): JsonResponse
{
    $query = Model::with(['relation'])->when($request->search, fn($q, $v) => $q->where('name', 'like', "%{$v}%"));
    return SomethingResource::collection($query->paginate($request->per_page ?? 15));
}

// Admin detail endpoint
public function show(int $id): JsonResponse
{
    $item = Model::with(['relations'])->findOrFail($id);
    return response()->json(['data' => new SomethingResource($item)]);
}
```

### 5. Filter Pattern cho Admin Endpoints
```php
$query->when($request->search, fn($q, $v) => $q->where('name', 'like', "%{$v}%"))
      ->when($request->status, fn($q, $v) => $q->where('status', $v))
      ->when($request->hotel_id, fn($q, $v) => $q->where('hotel_id', $v))
      ->when($request->date_from, fn($q, $v) => $q->whereDate('created_at', '>=', $v))
      ->when($request->date_to, fn($q, $v) => $q->whereDate('created_at', '<=', $v));
```

### 6. Service Pattern
Business logic phức tạp tách vào Service:
```php
class SomeService
{
    public function doSomething(Model $model, array $data): Model
    {
        // Business logic here
        return $model;
    }
}
```

### 7. After Coding — QUALITY GATES
1. `php -l app/Http/Controllers/Path/ToController.php` — syntax check
2. `php artisan route:list --path=api/admin` — verify routes
3. `php artisan test --filter=TestName` — run related tests
4. `php artisan test` — run all tests nếu thay đổi lớn

## Common Pitfalls
- Quên `use App\Models\...` import
- Return type `JsonResponse` nhưng trả về Resource collection — bỏ type hint
- Quên `whenLoaded()` trong Resource — N+1 query
- Validation trong controller thay vì FormRequest
