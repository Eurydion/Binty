import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Borders, Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/features/hooks/use-color-scheme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const ICONS: Record<string, { active: IoniconName; inactive: IoniconName; label: string }> = {
  routine: { active: 'list', inactive: 'list-outline', label: 'Routine' },
  index: { active: 'home', inactive: 'home-outline', label: 'Home' },
  analytics: { active: 'pulse', inactive: 'pulse-outline', label: 'Analytics' },
};

const ORDER = ['routine', 'index', 'analytics'] as const;

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const insets = useSafeAreaInsets();

  const routesByName = Object.fromEntries(state.routes.map((r) => [r.name, r]));

  function handlePress(routeName: string, isFocused: boolean) {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const route = routesByName[routeName];
    if (!route) return;
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name as never);
    }
  }

  const focusedName = state.routes[state.index]?.name;

  return (
    <View
      style={{
        backgroundColor: c.tabBarBackground,
        borderTopWidth: 1,
        borderTopColor: Borders.hairline[scheme],
        paddingBottom: insets.bottom,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 64,
        }}>
        {ORDER.map((name) => {
          const meta = ICONS[name];
          const isFocused = focusedName === name;
          const isCenter = name === 'index';

          if (isCenter) {
            return (
              <Pressable
                key={name}
                accessibilityRole="button"
                accessibilityLabel="Home"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={() => handlePress(name, isFocused)}
                style={({ pressed }) => ({
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  opacity: pressed ? 0.7 : 1,
                })}>
                <View
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 9999,
                    backgroundColor: Palette.kangkong,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Ionicons
                    name={isFocused ? meta.active : meta.inactive}
                    size={30}
                    color="#FFFFFF"
                  />
                </View>
              </Pressable>
            );
          }

          const color = isFocused ? Palette.kangkong : c.iconMuted;
          return (
            <Pressable
              key={name}
              accessibilityRole="button"
              accessibilityLabel={meta.label}
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={() => handlePress(name, isFocused)}
              style={({ pressed }) => ({
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                opacity: pressed ? 0.7 : 1,
              })}>
              <Ionicons
                name={isFocused ? meta.active : meta.inactive}
                size={24}
                color={color}
              />
              <Text
                style={{
                  marginTop: 2,
                  fontSize: 11,
                  fontWeight: '600',
                  color,
                }}>
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}