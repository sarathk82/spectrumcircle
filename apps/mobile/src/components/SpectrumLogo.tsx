import Svg, { Path } from 'react-native-svg'
import { View, Text } from 'react-native'

/**
 * Spectrum Circle logo for React Native (uses react-native-svg).
 * 6 spectrum-colored arcs forming a complete circle.
 */

const ARCS = [
  { color: '#9B59B6', d: 'M 100 26.5 A 73.5 73.5 0 0 1 160.21 57.85' },
  { color: '#4BADE8', d: 'M 163.65 63.25 A 73.5 73.5 0 0 1 166.61 131.06' },
  { color: '#4CAF7D', d: 'M 163.65 136.75 A 73.5 73.5 0 0 1 106.41 173.22' },
  { color: '#FFD23F', d: 'M 100 173.5 A 73.5 73.5 0 0 1 39.79 142.15' },
  { color: '#FF9A3C', d: 'M 36.35 136.75 A 73.5 73.5 0 0 1 33.39 68.94' },
  { color: '#FF5A5A', d: 'M 36.35 63.25 A 73.5 73.5 0 0 1 93.59 26.78' },
] as const

interface SpectrumLogoProps {
  size?: number
  showWordmark?: boolean
  variant?: 'color' | 'white'
}

export default function SpectrumLogo({
  size = 48,
  showWordmark = false,
  variant = 'color',
}: SpectrumLogoProps) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        accessibilityLabel="Spectrum Circle logo"
        accessibilityRole="image"
      >
        {ARCS.map((arc, index) => (
          <Path
            key={index}
            d={arc.d}
            stroke={variant === 'white' ? '#FFFFFF' : arc.color}
            strokeWidth={23}
            strokeLinecap="round"
            fill="none"
          />
        ))}
      </Svg>
      {showWordmark && (
        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <Text
            style={{
              fontSize: size * 0.28,
              fontFamily: 'Nunito_700Bold',
              color: variant === 'white' ? '#FFFFFF' : '#1A1A2E',
              letterSpacing: -0.5,
              lineHeight: size * 0.33,
            }}
          >
            Spectrum
          </Text>
          <Text
            style={{
              fontSize: size * 0.28,
              fontFamily: 'Nunito_400Regular',
              color: variant === 'white' ? 'rgba(255,255,255,0.8)' : '#5B4FCF',
              letterSpacing: -0.3,
              lineHeight: size * 0.33,
            }}
          >
            Circle
          </Text>
        </View>
      )}
    </View>
  )
}
