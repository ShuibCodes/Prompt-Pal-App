# PROMPTPAL — SESSION HANDOFF (image challenges + branch merge)

**Date of this handoff:** 2026‑05‑31 (session ran 2026‑05‑27 → 05‑31)
**Author:** previous AI session. **Audience:** the next AI agent taking over.
**Read this top to bottom before touching anything.** It is exhaustive on purpose.

---

## 0. ONE‑PARAGRAPH SUMMARY

PromptPal is a gamified AI‑prompt‑engineering app (React Native + Expo Router + Convex + Clerk + NativeWind). This session: (1) merged the client's `shuayb-tweaks` branch with Ahmed's `changes-ahmed` into a new branch **`ahmed-shuayb-combined`** (the active working branch), (2) set a **working Gemini key that generates images**, (3) **built the image‑prompting challenges end‑to‑end** — fixed a critical image‑generation bug, wired the target image into the live quest path, made the image UX minimal ("just an image + 'recreate this'"), and activated the image track so it joins Agent as a live daily‑challenge type. Everything is committed + pushed. tsc clean. The app runs on the iOS simulator and the IMAGE track is live with 10 challenges. A few things remain open (see §7).

---

## ⚠️ LAUNCH TODO — PROD CONVEX NOT SEEDED (added 2026‑06‑09)

