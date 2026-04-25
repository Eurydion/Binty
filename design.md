# Binti Design System

A minimalistic, roundy, wellness-forward UI language. Use this document as the single source of truth when building any new screen or component.

> Tokens live in `constants/theme.ts` (`Palette`, `Radii`, `Spacing`, `Colors`) and in `tailwind.config.js`. Never hardcode hex values in components — always reference tokens.

---

## 1. Brand Principles

1. **Calm & roundy.** Generous corner radii, soft shadows, no hard edges.
2. **Minimalistic.** Whitespace is a feature. One primary action per screen.
3. **Honest hierarchy.** Type + spacing carry weight before color does.
4. **Accessible.** Min 4.5:1 contrast for text. Tap targets ≥ 44×44.

---

## 2. Color Palette

| Token | Hex | Tailwind | Role |
|---|---|---|---|
| Binti Charcoal | `#2C2C2C` | `charcoal` | Primary text, dark surface |
| Kangkong Green | `#4F7942` | `kangkong` | Primary accent, active state, wellness |
| Cloud White | `#F9F9F9` | `cloud` | App background (light), text on dark |
| Kamote Gold | `#E1AD01` | `kamote` | Highlight, streaks, warnings |
| Wellness Teal | `#4A9B9B` | `teal` | Secondary accent, info, analytics |
| Tilapia Silver-Blue | `#A7C7E7` | `silverBlue` | Tertiary accent, water/calm states |

### Light mode
- Background: `cloud` (`#F9F9F9`)
- Surface (cards, footer): `#FFFFFF`
- Text: `charcoal`
- Active accent: `kangkong`

### Dark mode
- Background: `charcoal`
- Surface: `#1F1F1F`
- Text: `cloud`
- Active accent: `kangkong` (unchanged)

**Rule:** Accent colors (kangkong, kamote, teal, silverBlue) keep their hex across modes. Only neutrals flip.

---

## 3. Radii

| Token | px | Use |
|---|---|---|
| `sm` | 8 | Small chips, inputs |
| `md` | 16 | Buttons, inline tags |
| `lg` | 24 | Cards, modals |
| `pill` | 9999 | Footer, pill buttons, circular icons |

**Rule:** Default to `lg` for cards, `pill` for any container that should "float."

---

## 4. Spacing Scale

`xs:4 · sm:8 · md:12 · lg:16 · xl:24 · xxl:32`

Use multiples of 4. Screen edge padding is `xl` (24).

---

## 5. Typography

Use `Fonts.rounded` (system rounded) for headings to reinforce the roundy feel; `Fonts.sans` for body.

| Style | Size | Weight |
|---|---|---|
| Display | 28 | 700 |
| Title | 22 | 700 |
| Section | 16 | 600 |
| Body | 14 | 400 |
| Caption | 12 | 500 |
| Tab label | 11 | 600 |

---

## 6. Elevation

**Flat by default.** Use 1px hairline borders for separation, not shadows.

- Hairline border (light): `rgba(44,44,44,0.08)`
- Hairline border (dark): `rgba(249,249,249,0.08)`
- Tokens: `Borders.hairline.light` / `Borders.hairline.dark`.

The **only** surface that gets a shadow is the floating footer, and even that is barely perceptible:

```
shadowColor: '#000'
shadowOpacity: 0.04
shadowRadius: 8
shadowOffset: { width: 0, height: 2 }
elevation: 2     // Android
```

Avoid shadows on cards, buttons, modals, or the Home circle. If a surface needs to feel separated, give it a hairline border or a different background tone.

---

## 7. Iconography

- Library: `@expo/vector-icons` → **Ionicons** (default) for soft rounded glyphs.
- Sizes: 20 (inline), 24 (tab/button), 28 (primary action).
- Color: `tint` for active, `iconMuted` for inactive.

---

## 8. Component Patterns

### 8.1 Card
- `bg-white` (light) / `bg-[#1F1F1F]` (dark)
- `rounded-2xl` (radius `lg`)
- Padding `lg` (16)
- 1px hairline border (`Borders.hairline`) for separation — **no shadow**

### 8.2 Button
- Pill-shaped (`rounded-full`)
- Primary: `bg-kangkong text-white`
- Secondary: `bg-cloud text-charcoal border border-charcoal/10`
- Min height 44

### 8.3 Bottom Footer (Tab Bar)

**Layout**
- Full-width bar anchored to the bottom of the screen.
- No horizontal margin, no border-radius, no shadow.
- 1px hairline border on the **top edge only** (`Borders.hairline`).
- Height: 64. Bottom padding equals the safe-area inset.
- Three inline slots (equal flex): **Routine** (left) · **Home** (center) · **Analytics** (right).

**Side buttons (Routine, Analytics)**
- Stacked icon (24) + label (11px, weight 600).
- Active color: `kangkong`. Inactive: `iconMuted`.
- Full-height tap target.

**Center Home button**
- Icon-only — no text label.
- Wrapped in a 28×28 `kangkong` circle with a white Ionicon (`home` / `home-outline`) at 16px.
- Centered both vertically and horizontally within its slot.
- The kangkong circle stays kangkong regardless of focus (it's the brand anchor); icon swaps between filled/outline variants on focus.

**Behavior**
- Light haptic on press-in (iOS).
- Active route: side icons + labels use `kangkong`.

**Do**
- Keep only 3 destinations.
- Preserve the safe-area bottom inset on devices with home indicators.

**Don't**
- Don't add a 4th tab — promote it to an in-screen action instead.
- Don't give the Home circle a label or change its color per route.

---

## 9. Motion

- Default easing: `ease-out`, 180ms.
- Press feedback: scale `0.96` for buttons, opacity `0.9` for cards.
- Avoid bouncing/spring for utility UI; reserve spring for celebratory moments (streaks, completions).

---

## 10. Accessibility Checklist

- [ ] Text contrast ≥ 4.5:1
- [ ] Tap targets ≥ 44×44
- [ ] Every icon button has `accessibilityLabel`
- [ ] Color is never the sole carrier of meaning
- [ ] Dark mode parity verified
