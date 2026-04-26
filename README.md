# Binty — Less Guessing, More Living

A mobile wellness companion built for the realities of Filipino life. Binty combines real-time health monitoring, AI-powered routine generation, culturally relevant meal planning, and gentle behavioral nudges to help users build sustainable healthy habits — without the guesswork.

---

## Project Overview

### The Problem

Filipinos face a growing wellness gap: rising rates of lifestyle diseases (diabetes, hypertension, cardiovascular conditions) collide with limited access to personalized health guidance. Most wellness apps are designed for Western diets, schedules, and lifestyles — leaving Filipino users with generic advice that doesn't fit their reality. People are left guessing about what to eat, when to exercise, how stressed they really are, and what to do about it.

### The Proposed Solution

Binty is an intelligent, culturally-aware wellness companion that:

- **Monitors real-time health signals** (heart rate via camera PPG, step counting, sleep patterns) to replace guesswork with data
- **Generates personalized daily routines** using AI that adapt to the user's stress levels, sleep quality, fitness goals, and schedule
- **Plans Filipino meals** with cost estimates from local market prices — making healthy eating practical and affordable
- **Detects wellness triggers** (anxiety spikes, dehydration, sedentary behavior) and delivers timely interventions (breathing exercises, grounding techniques, hydration reminders)
- **Gamifies progress** with achievements, streaks, and a mood-reactive mascot to keep users engaged

---

## Features

### Health Monitoring
- **Camera-based PPG** — Measures heart rate by detecting blood flow through a fingertip placed on the rear camera with flash. Uses red-channel analysis from `expo-camera` and `expo-image-manipulator`
- **Phone pedometer** — Tracks daily steps using device motion sensors via `expo-sensors`
- **Sleep tracking** — Generates and visualizes sleep stage data (light, deep, REM, awake) with quality scoring
- **Smartwatch bridge** — Stubbed integration layer for BLE / Health Connect / HealthKit for future wearable support

### Intelligent Routine Engine
- **AI-powered routine generation** — Creates personalized daily plans using OpenAI (configurable provider) based on health snapshot, goals, and intensity preference
- **Local fallback generator** — Offline routine generation from curated exercise and meal pools when AI is unavailable
- **JSON-defined exercise library** — Extensible dataset of categorized exercises (mindfulness, light/medium movement, strength) loaded from `assets/dataset/Routines.json`
- **Slot swapping** — Users can swap meals or activities within their daily plan via a bottom sheet UI

### Filipino Meal Planning
- **Culturally relevant recipes** — Database of Filipino meals with full ingredient lists, nutritional info, and preparation steps
- **Health-aware suggestions** — Calming meals on high-stress days, dietary filters (e.g., no-pork), calorie-conscious options
- **Market price integration** — Ingredient cost calculator with market price API and AI-powered price fallback
- **Water intake tracking** — Personalized hydration goals based on body weight with visual progress tracking

### Wellness Interventions
- **Trigger detection engine** — Monitors for anxiety spikes, stress spikes, low energy, dehydration, sedentary behavior, and positive streaks
- **Severity classification** — Categorizes triggers as mild, moderate, or severe to calibrate response
- **Guided interventions** — Breathing exercises (box breathing, 4-7-8), body scan, grounding (5-4-3-2-1 technique), gratitude journaling
- **Check-in system** — Auto-prompted mood check-ins when urgent triggers fire

### Engagement & Gamification
- **Achievement system** — Unlockable badges (First Connect, Hydrated, Calm Mind, etc.) with point values and rank progression
- **Mood-reactive mascot** — SVG character that reflects the user's emotional state (calm, energized, anxious, stressed, sad) with animated transitions
- **Daily tips** — Curated wellness tips contextualized to the user's current health state
- **Health facts library** — Categorized educational content (water, steps, heart rate, sleep, stress, nutrition, mental wellbeing, recovery, sunlight)

### Analytics Dashboard
- **Key metrics strip** — Real-time sparklines for BPM, steps, and stress score
- **Heart rate chart** — Detailed heart rate visualization over time
- **Sleep analysis** — Sleep stage timeline, duration breakdown, and quality ring
- **Scenario simulation** — Preset health scenarios (resting, high-anxiety, panic-spike, deep-sleep, post-workout) for development and demo

---

## Tech Stack & Credits

