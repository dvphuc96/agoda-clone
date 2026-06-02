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

# [agoda-clone] recent context, 2026-06-02 8:53am GMT+7

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (11,918t read) | 4,855,331t work | 100% savings

### May 29, 2026
S307 tmux troubleshooting and alternative setup methods (May 29 at 10:26 AM)
S308 tmux parallel agent execution setup troubleshooting (May 29 at 10:40 AM)
S309 Admin MVP frontend completion - loading text standardization across admin list pages (May 29 at 10:44 AM)
S310 Admin MVP frontend bug fixes - resolved syntax errors in detail modals (May 29 at 11:22 AM)
S311 Frontend implementation Phase A tasks: Add notifications page, admin refunds management, admin policies management, and navigation updates (May 29 at 11:31 AM)
683 11:45a 🔵 Task breakdown initiated for Business Phase A backend implementation
684 " ⚖️ Business Phase A frontend tasks organized into structured task list
685 11:46a 🔵 Service layer, validation, and controller architecture tasks defined for Business Phase A
686 11:47a 🔵 Task 1 execution started with comprehensive pattern analysis
687 " 🟣 Business Phase A implementation task breakdown completed
688 11:48a 🟣 API client infrastructure created for Phase A features
689 " 🟣 Database migrations created for Business Phase A core tables
690 11:49a 🟣 Admin API methods and i18n infrastructure extended
691 11:50a 🟣 Eloquent models implemented with relationships for Business Phase A
693 11:52a 🟣 Service layer implementation completed for cancellation policy and refund workflow
692 " 🟣 Task 1 completed with bilingual i18n infrastructure
694 11:53a 🟣 Customer booking detail enhanced with cancellation policy and refund workflow
695 " 🟣 Notifications page created and integrated into routing
696 11:54a 🟣 API Resources and Form Requests implemented for Business Phase A
S312 Backend development for Business Phase A - booking policies, refunds, and notifications (May 29 at 11:56 AM)
697 11:56a 🟣 Controllers and routes implemented for Business Phase A admin and user workflows
698 11:58a 🟣 Test infrastructure implemented for Business Phase A with comprehensive test coverage
699 12:01p 🔴 RefundController updateStatus method return type corrected
700 " 🔵 Booking policy creation tests failing with null returns
701 12:07p 🔴 BookingPolicyController store method return type corrected
702 12:08p 🔴 BookingPolicyTest assertions updated for store endpoint
703 " 🔄 BookingPolicyTest cancellation assertions refactored
704 12:10p 🔵 BookingPolicyTest cancellation test returning null data
705 " 🔴 BookingPolicyTest create policy test assertions reverted
706 12:12p 🔵 booking_policies table not found in database
S313 Deploy booking policies, refunds, and notifications system to production database (May 29 at 12:12 PM)
S314 Complete database migration and seeding for booking policies, refunds, and notifications (May 29 at 12:22 PM)
S315 Việc cải tiến bộ lọc tìm kiếm khách sạn - nâng cấp UI bộ lọc giá từ input số sang slider kéo chọn (May 29 at 12:24 PM)
708 1:09p 🔵 Frontend-backend contract mismatches identified in Business Phase A code review
709 1:12p 🔴 TDD approach applied to Business Phase A code review issues - failing tests written first to identify exact problems
710 1:15p 🔴 Business Phase A code review issues fixed with TDD approach - all critical and important items resolved
712 1:18p 🔴 Fixed boolean truthiness check for gateway_response in payment detail
713 " 🔄 Replaced barrel imports with direct imports for better tree-shaking
714 " 🔵 React Doctor analysis revealed code quality opportunities
715 1:33p 🔵 PHP syntax validation passed for all code files
716 " 🔵 Test execution blocked by database connectivity issues
717 " 🔵 Laravel test suite passed completely with elevated database permissions
720 1:34p 🔵 Worker agent dispatched to fix Business Phase A code review issues
718 1:35p 🔵 Laravel tests require both APP_KEY and database connectivity to pass
719 " ✅ Code review fixes validated through comprehensive testing
721 1:37p ✅ Code review fixes completed and documented in project trace system
722 1:39p ✅ Admin user password changed for database seeding
723 1:44p 🔴 Business Phase A code review issues successfully resolved
724 " ✅ Admin user credentials updated and database successfully reset
725 1:47p 🔴 API resource response handling fixed in bookings API
726 1:49p 🔵 User requested information about obtaining 3 specific data sources
727 3:21p 🟣 Payment gateway credentials configured and services restarted
728 3:32p 🟣 MoMo payment gateway integration successfully functional
729 3:49p ✅ Room price data reset to 1 đồng for testing
730 3:52p ✅ Full database reset completed with new pricing structure
731 3:55p 🔴 MoMo payment minimum amount constraint resolved
732 4:17p 🔴 MoMo payment creation failing due to amounts below minimum threshold
733 4:20p 🔴 MoMo minimum transaction amount debugging and full database reset
734 4:27p 🟣 Enhanced hotel search filtering with types and amenities
S316 Cải tiến bộ lọc giá tìm kiếm khách sạn - nâng cấp UI từ input số sang slider kéo chọn với hai đầu min/max (May 29 at 4:40 PM)
**Investigated**: Đã khám phá và nâng cấp UI bộ lọc giá trong SearchFilters component từ input dạng số sang slider kéo chọn. Kiểm tra hiệu năng Intl.NumberFormat và các best practices React về hoisting constants. Tìm hiểu useReducer pattern cho managing complex state trong React components.

**Learned**: Học được rằng Intl.NumberFormat constructor tạo nhiều objects cho mỗi locale lookup, nên nên hoist lên module scope để tối ưu hiệu suất. Hiểu rõ hơn về useReducer pattern cho managing complex filter state so với multiple useState calls. Biết cách cải thiện UX với slider dual-range cho price filtering.

**Completed**: Hoàn thành việc chuyển đổi bộ lọc giá từ input dạng số sang slider kéo chọn với hai thanh trượt (min/max). Thêm priceFormatter constant để tối ưu hiệu suất format tiền tệ. Thêm các helper functions (clampPrice, priceValue, formatPrice) cho việc xử lý giá trị price bounds. React Doctor score duy trì ở 98/100 sau khi fix warning về Intl.NumberFormat. Build frontend thành công không lỗi.

**Next Steps**: Sau khi React Doctor báo kết quả tốt (98/100) và build thành công, session đang ở trạng thái chờ user request tiếp theo. Không có task đang được active làm. Các remaining warnings (3 issues) đều là pre-existing không liên quan đến work vừa làm: recharts dynamic import, RoomTypeListPage useState pattern, và BookingDetailPage component size.


Access 4855k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>

# Rules

- Whenever you writing react code, please use react doctor• skill to find any issues and fix it.
