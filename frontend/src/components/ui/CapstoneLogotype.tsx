import capstoneLogo from '../../assets/images/Capstone · شعار بخلفية شفافة.png'
import './CapstoneLogotype.css'

interface CapstoneLogotypeProps {
  /** variant: dark = on white bg (default) | white = on dark bg */
  variant?: 'dark' | 'white'
  /** overall height in px — logo + text scale together */
  height?: number
}

/**
 * Capstone logo + wordmark lockup.
 * Use `variant="white"` on dark/navy backgrounds (sidebar, auth panel).
 * Use `variant="dark"` on light/white backgrounds (topbars, form headers).
 */
export function CapstoneLogotype({ variant = 'dark', height = 36 }: CapstoneLogotypeProps) {
  const imgH   = height
  const nameFs = Math.round(height * 0.42)   // ~15px at h=36
  const tagFs  = Math.round(height * 0.22)   // ~8px  at h=36

  return (
    <div className={`cap-logotype cap-logotype-${variant}`} style={{ height }}>
      <img
        src={capstoneLogo}
        alt=""
        aria-hidden="true"
        className="cap-logotype-img"
        style={{
          height: imgH,
          filter: variant === 'white' ? 'brightness(0) invert(1)' : 'none',
        }}
      />
      <div className="cap-logotype-text">
        <span className="cap-logotype-name" style={{ fontSize: nameFs }}>Capstone</span>
        <span className="cap-logotype-tag"  style={{ fontSize: tagFs  }}>Student Platform</span>
      </div>
    </div>
  )
}
