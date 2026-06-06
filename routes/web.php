<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\RobotsTxtController;

// SEO routes
Route::get('/sitemap.xml', [SitemapController::class, 'index']);
Route::get('/robots.txt', [RobotsTxtController::class, 'index']);

// SPA fallback — serve React app for all non-API routes
Route::view('/{any}', 'welcome')->where('any', '.*');
