<?php

namespace Database\Seeders;

use App\Models\AcademicTerm;
use App\Models\Idea;
use App\Models\Supervisor;
use Illuminate\Database\Seeder;

class IdeaSeeder extends Seeder
{
    public function run(): void
    {
        $current  = AcademicTerm::where('is_current', true)->firstOrFail();
        $previous = AcademicTerm::where('is_current', false)->firstOrFail();

        $khaled = Supervisor::where('email', 'k.ismail@aspu.edu.sy')->firstOrFail();
        $sara   = Supervisor::where('email', 's.alhassan@aspu.edu.sy')->firstOrFail();
        $mazen  = Supervisor::where('email', 'm.daher@aspu.edu.sy')->firstOrFail();

        $ideas = [
            // ---------- معتمدة في الفصل الحالي (يراها الطالب) ----------
            [
                'code' => 'IDEA-001', 'status' => 'approved', 'term' => $current, 'supervisor' => $khaled,
                'title' => 'نظام إدارة العيادات الذكي',
                'field' => 'هندسة البرمجيات',
                'description' => 'منصة لإدارة مواعيد المرضى والسجلات الطبية ولوحة تحكم تحليلية للعيادة.',
                'problem' => 'تعتمد عيادات كثيرة على الورق أو أنظمة متفرقة، فتتضارب المواعيد ويصعب الوصول لتاريخ المريض.',
                'features' => ['حجز المواعيد وتذكيرات تلقائية', 'سجل طبي موحد لكل مريض', 'لوحة تحكم بالإحصائيات', 'صلاحيات للطبيب والمساعد'],
                'requirements' => ['تحليل متطلبات مع عيادة حقيقية', 'تصميم قاعدة بيانات تحفظ سرية البيانات', 'نموذج عملي قابل للاستخدام', 'تقرير تقني نهائي'],
                'tech_stack' => ['Laravel', 'React', 'MySQL'],
                'tags' => ['Laravel', 'React'],
                'approved_at' => '2026-10-28',
            ],
            [
                'code' => 'IDEA-002', 'status' => 'approved', 'term' => $current, 'supervisor' => $sara,
                'title' => 'كشف الأخبار المضللة باللغة العربية',
                'field' => 'الذكاء الاصطناعي',
                'description' => 'نموذج تعلم آلي يصنّف الأخبار العربية إلى موثوقة ومضللة مع شرح سبب التصنيف.',
                'problem' => 'تنتشر الأخبار المضللة بسرعة على وسائل التواصل، وأدوات الكشف المتوفرة تدعم العربية بشكل ضعيف.',
                'features' => ['جمع بيانات أخبار عربية', 'نموذج تصنيف بدقة قابلة للقياس', 'واجهة تلصق فيها الخبر وترى النتيجة', 'شرح الكلمات المؤثرة في القرار'],
                'requirements' => ['مجموعة بيانات موسومة', 'مقارنة بين نموذجين على الأقل', 'واجهة ويب بسيطة'],
                'tech_stack' => ['Python', 'FastAPI', 'Transformers'],
                'tags' => ['Python', 'NLP'],
                'approved_at' => '2026-10-25',
            ],
            [
                'code' => 'IDEA-003', 'status' => 'approved', 'term' => $current, 'supervisor' => $mazen,
                'title' => 'نظام كشف التسلل في الشبكات المحلية',
                'field' => 'الشبكات وأمن المعلومات',
                'description' => 'نظام يراقب حركة الشبكة ويكتشف الهجمات الشائعة وينبّه مدير الشبكة.',
                'problem' => 'الشبكات الصغيرة في الشركات المحلية لا تملك أدوات مراقبة بسبب كلفة الحلول التجارية.',
                'features' => ['التقاط حركة الشبكة وتحليلها', 'كشف فحص المنافذ وهجمات DoS', 'لوحة تنبيهات لحظية', 'تقارير أسبوعية'],
                'requirements' => ['بيئة اختبار بأجهزة افتراضية', 'سيناريوهات هجوم موثقة', 'قياس نسبة الإنذار الكاذب'],
                'tech_stack' => ['Python', 'Scapy', 'Elasticsearch'],
                'tags' => ['Security', 'Python'],
                'approved_at' => '2026-10-20',
            ],
            [
                'code' => 'IDEA-004', 'status' => 'approved', 'term' => $current, 'supervisor' => $khaled,
                'title' => 'منصة تبادل الكتب الجامعية',
                'field' => 'نظم المعلومات',
                'description' => 'منصة يعرض فيها الطلاب كتبهم المستعملة للبيع أو التبادل داخل الجامعة.',
                'problem' => 'أسعار الكتب مرتفعة، وكثير من الكتب تبقى دون استخدام بعد انتهاء المقرر.',
                'features' => ['إضافة كتاب مع صور وحالته', 'بحث حسب المقرر', 'محادثة بين البائع والمشتري', 'تقييم المستخدمين'],
                'requirements' => ['تحقق من هوية الطالب الجامعية', 'تطبيق ويب متجاوب'],
                'tech_stack' => ['Laravel', 'Vue', 'MySQL'],
                'tags' => ['Laravel', 'Vue'],
                'approved_at' => '2026-10-15',
            ],
            [
                'code' => 'IDEA-005', 'status' => 'approved', 'term' => $current, 'supervisor' => $sara,
                'title' => 'مساعد ذكي لتلخيص المحاضرات',
                'field' => 'الذكاء الاصطناعي',
                'description' => 'تطبيق يحوّل تسجيل المحاضرة الصوتي إلى نص ثم يلخّصه ويستخرج أسئلة مراجعة.',
                'problem' => 'يصعب على الطلاب مراجعة محاضرات طويلة، وتدوين الملاحظات يشتت التركيز.',
                'features' => ['تحويل الصوت إلى نص عربي', 'تلخيص تلقائي', 'توليد أسئلة مراجعة', 'تصدير PDF'],
                'requirements' => ['اختبار على 10 محاضرات حقيقية', 'تقييم جودة التلخيص'],
                'tech_stack' => ['Python', 'Whisper', 'React'],
                'tags' => ['AI', 'Speech'],
                'approved_at' => '2026-10-10',
            ],
            [
                'code' => 'IDEA-006', 'status' => 'approved', 'term' => $current, 'supervisor' => $mazen,
                'title' => 'نظام مراقبة المنزل الذكي',
                'field' => 'هندسة الحواسيب',
                'description' => 'حساسات متصلة بلوحة Arduino ترسل بيانات الحرارة والحركة والدخان إلى تطبيق جوال.',
                'problem' => 'أنظمة المنزل الذكي التجارية مكلفة وتعتمد على خدمات سحابية خارجية.',
                'features' => ['قراءة الحساسات لحظياً', 'تنبيه فوري عند الخطر', 'تحكم بالإضاءة عن بعد', 'سجل للأحداث'],
                'requirements' => ['نموذج عتادي يعمل', 'تطبيق جوال', 'تقرير عن استهلاك الطاقة'],
                'tech_stack' => ['Arduino', 'MQTT', 'Flutter'],
                'tags' => ['IoT', 'Flutter'],
                'approved_at' => '2026-10-05',
            ],

            // ---------- لا يجب أن يراها الطالب في بنك الأفكار ----------
            [
                'code' => 'IDEA-007', 'status' => 'pending', 'term' => $current, 'supervisor' => null,
                'title' => 'تطبيق لحجز ملاعب كرة القدم',
                'field' => 'هندسة البرمجيات',
                'description' => 'فكرة قيد المراجعة من اللجنة العلمية.',
                'approved_at' => null,
            ],
            [
                'code' => 'IDEA-008', 'status' => 'rejected', 'term' => $current, 'supervisor' => null,
                'title' => 'آلة حاسبة علمية',
                'field' => 'هندسة البرمجيات',
                'description' => 'فكرة مرفوضة لأنها بسيطة جداً لمشروع تخرج.',
                'approved_at' => null,
            ],
            [
                'code' => 'IDEA-009', 'status' => 'approved', 'term' => $previous, 'supervisor' => $khaled,
                'title' => 'نظام إدارة المكتبة الجامعية',
                'field' => 'نظم المعلومات',
                'description' => 'فكرة معتمدة لكن في فصل سابق.',
                'tech_stack' => ['PHP', 'MySQL'],
                'tags' => ['PHP'],
                'approved_at' => '2026-03-01',
            ],
        ];

        foreach ($ideas as $idea) {
            Idea::updateOrCreate(
                ['code' => $idea['code']],
                [
                    'title'            => $idea['title'],
                    'field'            => $idea['field'],
                    'description'      => $idea['description'],
                    'problem'          => $idea['problem'] ?? null,
                    'features'         => $idea['features'] ?? [],
                    'requirements'     => $idea['requirements'] ?? [],
                    'tech_stack'       => $idea['tech_stack'] ?? [],
                    'tags'             => $idea['tags'] ?? [],
                    'status'           => $idea['status'],
                    'academic_term_id' => $idea['term']->id,
                    'supervisor_id'    => $idea['supervisor']?->id,
                    'approved_at'      => $idea['approved_at'],
                ],
            );
        }
    }
}
