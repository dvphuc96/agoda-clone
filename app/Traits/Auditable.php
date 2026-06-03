<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

trait Auditable
{
    protected static function bootAuditable(): void
    {
        static::created(function ($model) {
            if (Auth::check() && Auth::user()->role === 'admin') {
                AuditLog::log('created', $model, $model->getAttributes());
            }
        });

        static::updated(function ($model) {
            if (Auth::check() && Auth::user()->role === 'admin') {
                AuditLog::log('updated', $model, [
                    'old' => $model->getOriginal(),
                    'new' => $model->getChanges(),
                ]);
            }
        });

        static::deleted(function ($model) {
            if (Auth::check() && Auth::user()->role === 'admin') {
                AuditLog::log('deleted', $model, $model->getAttributes());
            }
        });
    }
}
