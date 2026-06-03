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
            'status' => $this->status,
            'user' => $this->whenLoaded('user', fn () => [
                'name' => $this->user->name,
                'avatar' => $this->user->avatar,
            ]),
            'hotel_name' => $this->whenLoaded('hotel', fn () => $this->hotel->name),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
