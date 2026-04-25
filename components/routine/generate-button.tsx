import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Colors, Palette, Radii } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Props {
  onGenerate: () => void;
  isGenerating: boolean;
  error?: string | null;
  hasRoutine?: boolean;
}

export function GenerateButton({ onGenerate, isGenerating, error, hasRoutine }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const iconName = hasRoutine ? "refresh" : "sparkles-outline";
  const buttonIcon = hasRoutine ? "refresh" : "sparkles";
  const title = hasRoutine ? "Routine generated" : "No routine yet";
  const subtitle = hasRoutine
    ? "Tap below to regenerate with latest health data."
    : "Generate a personalized routine based on your health data and goals.";
  const buttonLabel = isGenerating
    ? "Generating\u2026"
    : hasRoutine
      ? "Regenerate Routine"
      : "Generate Routine";

  return (
    <View style={{ alignItems: 'center', paddingTop: 64, paddingBottom: 32 }}>
      <Ionicons
        name={iconName}
        size={48}
        color={Palette.kangkong}
        style={{ marginBottom: 16 }}
      />
      <Text style={{ fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 8 }}>
        {title}
      </Text>
      <Text style={{ fontSize: 14, color: c.iconMuted, textAlign: 'center', marginBottom: 24, paddingHorizontal: 32 }}>
        {subtitle}
      </Text>

      <Pressable
        onPress={onGenerate}
        disabled={isGenerating}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: Palette.kangkong,
          paddingHorizontal: 28,
          paddingVertical: 14,
          borderRadius: Radii.pill,
          opacity: pressed ? 0.85 : 1,
          minHeight: 44,
          gap: 10,
        })}>
        {isGenerating ? (
          <ActivityIndicator size="small" color={Palette.cloud} />
        ) : (
          <Ionicons name={buttonIcon} size={20} color={Palette.cloud} />
        )}
        <Text style={{ fontSize: 16, fontWeight: '600', color: Palette.cloud }}>
          {buttonLabel}
        </Text>
      </Pressable>

      {error && (
        <Text style={{ fontSize: 12, color: Palette.kamote, marginTop: 12, textAlign: 'center', paddingHorizontal: 24 }}>
          {error}
        </Text>
      )}
    </View>
  );
}
