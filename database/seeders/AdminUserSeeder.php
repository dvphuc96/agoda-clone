<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@gostay.local'],
            [
                'name' => 'GoStay Admin',
                'phone' => '0900000000',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'is_active' => true,
            ],
        );
    }
}
