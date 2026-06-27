# PromptPal Paywall — React Native

React Native / Expo translation of the paywall screen. Same warm cream +
orange aesthetic, green 3D CTA, Prompty wizard mascot, and the full CTA logic.

## Install (drop-in)

```
rn-export/src/features/paywall/        →  src/features/paywall/
rn-export/assets/images/prompty-wizard.png  →  assets/images/
```

No new npm dependencies — uses `react-native-reanimated`,
`react-native-safe-area-context`, `expo-haptics`, `@expo/vector-icons`.

## Files

| File | Purpose |
|---|---|
| `PaywallScreen.tsx` | The screen. Self-contained `useState` for toggle + selected plan. |
| `TrialToggle.tsx` | Animated iOS-style free-trial toggle. |
| `theme.ts` | Colour tokens + mascot asset. |

## CTA logic (the edge cases)

```ts
ctaLabel = (trial && plan === "weekly") ? "Try for Free" : "Continue";
```

| Trial | Selected plan | CTA |
|---|---|---|
| ON | Weekly (free-trial) | **Try for Free** |
| ON | Yearly | **Continue** |
| OFF | Yearly | **Continue** |
| OFF | Weekly | **Continue** |

The weekly card also relabels: **3-Day Free Trial → Weekly Access** when the
trial toggle is off. All four states are reachable at runtime by tapping the
toggle / plan cards.

## Usage

```tsx
import { PaywallScreen } from "@/features/paywall/PaywallScreen";

<PaywallScreen
  onClose={() => router.back()}
  onRestore={restorePurchases}
  onContinue={({ plan, trial }) => startCheckout(plan, trial)}
/>
```

`initialTrial` / `initialPlan` props let you preset the entry state.

## Next steps
- Wire `onContinue` / `onRestore` to your IAP layer (RevenueCat, expo-iap, etc.).
- Swap the placeholder prices ($59.99 / $4.99 / $1.15) for live store products.
