import { useMemo } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

interface Props {
  /** 0..1 — overall opacity of the grain layer. */
  opacity?: number;
  /** Color of the grain dots. */
  color?: string;
  /** Tile size — smaller = denser grain. */
  tile?: number;
  style?: StyleProp<ViewStyle>;
}

/** Deterministic pseudo-random for stable patterns across renders. */
function rand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function NoiseOverlay({
  opacity = 0.05,
  color = '#000000',
  tile = 80,
  style,
}: Props) {
  const dots = useMemo(() => {
    const out: { cx: number; cy: number; r: number; o: number }[] = [];
    for (let i = 0; i < 80; i++) {
      out.push({
        cx: rand(i * 1.3) * tile,
        cy: rand(i * 2.7) * tile,
        r: rand(i * 3.1) * 0.7 + 0.2,
        o: rand(i * 4.9) * 0.6 + 0.3,
      });
    }
    return out;
  }, [tile]);

  return (
    <View pointerEvents="none" style={[{ position: 'absolute', inset: 0, opacity }, style]}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="noise" x="0" y="0" width={tile} height={tile} patternUnits="userSpaceOnUse">
            {dots.map((d, i) => (
              <Circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={color} fillOpacity={d.o} />
            ))}
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#noise)" />
      </Svg>
    </View>
  );
}
