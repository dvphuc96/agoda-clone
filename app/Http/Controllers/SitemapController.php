<?php

namespace App\Http\Controllers;

use App\Models\Hotel;
use App\Models\Location;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $xml = Cache::remember('sitemap.xml', now()->addDay(), function () {
            $baseUrl = config('app.url');
            $lines = [];

            $lines[] = '<?xml version="1.0" encoding="UTF-8"?>';
            $lines[] = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

            // Static pages
            $lines[] = $this->buildUrl("{$baseUrl}/", '1.0', 'daily', now()->toIso8601String());
            $lines[] = $this->buildUrl("{$baseUrl}/search", '0.9', 'daily', now()->toIso8601String());

            // Locations
            $locations = Location::all();
            foreach ($locations as $location) {
                $lines[] = $this->buildUrl(
                    "{$baseUrl}/search?location={$location->slug}",
                    '0.6',
                    'monthly',
                    $location->updated_at->toIso8601String()
                );
            }

            // Hotels
            $hotels = Hotel::where('status', 'active')->with('location')->get();
            foreach ($hotels as $hotel) {
                $lines[] = $this->buildUrl(
                    "{$baseUrl}/hotel/{$hotel->slug}",
                    '0.8',
                    'weekly',
                    $hotel->updated_at->toIso8601String()
                );
            }

            $lines[] = '</urlset>';

            return implode("\n", $lines);
        });

        return response($xml, 200)->header('Content-Type', 'application/xml');
    }

    private function buildUrl(string $loc, string $priority, string $changefreq, string $lastmod): string
    {
        return <<<XML
  <url>
    <loc>{$loc}</loc>
    <lastmod>{$lastmod}</lastmod>
    <changefreq>{$changefreq}</changefreq>
    <priority>{$priority}</priority>
  </url>
XML;
    }
}
