<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'bookings.view', 'bookings.manage',
            'hotels.view', 'hotels.manage',
            'room-types.view', 'room-types.manage',
            'payments.view', 'payments.refund',
            'refunds.view', 'refunds.manage',
            'users.view', 'users.manage',
            'reviews.view', 'reviews.moderate',
            'coupons.view', 'coupons.manage',
            'policies.view', 'policies.manage',
            'transfers.view', 'transfers.manage',
            'support.view', 'support.manage',
            'analytics.view',
            'locations.view', 'locations.manage',
            'audit-logs.view',
            'modifications.view', 'modifications.manage',
            'price-overrides.view', 'price-overrides.manage',
            'invoices.view', 'invoices.generate',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        $roles = [
            'super_admin' => $permissions,
            'admin' => array_values(array_diff($permissions, ['users.manage'])),
            'content_manager' => ['hotels.view', 'hotels.manage', 'room-types.view', 'room-types.manage', 'locations.view', 'locations.manage', 'price-overrides.view', 'price-overrides.manage'],
            'support_agent' => ['bookings.view', 'support.view', 'support.manage', 'reviews.view', 'reviews.moderate', 'refunds.view'],
            'partner' => ['hotels.view', 'room-types.view', 'room-types.manage', 'bookings.view', 'price-overrides.view', 'price-overrides.manage', 'reviews.view'],
            'user' => [],
        ];

        foreach ($roles as $roleName => $rolePerms) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            $role->syncPermissions(array_values($rolePerms));
        }

        // Assign roles to existing users based on role column
        $admins = \App\Models\User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $admin->assignRole('super_admin');
        }
    }
}
