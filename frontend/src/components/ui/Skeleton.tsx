import React from 'react'
import './Skeleton.css'

/* ── Types ── */
interface SkeletonProps {
  width?:  string | number
  height?: string | number
  radius?: string | number
  className?: string
  style?: React.CSSProperties
}

/* ════════════════════════════════════════
   BASE BLOCK
════════════════════════════════════════ */
export function Skeleton({ width = '100%', height = 16, radius = 6, className = '', style }: SkeletonProps) {
  return (
    <span
      className={`skel-block ${className}`}
      style={{ width, height, borderRadius: radius, ...style }}
      aria-hidden="true"
    />
  )
}

/* ── Shared topbar ── */
function SkelTopbar({ current }: { current: string }) {
  return (
    <div className="db-topbar" aria-hidden="true">
      <div className="skel-topbar-left">
        <Skeleton width={70} height={11} radius={4} />
        <span className="skel-sep">/</span>
        <Skeleton width={current.length * 7} height={11} radius={4} />
      </div>
      <Skeleton width={130} height={30} radius={7} />
    </div>
  )
}

/* ── Shared page heading ── */
function SkelHeading({ titleW = 240 }: { titleW?: number }) {
  return (
    <div className="db-page-head" aria-hidden="true">
      <Skeleton width={80}    height={10} radius={4} style={{ marginBottom: 8 }} />
      <Skeleton width={titleW} height={28} radius={6} style={{ marginBottom: 10 }} />
      <Skeleton width={320}  height={12} radius={4} />
    </div>
  )
}

/* ── Generic card shell ── */
function SkelCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="db-card" style={style} aria-hidden="true">
      {children}
    </div>
  )
}

