# Agent Instructions

Add project-specific agent instructions here.

<!-- HARNESS:BEGIN -->
## Harness

This repo uses Harness. Before work, read:

- `README.md`
- `docs/HARNESS.md`
- `docs/FEATURE_INTAKE.md`
- `docs/ARCHITECTURE.md`
- `scripts/harness query matrix`

Use the Rust Harness CLI as the main operational tool. Run it through the
stable repo-local entrypoint `scripts/harness`, which uses the prebuilt Rust
binary at `scripts/bin/harness-cli` in installed projects.
<!-- HARNESS:END -->


<claude-mem-context>
# Memory Context

# [agoda-clone] recent context, 2026-06-03 8:43am GMT+7

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (14,565t read) | 4,440,076t work | 100% savings

### May 29, 2026
S313 Deploy booking policies, refunds, and notifications system to production database (May 29 at 12:12 PM)
S314 Complete database migration and seeding for booking policies, refunds, and notifications (May 29 at 12:22 PM)
S315 Việc cải tiến bộ lọc tìm kiếm khách sạn - nâng cấp UI bộ lọc giá từ input số sang slider kéo chọn (May 29 at 12:24 PM)
S316 Cải tiến bộ lọc giá tìm kiếm khách sạn - nâng cấp UI từ input số sang slider kéo chọn với hai đầu min/max (May 29 at 4:31 PM)
S317 Plan and implement features from FEATURE_REPORT.md with branch creation and commits for each feature (May 29 at 4:40 PM)
### Jun 2, 2026
S318 Parallel Backend Implementation of Batch 1 Features for GoStay (Jun 2 at 10:04 AM)
S319 User initiated session with greeting "hi" (Jun 2 at 11:25 AM)
813 1:12p 🔴 Fixed coupon validation API response handling
814 " 🔴 Removed unused imports and types from admin coupon list page
S320 Implement complete coupon/promotion system with admin management and booking integration (Jun 2 at 3:42 PM)
817 3:47p 🔵 Coupon feature implementation staged for commit
818 3:48p 🔵 Coupon system architecture examined for task breakdown
819 3:50p 🔵 Coupon system API routes and frontend integration analyzed
820 " 🟣 Coupon feature task breakdown created with 8 tasks
821 3:52p 🔵 Coupon database migrations not yet executed
822 3:53p 🔵 Docker database container not running or doesn't exist
823 3:54p 🔵 Docker services started and database container healthy
824 " 🔵 Database migrations report nothing to migrate
825 3:55p 🟣 Coupon seed data created and populated
826 3:58p 🟣 Coupon seeder creation and execution completed successfully
827 4:00p 🟣 Task progression advanced to API endpoint testing phase
828 4:01p 🔴 CouponController middleware error discovered during API testing
829 4:02p 🔴 CouponController constructor syntax fixed
830 4:04p 🔵 Codebase constructor patterns analyzed for consistency
831 4:06p 🔴 CouponController middleware error persists after constructor fix
832 4:07p 🔴 CouponController converted to traditional constructor syntax
833 4:08p 🔵 CouponController middleware registration fundamentally non-functional
834 4:09p 🔵 Root cause identified: Base Controller class lacks middleware functionality
835 4:11p 🔴 CouponController refactored to work with codebase architecture
836 4:12p 🔵 Coupon validation route lacks authentication middleware protection
837 4:14p 🔴 Coupon validation route moved to authenticated middleware group
838 4:15p 🔵 Authentication middleware now functional but login route not named
839 4:18p 🔵 Authentication middleware functional across all protected routes
840 4:19p 🔵 All coupon routes properly registered in Laravel router
841 4:20p 🔵 Laravel 11 application configuration examined for middleware setup
842 4:22p 🔵 Laravel Sanctum installed but not configured in auth guards
843 4:23p 🔴 Sanctum authentication guard configuration added
844 4:25p 🔵 Sanctum guard configuration didn't resolve authentication errors
845 4:26p 🔵 Application code does not reference login route name
846 4:29p 🔴 Laravel Sanctum stateful API middleware configuration added
847 4:30p 🔵 Authentication issues persist despite Sanctum middleware configuration
848 4:33p 🔵 Hotels API endpoint functional, isolates authentication issue to protected routes
849 4:42p ✅ Coupon feature task breakdown completely removed for expedited completion
850 4:44p 🔴 Admin coupon show endpoint returns incorrect response structure
851 " 🔵 CouponSeeder successfully populates database
852 4:54p 🔴 Fixed "Route [login] not defined" error in unauthenticated API requests
853 " 🔵 Coupon validation API working correctly after authentication fix
854 " 🔴 Admin coupon management API functional with proper role-based access control
855 " 🔵 Coupon update validation error with unique rule parameter
856 4:56p 🔴 Modified UpdateCouponRequest to handle route parameter resolution
857 " 🔵 Database constraint violation during coupon update operations
858 " 🔵 Unique validation still incorrectly flagging existing coupon codes
859 4:58p 🔴 Fixed coupon update controller to handle partial field updates
860 " 🟣 Coupon management system fully functional with complete CRUD operations
861 " ✅ Cleaned up unnecessary middleware file
862 5:00p 🔄 Replaced deprecated onKeyPress event handler with onKeyDown
863 5:04p 🔵 Laravel application missing encryption key configuration
S321 Fix Laravel authentication login error "No application encryption key has been specified" (Jun 2 at 5:04 PM)
864 5:11p 🔵 Database constraint violation for duplicate location slug
S322 Fix database seeding duplicate constraint violation for locations table (Jun 2 at 5:17 PM)
**Investigated**: Investigated duplicate entry error for locations table slug constraint violation. Examined entrypoint.sh seeder logic, DatabaseSeeder.php and LocationSeeder.php structure.

**Learned**: Learned that entrypoint.sh was checking HOTEL_COUNT to determine if database is empty, but LocationSeeder runs before HotelSeeder in DatabaseSeeder, causing duplicate location entries on container restart. The logic should check LOCATION_COUNT instead since locations are seeded first.

**Completed**: Fixed entrypoint.sh seeder logic by changing from HOTEL_COUNT to LOCATION_COUNT check. This ensures that seeder only runs if no locations exist, preventing duplicate entry violations. Successfully tested restart showing "Nothing to migrate" and no duplicate errors.

**Next Steps**: Monitor container logs to ensure no duplicate constraint violations occur on future restarts


Access 4440k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>

# Rules

- Whenever you writing react code, please use react doctor• skill to find any issues and fix it.
