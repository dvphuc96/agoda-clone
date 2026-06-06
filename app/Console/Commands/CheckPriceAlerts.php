<?php

namespace App\Console\Commands;

use App\Services\PriceAlertService;
use Illuminate\Console\Command;

class CheckPriceAlerts extends Command
{
    protected $signature = 'price-alerts:check';

    protected $description = 'Check price alerts and notify users';

    public function handle(PriceAlertService $service): int
    {
        $count = $service->checkAndNotify();

        $this->info("Sent {$count} price alert notifications.");

        return self::SUCCESS;
    }
}
