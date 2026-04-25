import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RoutineCategory } from '@/components/routine/category-chips';
import { CategoryChips } from '@/components/routine/category-chips';
import { MealDetail } from '@/components/routine/meal-detail';
import { RoutineHeader } from '@/components/routine/routine-header';
import { SlotSwapSheet } from '@/components/routine/slot-swap-sheet';
import { TaskCard } from '@/components/routine/task-card';
import { WeekStrip } from '@/components/routine/week-strip';
import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { enrichMealWithPrices, calculateMealCost } from '@/features/meals/ingredient-calculator';
import { fetchMarketPrices } from '@/features/meals/market-api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDate } from '@/lib/date';
import { useHealthStore } from '@/store/use-health-store';
import { useMarketStore } from '@/store/use-market-store';
import { useRoutineStore } from '@/store/use-routine-store';
import { useUserStore } from '@/store/use-user-store';
import type { Meal } from '@/types/meals';
import type {
  ActivitySlot,
  HydrationSlot,
  MealSlot,
  RoutineBlock,
  RoutineSlot,
  SlotAlternative,
} from '@/types/routine';

type SwapSheet =
  | { visible: true; slotId: string; kind: 'activity'; currentTitle: string; alternatives: SlotAlternative[] }
  | { visible: true; slotId: string; kind: 'meal'; currentTitle: string; alternatives: Meal[] }
  | { visible: false };

