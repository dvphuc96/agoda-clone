<?php

namespace App\Http\Resources;

use App\Support\ImageUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LocationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'image' => ImageUrl::resolve($this->image),
            'description' => $this->description,
            'region' => $this->region,
            'hotels_count' => $this->whenCounted('hotels'),
        ];
    }
}
