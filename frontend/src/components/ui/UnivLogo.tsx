import aspuLogo from '../../assets/images/ASPU.jfif'

interface UnivLogoProps {
  /** الحجم بالـ px — افتراضي 36 */
  height?: number
  className?: string
}

export function UnivLogo({ height = 36, className }: UnivLogoProps) {
  return (
    <img
      src={aspuLogo}
      alt="جامعة الشام الخاصة"
      height={height}
      style={{ width: 'auto', objectFit: 'contain', display: 'block' }}
      className={className}
    />
  )
}
