import { type StyleProp, View, type ViewStyle } from 'react-native';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';

interface Props {
  color?: string;
  opacity?: number;
  spacing?: number;
  thickness?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Diagonal hairline stripes — calmer than waves, less busy than dots. Good
 * for hero/quote cards where we want texture without visual noise.
 */
export function DiagonalLines({
  color = '#FFFFFF',
  opacity = 0.12,
  spacing = 14,
  thickness = 1,
  style,
}: Props) {
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', inset: 0, opacity }, style]}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id="diag"
            x="0"
            y="0"
            width={spacing}
            height={spacing}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <Path
              d={`M 0 ${spacing / 2} L ${spacing} ${spacing / 2}`}
              stroke={color}
              strokeWidth={thickness}
            />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#diag)" />
      </Svg>
    </View>
  );
}
