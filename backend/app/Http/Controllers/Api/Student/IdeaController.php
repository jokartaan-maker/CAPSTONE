<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\IdeaIndexRequest;
use App\Http\Requests\Student\StoreIdeaRequest;
use App\Http\Resources\Student\IdeaResource;
use App\Models\AcademicTerm;
use App\Models\Idea;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class IdeaController extends Controller
{
    private const MAX_PENDING_PROPOSALS = 3;   // أقصى عدد اقتراحات قيد المراجعة للطالب

    // GET /api/student/ideas?search=&field=&supervisor_id=
    // الأفكار المعتمدة في الفصل الحالي، مع بحث وتصفية
    public function index(IdeaIndexRequest $request): JsonResponse
    {
        $filters = $request->validated();

        $ideas = Idea::query()
            ->approved()
            ->inCurrentTerm()
            ->with(['supervisor', 'academicTerm'])   // تحميل مسبق: يمنع استعلاماً لكل فكرة
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($filters['field'] ?? null, fn ($query, $field) => $query->where('field', $field))
            ->when($filters['supervisor_id'] ?? null, fn ($query, $id) => $query->where('supervisor_id', $id))
            ->orderByDesc('approved_at')
            ->get();

        return response()->json([
            'ideas' => IdeaResource::collection($ideas),
            'total' => $ideas->count(),
        ]);
    }

    // GET /api/student/ideas/{id}
    // فكرة معتمدة في الفصل الحالي، أو فكرة اقترحها الطالب نفسه (بأي حالة)
    public function show(Request $request, int $id): JsonResponse
    {
        $studentId = $request->user()->id;

        $idea = Idea::query()
            ->where(function ($q) use ($studentId) {
                $q->where(fn ($q) => $q->approved()->inCurrentTerm())
                  ->orWhere('proposed_by_student_id', $studentId);
            })
            ->with(['supervisor', 'academicTerm'])
            ->find($id);

        if (! $idea) {
            return response()->json([
                'message' => 'الفكرة غير موجودة',
            ], 404);
        }

        return response()->json([
            'idea' => new IdeaResource($idea),
        ]);
    }

    // POST /api/student/ideas
    // اقتراح فكرة جديدة، تُحفظ بحالة "قيد المراجعة"
    public function store(StoreIdeaRequest $request): JsonResponse
    {
        $student = $request->user();
        $data    = $request->validated();

        // 1) يجب وجود فصل دراسي فعّال
        $term = AcademicTerm::current();

        if (! $term) {
            return response()->json([
                'message' => 'لا يوجد فصل دراسي فعّال حالياً، تواصل مع الإدارة',
            ], 422);
        }

        // 2) حد أقصى للاقتراحات قيد المراجعة
        $pendingCount = Idea::where('proposed_by_student_id', $student->id)
            ->where('status', 'pending')
            ->count();

        if ($pendingCount >= self::MAX_PENDING_PROPOSALS) {
            return response()->json([
                'message' => 'لديك ' . self::MAX_PENDING_PROPOSALS . ' اقتراحات قيد المراجعة، انتظر قرار اللجنة قبل اقتراح فكرة جديدة',
            ], 422);
        }

        // 3) الإنشاء داخل transaction: الكود يُبنى من رقم الفكرة فلا يتكرر
        $idea = DB::transaction(function () use ($data, $student, $term) {
            $idea = Idea::create([
                'code'                   => 'TMP-' . uniqid(),
                'title'                  => $data['title'],
                'field'                  => $data['field'],
                'description'            => $data['description'],
                'problem'                => $data['problem'],
                'features'               => $data['features'],
                'requirements'           => $data['requirements'],
                'tech_stack'             => $data['tech_stack'],
                'tags'                   => array_slice($data['tech_stack'], 0, 3),
                'status'                 => 'pending',
                'academic_term_id'       => $term->id,
                'supervisor_id'          => $data['supervisor_id'],
                'proposed_by_student_id' => $student->id,
            ]);

            $idea->update([
                'code' => 'IDEA-' . str_pad((string) $idea->id, 3, '0', STR_PAD_LEFT),
            ]);

            return $idea;
        });

        $idea->load(['supervisor', 'academicTerm']);

        return response()->json([
            'message' => 'تم إرسال الفكرة بنجاح، وهي الآن قيد المراجعة من اللجنة العلمية',
            'idea'    => new IdeaResource($idea),
        ], 201);
    }

    // GET /api/student/my-ideas
    // كل الأفكار التي اقترحها الطالب، بكل حالاتها
    public function myIdeas(Request $request): JsonResponse
    {
        $ideas = Idea::query()
            ->where('proposed_by_student_id', $request->user()->id)
            ->with(['supervisor', 'academicTerm'])
            ->latest()
            ->get();

        return response()->json([
            'ideas' => IdeaResource::collection($ideas),
            'total' => $ideas->count(),
        ]);
    }
}