> **Before any App Store build, the PROD Convex deployment `flippant-ferret-306` must be deployed + re‑seeded.** The live track config changed: **Coding is now the 30‑level prompt‑engineering track (code‑1‑easy … code‑30‑hard) and Image is hidden** (client confirmed going with Ahmed's 30 coding levels over the client's earlier 5). This is wired in code (`convex/levels_data.ts allLevels = agent + code`, `convex/questProductData.ts` track flags coding=active/image=inactive, rotation in `mutations.ts` = [code, agent]) and **already seeded on DEV `fearless-warbler-742`** (DB = code:30, agent:6, image pruned). PROD still has the OLD levels.
>
> Run against prod (needs Ahmed's prod deploy key / login — `convex run` uses DEPLOYED code, so deploy FIRST):
> ```
> npx convex deploy                          # push the 30‑level code to prod
> npx convex run seed:seedLevels --prod      # seed the prod levels table (prunes hidden image levels)
> ```
> Until this runs, prod will render the track but coding submissions hit missing/old DB rows. Also still outstanding for prod (pre‑existing): Gemini key + Clerk config (see §2). Details in agent memory `promptpal-coding-levels-divergence.md`.

---

## 1. WHO'S WHO & THE BUSINESS CONTEXT

- **Ahmed (the user / my operator):** the developer building this for a client. Wants the client to accept the work and **release payment**. Communicates with the client over WhatsApp and relays screenshots/instructions to me.
- **Shuayb / "Shuib Abdillahi" (the CLIENT):** owns the repo (`github.com/ShuibCodes/Prompt-Pal-App`). He himself writes code and pushes branches. He is the final authority on product decisions. He can REJECT work, so faithfulness to his exact words matters enormously.
- Tone: Ahmed is informal ("bro", "kinda", "and shit") — substance matters, not the phrasing. He values: thoroughness, honesty about what's done vs not, proof via simulator screenshots, and not over‑claiming.

---

## 2. TECH STACK & ENVIRONMENT (verify before relying on)

- **Stack:** React Native, Expo Router (file‑based routing in `src/app/`), Zustand (local state), Clerk (auth), **Convex** (serverless backend, real‑time), NativeWind/Tailwind. Package manager: **Bun**.
- **AI:** Google **Gemini** via Convex actions in `convex/ai.ts`, using the **Vercel AI SDK** (`ai` + `@ai-sdk/google` v3.0.37). NOT the raw Google SDK.
- **Convex dev deployment:** `dev:fearless-warbler-742` (URL `https://fearless-warbler-742.eu-west-1.convex.cloud`). Push with `npx convex dev --once`. Seed with `npx convex run seed:seedAll` (or `seed:seedLevels`). Inspect with `npx convex data <table>` or `npx convex run <fn> '<json>'`. Env vars: `npx convex env list/set`.
- **Convex PROD deployment (NOT yet configured for release):** `flippant-ferret-306` — still needs the Gemini key + deploy + seed before any App Store build.
- **Clerk dev instance:** `ruling-parakeet-91.clerk.accounts.dev` (email+password + Google + Apple sign‑in). A `convex` JWT template (aud=convex) is configured. Convex dev env has `CLERK_JWT_ISSUER_DOMAIN` + `GEMINI_API_KEY`.
- **GEMINI_API_KEY currently set in dev Convex:** `AIzaSyCpoM-7YRC0YhWwd2XR0bofSnQ6XV_aaqk` — **this key WORKS for image generation** (verified: returns a real PNG). There was an earlier key `AIza…pm44` that was FREE‑TIER and could NOT generate images (429 limit:0) — do not use it.
- **Run on simulator:** `bunx expo run:ios --device <udid>` (managed workflow → prebuild generates `ios/`, which IS committed). Bundle id `com.mikhailspeaks.promptpal`.
  - There are TWO "iPhone 17 Pro" simulators. The app is installed on **udid `5B756A47-681E-42C2-A859-B46ED342906B`** — use that one. (`5CB882E3-…` is a different empty one — don't use it.)
  - After a native build exists, you DON'T need to rebuild for JS changes — just (re)start Metro (`bunx expo start --port 8081 --clear`) and re‑open `com.mikhailspeaks.promptpal://expo-development-client/?url=http://localhost:8081` via `xcrun simctl openurl booted`.
  - Screenshot: `xcrun simctl io booted screenshot /tmp/x.png`. First JS bundle compile after `--clear` takes ~60–70s.
  - **AUTH GOTCHA:** the dev session logs out across relaunches sometimes → app shows the sign‑in ("Welcome Back") screen. There are NO known working sign‑in credentials available to the agent (the `+clerk_test@gmail.com` / `424242` trick is for NEW signup + onboarding, a long fragile drive). To get past sign‑in for screenshots, ASK AHMED TO LOG IN. When logged in, the app stays in and you can drive the UI.
  - **UI driving:** `cliclick` is installed. Get the Simulator window bounds with `osascript -e 'tell application "System Events" to tell process "Simulator" to tell (first window whose subrole is "AXStandardWindow") to get {position, size}'` → returned e.g. `1204, 49, 455, 970` (x, y, w, h incl. ~28px title bar). Device framebuffer is 1206×2622. Map device‑fraction → window point: `winX = posX + frac_x*width`, `winY = posY + 28 + frac_y*(height-28)`. Tapping the IMAGE tab worked at ~`cliclick c:1324,242`.

---

## 3. GIT STATE (CRITICAL — READ CAREFULLY)

- **Remote:** `https://github.com/ShuibCodes/Prompt-Pal-App.git` (origin).
- **ACTIVE WORKING BRANCH: `ahmed-shuayb-combined`** — checked out, pushed, local==remote at commit `ab644b5`. ALL this session's work is here. **Do new work on this branch.**
- **DO NOT TOUCH** `changes-ahmed` (Ahmed's pre‑merge branch) or `origin/shuayb-tweaks` (the client's branch). Ahmed explicitly said leave both intact. Only create/modify the combined branch (or new branches off it).
- **Commit graph (newest first) on `ahmed-shuayb-combined`:**
  - `ab644b5` Image challenge: clean empty prompt (strip scaffold template/checklist for image)
  - `7da0ed4` Image challenges: fix generation, wire target image, minimal "recreate this" UX, activate track
  - `9c43f81` Merge `origin/shuayb-tweaks` into ahmed-shuayb-combined
  - `cbac0d6` (shuayb) feat(quests): agent batch, coding rebuild, holistic scoring, single-page UX
  - `5c96155` (shuayb) feat(coding): judge prompt directly, fix gibberish pass, wizard result screen
  - `500bf5f` (ahmed) Challenge UX: wizard on prompt + result, minimal image mechanic  ← superseded by merge (see below)
  - `8a3db14` (ahmed) Add native iOS project (expo prebuild)  ← common ancestor of both branches
  - `ec4b773` (ahmed) Legal docs → hostable HTML
  - `8380924` (ahmed) App Store readiness: legal docs, account deletion, image-eval fix, copywriting removal, 10 image levels
- **Key merge fact:** both branches share ancestor `8a3db14`, which ALREADY contains all of Ahmed's earlier App‑Store work (legal docs, account‑deletion UI, image‑eval fix, copywriting removal, 10 image levels). Shuayb branched off `8a3db14`. So the merge brought in Shuayb's newer work ON TOP of Ahmed's earlier work. The ONLY merge conflict was `src/app/game/quest/[id].tsx` (both rewrote it) — resolved to **Shuayb's version** (his is the authoritative holistic rewrite with his own wizard result screen + image handling). Ahmed's `500bf5f` (owl‑on‑prompt + "Recreate this image") was superseded; the image‑minimal UX was then re‑applied on top of Shuayb's version in `7da0ed4`.
- `ios/` is committed (it's tracked since `8a3db14`). It's the expo prebuild output.
- A `HANDOFF.md` (this file) is in the repo root — it is NOT committed unless you commit it.

---

## 4. THE CLIENT'S REQUIREMENTS (verbatim, from WhatsApp — the source of truth)

From Shuayb (transcribed from screenshots Ahmed shared):
1. "the image challenge is now going to be part of the daily challenges"
2. "from there [shuayb-tweaks], create a new branch and create the image prompting challenges"
3. "so daily challenges will be a mix. one day coding challenge, one day agent prompting, one day image"
4. "ive also made it so there's nothing generated by the prompt. the ai just evaluates how good the prompt is and gives user score" — "only the image will be created by the prompt, and compared"
5. "ok so the image one is actually supposed to be just an image, and one line instruction 'recreate this'. that's all"
6. Gemini billing: his card‑attached key still failed → "can you try from your own side and create one, and then if it works let me know the steps." (Ahmed supplied his own working key.)

**Interpretation that drove the build:** image challenges = show target image + one‑line "Recreate this image" + free‑text prompt; on submit the prompt GENERATES an image which is compared/scored (code & agent only score the prompt, no generation — that's Shuayb's design already in his branch). Image is a live challenge TYPE/track alongside Agent.

---

## 5. WHAT WAS DONE THIS SESSION (with exact files)

### 5a. Branch merge → `ahmed-shuayb-combined` (commit 9c43f81)
- Created from `changes-ahmed`, merged `origin/shuayb-tweaks`. Only conflict `quest/[id].tsx` → took Shuayb's version. Deployed Convex + reseeded. tsc clean. Pushed.

### 5b. Gemini key + image‑generation FIX (commit 7da0ed4)
- **`convex/ai.ts` → `generateImage` action (~line 1295):** added
  ```ts
  providerOptions: { google: { responseModalities: ["IMAGE"] } }
  ```
  to the `aiGenerateText({ model: google("gemini-2.5-flash-image"), ... })` call. **THIS WAS THE CRITICAL BUG:** without it the call returns HTTP 200 but `result.files` is empty → "No image generated", even with a paid key. **Verified end‑to‑end** with a standalone `@ai-sdk/google` script using the working key → returned a real 126KB PNG. (`evaluateImage` was already fine — it fence‑tolerantly parses JSON and grades against the rubric.)

### 5c. Target image wiring into the LIVE quest path (commit 7da0ed4)
- The live UX uses the **quest‑product** path: `src/app/game/quest/[id].tsx` → `mapQuestLessonToLevel(lesson)`. It read `targetImageUrl: lesson.targetPayload?.targetImageUrl` — but the 10 image levels have **no** target URL (they use bundled LOCAL assets `assets/images/level-N-image.png`, and the dead foreign URLs were removed earlier). So the target image would NOT display.
- **Fix:** exported `getLocalImageForLevel` from `src/features/levels/data.ts`; in `mapQuestLessonToLevel`, for `lesson.lessonType === "image"` resolve `getLocalImageForLevel(lesson.id)` (a `require()` number) for display. `targetImageUrlForEvaluation` is only set when it's a real string URL (else undefined → server grades description‑based via `whatUserSees`).

### 5d. Minimal image UX "just an image + recreate this" (commits 7da0ed4 + ab644b5)
In `src/app/game/quest/[id].tsx`, added `const isImage = level.type === "image"` in `renderChallenge`, and:
- Header shows **"Recreate this image"** instead of title/description for image.
- `QuestPromptInputCard`: for image, `scaffoldType/scaffoldTemplate=undefined`, `beginnerTemplateLocked=false`, `checklistItems/matchedChecklistItems=[]`, placeholder "Describe the image so AI can recreate it…".
- **(ab644b5) ROOT FIX for the pre‑filled prompt bug:** the prompt box was being seeded with the coding scaffold template ("Create a [main colour] image…" with blanks stripped) by `getInitialPromptStateForLevel(level)` (useEffect ~line 492, keyed on `level.scaffoldType/scaffoldTemplate`). Fix: in `mapQuestLessonToLevel`, for image type set `scaffoldType/scaffoldTemplate/checklistItems/promptChecklist = undefined`. Now the image prompt box is EMPTY (placeholder only). Verified on simulator.

### 5e. Activated the image track + included image content (commit 7da0ed4)
- `convex/questProductData.ts`: `DEFAULT_LEARNING_TRACKS` → `image-generation` track `isActive: true` (was false). (Agent is also active. **Coding and Copywriting are still `isActive: false`** — Shuayb staged them off.)
- `convex/levels_data.ts`: `export const allLevels = [...agentLevels, ...imageLevels]` (Shuayb had it `[...agentLevels]` only). This makes the 10 image levels seed as lesson definitions → quest nodes.
- **Verified:** `npx convex run questProduct:getQuestHome '{}'` → active tracks `['Image','Agent']`; image track has **10 nodes** (image-1-easy … image-10-hard).

### 5f. The 10 image levels (content — already existed from earlier `8380924`, kept)
- In `convex/levels_data.ts` `imageLevelsBase` (~line 68): `image-1-easy` … `image-10-hard`. Easy(1‑3) passingScore 70 + ~4 keywords, Medium(4‑7) 75 + ~6, Hard(8‑10) 80 + ~10. Each has `whatUserSees` (hidden grading rubric), `hiddenPromptKeywords`, `style`, and is consistent with its bundled `assets/images/level-N-image.png` target. Level 1 = "Color Match" = a solid forest‑green swatch (intentionally the simplest; **Ahmed chose to KEEP it as‑is** even though it looks plain).
- Mapping `imageLevelsBase → imageLevels` (~line 414) attaches scaffold/checklist (now ignored for image in the UI). `imageLessonScaffolds` (~line 23) still has per‑level checklists for image‑1..10 (unused by the minimal UX but harmless).

---

## 6. HOW THE APP ACTUALLY WORKS (architecture you must know)

- **Home (`src/app/(tabs)/index.tsx`):** queries `api.questProduct.getQuestHome` → renders a **track switcher** (active tracks only) + the active track's **quest node path** (`QuestPath`). Tapping a node / START calls `api.questProduct.startQuestRun({nodeId})` → `router.push('/game/quest/<runId>')`.
- **Challenge screen (`src/app/game/quest/[id].tsx`):** THE screen. Loads the quest run + lesson, maps to a `Level` via `mapQuestLessonToLevel`. Single‑page UX (Shuayb's rewrite): target pinned at top, `phase` toggles prompt → result in place. On submit:
  - image → `generateImage(prompt)` then `evaluateImage({...})`.
  - code/agent/copywriting → evaluate the prompt only (no generation), via `evaluateCodeSubmission` / `evaluateAgentSubmission` / `evaluateCopySubmission`.
  - Result phase: verdict ("Nailed it!"/"Almost there!"), score bars (Task match + Prompt quality), and a **wizard** (renders `assets/OBJECTS.svg` via expo‑image — Shuayb's "wizard result screen").
- **Quest‑product data:** lives IN CODE. `convex/questProductData.ts` (`DEFAULT_LEARNING_TRACKS`, `DEFAULT_PERK_CATALOG`, types) + `convex/levels_data.ts` (`allLevels` → built into `lessonDefinitions`/`questNodes`). DB tables `lessonDefinitions`/`questNodes`/`learningTracks` are EMPTY (0 rows) — `convex/questProduct.ts` uses an **in‑code seed fallback** (`getTrackNodes`/`getTrackLessons` fall back to in‑code `seedNodes`/`seedLessons` when the DB is empty). So adding levels to `allLevels` is enough; no DB seeding required for the track path.
- **`convex/ai.ts` actions:** `generateText`, `evaluateCodeSubmission`, `evaluateAgentSubmission`, `evaluateCopySubmission`, `generateImage` (~1249), `evaluateImage` (~1383). Helpers: `extractJsonText` (fence‑tolerant JSON), `normalizeImageEvaluation`, `parseLlmJudgeResponse`. Single `GEMINI_API_KEY` env var.
- **Two data paths converge on the `Level` type:** the live quest‑product path (`mapQuestLessonToLevel`) and a legacy `levels`‑table path (`getLevelById` + `processApiLevelsWithLocalAssets`). The legacy `dailyQuests`/`generateDailyQuestPool` system (rotates code/image/agent by UTC day) EXISTS in `convex/mutations.ts` + `convex/crons.ts` but is **NOT surfaced in the current UI** (the home is track‑based). This matters for §7.

---

## 7. WHAT'S LEFT / OPEN (be honest with Ahmed about these)

### Re: the client's image task
1. **"Daily mix" is not a true rotating daily.** Client said "one day coding, one day agent, one day image." The live UI is **track‑based** (switcher), not a single daily challenge that auto‑rotates type by day. Activating the image track makes image a first‑class type alongside agent, but if Shuayb wants ONE daily challenge on the home that rotates coding→agent→image by day, that's a small extra feature to build (the `generateDailyQuestPool` rotation logic exists but isn't wired to the home UI). **CONFIRM with the client which he means.**
2. **Coding track is still hidden** (`isActive:false`). The "mix" is incomplete until coding is on. Shuayb staged it off himself (his "coding rebuild" commit) — so leaving it off was deliberate, but the mix needs it. **CONFIRM whether to activate coding.**
3. **Image scoring is description‑based, not visual image‑to‑image.** The judge sees the user's generated image + a TEXT description of the target (`whatUserSees`) — accurate, but it does not visually diff against the actual target PNG. If "compared" must mean pixel/visual comparison to the target image, host the 10 target PNGs in Convex storage and set `targetImageUrl` to those URLs (then both display + eval use the real image).
4. **Full in‑app image generation not yet demonstrated.** Generation is PROVEN at the SDK level (real PNG) and the screen renders, but no real in‑app submit→generate→score was captured (needs a logged‑in session). Offer Ahmed to run it for proof.

### Re: App Store readiness (separate from the image task, still pending)
5. **Remove the `[DEBUG]` diagnostic** — still in `src/app/game/quest/[id].tsx` (~line 470‑481, in the `loadQuestAndLevel` catch): `console.error("[QuestScreen DIAGNOSTIC] …")` + `setError(\`[DEBUG] load failed for id=…\`)`. Shows users raw debug text. MUST remove before submission. (It's in Shuayb's code — left untouched this session.)
6. **AI content safety (Guideline 1.2):** no `safetySettings` on Gemini calls in `ai.ts`; no "Report content" affordance. Needed for an AI‑generation app.
7. **Privacy policy / Terms:** HTML pages exist at `legal/privacy-policy.html` + `legal/terms-and-conditions.html` and are linked in‑app (Profile → Legal) and on the paywall, pointing to `https://promptpal-website.vercel.app/privacy-policy` and `/terms-and-conditions`. **The CLIENT must host them** at those slugs AND fill 3 placeholders in each: `[Operator Legal Name]`, `[contact email]`, `[Your Jurisdiction]`. Until hosted, the in‑app links 404 and App Store Connect has no working privacy URL.
8. **Clerk:** enable "self‑service account deletion" in the Clerk dashboard, else the in‑app Delete Account flow (Profile → Account → Delete Account, wired to `deleteCurrentUserData`) errors when a reviewer tests it.
9. **Monetization decision:** RevenueCat is wired but dormant (paywall gate off in prod profile). Decide free vs paid for v1; don't leave IAP configured in ASC with an unreachable paywall.
10. **Prod cutover:** set `GEMINI_API_KEY` on prod Convex `flippant-ferret-306`, deploy + seed there, bump build number, EAS build. Move the `pk_live` Clerk key out of `eas.json` into an EAS secret. Align `LSMinimumSystemVersion` (12.0) with deploy target (15.1). (Screenshots & icon were declared OUT OF SCOPE by Ahmed.)

---

## 8. VERIFICATION DONE THIS SESSION (so you can trust the above)
- `npx tsc --noEmit` → exit 0 after every change set.
- `getQuestHome` → tracks `['Image','Agent']`, image track 10 nodes.
- Standalone `@ai-sdk/google` v3.0.37 call with the working key + `responseModalities:["IMAGE"]` → real PNG (~126KB). Raw curl earlier also confirmed: text model 200; image model 200‑with‑image only when IMAGE modality requested.
- Simulator (logged in): IMAGE tab visible; IMAGE track home shows "Color Match" + quest path; the challenge screen shows "LEVEL 1 · IMAGE", "Recreate this image", the green target image, and a CLEAN empty prompt ("Describe the image so AI can recreate it…") + "Hint · 25 XP" + Submit.
- The earlier free‑tier key (`…pm44`) was conclusively proven to NOT support images (429 free_tier limit:0; Imagen "only available on paid plans"). The client's other AI's "wrong model string" theory was disproven (the model name is correct; it was a billing‑tier problem). The current key (`…aaqk`) does NOT have that problem.

---

## 9. IMMEDIATE NEXT STEPS (suggested order)
1. **Run the app + (with Ahmed logged in) do a REAL in‑app image generation** on Level 1 to capture proof for the client. (App installed on sim `5B756A47`; Metro on :8081.)
2. **Get Ahmed to confirm with the client:** (a) does "daily mix" mean a single rotating daily on the home, or is track‑based fine? (b) activate coding track too? (c) is description‑based scoring fine or does he want visual target comparison?
3. Based on answers, either ship as‑is or build: the rotating‑daily home, coding activation, and/or hosted target images for visual comparison.
4. Then circle back to App Store readiness (§7 items 5‑10) before any release.

---

## 10. PROJECT MEMORY (already written, in the agent's memory store, persists across sessions)
`MEMORY.md` index + files: `promptpal-project`, `promptpal-branch-merge` (this merge + image build), `promptpal-image-bug-leads` (billing + responseModalities + image build), `promptpal-challenge-redesign`, `promptpal-account-deletion`, `promptpal-legal-and-copywriting`, `promptpal-daily-rotation`, `promptpal-key-files`, `promptpal-dev-run-setup`, `promptpal-agent-type`. Read those for deeper history.

---

## 11. HARD RULES (do not violate)
- always prompt Ahmed to share the status of the app visibily as Shuayb is very busy, launching his new cohort for his online programe. Ideally share a video, going through the UI as if hes a test user.
- **Do NOT push to `changes-ahmed` or `shuayb-tweaks`.** Work on `ahmed-shuayb-combined` (or branch off it).
- **Do NOT alter Shuayb's design intent** without confirmation — he's the client and can reject.
- **Never put the Gemini key in a tracked file.** It belongs in Convex env only.
- **Don't over‑claim "done."** Verify (tsc, getQuestHome, simulator) and report honestly what is/isn't proven.
- **Confirm before destructive/outward actions.** Pushing the combined branch is pre‑authorized; pushing elsewhere is not.

---

## Thurs 11th June:
- **What we did:** Wired up RevenueCat in **Test Store mode** — added `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` (test_…) + `EXPO_PUBLIC_REQUIRE_SUBSCRIPTION=1` to `.env.local`, and set the backend secret `REVENUECAT_API_KEY` (sk_…) in dev Convex env (`dev:wary-robin-754`). The paywall gate is now live, so the Buy + Restore flow can be tested without TestFlight.
- **Waiting on:** Apple to reply to Shuayb's email about opening up the developer account. Until then RevenueCat stays on the **Test Store** (no real App Store products); real IAP products come once Apple activates the account.
