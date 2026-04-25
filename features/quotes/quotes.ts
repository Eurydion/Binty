export interface DailyQuote {
  text: string;
  author: string;
}

const QUOTES: DailyQuote[] = [
  { text: 'Almost everything will work again if you unplug it for a few minutes — including you.', author: 'Anne Lamott' },
  { text: 'Rest is not idleness, and to lie sometimes on the grass under trees is by no means a waste of time.', author: 'John Lubbock' },
  { text: 'You don’t have to see the whole staircase, just take the first step.', author: 'Martin Luther King Jr.' },
  { text: 'Take care of your body. It’s the only place you have to live.', author: 'Jim Rohn' },
  { text: 'Inhale the future, exhale the past.', author: 'Unknown' },
  { text: 'Self-care is how you take your power back.', author: 'Lalah Delia' },
  { text: 'Slow breathing is like an anchor in the midst of an emotional storm.', author: 'Russ Harris' },
  { text: 'Healing takes time, and asking for help is a courageous step.', author: 'Mariska Hargitay' },
  { text: 'Almost any feeling can be survived if you can just keep breathing.', author: 'Glennon Doyle' },
  { text: 'You are allowed to be both a masterpiece and a work in progress.', author: 'Sophia Bush' },
  { text: 'Drink water. Touch grass. Take a breath. Repeat.', author: 'Unknown' },
  { text: 'A calm mind brings inner strength and self-confidence.', author: 'Dalai Lama' },
  { text: 'Nothing diminishes anxiety faster than action.', author: 'Walter Anderson' },
  { text: 'Don’t wait until you’re thirsty to drink, or tired to rest.', author: 'Unknown' },
  { text: 'Movement is a medicine for creating change in a person’s physical, emotional, and mental states.', author: 'Carol Welch' },
  { text: 'Your calm mind is the ultimate weapon against your challenges.', author: 'Bryant McGill' },
  { text: 'Sometimes the most productive thing you can do is rest.', author: 'Mark Black' },
  { text: 'Be gentle with yourself. You’re doing the best you can.', author: 'Unknown' },
  { text: 'Breathe in deeply to bring your mind home to your body.', author: 'Thich Nhat Hanh' },
  { text: 'A good laugh and a long sleep are the best cures in the doctor’s book.', author: 'Irish Proverb' },
  { text: 'Notice when your shoulders sneak up. Drop them.', author: 'Unknown' },
  { text: 'Hydration is a love letter to tomorrow’s you.', author: 'Unknown' },
  { text: 'Mental health is not a destination, but a process.', author: 'Noam Shpancer' },
  { text: 'Stillness is where creativity and solutions to problems are found.', author: 'Eckhart Tolle' },
  { text: 'You can rest and still be enough.', author: 'Unknown' },
  { text: 'Worry pretends to be necessary, but serves no useful purpose.', author: 'Eckhart Tolle' },
  { text: 'Sleep is the best meditation.', author: 'Dalai Lama' },
  { text: 'Small steps every day.', author: 'Unknown' },
  { text: 'Don’t forget to drink water and get sun. You’re basically a houseplant with feelings.', author: 'Unknown' },
  { text: 'Healing isn’t linear. Be patient with the seasons of your mind.', author: 'Unknown' },
];

function dayOfYear(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}

export function getDailyQuote(date = new Date()): DailyQuote {
  const idx = dayOfYear(date) % QUOTES.length;
  return QUOTES[idx];
}