/* ════════════════════════════════════════
   DASHBOARD PAGE SKELETON
════════════════════════════════════════ */
export function DashboardPageSkeleton() {
  return (
    <div className="db-wrap" aria-busy="true" aria-label="جارٍ التحميل">
      <SkelTopbar current="نظرة عامة" />
      <div className="db-body">
        <div className="db-body-inner">

          <SkelHeading titleW={280} />

          {/* Hero card */}
          <Skeleton width="100%" height={148} radius={14} style={{ marginBottom: 20 }} />

          {/* Stats row */}
          <div className="db-stats-row" style={{ marginBottom: 20 }}>
            {[0,1,2,3].map(i => (
              <div key={i} className="db-stat-card">
                <Skeleton width={38} height={38} radius={10} />
                <div className="db-stat-body">
                  <Skeleton width={70} height={10} radius={4} style={{ marginBottom: 8 }} />
                  <Skeleton width={50} height={26} radius={5} style={{ marginBottom: 6 }} />
                  <Skeleton width={90} height={10} radius={4} />
                </div>
              </div>
            ))}
          </div>

          {/* Two-column grid */}
          <div className="db-grid">
            {/* Left col */}
            <div className="db-left-col">
              <SkelCard style={{ marginBottom: 16 }}>
                <div className="db-card-header">
                  <div>
                    <Skeleton width={160} height={14} radius={5} style={{ marginBottom: 6 }} />
                    <Skeleton width={220} height={11} radius={4} />
                  </div>
                </div>
                <div style={{ padding: '16px 22px 20px', display:'flex', flexDirection:'column', gap:14 }}>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:13 }}>
                      <Skeleton width={24} height={24} radius="50%" style={{ flexShrink:0, marginTop:2 }} />
                      <div style={{ flex:1 }}>
                        <Skeleton width="55%" height={13} radius={4} style={{ marginBottom:5 }} />
                        <Skeleton width="80%" height={10} radius={4} />
                      </div>
                    </div>
                  ))}
                </div>
              </SkelCard>
              <div className="db-row">
                {[0,1].map(i => (
                  <SkelCard key={i}>
                    <div className="db-card-header">
                      <Skeleton width={110} height={14} radius={5} />
                    </div>
                    <div style={{ padding:'16px 22px' }}>
                      {[0,1,2].map(j => (
                        <Skeleton key={j} width="100%" height={12} radius={4} style={{ marginBottom:10 }} />
                      ))}
                    </div>
                  </SkelCard>
                ))}
              </div>
            </div>

            {/* Right col */}
            <div className="db-right-col">
              {[90, 120, 100].map((h, i) => (
                <SkelCard key={i}>
                  <div className="db-card-header">
                    <Skeleton width={120} height={14} radius={5} />
                  </div>
                  <div style={{ padding:'14px 22px' }}>
                    <Skeleton width="100%" height={h} radius={8} />
                  </div>
                </SkelCard>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   IDEAS PAGE SKELETON
════════════════════════════════════════ */
export function IdeasPageSkeleton() {
  return (
    <div className="db-wrap" aria-busy="true" aria-label="جارٍ التحميل">
      <SkelTopbar current="بنك الأفكار" />
      <div className="db-body">
        <div className="db-body-inner">

          {/* Heading + CTA */}
          <div className="ideas-page-head" style={{ marginBottom: 22 }}>
            <div>
              <Skeleton width={80}  height={10} radius={4} style={{ marginBottom: 8 }} />
              <Skeleton width={180} height={28} radius={6} style={{ marginBottom: 8 }} />
              <Skeleton width={320} height={12} radius={4} />
            </div>
            <Skeleton width={130} height={38} radius={9} style={{ flexShrink: 0 }} />
          </div>

          {/* Filter bar */}
          <div className="ideas-filters">
            <div className="ideas-filter-group" style={{ flex: 1 }}>
              <Skeleton width={80}  height={10} radius={4} style={{ marginBottom: 6 }} />
              <Skeleton width="100%" height={38} radius={9} />
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
              <Skeleton width={40}  height={10} radius={4} />
              <Skeleton width={190} height={38} radius={9} />
            </div>
            <Skeleton width={72} height={38} radius={9} style={{ alignSelf:'flex-end' }} />
          </div>

          {/* Results head */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <Skeleton width={100} height={11} radius={4} />
            <div style={{ display:'flex', gap:6 }}>
              {[70,90,80,80].map((w,i) => <Skeleton key={i} width={w} height={30} radius={999} />)}
            </div>
          </div>

          {/* Cards grid */}
          <div className="ideas-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="idea-card" style={{ gap: 12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <Skeleton width={70}  height={20} radius={999} />
                  <Skeleton width={55}  height={11} radius={4} />
                </div>
                <Skeleton width={60}  height={10} radius={4} />
                <Skeleton width="90%" height={18} radius={5} />
                <Skeleton width="75%" height={18} radius={5} />
                <Skeleton width="100%" height={12} radius={4} />
                <Skeleton width="85%"  height={12} radius={4} />
                {/* Supervisor box */}
                <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 11px', background:'#f7f8fa', borderRadius:8 }}>
                  <Skeleton width={28} height={28} radius="50%" style={{ flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <Skeleton width={60} height={9} radius={3} style={{ marginBottom:4 }} />
                    <Skeleton width={110} height={12} radius={4} />
                  </div>
                </div>
                {/* Tags */}
                <div style={{ display:'flex', gap:5 }}>
                  {[55,70,60].map((w,j) => <Skeleton key={j} width={w} height={22} radius={999} />)}
                </div>
                {/* Footer */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:10, borderTop:'1px solid #f0f2f5' }}>
                  <Skeleton width={80} height={11} radius={4} />
                  <Skeleton width={80} height={30} radius={7} />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   IDEA DETAIL PAGE SKELETON
════════════════════════════════════════ */
export function IdeaDetailPageSkeleton() {
  return (
    <div className="db-wrap" aria-busy="true" aria-label="جارٍ التحميل">
      <SkelTopbar current="تفاصيل الفكرة" />
      <div className="db-body">
        <div className="db-body-inner">

          {/* Back + hero */}
          <div className="idd-page-head">
            <Skeleton width={170} height={12} radius={4} style={{ marginBottom: 18 }} />
            <div style={{ display:'flex', gap:8, marginBottom:12 }}>
              <Skeleton width={80}  height={22} radius={999} />
              <Skeleton width={100} height={22} radius={999} />
              <Skeleton width={65}  height={22} radius={999} />
            </div>
            <Skeleton width="70%" height={32} radius={6} style={{ marginBottom: 8 }} />
            <Skeleton width={200} height={12} radius={4} />
          </div>

          {/* Two-column layout */}
          <div className="idd-layout">

            {/* Main content */}
            <div className="idd-main">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="idd-section" style={{ marginBottom:14 }}>
                  <Skeleton width={120} height={11} radius={4} style={{ marginBottom:14 }} />
                  <Skeleton width="100%" height={12} radius={4} style={{ marginBottom:8 }} />
                  <Skeleton width="90%"  height={12} radius={4} style={{ marginBottom:8 }} />
                  <Skeleton width="75%"  height={12} radius={4} />
                </div>
              ))}
            </div>

            {/* Sidebar */}
            <aside className="idd-sidebar">
              <div className="idd-sidebar-card">
                <Skeleton width={110} height={14} radius={4} style={{ marginBottom:16 }} />
                {[0,1,2,3].map(i => (
                  <div key={i} style={{ padding:'10px 0', borderBottom:'1px solid #f0f2f5' }}>
                    <Skeleton width={60}  height={9}  radius={3} style={{ marginBottom:5 }} />
                    <Skeleton width={120} height={13} radius={4} />
                  </div>
                ))}
                <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:14 }}>
                  {[55,70,60,80].map((w,i) => <Skeleton key={i} width={w} height={22} radius={999} />)}
                </div>
              </div>
              <div className="idd-sidebar-card">
                <Skeleton width={130} height={14} radius={4} style={{ marginBottom:16 }} />
                {[0,1].map(i => (
                  <div key={i} style={{ padding:'12px 14px', background:'#f7f8fa', borderRadius:10, marginBottom:10 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                      <Skeleton width={32} height={32} radius={8} style={{ flexShrink:0 }} />
                      <div style={{ flex:1 }}>
                        <Skeleton width="60%" height={13} radius={4} style={{ marginBottom:4 }} />
                        <Skeleton width="40%" height={10} radius={3} />
                      </div>
                      <Skeleton width={45} height={20} radius={999} style={{ flexShrink:0 }} />
                    </div>
                    <Skeleton width="100%" height={3} radius={999} style={{ marginBottom:8 }} />
                    <Skeleton width="100%" height={30} radius={8} />
                  </div>
                ))}
              </div>
            </aside>
          </div>

        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   ACCOUNT PAGE SKELETON  (unchanged)
════════════════════════════════════════ */
export function AccountPageSkeleton() {
  return (
    <div className="account-wrap">

      <div className="account-topbar">
        <div className="skel-topbar-left">
          <Skeleton width={80} height={11} />
          <span className="skel-sep">/</span>
          <Skeleton width={120} height={11} />
        </div>
        <Skeleton width={110} height={28} radius={6} />
      </div>

      <div className="account-body">
        <div className="account-inner">

          <div className="account-page-head">
            <Skeleton width={60}  height={10} radius={4} />
            <Skeleton width={220} height={26} radius={6} style={{ marginTop: 8 }} />
            <Skeleton width={340} height={12} radius={4} style={{ marginTop: 10 }} />
          </div>

          <div className="account-grid">
            {/* Left col */}
            <div className="account-col">
              <div className="account-card">
                <Skeleton width={110} height={14} radius={4} style={{ marginBottom: 20 }} />
                <div className="skel-profile-head">
                  <Skeleton width={54} height={54} radius="50%" />
                  <div className="skel-profile-info">
                    <Skeleton width={140} height={14} radius={5} />
                    <Skeleton width={190} height={11} radius={4} style={{ marginTop: 7 }} />
                    <Skeleton width={80}  height={22} radius={999} style={{ marginTop: 10 }} />
                  </div>
                </div>
                {[160,140,200,120,150,110].map((w, i) => (
                  <div key={i} className="skel-info-row">
                    <Skeleton width={80} height={11} radius={4} />
                    <Skeleton width={w}  height={11} radius={4} />
                  </div>
                ))}
                <Skeleton width={110} height={36} radius={8} style={{ marginTop: 16 }} />
              </div>
              <div className="account-card">
                <Skeleton width={150} height={14} radius={4} style={{ marginBottom: 20 }} />
                {[1,2,3].map(i => (
                  <Skeleton key={i} width="100%" height={40} radius={8} style={{ marginBottom: 14 }} />
                ))}
                <Skeleton width={130} height={36} radius={8} style={{ marginTop: 4 }} />
              </div>
            </div>
            {/* Right col */}
            <div className="account-col">
              <div className="account-card">
                <Skeleton width={90} height={14} radius={4} style={{ marginBottom: 20 }} />
                <Skeleton width="100%" height={42} radius={8} style={{ marginBottom: 10 }} />
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="skel-notif-row">
                    <Skeleton width={36} height={36} radius={9} />
                    <div style={{ flex: 1 }}>
                      <Skeleton width="70%" height={12} radius={4} />
                      <Skeleton width="45%" height={10} radius={4} style={{ marginTop: 6 }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="account-card">
                <Skeleton width={180} height={14} radius={4} style={{ marginBottom: 20 }} />
                {[1,2,3,4].map(i => (
                  <div key={i} className="skel-pref-row">
                    <div style={{ flex: 1 }}>
                      <Skeleton width="65%" height={12} radius={4} />
                      <Skeleton width="85%" height={10} radius={4} style={{ marginTop: 5 }} />
                    </div>
                    <Skeleton width={38} height={22} radius={999} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