### Frameworks & Core
| Technology | Version | Purpose |
|---|---|---|
| [Expo](https://expo.dev) | SDK 54 | App framework and build tooling |
| [React Native](https://reactnative.dev) | 0.81.5 | Cross-platform mobile UI |
| [React](https://react.dev) | 19.1 | UI library |
| [Expo Router](https://docs.expo.dev/router/introduction/) | 6 | File-based navigation |
| [TypeScript](https://www.typescriptlang.org) | 5.9 | Type-safe development |

### UI & Styling
| Technology | Purpose |
|---|---|
| [NativeWind](https://www.nativewind.dev) 4 + [Tailwind CSS](https://tailwindcss.com) 3.4 | Utility-first styling |
| [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) 4.1 | Performant animations |
| [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/) 2.28 | Touch gesture handling |
| [React Native SVG](https://github.com/software-mansion/react-native-svg) 15.12 | SVG mascot rendering |
| [@expo/vector-icons](https://icons.expo.fyi) | Ionicons icon set |
| [Expo Image](https://docs.expo.dev/versions/latest/sdk/image/) | Optimized image display |

### State Management & Storage
| Technology | Purpose |
|---|---|
| [Zustand](https://zustand-demo.pmnd.rs) 5 | Lightweight state management |
| [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) 2.2 | Persistent local storage |

### Device APIs
| Technology | Purpose |
|---|---|
| [Expo Camera](https://docs.expo.dev/versions/latest/sdk/camera/) | PPG heart rate scanning |
| [Expo Image Manipulator](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/) | Frame pixel analysis for PPG |
| [Expo Sensors](https://docs.expo.dev/versions/latest/sdk/sensors/) | Pedometer / step counting |
| [Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/) | Tactile feedback |
| [Expo Audio](https://docs.expo.dev/versions/latest/sdk/audio/) | Alert sounds for interventions |
| [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/) | Market locator for meal pricing |

### AI & Data Processing
| Technology | Purpose |
|---|---|
| OpenAI / Azure OpenAI API | AI-powered routine generation and insight messages |
| [upng-js](https://github.com/nickthedude/upng-js) | PNG decoding for PPG frame analysis |
| [sharp](https://sharp.pixelplumbing.com) (dev) | App icon generation from SVG |

### Dev Tooling
| Technology | Purpose |
|---|---|
| [ESLint](https://eslint.org) 9 + [eslint-config-expo](https://github.com/expo/expo/tree/main/packages/eslint-config-expo) | Code linting |
| [react-native-svg-transformer](https://github.com/kristerkari/react-native-svg-transformer) | Import SVGs as React components |

---

## Running Locally

### Prerequisites

- **Node.js** >= 18
- **npm** (comes with Node.js)
- **Expo Go** app installed on your phone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)), OR an Android emulator / iOS simulator

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/Eurydion/binty.git
   cd binty
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up mascot assets** (renames SVG files with spaces)

   ```bash
   node scripts/setup-mascot.js
   ```

4. **(Optional) Generate app icons from mascot SVG**

   ```bash
   node scripts/generate-icons.js
   ```

5. **(Optional) Configure AI features**

   Create a `.env` file in the project root for AI-powered routine generation:

   ```env
   EXPO_PUBLIC_AI_PROVIDER=openai
   EXPO_PUBLIC_AI_API_KEY=your-api-key-here
   EXPO_PUBLIC_AI_MODEL=gpt-4o-mini
   ```

   The app works fully without AI — it falls back to the local routine generator.

### Start the Development Server

```bash
npx expo start
```

This will display a QR code and options:

| Method | How |
|---|---|
| **Expo Go (phone)** | Scan the QR code with your phone's camera (iOS) or the Expo Go app (Android) |
| **Android emulator** | Press `a` in the terminal |
| **iOS simulator** | Press `i` in the terminal (macOS only) |
| **Web browser** | Press `w` in the terminal |

### Other Commands

```bash
npx expo start -c        # Start with cache cleared
npm run android           # Start and open on Android
npm run ios               # Start and open on iOS
npm run web               # Start and open in browser
npm run lint              # Run ESLint
```

---

## Project Structure

```
binty/
├── app/                    # Screens (file-based routing)
│   ├── (tabs)/             # Bottom tab screens (Home, Routine, Analytics)
│   ├── modals/             # Modal screens (breathing, check-in, insights, etc.)
│   ├── _layout.tsx         # Root layout with navigation + onboarding gate
│   └── onboarding.tsx      # Onboarding flow
├── assets/
│   ├── dataset/            # JSON data (health facts, exercise routines)
│   ├── images/             # App icons, mascot SVGs
│   └── sounds/             # Alert audio files
├── components/             # Reusable UI components
│   ├── analytics/          # Analytics tab cards and charts
│   ├── cards/              # Home screen cards
│   ├── charts/             # Line charts, sparklines
│   ├── effects/            # Visual effects (noise, dots, waves)
│   ├── heart/              # Heart rate UI components
│   ├── home/               # Home screen components (mascot, etc.)
│   ├── routine/            # Routine tab components
│   └── ui/                 # Shared UI primitives
├── constants/              # Theme, goals, moods definitions
├── features/               # Domain logic
│   ├── achievements/       # Gamification engine
│   ├── alerts/             # Audio alert playback
│   ├── habits/             # Habit tracking
│   ├── mascot/             # Mood-reactive mascot mapping
│   ├── meals/              # Filipino meal planning + pricing
│   ├── ppg/                # Camera-based heart rate detection
│   ├── simulation/         # Health data scenario simulator
│   ├── sleep/              # Sleep data generation
│   ├── smartwatch/         # Wearable device bridge
│   ├── tips/               # Wellness tip selection
│   └── wellness-engine/    # Core trigger detection + interventions
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── scripts/                # Build & setup scripts
├── services/               # AI client, storage, notifications
├── store/                  # Zustand state stores
└── types/                  # TypeScript type definitions
```
