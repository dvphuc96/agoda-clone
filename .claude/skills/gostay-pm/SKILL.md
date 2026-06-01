---
name: gostay-orchestrator
description: Orchestrator skill cho GoStay team. Điều phối frontend-dev, backend-dev, và QA agents để hoàn thành milestones. Phân task, theo dõi progress, resolve blockers. Triggers: "run team", "coordinate", "start milestone", "execute plan", "run agents", "team work", "orchestrate", "m1", "m2", "milestone", "deadline", "sprint". Thêm: "re-run", "update", "modify", "continue", "resume", "pick up where we left off".
---

# GoStay Orchestrator

## Phase 0: Context Check

1. Kiểm tra `_workspace/` folder:
   - Tồn tại + user muốn continue → **resume** từ checkpoint cuối
   - Tồn tại + user đưa input mới → **new run** (rename `_workspace/` → `_workspace_prev/`)
   - Không tồn tại → **initial run**

2. Đọc plan documents nếu user reference milestones
3. Kiểm tra TaskList cho pending tasks từ session trước

## Phase 1: Task Breakdown

### Input
- Plan document path (ví dụ: `docs/superpowers/plans/2026-05-29-m1-admin-mvp-completion.md`)
- Hoặc user verbal description

### Classification
Với mỗi task trong plan, classify:

| Type | Agent | Example |
|------|-------|---------|
| Frontend-only | frontend-dev | Modal, filter UI, pagination |
| Backend-only | backend-dev | New API endpoint, migration |
| Full-stack | BE first → FE after | New feature cần cả API + UI |
| QA | qa | Review, test sau khi dev xong |

### Dependency Mapping
- Backend tasks block frontend tasks khi frontend cần API mới
- Dev tasks block QA tasks
- Independent tasks có thể chạy parallel

### Task Creation Format
```
Subject: [M1-T1] Booking detail modal
Description: Thêm detail modal cho booking row...
Owner: frontend-dev
BlockedBy: (nếu cần backend API trước)
```

## Phase 2: Team Assembly

### Execution Mode: Agent Team (default)

```
TeamCreate(team_name: "gostay-sprint")
├── Agent(frontend-dev) — model: opus
├── Agent(backend-dev) — model: opus
└── Agent(qa) — model: opus
```

### Team Communication Protocol
- PM gửi task qua SendMessage kèm file paths cụ thể
- Dev báo complete qua TaskUpdate + SendMessage cho PM
- Dev cần cross-team change → SendMessage cho dev kia + CC PM
- QA báo kết quả qua SendMessage cho PM + dev nếu có issues

## Phase 3: Execution

### Sequencing
1. **Backend tasks first** (nếu frontend cần API)
2. **Frontend tasks** (sau khi backend ready)
3. **Parallel tasks** (independent frontend/backend)
4. **QA batch** (sau mỗi task hoặc batch)

### Progress Tracking
- Mỗi agent append vào `_workspace/progress.md`:
  ```
  [FRONTEND-DEV] Booking detail modal - DONE - 10:30
  [BACKEND-DEV]  Room type API endpoint - IN PROGRESS - 10:35
  ```
- PM monitor TaskList mỗi 5 phút

### Error Recovery
- Agent block → PM assess, reassign hoặc simplify
- Build fail → agent tự fix, nếu quá 2 lần → PM escalate
- Test fail → dev fix, QA re-verify

## Phase 4: Completion

1. QA chạy final review toàn bộ milestone
2. PM tổng hợp progress report
3. Cleanup team resources
4. Report cho user: completed tasks + remaining + issues

## Error Handling

| Scenario | Action |
|----------|--------|
| Agent unresponsive | Retry 1 lần, nếu vẫn fail → skip task, log |
| Build fail | Agent tự fix, max 2 attempts → escalate |
| Test fail | Dev fix → QA re-verify |
| Merge conflict | PM guide resolution |

## Test Scenarios

### Happy Path
1. User: "Chạy M1 — Admin MVP Completion"
2. Orchestrator reads plan, creates 6 tasks, assigns agents
3. Backend dev completes API tasks → frontend dev picks up UI tasks
4. QA reviews each completed task
5. Final report: all tasks pass

### Error Path
1. Backend API fails to build → PM notified
2. PM reassigns or simplifies task
3. Frontend continues with mock data while backend fixes
4. QA notes the mock vs real discrepancy

## After Completion

- Hỏi user feedback
- Update CLAUDE.md change history
- Clean up `_workspace/` if user confirms
