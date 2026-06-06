<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'rating' => $this->rating,
            'title' => $this->title,
            'comment' => $this->comment,
            'images' => $this->images ?? [],
            'status' => $this->status,
            'user' => $this->whenLoaded('user', fn () => [
                'name' => $this->user->name,
                'avatar' => $this->user->avatar,
            ]),
            'hotel_name' => $this->whenLoaded('hotel', fn () => $this->hotel->name),
            'owner_response' => $this->when($this->owner_response, [
                'text' => $this->owner_response,
                'responded_at' => $this->owner_responded_at?->toIso8601String(),
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
