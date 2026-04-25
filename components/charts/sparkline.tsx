import { useMemo } from 'react';
import Svg, { Path } from 'react-native-svg';

import { Palette } from '@/constants/theme';

interface Props {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function Sparkline({ data, width = 60, height = 22, color = Palette.kangkong }: Props) {
  const path = useMemo(() => {
    if (data.length === 0) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = Math.max(1, max - min);
    const stepX = data.length > 1 ? width / (data.length - 1) : 0;
    const points = data.map((v, i) => ({
      x: i * stepX,
      y: height - ((v - min) / range) * (height - 2) - 1,
    }));
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const cur = points[i];
      const cx = (prev.x + cur.x) / 2;
      d += ` Q ${prev.x} ${prev.y} ${cx} ${(prev.y + cur.y) / 2}`;
      d += ` T ${cur.x} ${cur.y}`;
    }
    return d;
  }, [data, width, height]);

  return (
    <Svg width={width} height={height}>
      {path ? (
        <Path
          d={path}
          stroke={color}
          strokeWidth={1.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </Svg>
  );
}
