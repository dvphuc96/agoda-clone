<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

class RobotsTxtController extends Controller
{
    public function index(): Response
    {
        $baseUrl = config('app.url');

        $content = <<<TXT
User-agent: *
Allow: /
Disallow: /api/

Sitemap: {$baseUrl}/sitemap.xml
TXT;

        return response($content, 200)->header('Content-Type', 'text/plain');
    }
}
