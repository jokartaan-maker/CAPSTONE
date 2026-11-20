// ═══════════════════════════════════════════════════
//  CAPSTONE — Icon Registry  (verified visually)
// ═══════════════════════════════════════════════════

// 1  — قفل مفتوح (open lock)
import iconLock         from './Vector (1).png'

// 2  — درع + علامة صح (shield check)
import iconShieldCheck  from './Vector (2).png'

// 3  — شخص واحد (single person / user)
import iconPerson       from './Vector (3).png'

// 4  — شخصان (two persons / group)
import iconPersons      from './Vector (4).png'

// 5  — قبعة تخرج (graduation cap)
import iconGradCap      from './Vector (5).png'

// 6  — شاشة / مونيتور (monitor / screen)
import iconMonitor      from './Vector (6).png'

// 7  — شخص + عدسة بحث (person search)
import iconPersonSearch from './Vector (7).png'

// 8  — درع بسيط (plain shield)
import iconShield       from './Vector (8).png'

// 9  — دائرة + حرف i  (info circle)
import iconInfo         from './Vector (9).png'

// 10 — بناية / مؤسسة (building / university)
import iconBuilding     from './Vector (10).png'

// 11 — قبعة تخرج نسخة ثانية (graduation cap alt)
import iconGradCapAlt   from './Vector (11).png'

// 12 — قفل مغلق (closed lock)
import iconLockClosed   from './Vector (12).png'

// 13 — مظروف / بريد إلكتروني (envelope / email)
import iconEnvelope     from './Vector (13).png'

// 14 — دائرة + علامة استفهام (question circle / help)
import iconHelp         from './Vector (14).png'

// mail-check (تم إرسال البريد)
import iconMailCheck    from './mail-check.png'

export {
  iconLock,
  iconShieldCheck,
  iconPerson,
  iconPersons,
  iconGradCap,
  iconMonitor,
  iconPersonSearch,
  iconShield,
  iconInfo,
  iconBuilding,
  iconGradCapAlt,
  iconLockClosed,
  iconEnvelope,
  iconHelp,
  iconMailCheck,
}

// ── backward-compat aliases (old names → new) ──────
export const iconMail        = iconEnvelope    // كان مسمى خطأ
export const iconLockSmall   = iconMonitor     // كان مسمى خطأ
export const iconLockCircle  = iconInfo        // كان مسمى خطأ
export const iconDash        = iconBuilding    // كان مسمى خطأ
export const iconKey         = iconHelp        // كان مسمى خطأ
export const iconLockAlt     = iconLockClosed  // alias
