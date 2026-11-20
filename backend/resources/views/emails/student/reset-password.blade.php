<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>إعادة تعيين كلمة المرور</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background-color: #f0f2f5;
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      direction: rtl;
      color: #1a1a2e;
    }

    .wrapper {
      max-width: 560px;
      margin: 40px auto;
      padding: 0 16px 40px;
    }

    /* ===== Header ===== */
    .header {
      background: linear-gradient(135deg, #0d1b2a 0%, #1b2e45 100%);
      border-radius: 16px 16px 0 0;
      padding: 32px 40px 28px;
      text-align: center;
    }

    .header-logo {
      font-size: 22px;
      font-weight: 800;
      color: #c9a84c;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .header-logo span {
      color: #ffffff;
    }

    .header-subtitle {
      font-size: 11px;
      color: #8ba3bf;
      margin-top: 4px;
      letter-spacing: 0.5px;
    }

    /* ===== Body ===== */
    .body {
      background: #ffffff;
      padding: 40px 40px 32px;
    }

    .greeting {
      font-size: 17px;
      font-weight: 700;
      color: #0d1b2a;
      margin-bottom: 12px;
    }

    .message-text {
      font-size: 14px;
      color: #4a5568;
      line-height: 1.8;
      margin-bottom: 32px;
    }

    /* ===== CTA Button ===== */
    .btn-wrap {
      text-align: center;
      margin-bottom: 32px;
    }

    .btn-cta {
      display: inline-block;
      background: linear-gradient(135deg, #0d1b2a 0%, #1b3a5c 100%);
      color: #ffffff !important;
      text-decoration: none;
      font-size: 15px;
      font-weight: 700;
      padding: 15px 48px;
      border-radius: 10px;
      letter-spacing: 0.3px;
      border-bottom: 3px solid #c9a84c;
    }

    /* ===== Notice ===== */
    .notice-box {
      background: #fff8ec;
      border: 1px solid #f0d080;
      border-radius: 10px;
      padding: 14px 18px;
      font-size: 12px;
      color: #7a5a00;
      line-height: 1.7;
      margin-bottom: 24px;
    }

    .notice-box strong {
      display: block;
      margin-bottom: 4px;
      font-size: 12.5px;
    }

    /* ===== Fallback URL ===== */
    .fallback {
      font-size: 11px;
      color: #8b9ab0;
      line-height: 1.6;
      border-top: 1px solid #eef0f4;
      padding-top: 20px;
      word-break: break-all;
    }

    .fallback a {
      color: #3b6fa0;
      text-decoration: none;
    }

    /* ===== Footer ===== */
    .footer {
      background: #f7f8fa;
      border: 1px solid #e8eaef;
      border-top: none;
      border-radius: 0 0 16px 16px;
      padding: 20px 40px;
      text-align: center;
    }

    .footer-name {
      font-size: 12px;
      font-weight: 700;
      color: #0d1b2a;
      margin-bottom: 4px;
    }

    .footer-university {
      font-size: 10.5px;
      color: #8b9ab0;
    }

    .footer-ignore {
      font-size: 10px;
      color: #b0bac8;
      margin-top: 12px;
    }
  </style>
</head>
<body>
  <div class="wrapper">

    <div class="header">
      <div class="header-logo">Cap<span>stone</span></div>
      <div class="header-subtitle">Graduation Project Management Platform</div>
    </div>

    <div class="body">
      <p class="greeting">مرحباً {{ $studentName }}،</p>
      <p class="message-text">
        وصلنا طلب لإعادة تعيين كلمة المرور الخاصة بحسابك.<br />
        اضغط على الزر أدناه لتأكيد الطلب وإنشاء كلمة مرور جديدة.
      </p>

      <div class="btn-wrap">
        <a href="{{ $resetUrl }}" class="btn-cta">تأكيد إعادة تعيين كلمة المرور</a>
      </div>

      <div class="notice-box">
        <strong>⏱ ملاحظة أمنية</strong>
        هذا الرابط صالح لمدة <strong>30 دقيقة</strong> فقط ويُستخدم مرة واحدة.<br />
        إذا لم تطلب ذلك، تجاهل هذه الرسالة وكلمة مرورك لن تتغير.
      </div>

      <div class="fallback">
        إذا لم يعمل الزر، انسخ الرابط التالي وألصقه في المتصفح:<br />
        <a href="{{ $resetUrl }}">{{ $resetUrl }}</a>
      </div>
    </div>

    <div class="footer">
      <div class="footer-name">نظام إدارة مشاريع التخرج — Capstone</div>
      <div class="footer-university">جامعة الشام الخاصة · كلية الهندسة المعلوماتية</div>
      <div class="footer-ignore">هذه رسالة تلقائية، يُرجى عدم الرد عليها.</div>
    </div>

  </div>
</body>
</html>
