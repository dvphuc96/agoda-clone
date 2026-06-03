<?php

namespace App\Services;

use App\Models\ChatMessage;
use App\Models\ChatSession;
use App\Models\Hotel;
use App\Models\Location;
use Illuminate\Support\Collection;

class ChatService
{
    /**
     * Process an incoming user message and return an AI-like response.
     * Uses rule-based keyword matching (no external AI dependency).
     */
    public function processMessage(ChatSession $session, string $userMessage): string
    {
        $context = $session->context ?? [];
        $message = mb_strtolower($userMessage);

        // Extract criteria from the message
        $location = $this->extractLocation($message, $context);
        $maxPrice = $this->extractPrice($message);
        $guests = $this->extractGuests($message);

        // Update context with extracted information
        if ($location) {
            $context['location'] = $location;
        }
        if ($maxPrice) {
            $context['max_price'] = $maxPrice;
        }
        if ($guests) {
            $context['guests'] = $guests;
        }

        // Detect intent and build response
        $response = $this->buildResponse($message, $context, $location, $maxPrice, $guests);

        // Persist updated context
        $session->update(['context' => $context]);

        return $response;
    }

    /**
     * Search hotels based on extracted criteria.
     */
    private function searchHotels(?string $location, ?int $guests, ?float $maxPrice): Collection
    {
        $query = Hotel::with(['location', 'roomTypes'])
            ->where('status', 'active');

        if ($location) {
            $query->whereHas('location', function ($q) use ($location) {
                $q->where('name', 'like', "%{$location}%")
                    ->orWhere('slug', 'like', "%{$location}%");
            });
        }

        $hotels = $query->take(5)->get();

        if ($maxPrice) {
            $hotels = $hotels->filter(function ($hotel) use ($maxPrice) {
                return $hotel->roomTypes->min('price_per_night') <= $maxPrice;
            });
        }

        if ($guests) {
            $hotels = $hotels->filter(function ($hotel) use ($guests) {
                return $hotel->roomTypes->max('max_guests') >= $guests;
            });
        }

        return $hotels->take(5);
    }

    /**
     * Build the response text based on intent and search results.
     */
    private function buildResponse(string $message, array $context, ?string $location, ?float $maxPrice, ?int $guests): string
    {
        // Greeting intent
        if ($this->matchesIntent($message, ['xin chao', 'hello', 'hi', 'chao', 'hey'])) {
            return "Xin chao! Toi la tro ly ao cua GoStay. Toi co the giup ban:\n"
                . "- Tim khach san theo thanh pho/dia diem\n"
                . "- Tim phong theo gia va so khach\n"
                . "- Tu van dia diem du lich pho bien\n\n"
                . "Ban muon tim khach san o dau?";
        }

        // Help intent
        if ($this->matchesIntent($message, ['giup', 'help', 'huong dan', 'can gi', 'lam gi'])) {
            return "Toi co the giup ban:\n"
                . "1. Tim khach san: \"Tim khach san o Da Nang\"\n"
                . "2. Tim theo gia: \"Khach san duoi 1 trieu dem\"\n"
                . "3. Tim theo so khach: \"Phong cho 4 nguoi\"\n"
                . "4. Goi y dia diem: \"Goi y dia diem du lich\"\n"
                . "Ban can giup gi?";
        }

        // Popular destinations intent
        if ($this->matchesIntent($message, ['goi y', 'suggest', 'popular', 'pho bien', 'dia diem', 'du lich', 'recommend'])) {
            return $this->getPopularDestinations();
        }

        // Search intent - has location or other criteria
        if ($location || $maxPrice || $guests) {
            $hotels = $this->searchHotels($location, $guests, $maxPrice);

            if ($hotels->isEmpty()) {
                $fallback = "Xin loi, toi khong tim thay khach san phu hop";
                if ($location) {
                    $fallback .= " tai {$location}";
                }
                $fallback .= ". Ban co muon thu tim o dia diem khac khong?";

                if (!$location) {
                    $fallback .= "\n\n" . $this->getPopularDestinations();
                }

                return $fallback;
            }

            return $this->formatHotelResults($hotels);
        }

        // Thanks intent
        if ($this->matchesIntent($message, ['cam on', 'thank', 'thanks', 'ty'])) {
            return "Khong co gi! Rat vui vi da giup duoc ban. Neu ban can them thong tin gi, dung ngai hoi nhe!";
        }

        // Default fallback
        return "Toi co the giup ban tim khach san. Ban muon tim o khu vuc nao?\n"
            . "Vi du: \"Tim khach san o Da Nang\" hoac \"Phong duoi 500k dem\"\n\n"
            . $this->getPopularDestinations();
    }

