import { UnlockToast } from '@/components/achievements/unlock-toast';
import { useAchievementsStore } from '@/store/use-achievements-store';

/**
 * Mounted once at the root. Renders the head of the recentlyUnlocked queue
 * as a toast; toast calls `consumeRecent` on dismiss to advance.
 */
export function UnlockOverlay() {
  const queue = useAchievementsStore((s) => s.recentlyUnlocked);
  const consume = useAchievementsStore((s) => s.consumeRecent);
  const head = queue[0];
  if (!head) return null;
  return <UnlockToast key={head} achievementId={head} onDone={() => consume(head)} />;
}
