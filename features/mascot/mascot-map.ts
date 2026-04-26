import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';

import type { EmotionalState } from '@/types/health';

import AnxiousSvg from '@/assets/images/anxious.svg';
import CalmSvg from '@/assets/images/calm.svg';
import HappySvg from '@/assets/images/happy_energized.svg';
import SadSvg from '@/assets/images/sad.svg';
import StressedSvg from '@/assets/images/stressed.svg';

/**
 * Maps each emotional state to an SVG mascot component.
 * SVGs live in `assets/images/` and are imported via react-native-svg-transformer.
 */
export const MascotMap: Record<EmotionalState, FC<SvgProps>> = {
  calm: CalmSvg,
  energized: HappySvg,
  anxious: AnxiousSvg,
  stressed: StressedSvg,
  sad: SadSvg,
};

export function getMascotComponent(state: EmotionalState): FC<SvgProps> {
  return MascotMap[state] ?? HappySvg;
}
