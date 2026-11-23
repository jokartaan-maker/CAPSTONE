<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\IdeaIndexRequest;
use App\Http\Resources\Student\IdeaResource;
use App\Models\Idea;
use Illuminate\Http\JsonResponse;

class IdeaController extends Controller
{
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
    // تفاصيل فكرة معتمدة في الفصل الحالي فقط
    public function show(int $id): JsonResponse
    {
        $idea = Idea::query()
            ->approved()
            ->inCurrentTerm()
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
}
