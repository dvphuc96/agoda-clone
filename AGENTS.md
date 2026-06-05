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

# [agoda-clone] recent context, 2026-06-04 2:50pm GMT+7

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (12,683t read) | 1,512,391t work | 99% savings

### Jun 3, 2026
972 10:25p 🔵 Laravel Socialite package not installed
974 10:26p 🟣 Extended social login to registration page with Google and Facebook OAuth
975 " 🟣 Database migrations executed successfully for chat and social authentication features
976 " 🟣 Integrated chat widget into client layout for global access
977 10:37p 🔴 Fixed duplicate "My Bookings" navigation item and added admin redirect functionality
978 " 🔴 Fixed duplicate "My Bookings" navigation link and preparing admin redirect functionality
979 10:51p 🔴 Duplicate "my bookings" display removal requested
980 " 🟣 Admin account toggle redirect functionality requested
981 10:55p 🔴 Removed standalone "My Bookings" link from desktop top navigation bar
982 10:57p 🟣 Created notification dropdown component with real-time notification preview
983 " 🟣 Created notification dropdown component with lazy loading and badge count display
984 10:58p 🔄 Integrated NotificationDropdown component into Navbar and removed Bell icon from navbar imports
S425 Complete integration of showForm state for improved form management in CouponListPage (Jun 3 at 11:06 PM)
S426 Complete showForm state integration with proper submit button logic (Jun 3 at 11:07 PM)
S427 Complete showForm state integration in admin coupon management interface (Jun 3 at 11:07 PM)
S428 Click-to-apply coupon functionality for booking page (Jun 3 at 11:08 PM)
985 11:08p 🟣 Booking page coupon UX improvement proposed
986 11:15p 🟣 Booking page coupon selection UX improvement initiated
987 " 🔵 Backend coupon validation API structure identified
988 " 🔵 Coupon validation service logic identified
989 " 🔵 Coupon model validation methods identified
990 " 🟣 Available coupons API endpoint implemented
991 " 🟣 CouponController imports updated for available endpoint
992 11:16p 🟣 Available coupons API route registered
993 " 🔵 Frontend coupon API structure identified
994 " 🟣 Frontend available coupons API method added
995 11:17p 🟣 CouponInput component enhanced with click-to-apply functionality
996 " 🟣 Click-to-apply coupon feature completed and deployed
997 " 🔵 Backend directory not found
998 " 🔵 SEO meta tags missing
S429 Continue work on agoda-clone project - AvailabilityCalendar integration and polish features (Jun 3 at 11:17 PM)
### Jun 4, 2026
999 10:36a 🔵 GoStay platform missing features comprehensive analysis
1000 10:38a ⚖️ Feature gap implementation workflow organized
1001 10:40a 🔵 Booking expiry backend already implemented and scheduled
1002 10:44a 🟣 Partner booking management actions added
1003 " ✅ Hotel detail page prepared for availability calendar integration
1004 " ✅ Feature status documentation updated
S430 Create test data for all application pages (Jun 4 at 10:49 AM)
1005 10:51a 🔵 New task request: Create test data for all app pages
S431 Fix hotel detail page to hide "Check Availability" button when no dates selected (Jun 4 at 11:06 AM)
1006 11:07a 🔵 Database schema analysis for test data creation
1007 11:10a ⚖️ Break seeder task into smallest possible subtasks
S432 Check availability button and hotel check-in/check-out time display issues (Jun 4 at 11:29 AM)
S433 Profile image upload not displaying after upload (Jun 4 at 11:32 AM)
1008 11:41a 🔴 Profile image upload not displaying after upload
1009 1:24p 🔴 Profile image upload display issue investigation
1010 1:25p 🔴 Profile image upload state management bug discovered
1011 1:29p 🔴 Profile image upload storage symlink fixed
1012 1:30p 🔴 Image upload display issue in form
1013 1:53p 🔵 Laravel stateful API middleware configuration
1014 1:54p 🔵 Multiple file chooser dialogs triggered by upload component
1015 " 🔵 File upload component creating duplicate handlers
1016 1:55p 🔵 Application uses Laravel Sanctum authentication
1017 " 🔵 Backend API authentication validation functional
1018 1:57p 🔵 API authentication rejects valid database credentials
1019 " 🔵 Profile API routes identified for avatar uploads
1020 1:58p 🔵 Profile routes require Sanctum authentication
1021 " 🔵 AvatarUpload component uses FileReader for immediate preview
1022 1:59p 🔴 Fixed avatar upload preview not displaying immediately
S434 Fixed avatar upload preview not displaying immediately after file selection (Jun 4 at 2:00 PM)
**Investigated**: Investigated image upload display issue where uploaded avatar images were not showing before clicking save. Explored Laravel backend configuration (stateful API middleware, Sanctum authentication), profile routes (POST /api/profile/avatar requires auth:sanctum), and frontend AvatarUpload component implementation. Discovered during Playwright browser testing that the upload component was spawning 12 concurrent file chooser dialogs, suggesting a component bug, but the core issue was in state management.

**Learned**: - Application uses Laravel Sanctum with stateful API middleware and requires authentication for profile/avatar operations
    - AvatarUpload component uses FileReader for immediate local preview before server upload
    - Original component used `const displayUrl = preview || currentAvatarUrl` which computed display URL on each render
    - This computed approach caused preview to not show properly when component re-rendered due to parent state changes
    - Profile routes protected by auth:sanctum middleware require valid session tokens for file uploads

**Completed**: - Refactored AvatarUpload component in `/Users/dvphuc/dev/project/agoda-clone/frontend/src/client/components/profile/AvatarUpload.tsx`
    - Replaced computed displayUrl with dedicated `displayUrl` state initialized with currentAvatarUrl
    - Added `previewRef` useRef for persisting preview URL across re-renders
    - Optimized with `useCallback` on handleFileChange to prevent unnecessary re-renders
    - Added `useQueryClient` for updating React Query cache after successful uploads
    - TypeScript compilation passed with no errors

**Next Steps**: User needs to restart Vite dev server for the proxy `/storage` to take effect, then test the avatar upload functionality. The fix ensures: immediate preview display (FileReader data URL), preview persistence across component re-renders, and proper server image display after successful upload.


Access 1512k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>

# Rules

- Whenever you writing react code, please use react doctor• skill to find any issues and fix it.
