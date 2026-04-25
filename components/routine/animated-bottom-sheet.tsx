import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, View } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** ms — backdrop fade duration */
  fadeDuration?: number;
  /** ms — sheet slide-up duration */
  slideDuration?: number;
  /** dim color */
  backdropColor?: string;
  /** Where the sheet anchors */
  anchor?: 'bottom' | 'center';
}

/**
 * Bottom sheet (or centered modal) where the dim backdrop fades in/out
 * independently from the sheet's slide-up animation. Both close together
 * but the backdrop never "slides" with the sheet.
 */
export function AnimatedBottomSheet({
  visible,
  onClose,
  children,
  fadeDuration = 200,
  slideDuration = 260,
  backdropColor = 'rgba(0,0,0,0.4)',
  anchor = 'bottom',
}: Props) {
  const [mounted, setMounted] = useState(visible);
  const backdrop = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(1)).current; // 0 = open, 1 = closed (off-screen)

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 1,
          duration: fadeDuration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slide, {
          toValue: 0,
          duration: slideDuration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 0,
          duration: fadeDuration,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slide, {
          toValue: 1,
          duration: slideDuration,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, mounted, backdrop, slide, fadeDuration, slideDuration]);

  if (!mounted) return null;

  const translateY = slide.interpolate({
    inputRange: [0, 1],
    outputRange: anchor === 'bottom' ? [0, 600] : [0, 60],
  });
  const opacity = anchor === 'center' ? backdrop : 1;

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      <View style={{ flex: 1 }}>
        <Animated.View
          style={{
            ...StyleSheetAbsoluteFill,
            backgroundColor: backdropColor,
            opacity: backdrop,
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>

        <Animated.View
          pointerEvents="box-none"
          style={{
            flex: 1,
            justifyContent: anchor === 'bottom' ? 'flex-end' : 'center',
            alignItems: anchor === 'center' ? 'center' : undefined,
            transform: [{ translateY }],
            opacity,
          }}
        >
          <Pressable onPress={() => {}}>{children}</Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const StyleSheetAbsoluteFill = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};
