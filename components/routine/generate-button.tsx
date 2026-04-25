import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Colors, Palette, Radii } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Props {
  onGenerate: () => void;
  isGenerating: boolean;
  error?: string | null;
}

export function GenerateButton({ onGenerate, isGenerating, error }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  return (
    <View style={{ alignItems: 'center', paddingTop: 64, paddingBottom: 32 }}>
      <Ionicons
        name="sparkles-outline"
        size={48}
        color={Palette.kangkong}
        style={{ marginBottom: 16 }}
      />
      <Text style={{ fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 8 }}>
        No routine yet
      </Text>
      <Text style={{ fontSize: 14, color: c.iconMuted, textAlign: 'center', marginBottom: 24, paddingHorizontal: 32 }}>
        Generate a personalized routine based on your health data and goals.
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
          gap: 10,
        })}>
        {isGenerating ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons name="sparkles" size={20} color="#FFFFFF" />
        )}
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
          {isGenerating ? 'Generating…' : 'Generate Routine'}
        </Text>
      </Pressable>

      {error && (
        <Text style={{ fontSize: 12, color: '#D32F2F', marginTop: 12, textAlign: 'center', paddingHorizontal: 24 }}>
          {error}
        </Text>
      )}
    </View>
  );
}
