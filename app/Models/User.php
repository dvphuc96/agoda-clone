<?php

namespace App\Models;

use App\Notifications\VerifyEmailNotification;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'password', 'phone', 'avatar', 'role', 'is_active', 'provider', 'provider_id', 'preferred_currency'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $appends = ['avatar_url'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    protected function avatarUrl(): Attribute
    {
        return Attribute::get(fn () => $this->avatar ? '/storage/' . $this->avatar : null);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function notificationRecords(): HasMany
    {
        return $this->hasMany(NotificationRecord::class);
    }

    public function transferBookings(): HasMany
    {
        return $this->hasMany(TransferBooking::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    public function ownedHotels(): BelongsToMany
    {
        return $this->belongsToMany(Hotel::class, 'hotel_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function chatSessions(): HasMany
    {
        return $this->hasMany(ChatSession::class);
    }

    public function loyaltyAccount()
    {
        return $this->hasOne(LoyaltyAccount::class);
    }

    public function isHotelOwner(): bool
    {
        return $this->ownedHotels()->exists();
    }

    public function ownsHotel(int $hotelId): bool
    {
        return $this->ownedHotels()->where('hotel_id', $hotelId)->exists();
    }

    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerifyEmailNotification());
    }
}
