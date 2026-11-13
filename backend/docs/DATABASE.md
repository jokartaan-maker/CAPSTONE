# قاعدة البيانات – CAPSTONE

## إصلاحات الـ ERD المطبّقة في الـ migrations

| الجدول | الإصلاح | السبب |
|---|---|---|
| `deadlines` | `team_id` أصبح اختياريًا، وأُضيف `academic_term_id` و`description` | الموعد إما عام للفصل كله (تحدده اللجنة UC-27، `team_id = NULL`) أو خاص بفريق (يحدده المشرف UC-43) |
| `evaluation_criteria` | أُضيف `academic_term_id` و`max_score` | المعايير خاصة بكل فصل |
| `evaluation_scores` | أُضيف `weight` (لقطة من وزن المعيار) | تعديل المعيار لاحقًا لا يغيّر التقييمات القديمة (UC-46) |
| `evaluations` | أُضيف `status` (draft / final) | المسودة مخفية عن الطلاب (UC-22) |
| `discussion_schedules` | تدفق الحالة: proposed ← scheduled ← completed / cancelled | المشرف يقترح (UC-44) واللجنة تعتمد (UC-34) مع بقاء مناقشة واحدة لكل فريق |
| `notifications`، `audit_logs` | `entity_id` أصبح BIGINT | كان INT بينما كل المعرّفات BIGINT |
| `join_requests` | عمود مولَّد `pending_key` + قيد UQ، وأُضيف `message` و`decision_reason` | يمنع طلبين معلّقين لنفس الطالب ونفس الفريق (UC-42)، ويسمح بإعادة الطلب بعد الرفض |
| `evaluations` | `student_key` عمود مولَّد `COALESCE(student_id, 0)` | يجعل قيد عدم التكرار يعمل مع التقييم الجماعي (student_id = NULL) |
| `similarity_checks` | أُضيف `limited_check`، و`similarity` يقبل NULL | علامة «فحص محدود» عند تعطل خدمة المعنى |
| `submission_versions` | أُضيف `is_late` | تمييز الإصدار المرفوع بعد الموعد |
| `import_batches` | أُضيف `skipped_rows` | الصفوف المكررة المتجاوزة في ملخص الاستيراد (UC-40) |
| `users` | ENUM لـ `registration_status` و`requested_role` | توحيد القيم |

## قيم ENUM (مصدرها الوحيد: `app/Enums`)

| الحقل | القيم |
|---|---|
| users.registration_status | pending, approved, rejected |
| users.requested_role | student, supervisor, committee |
| academic_terms.term_name | first, second, summer |
| academic_terms.status | upcoming, active, closed |
| ideas.source | supervisor, student, import |
| ideas.status | draft, pending_review, needs_modification, approved, rejected, withdrawn, archived |
| ideas.supervisor_status | pending, accepted, declined |
| similarity_checks.check_type | precheck, review |
| similarity_checks.band | clear, needs_review |
| similarity_checks.decision | actual_duplicate, extension, permitted_similarity |
| committee_recommendations.type | supervisor_assignment, general |
| committee_recommendations.status | pending, accepted, rejected |
| teams.status | forming, active, completed, archived |
| team_members.role_in_team | leader, member |
| join_requests.status | pending, accepted, rejected, cancelled |
| tasks.priority | low, medium, high |
| tasks.status / task_updates.* | new, in_progress, for_review, completed, overdue |
| deadlines.submission_type / submissions.type | proposal, progress_report, final_report, presentation, source_code, other |
| deadlines.status | open, closed |
| submissions.status | not_submitted, submitted, late, needs_changes, reviewed |
| feedback.status | open, in_progress, addressed, closed |
| feedback_responses.status | submitted, seen |
| evaluation_criteria.scope | team, member |
| evaluations.evaluation_type | team, individual |
| evaluations.evaluator_role | supervisor, committee |
| evaluations.status | draft, final |
| discussion_schedules.status | proposed, scheduled, completed, cancelled |
| discussion_committee.role_in_committee | chair, member, supervisor |
| notifications.channel | in_app, email, both |

لكل Enum دالة `label()` تعيد الاسم العربي، و`values()` و`rule()` للتحقق: `'status' => ['required', TaskStatus::rule()]`.

## قواعد العمل (config/capstone.php ← system_settings)

| الإعداد | القيمة الافتراضية |
|---|---|
| teams.max_members | 5 |
| teams.supervisor_max_teams | 6 |
| files.max_size_mb | 20 |
| files.allowed_extensions | pdf, doc, docx, ppt, pptx, xls, xlsx, zip, rar, png, jpg, jpeg |
| submissions.late_policy | mark_late (يُقبل ويُعلَّم متأخرًا) |
| reminders.hours_before | 48، 24 |
| discussions.default_duration_minutes | 30 |
| similarity.semantic_threshold / lexical_threshold / top_k | 0.80 / 0.60 / 5 |

القراءة في الكود: `Settings::get('teams.max_members')`.

## الأدوار

`student`، `supervisor`، `committee`، `admin` — والصلاحيات في `RolesAndPermissionsSeeder` مطابقة لمصفوفة الصلاحيات في التقرير.