    /**
     * Extract a location name from the message.
     */
    private function extractLocation(string $message, array $context): ?string
    {
        // Known Vietnamese destinations
        $destinations = [
            'da nang', 'nha trang', 'hoi an', 'ha noi', 'tp hcm', 'sai gon',
            'ho chi minh', 'da lat', 'phu quoc', 'hue', 'sapa', 'sa pa',
            'quy nhon', 'vung tau', 'halong', 'ha long', 'mui ne', 'phan thiet',
            'ninh binh', 'con dao', 'phan rang', 'buon ma thuot',
        ];

        foreach ($destinations as $dest) {
            if (str_contains($message, $dest)) {
                return $dest;
            }
        }

        // Try matching against database locations
        $words = explode(' ', $message);
        foreach ($words as $word) {
            $word = trim($word);
            if (mb_strlen($word) >= 3) {
                $location = Location::where('name', 'like', "%{$word}%")->first();
                if ($location) {
                    return $location->name;
                }
            }
        }

        // Use context if previously set
        return $context['location'] ?? null;
    }

    /**
     * Extract a maximum price from the message.
     */
    private function extractPrice(string $message): ?float
    {
        // Match patterns like "duoi 1 trieu", "nho hon 500k", "duoi 500000"
        if (preg_match('/(duoi|nho hon|it hon|khoang|toi|under|max)\s*(\d+)/', $message, $matches)) {
            $value = (float) $matches[2];
            // If value is small, assume it means millions
            if ($value <= 50 && str_contains($message, 'trieu')) {
                return $value * 1000000;
            }
            // If value is in the thousands range, assume VND
            if ($value >= 100) {
                return $value;
            }
            return $value * 100000;
        }

        // Match "500k" pattern
        if (preg_match('/(\d+)\s*k(\/|dem)*/i', $message, $matches)) {
            return (float) $matches[1] * 1000;
        }

        // Match "1 trieu" pattern
        if (preg_match('/(\d+)\s*trieu/i', $message, $matches)) {
            return (float) $matches[1] * 1000000;
        }

        return null;
    }

    /**
     * Extract the number of guests from the message.
     */
    private function extractGuests(string $message): ?int
    {
        if (preg_match('/(\d+)\s*(nguoi|khach|guest|people|person)/i', $message, $matches)) {
            return (int) $matches[1];
        }

        return null;
    }

    /**
     * Check if the message matches any of the given keywords.
     */
    private function matchesIntent(string $message, array $keywords): bool
    {
        foreach ($keywords as $keyword) {
            if (str_contains($message, $keyword)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get a list of popular destinations with recommendations.
     */
    private function getPopularDestinations(): string
    {
        $locations = Location::withCount('hotels')
            ->having('hotels_count', '>', 0)
            ->orderByDesc('hotels_count')
            ->take(5)
            ->get();

        if ($locations->isEmpty()) {
            return "Hien tai chua co dia diem nao. Vui long quay lai sau!";
        }

        $response = "Dia diem du lich pho bien:\n";
        foreach ($locations as $i => $location) {
            $response .= ($i + 1) . ". {$location->name} ({$location->hotels_count} khach san)\n";
        }

        $response .= "\nBan muon tim khach san o dia diem nao?";

        return $response;
    }

    /**
     * Format hotel search results into a readable response.
     */
    private function formatHotelResults(Collection $hotels): string
    {
        $response = "Toi tim thay " . $hotels->count() . " khach san phu hop:\n\n";

        foreach ($hotels as $hotel) {
            $minPrice = $hotel->roomTypes->min('price_per_night');
            $priceText = $minPrice ? number_format($minPrice) . ' VND/dem' : 'Lien he';
            $location = $hotel->location?->name ?? '';
            $starRating = $hotel->star_rating ? str_repeat('*', $hotel->star_rating) . ' ' : '';

            $response .= "- {$starRating}{$hotel->name}";
            if ($location) {
                $response .= " ({$location})";
            }
            $response .= "\n  Gia tu: {$priceText}\n";
        }

        $response .= "\nBan muon xem chi tiet khach san nao?";

        return $response;
    }
}
