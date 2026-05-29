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

# [agoda-clone] recent context, 2026-05-29 8:32am GMT+7

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 34 obs (9,455t read) | 2,381,378t work | 100% savings

### May 28, 2026
550 10:08a ⚖️ Structured brainstorming workflow created for Agoda clone project
551 10:10a 🔵 Project structure and harness framework discovered for Agoda clone
552 10:12a 🟣 Visual companion server infrastructure deployed for Agoda clone
553 10:20a 🔵 Visual companion server re-established after timeout
554 10:25a 🔵 Technology stack version research for Laravel and React
555 10:31a 🔵 UI library popularity data collected for tech stack decision
556 10:57a ⚖️ Approved v3 color scheme combining Abogo aesthetic with blue/gold accents
557 11:20a ⚖️ Approved comprehensive design specification for VietStay booking platform
558 11:23a ✅ Created comprehensive Laravel 13 backend implementation plan for VietStay
559 11:31a ⚖️ Approved parallel implementation with 2 sub-agents
560 11:32a 🟣 Implemented Laravel API Resources and hotel detail functionality
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
S291 Project rebranding from VietStay to GoStay across codebase (May 28 at 12:24 PM)
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
S300 Continue debugging "l?.map is not a function" TypeError (May 28 at 3:29 PM)
**Investigated**: Previous session fixed similar "e?.slice(...)?.map is not a function" error by updating frontend API response handling and removing JsonResponse type hints from backend controllers. Frontend now accesses r.data.data for paginated responses.

**Learned**: Error persists with different variable name ("l" instead of "e"), suggesting another component has similar array/map issue or frontend changes not fully applied.

**Completed**: Previous fixes included: removed axios interceptor, updated LocationGrid/HeroSearch/FeaturedHotels/HotelDetailPage components, fixed backend controller return type hints, confirmed API returns correct {data:[...]} format.

**Next Steps**: Need to identify which component is throwing the "l?.map is not a function" error and apply similar fixes for accessing paginated data correctly.


Access 2381k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>

# Rules

- Whenever you writing react code, please use react doctor• skill to find any issues and fix it.
