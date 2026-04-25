import { type StyleProp, View, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

interface Props {
  color?: string;
  opacity?: number;
  spacing?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function DotPattern({
  color = '#FFFFFF',
  opacity = 0.12,
  spacing = 20,
  radius = 1.6,
  style,
}: Props) {
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', inset: 0, opacity }, style]}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id="dots"
            x="0"
            y="0"
            width={spacing}
            height={spacing}
            patternUnits="userSpaceOnUse"
          >
            <Circle cx={spacing / 2} cy={spacing / 2} r={radius} fill={color} />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#dots)" />
      </Svg>
    </View>
  );
}
