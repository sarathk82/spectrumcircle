import React from 'react'

/**
 * Spectrum Circle Logo
 * 6 spectrum-colored arcs arranged to form a complete circle.
 * Colors represent the diversity and uniqueness of the autism spectrum.
 *
 * Arc layout (clockwise from top, 55° each, 5° gaps):
 *   0°–55°   → Purple  (#9B59B6)
 *  60°–115°  → Blue    (#4BADE8)
 * 120°–175°  → Green   (#4CAF7D)
 * 180°–235°  → Yellow  (#FFD23F)
 * 240°–295°  → Orange  (#FF9A3C)
 * 300°–355°  → Red     (#FF5A5A)
 */

interface SpectrumCircleLogoProps {
  size?: number
  className?: string
  /** Show the wordmark beside the icon */
  showWordmark?: boolean
  /** Variant: 'color' (default) | 'white' | 'dark' */
  variant?: 'color' | 'white' | 'dark'
}

const ARCS = [
  { color: '#9B59B6', d: 'M 100 26.5 A 73.5 73.5 0 0 1 160.21 57.85' },
  { color: '#4BADE8', d: 'M 163.65 63.25 A 73.5 73.5 0 0 1 166.61 131.06' },
  { color: '#4CAF7D', d: 'M 163.65 136.75 A 73.5 73.5 0 0 1 106.41 173.22' },
  { color: '#FFD23F', d: 'M 100 173.5 A 73.5 73.5 0 0 1 39.79 142.15' },
  { color: '#FF9A3C', d: 'M 36.35 136.75 A 73.5 73.5 0 0 1 33.39 68.94' },
  { color: '#FF5A5A', d: 'M 36.35 63.25 A 73.5 73.5 0 0 1 93.59 26.78' },
] as const

export function SpectrumCircleLogo({
  size = 40,
  className = '',
  showWordmark = true,
  variant = 'color',
}: SpectrumCircleLogoProps) {
  const strokeColor = variant === 'white' ? '#FFFFFF' : undefined
  const wordmarkColor =
    variant === 'white' ? '#FFFFFF' : variant === 'dark' ? '#1A1A2E' : '#1A1A2E'

  return (
    <div
      className={`inline-flex items-center gap-3 ${className}`}
      role="img"
      aria-label="Spectrum Circle"
    >
      <SpectrumCircleIcon size={size} variant={variant} />
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span
            style={{
              color: wordmarkColor,
              fontSize: size * 0.5,
              fontWeight: 700,
              fontFamily: 'var(--font-nunito, Nunito, sans-serif)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            Spectrum
          </span>
          <span
            style={{
              color: strokeColor ?? '#5B4FCF',
              fontSize: size * 0.5,
              fontWeight: 400,
              fontFamily: 'var(--font-nunito, Nunito, sans-serif)',
              letterSpacing: '-0.01em',
              lineHeight: 1.1,
            }}
          >
            Circle
          </span>
        </div>
      )}
    </div>
  )
}

interface SpectrumCircleIconProps {
  size?: number
  className?: string
  variant?: 'color' | 'white' | 'dark'
}

export function SpectrumCircleIcon({
  size = 40,
  className = '',
  variant = 'color',
}: SpectrumCircleIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {ARCS.map((arc, index) => (
        <path
          key={index}
          d={arc.d}
          stroke={variant === 'white' ? '#FFFFFF' : arc.color}
          strokeWidth="23"
          strokeLinecap="round"
          fill="none"
        />
      ))}
    </svg>
  )
}
