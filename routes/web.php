<?php

use Illuminate\Support\Facades\Route;

// SPA fallback — serve React app for all non-API routes
Route::view('/{any}', 'welcome')->where('any', '.*');
