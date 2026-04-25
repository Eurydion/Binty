import { type StyleProp, View, type ViewStyle } from 'react-native';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';

interface Props {
  color?: string;
  opacity?: number;
  amplitude?: number;
  wavelength?: number;
  style?: StyleProp<ViewStyle>;
}

export function WavePattern({
  color = '#FFFFFF',
  opacity = 0.1,
  amplitude = 4,
  wavelength = 40,
  style,
}: Props) {
  // single sine half-wave, repeated horizontally + vertically
  const w = wavelength;
  const h = amplitude * 4;
  const mid = h / 2;
  const d = `M 0 ${mid} Q ${w / 4} ${mid - amplitude} ${w / 2} ${mid} T ${w} ${mid}`;
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', inset: 0, opacity }, style]}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="waves" x="0" y="0" width={w} height={h} patternUnits="userSpaceOnUse">
            <Path d={d} stroke={color} strokeWidth={1} fill="none" />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#waves)" />
      </Svg>
    </View>
  );
}
