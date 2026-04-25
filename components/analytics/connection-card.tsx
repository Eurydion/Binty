import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHealthStore } from '@/store/use-health-store';

export function ConnectionCard() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const connection = useHealthStore((s) => s.connection);
  const connect = useHealthStore((s) => s.connect);
  const pause = useHealthStore((s) => s.pause);
  const resume = useHealthStore((s) => s.resume);
  const disconnect = useHealthStore((s) => s.disconnect);

  const dotColor =
    connection === 'connected'
      ? Palette.kangkong
      : connection === 'paused'
      ? Palette.kamote
      : c.iconMuted;
  const label =
    connection === 'connected' ? 'Connected' : connection === 'paused' ? 'Paused' : 'Disconnected';

  return (
    <View style={{ paddingHorizontal: 24 }}>
      <View
        style={{
          borderRadius: Radii.lg,
          padding: Spacing.lg,
          borderWidth: 1,
          borderColor: Borders.hairline[scheme],
          backgroundColor: c.surface,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: Spacing.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 }}>
          <Ionicons name="watch-outline" size={20} color={c.icon} />
          <View style={{ flexShrink: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: c.text }}>Smartwatch</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 9999,
                  backgroundColor: dotColor,
                }}
              />
              <Text style={{ fontSize: 12, color: c.iconMuted }}>{label}</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {connection === 'disconnected' ? (
            <PrimaryBtn label="Connect" onPress={connect} scheme={scheme} />
          ) : null}
          {connection === 'connected' ? (
            <>
              <SecondaryBtn label="Pause" onPress={pause} scheme={scheme} />
              <SecondaryBtn label="Disconnect" onPress={disconnect} scheme={scheme} />
            </>
          ) : null}
          {connection === 'paused' ? (
            <>
              <PrimaryBtn label="Resume" onPress={resume} scheme={scheme} />
              <SecondaryBtn label="Disconnect" onPress={disconnect} scheme={scheme} />
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function PrimaryBtn({ label, onPress, scheme }: { label: string; onPress: () => void; scheme: 'light' | 'dark' }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: Palette.kangkong,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: Radii.pill,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text style={{ color: Palette.cloud, fontSize: 12, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

function SecondaryBtn({ label, onPress, scheme }: { label: string; onPress: () => void; scheme: 'light' | 'dark' }) {
  const c = Colors[scheme];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: 'transparent',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: Radii.pill,
        borderWidth: 1,
        borderColor: Borders.hairline[scheme],
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Text style={{ color: c.text, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}
