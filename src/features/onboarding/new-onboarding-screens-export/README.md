# PromptPal Onboarding — Direction A ("Open Sky")

React Native / Expo translation of the **Direction A** onboarding prototype.
Built to match the green Duolingo-style vocabulary already in your repo
(`ReasonForLearningScreen`, `ExperienceScreen`): `#5CD615` green, 3D
bottom-border buttons, `@/components/Icons` progress bar, StyleSheet styling.

## Install (drop-in)

Copy the two trees into your repo, preserving paths:

```
rn-export/src/features/onboarding/directionA/   →  src/features/onboarding/directionA/
rn-export/assets/images/prompty-*.png           →  assets/images/
```

No new npm dependencies — uses what you already have:
`zustand`, `react-native-reanimated`, `react-native-safe-area-context`,
`expo-haptics`, `@expo/vector-icons`, plus `@/components/Icons`.

## Files

| File | Purpose |
|---|---|
| `OnboardingFlowA.tsx` | Step router — render this once when onboarding is needed |
| `store.ts` | Zustand store: step order, progress %, captured answers |
| `theme.ts` | Color tokens + mascot asset map |
| `components/Chrome.tsx` | Shared: ScreenBase, Header, Mascot, OptionRow, ContinueButton, Footer |
| `screens/HookScreen.tsx` | 01 · Hero hook |
| `screens/WhyScreen.tsx` | 02 · Why are you learning AI? |
| `screens/RewardScreen.tsx` | 03 / 05 / 07 · Reward beats (`kind="social\|meet\|time"`) |
| `screens/LevelScreen.tsx` | 04 · How much AI do you know? |
| `screens/TimeScreen.tsx` | 06 · Time a day |
| `screens/LeaderboardScreen.tsx` | 08 · Battle your friends |
| `screens/ChallengeScreen.tsx` | 09 · First challenge |

## Wire it up

```tsx
import { OnboardingFlowA } from "@/features/onboarding/directionA/OnboardingFlowA";

// e.g. in your root, gated like the existing OnboardingFlow:
{needsOnboarding && <OnboardingFlowA />}
```

The flow advances through `store.ts`'s `A_STEP_ORDER`. The final
`ChallengeScreen` "Submit Prompt" currently loops back to the start
(`restart()`) — replace that with your real game hand-off / `completeOnboarding`.

## Notes / next steps
- Answers are captured in the store (`reason`, `level`, `minutesPerDay`) but not
  yet persisted to Convex — add a mutation on the relevant `setX` or on completion.
- Mascots map to your four Prompty cutouts. Swap the `require`s in `theme.ts`
  if you prefer the existing `simplification.png`.
- `WhyScreen` scrolls (6 options); the rest are fixed-height.
