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

# [agoda-clone] recent context, 2026-05-29 11:30am GMT+7

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (14,228t read) | 3,525,866t work | 100% savings

### May 28, 2026
S300 Continue debugging "l?.map is not a function" TypeError (May 28 at 3:27 PM)
S301 Install react-doctor in agoda-clone project (May 28 at 3:29 PM)
### May 29, 2026
S302 React code quality improvements and react-doctor fixes (May 29 at 8:58 AM)
604 9:39a ✅ React 19 migration in AuthContext
605 " ✅ localStorage key versioning for auth data
606 " 🔄 Code quality fixes across frontend codebase
614 9:42a ⚖️ Milestone-based sequential development approach selected
607 " 🔄 useI18n hook React 19 migration
608 " 🔄 Intl formatter performance optimization in adminUtils
609 9:43a 🔄 Intl formatter caching in i18n format utilities
610 9:44a 🔄 PriceSummary formatting optimization
611 " ✅ Accessibility improvement in ImageGallery fallback
612 9:45a 🔵 TypeScript configuration missing at project root
613 9:47a 🔵 TypeScript compilation successful with frontend project path
S305 Parallel agent execution strategies using tmux and git worktrees (May 29 at 9:47 AM)
616 " 🔵 Business gap analysis identifies 12 critical capabilities needed for production booking platform
S306 Understanding tmux vs Claude Code sub-agent orchestration for parallel work (May 29 at 9:56 AM)
S303 React code quality improvements and tmux parallel agent execution (May 29 at 9:56 AM)
S304 Parallel agent execution workflow using tmux (May 29 at 9:56 AM)
S307 tmux troubleshooting and alternative setup methods (May 29 at 10:26 AM)
615 10:28a 🔵 Project milestone documentation structure identified
S308 tmux parallel agent execution setup troubleshooting (May 29 at 10:40 AM)
617 10:51a ✅ Frontend development work initiated for M1 Admin MVP completion
618 10:52a ✅ Admin MVP frontend feature requirements identified
619 " 🟣 Milestone 2 Booking & Payment Real Flow Implementation Plan
620 10:53a 🔵 Admin API structure already supports required detail and pagination functionality
621 10:54a 🔵 Current API Structure Analysis
622 " 🔵 Current booking admin page missing detail modal and required filters
623 " 🔵 Admin Room Type API Pattern Analysis
624 " 🔵 Room Type admin uses side panel instead of modal per MVP requirements
625 10:55a 🔵 Model and Resource Structure Analysis
626 " 🔵 User admin page missing detail modal and booking history display
627 10:56a 🔵 Database Schema Structure Analysis
628 " 🔵 DataTable component lacks pagination controls required for M1 MVP
629 10:57a 🔵 User and Location Database Schema Analysis
632 " ⚖️ Brainstorming skill invoked for M1 Admin MVP frontend implementation
630 10:58a 🔵 Request Validation and Database Seeding Analysis
631 " 🔵 Database Seeding Structure and Service Layer Analysis
633 10:59a 🔵 Complete Laravel Backend Structure Analysis
634 11:00a 🟣 Reusable Pagination component created for admin tables
635 " 🔵 Room Type Detail API Implementation Strategy Discovery
636 11:01a 🟣 Booking admin enhanced with detail modal and comprehensive filters
637 11:02a 🟣 Room Type Detail API Implementation
638 11:03a 🟣 Payment admin enhanced with detail modal and date range filters
639 " 🟣 Admin Endpoint Filtering Enhancement
640 11:05a 🟣 Hotel admin enhanced with comprehensive filters and image management
641 11:06a 🟣 Database Testing Factories Implementation
643 11:07a 🟣 Room Type admin converted to modal with labeled inputs and image management
642 " 🔵 Database Bed Type Constraint Discovery
644 11:08a 🔴 Database Constraint Alignment for Testing Infrastructure
645 11:20a ✅ Admin UI loading text updated with proper ellipsis character
646 11:21a ✅ Completed admin UI loading text standardization across all list pages
S309 Admin MVP frontend completion - loading text standardization across admin list pages (May 29 at 11:22 AM)
647 11:24a 🔵 Admin bookings page successfully loaded in browser testing
648 11:25a 🔵 Admin authentication redirection confirmed during browser testing
649 11:26a 🔵 Admin user credentials identified in database seeder
650 11:27a 🔴 Syntax error in BookingListPage.tsx causing Vite compilation failure
651 " 🔴 Fixed BookingListPage.tsx ternary operator syntax error
652 11:28a 🔴 Fixed syntax errors in PaymentListPage and UserListPage detail modals
653 11:29a 🔵 Admin pages successfully rendering after syntax fixes

Access 3526k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>

# Rules

- Whenever you writing react code, please use react doctor• skill to find any issues and fix it.
