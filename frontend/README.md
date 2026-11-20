# Capstone Frontend (Student)

واجهة الطالب لنظام إدارة مشاريع التخرج — مبنية بـ **React + TypeScript + Vite**.

## المتطلبات

- Node.js 18+ و npm
- تشغيل الـ backend (Laravel) على المنفذ 8000:

  ```bash
  cd backend
  php artisan serve
  ```

## التشغيل

```bash
cd frontend
npm install
npm run dev
```

ثم افتح <http://localhost:5173>

أثناء التطوير تستخدم Vite **proxy** لتمرير طلبات `/api` إلى `http://localhost:8000`،
لذلك لا حاجة لإعداد CORS على الـ backend.

## البناء والفحص

```bash
npm run build      # فحص الأنواع ثم بناء الإنتاج إلى dist/
npm run preview    # معاينة نسخة الإنتاج محلياً
npm run typecheck   # فحص الأنواع فقط
```

## الإعدادات

انسخ `.env.example` إلى `.env` وعدّل عند الحاجة:

```
VITE_API_BASE_URL=/api
```

- الافتراضي `/api` يستخدم Vite proxy (موصى به أثناء التطوير).
- لاستدعاء الـ backend مباشرة (بدون proxy): `VITE_API_BASE_URL=http://localhost:8000/api`
  وعندها يجب تفعيل CORS في الـ backend للسماح بالأصل `http://localhost:5173`.

## المسارات

| المسار | الوصف | محمي |
| --- | --- | --- |
| `/student/login` | تسجيل الدخول | لا |
| `/student/register` | إنشاء حساب طالب | لا |
| `/student/forgot-password` | طلب رابط إعادة تعيين كلمة المرور | لا |
| `/student/reset-password` | تعيين كلمة مرور جديدة (من رابط البريد) | لا |
| `/student/profile` | الملف الشخصي (عرض + تعديل) | نعم |
| `/student/profile/password` | تغيير كلمة المرور | نعم |

## البنية

```
frontend/
├─ src/
│  ├─ api/            # عميل HTTP (fetch) + دوال الـ endpoints
│  ├─ components/     # layouts + عناصر الواجهة (Input/Button/Alert...)
│  ├─ context/        # AuthContext (الـ token + المستخدم الحالي)
│  ├─ pages/          # صفحات الطالب + صفحة 404
│  ├─ types/          # أنواع TypeScript المشتركة
│  ├─ App.tsx         # تعريف المسارات (routes)
│  ├─ main.tsx        # نقطة الدخول
│  └─ index.css       # التنسيق العام (RTL/عربي)
└─ vite.config.ts     # إعداد Vite + الـ proxy
```