const MEAL_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  breakfast: 'restaurant-outline',
  lunch: 'restaurant-outline',
  dinner: 'restaurant-outline',
  snack: 'nutrition-outline',
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function RoutineScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const {
    routine,
    selectedDate,
    selectedCategory,
    isGenerating,
    setSelectedDate,
    setSelectedCategory,
    ensureRoutineForDate,
    completeSlot,
    swapSlot,
    swapMeal,
    loadFromStorage,
    loadAllRoutineDates,
    routineCache,
  } = useRoutineStore();

  const { profile } = useUserStore();
  const { snapshot } = useHealthStore();
  const { prices, setPrices, setLoading, setError } = useMarketStore();

  const [expandedMealId, setExpandedMealId] = useState<string | null>(null);
  const [swapSheet, setSwapSheet] = useState<SwapSheet>({ visible: false });
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  const [calendarYear, setCalendarYear] = useState(selectedDate.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(selectedDate.getMonth());

  // Read-only for past dates that already have a logged routine
  const hasRoutine = routine !== null && routine.blocks.length > 0;
  const today = useMemo(() => new Date(), []);
  const isBeforeToday = useMemo(() => {
    const sel = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const tod = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return sel.getTime() < tod.getTime();
  }, [selectedDate, today]);
  const readOnly = isBeforeToday && hasRoutine;

  // Compute streak dates for indicators on week strip and calendar
  const routineDateSet = useMemo(() => new Set(Object.keys(routineCache)), [routineCache]);
  const streakDates = useMemo(() => {
    if (routineDateSet.size === 0) return new Set<string>();
    const todayKey = formatDate(today);
    const dates = new Set<string>();
    const d = new Date(today);
    if (!routineDateSet.has(todayKey)) {
      d.setDate(d.getDate() - 1);
    }
    while (true) {
      const key = formatDate(d);
      if (routineDateSet.has(key)) {
        dates.add(key);
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return dates;
  }, [routineDateSet, today]);

  const handleMonthPress = useCallback(() => {
    setCalendarYear(selectedDate.getFullYear());
    setCalendarMonth(selectedDate.getMonth());
    setMonthPickerVisible(true);
  }, [selectedDate]);

  const handleDaySelect = useCallback(
    (day: number) => {
      setSelectedDate(new Date(calendarYear, calendarMonth, day));
      setMonthPickerVisible(false);
    },
    [calendarYear, calendarMonth, setSelectedDate],
  );

  const handleCalendarPrevMonth = useCallback(() => {
    setCalendarMonth((prev) => {
      if (prev === 0) {
        setCalendarYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const handleCalendarNextMonth = useCallback(() => {
    setCalendarMonth((prev) => {
      if (prev === 11) {
        setCalendarYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  // Build calendar grid for the viewed month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const rows: (number | null)[][] = [];
    let week: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      week.push(d);
      if (week.length === 7) {
        rows.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      rows.push(week);
    }
    return rows;
  }, [calendarYear, calendarMonth]);

  useEffect(() => {
    loadFromStorage();
    loadAllRoutineDates();

    setLoading(true);
    fetchMarketPrices()
      .then((p) => setPrices(p))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to fetch prices'),
      )
      .finally(() => setLoading(false));
  }, [loadFromStorage, loadAllRoutineDates, setPrices, setLoading, setError]);

  // Auto-load routine when selectedDate changes
  useEffect(() => {
    if (profile && snapshot) {
      ensureRoutineForDate(profile, snapshot);
    }
  }, [selectedDate, profile, snapshot, ensureRoutineForDate]);

  const handleCategorySelect = useCallback(
    (cat: RoutineCategory) => setSelectedCategory(cat),
    [setSelectedCategory],
  );

  const handleToggleMealExpand = useCallback(
    (slotId: string) => setExpandedMealId((prev) => (prev === slotId ? null : slotId)),
    [],
  );

  const handleActivityLongPress = useCallback(
    (slot: ActivitySlot) => {
      if (readOnly) return;
      if (!slot.alternatives || slot.alternatives.length === 0) return;
      setSwapSheet({
        visible: true,
        slotId: slot.id,
        kind: 'activity',
        currentTitle: slot.title,
        alternatives: slot.alternatives,
      });
    },
    [readOnly],
  );

  const handleMealChange = useCallback(
    (slot: MealSlot) => {
      if (readOnly) return;
      if (!slot.alternativeMeals || slot.alternativeMeals.length === 0) return;
      setSwapSheet({
        visible: true,
        slotId: slot.id,
        kind: 'meal',
        currentTitle: slot.suggestedMeal?.name ?? 'Meal',
        alternatives: slot.alternativeMeals,
      });
    },
    [readOnly],
  );

  const handleSwapSelect = useCallback(
    (selection: SlotAlternative | Meal) => {
      if (!swapSheet.visible) return;
      if (swapSheet.kind === 'activity') {
        swapSlot(swapSheet.slotId, selection as SlotAlternative);
      } else {
        swapMeal(swapSheet.slotId, selection as Meal);
      }
      setSwapSheet({ visible: false });
    },
    [swapSheet, swapSlot, swapMeal],
  );

  const handleSwapClose = useCallback(() => setSwapSheet({ visible: false }), []);

  // Filter blocks by category
  const filteredBlocks: RoutineBlock[] = useMemo(() => {
    if (!routine) return [];
    if (selectedCategory === 'All') return routine.blocks;

    return routine.blocks
      .map((block) => ({
        ...block,
        slots: block.slots.filter((slot) => slot.category === selectedCategory),
      }))
      .filter((block) => block.slots.length > 0);
  }, [routine, selectedCategory]);

  function enrichSlotMeal(slot: MealSlot): Meal | null {
    if (!slot.suggestedMeal) return null;
    return prices.length > 0
      ? enrichMealWithPrices(slot.suggestedMeal, prices)
      : slot.suggestedMeal;
  }

  function getMealSubtitle(meal: Meal): string {
    const parts: string[] = [];
    if (meal.calories) parts.push(`${meal.calories} kcal`);
    const cost =
      prices.length > 0 ? calculateMealCost(meal, prices) : meal.estimatedCostPhp;
    if (cost && cost > 0) parts.push(`~₱${Math.round(cost)}`);
    return parts.join(' · ');
  }

  function renderSlot(slot: RoutineSlot) {
    if (slot.type === 'meal') {
      const mealSlot = slot as MealSlot;
      const enrichedMeal = enrichSlotMeal(mealSlot);
      if (!enrichedMeal) return null;
      const iconName = (MEAL_ICON[mealSlot.mealType] ?? 'restaurant-outline') as keyof typeof Ionicons.glyphMap;
      const isExpanded = expandedMealId === slot.id;

      const mealLabel = mealSlot.mealType.charAt(0).toUpperCase() + mealSlot.mealType.slice(1);

      return (
        <TaskCard
          key={slot.id}
          title={`${mealLabel}: ${enrichedMeal.name}`}
          subtitle={`Suggested · ${getMealSubtitle(enrichedMeal)}`}
          completed={slot.completed}
          isMeal
          isExpanded={isExpanded}
          readOnly={readOnly}
          icon={iconName}
          iconColor={Palette.kangkong}
          onPress={() => handleToggleMealExpand(slot.id)}
          onToggle={() => completeSlot(slot.id)}
        >
          <MealDetail
            meal={enrichedMeal}
            onChangeMeal={readOnly ? undefined : () => handleMealChange(mealSlot)}
          />
        </TaskCard>
      );
    }

    if (slot.type === 'hydration') {
      const hydSlot = slot as HydrationSlot;
      return (
        <TaskCard
          key={slot.id}
          title="Drink Water"
          subtitle={`${hydSlot.targetMl}ml`}
          completed={slot.completed}
          readOnly={readOnly}
          icon="water-outline"
          iconColor={Palette.silverBlue}
          onToggle={() => completeSlot(slot.id)}
        />
      );
    }

    // activity | mindfulness | rest | custom
    const actSlot = slot as ActivitySlot;
    const activityIcon: Record<string, keyof typeof Ionicons.glyphMap> = {
      activity: 'barbell-outline',
      mindfulness: 'leaf-outline',
      rest: 'bed-outline',
      custom: 'sparkles-outline',
    };
    const activityIconColor: Record<string, string> = {
      activity: Palette.kangkong,
      mindfulness: Palette.teal,
      rest: Palette.silverBlue,
      custom: Palette.kamote,
    };
    return (
      <TaskCard
        key={slot.id}
        title={actSlot.title}
        subtitle={`${actSlot.durationMinutes} min · ${actSlot.intensity}`}
        completed={slot.completed}
        readOnly={readOnly}
        icon={activityIcon[slot.type] ?? 'fitness-outline'}
        iconColor={activityIconColor[slot.type] ?? Palette.kangkong}
        onToggle={() => completeSlot(slot.id)}
        onLongPress={
          !readOnly && actSlot.alternatives && actSlot.alternatives.length > 0
            ? () => handleActivityLongPress(actSlot)
            : undefined
        }
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: Spacing.lg,
          paddingBottom: 120,
          paddingHorizontal: Spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
      >
        <RoutineHeader selectedDate={selectedDate} onMonthPress={handleMonthPress} />

        <WeekStrip
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          routineDates={routineDateSet}
        />

        <CategoryChips
          selected={selectedCategory}
          onSelect={handleCategorySelect}
        />

        {/* Read-only banner for past dates with existing logs */}
        {readOnly && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: scheme === 'light' ? 'rgba(79,121,66,0.08)' : 'rgba(79,121,66,0.15)',
              borderRadius: Radii.md,
              paddingHorizontal: Spacing.lg,
              paddingVertical: Spacing.sm,
              marginBottom: Spacing.lg,
            }}
          >
            <Ionicons name="lock-closed-outline" size={14} color={Palette.kangkong} />
            <Text style={{ fontSize: 12, fontWeight: '500', color: Palette.kangkong }}>
              Past routine — view only
            </Text>
          </View>
        )}

        {isGenerating ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 64 }}>
            <ActivityIndicator size="small" color={Palette.kangkong} />
            <Text style={{ fontSize: 13, color: c.iconMuted, marginTop: Spacing.sm }}>
              Loading routine…
            </Text>
          </View>
        ) : hasRoutine ? (
          <View style={{ gap: Spacing.lg }}>
            {filteredBlocks.map((block) => (
              <View key={block.id}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: c.iconMuted,
                    textTransform: 'uppercase',
                    letterSpacing: 1.2,
                    marginBottom: Spacing.md,
                    marginTop: Spacing.sm,
                  }}
                >
                  {block.label}
                </Text>
                {block.slots.map(renderSlot)}
              </View>
            ))}
          </View>
        ) : (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 64 }}>
            <Ionicons name="calendar-outline" size={48} color={c.iconMuted} style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: c.text, marginBottom: 6 }}>
              No routine yet
            </Text>
            <Text style={{ fontSize: 14, color: c.iconMuted, textAlign: 'center', paddingHorizontal: 32 }}>
              {isBeforeToday
                ? 'No routine was logged for this day.'
                : 'A routine will be generated based on your health data.'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Swap sheet modal — only available for today */}
      <Modal
        visible={swapSheet.visible}
        transparent
        animationType="slide"
        onRequestClose={handleSwapClose}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'flex-end',
          }}
          onPress={handleSwapClose}
        >
          <Pressable onPress={() => {}}>
            {swapSheet.visible && swapSheet.kind === 'activity' && (
              <SlotSwapSheet
                kind="activity"
                currentTitle={swapSheet.currentTitle}
                alternatives={swapSheet.alternatives}
                onSelect={(alt) => handleSwapSelect(alt)}
                onClose={handleSwapClose}
              />
            )}
            {swapSheet.visible && swapSheet.kind === 'meal' && (
              <SlotSwapSheet
                kind="meal"
                currentTitle={swapSheet.currentTitle}
                alternatives={swapSheet.alternatives}
                onSelect={(meal) => handleSwapSelect(meal)}
                onClose={handleSwapClose}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Calendar picker modal */}
      <Modal
        visible={monthPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMonthPickerVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setMonthPickerVisible(false)}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: c.surface,
              borderRadius: Radii.lg,
              width: 320,
              paddingBottom: 16,
              borderWidth: 1,
              borderColor: Borders.hairline[scheme],
            }}
          >
            {/* Month/year header with arrows */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingTop: 18,
                paddingBottom: 14,
              }}
            >
              <Pressable
                onPress={handleCalendarPrevMonth}
                hitSlop={12}
                style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
              >
                <Ionicons name="chevron-back" size={22} color={c.text} />
              </Pressable>
              <Text style={{ fontSize: 17, fontWeight: '700', color: c.text }}>
                {MONTH_NAMES[calendarMonth]} {calendarYear}
              </Text>
              <Pressable
                onPress={handleCalendarNextMonth}
                hitSlop={12}
                style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
              >
                <Ionicons name="chevron-forward" size={22} color={c.text} />
              </Pressable>
            </View>

            {/* Day-of-week labels */}
            <View style={{ flexDirection: 'row', paddingHorizontal: 12, marginBottom: 4 }}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <View key={d} style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: c.iconMuted }}>
                    {d}
                  </Text>
                </View>
              ))}
            </View>

            {/* Calendar grid */}
            {calendarDays.map((week, wi) => (
              <View key={wi} style={{ flexDirection: 'row', paddingHorizontal: 12 }}>
                {week.map((day, di) => {
                  if (day === null) {
                    return <View key={`e-${di}`} style={{ flex: 1, height: 46 }} />;
                  }
                  const isSelected =
                    calendarYear === selectedDate.getFullYear() &&
                    calendarMonth === selectedDate.getMonth() &&
                    day === selectedDate.getDate();
                  const isDayToday =
                    calendarYear === new Date().getFullYear() &&
                    calendarMonth === new Date().getMonth() &&
                    day === new Date().getDate();
                  const dateKey = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isStreak = streakDates.has(dateKey);
                  return (
                    <View key={day} style={{ flex: 1, alignItems: 'center' }}>
                      <Pressable
                        onPress={() => handleDaySelect(day)}
                        style={({ pressed }) => ({
                          width: 36,
                          height: 46,
                          borderRadius: 18,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isSelected
                            ? Palette.kangkong
                            : pressed
                              ? c.background
                              : 'transparent',
                          borderWidth: isDayToday && !isSelected ? 1.5 : 0,
                          borderColor: isDayToday && !isSelected ? Palette.kangkong : 'transparent',
                          marginVertical: 1,
                        })}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: isSelected || isDayToday ? '700' : '400',
                            color: isSelected
                              ? Palette.cloud
                              : isDayToday
                                ? Palette.kangkong
                                : c.text,
                          }}
                        >
                          {day}
                        </Text>
                        {isStreak && (
                          <Ionicons name="flame" size={10} color={isSelected ? Palette.cloud : Palette.kamote} style={{ marginTop: 1 }} />
                        )}
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
