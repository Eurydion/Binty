import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, Text, View } from 'react-native';

import { Borders, Colors, Palette, Radii } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Props {
  title: string;
  subtitle?: string;
  completed: boolean;
  isMeal?: boolean;
  isExpanded?: boolean;
  readOnly?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onToggle: () => void;
  onLongPress?: () => void;
  onPress?: () => void;
  children?: React.ReactNode;
}

export function TaskCard({
  title,
  subtitle,
  completed,
  isMeal,
  isExpanded,
  readOnly,
  icon,
  iconColor,
  onToggle,
  onLongPress,
  onPress,
  children,
}: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  function handlePress() {
    if (readOnly) return;
    if (onPress) {
      onPress();
    } else {
      handleToggle();
    }
  }

  function handleToggle() {
    if (readOnly) return;
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggle();
  }

  function handleLongPress() {
    if (readOnly) return;
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onLongPress?.();
  }

  return (
    <View style={{ marginBottom: 10 }}>
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={400}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completed }}
        accessibilityLabel={title}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: c.surface,
          borderRadius: Radii.pill,
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderWidth: 1,
          borderColor: Borders.hairline[scheme],
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={completed ? c.iconMuted : (iconColor ?? Palette.kangkong)}
            style={{ marginRight: 8 }}
          />
        )}

        {isMeal && (
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={c.iconMuted}
            style={{ marginRight: 8 }}
          />
        )}

        {onLongPress && !isMeal && (
          <Ionicons
            name="swap-horizontal-outline"
            size={16}
            color={c.iconMuted}
            style={{ marginRight: 8 }}
          />
        )}

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: '500',
              color: completed ? c.iconMuted : c.text,
              textDecorationLine: completed ? 'line-through' : 'none',
            }}
            numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={{ fontSize: 12, color: c.iconMuted, marginTop: 2 }} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        <Pressable
          onPress={handleToggle}
          hitSlop={8}
          style={{
            width: 32,
            height: 32,
            borderRadius: 9999,
            backgroundColor: completed ? Palette.kangkong : 'transparent',
            borderWidth: completed ? 0 : 1.5,
            borderColor: completed ? 'transparent' : Borders.hairline[scheme],
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 12,
          }}>
          {completed ? (
            <Ionicons name="checkmark" size={18} color={Palette.cloud} />
          ) : null}
        </Pressable>
      </Pressable>

      {/* Expandable content (meal detail) */}
      {isExpanded && children}
    </View>
  );
}
