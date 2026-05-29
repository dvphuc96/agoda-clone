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

# [agoda-clone] recent context, 2026-05-29 9:46am GMT+7

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (12,364t read) | 3,199,224t work | 100% savings

### May 28, 2026
561 11:43a 🟣 Implemented authentication pages with form validation and error handling
562 11:46a 🟣 Implemented booking system with service layer, API endpoints, and frontend components
563 11:49a 🟣 Docker containerization for frontend and backend services
564 12:16p 🟣 Multi-stage Dockerfile for React frontend
565 " 🟣 Docker Compose orchestration for full-stack application
566 " 🟣 Frontend Docker build optimization with ignore rules
567 12:17p 🔵 Application environment configuration verified
568 " ✅ Docker environment configuration file created
569 12:18p ✅ Docker build environment configuration automation
570 " 🔐 Docker environment file excluded from version control
571 12:20p ✅ Database service reconfiguration and credentials standardization
572 12:21p ✅ Complete Docker Compose database service refactoring
573 12:22p ✅ Database directories and environment configuration synchronized
574 " ✅ Database connection check simplified in entrypoint script
575 1:42p ✅ Project branding rename from VietStay to GoStay initiated
S292 Complete project rebranding from VietStay to GoStay (May 28 at 1:43 PM)
576 1:44p ✅ Docker Compose configuration rebranded from VietStay to GoStay
577 1:46p ✅ Comprehensive project rebranding from VietStay to GoStay completed
S293 Project rebranding completion with Docker infrastructure ready for testing (May 28 at 1:49 PM)
S294 GoStay Admin Dashboard specification design (May 28 at 1:52 PM)
S295 Admin frontend architecture discussion and terminology standardization (May 28 at 1:53 PM)
578 1:57p ✅ Admin dashboard specification translated to English
579 1:59p ⚖️ Admin frontend architecture decision questioned
S296 Rebuild and run migrate but still getting errors (May 28 at 2:01 PM)
580 2:03p 🔵 Destination terminology scope analysis for Location rename
S297 Rebuild and run migrate but still getting errors (May 28 at 2:07 PM)
S298 API response handling fix for "e?.slice(...)?.map is not a function" error (May 28 at 3:06 PM)
581 3:09p 🔴 LocationController index() return type mismatch
S299 API response format fix - backend container needs rebuild (May 28 at 3:22 PM)
582 3:23p 🔴 Removed JsonResponse type hints from controller methods returning Resource collections
583 3:24p 🔵 API endpoint /api/locations now returns correct data format
S300 Continue debugging "l?.map is not a function" TypeError (May 28 at 3:27 PM)
598 4:57p 🔵 Admin Dashboard Implementation Status Assessment
### May 29, 2026
585 8:57a ✅ Installed react-doctor v0.2.11 in agoda-clone
S301 Install react-doctor in agoda-clone project (May 29 at 8:58 AM)
586 9:12a 🔵 React Doctor playbook successfully fetched
587 9:14a 🔵 Project structure identified as Laravel + React application
588 " 🔵 React 19.2.6 frontend with modern stack discovered
589 " 🔵 React Doctor diagnostics executed successfully
590 " 🔵 Diagnostic issues organized into 6 prioritized tasks
591 9:15a 🔵 Component files located in @/components/ui/ directory
592 9:16a 🔵 Only-export-components errors identified as false positives
593 " 🔵 AdminModal component contains redundant size-axes issue
594 " ✅ Redundant Tailwind size-axes fixes implemented in admin components
595 9:17a ✅ Comprehensive Tailwind size-axes optimization completed across frontend components
596 9:19a 🔴 Task 2 completed: comprehensive Tailwind size-axes optimization
597 9:22a ✅ Accessibility improvements initiated for form controls missing labels
599 9:25a 🔴 react-doctor source code fix
600 9:36a 🔵 Agoda Clone Architecture Analysis
601 " 🔴 React Button Type Attribute Fix
602 9:37a 🔴 Comprehensive Button Type Attribute Fix
603 9:38a 🔵 React Doctor Diagnostics Analysis
604 9:39a ✅ React 19 migration in AuthContext
605 " ✅ localStorage key versioning for auth data
606 " 🔄 Code quality fixes across frontend codebase
607 9:42a 🔄 useI18n hook React 19 migration
608 " 🔄 Intl formatter performance optimization in adminUtils
609 9:43a 🔄 Intl formatter caching in i18n format utilities
610 9:44a 🔄 PriceSummary formatting optimization
611 " ✅ Accessibility improvement in ImageGallery fallback

Access 3199k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>

# Rules

- Whenever you writing react code, please use react doctor• skill to find any issues and fix it.
