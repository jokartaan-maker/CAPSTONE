import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="center-screen">
      <div className="not-found">
        <p className="not-found-code">404</p>
        <h1>الصفحة غير موجودة</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
          الرابط الذي وصلت إليه غير موجود أو تم نقله.
        </p>
        <Link to="/student/login" className="btn btn-primary">
        Back
        </Link>
      </div>
    </div>
  )
}
