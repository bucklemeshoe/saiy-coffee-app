
# 🎨 Design System & Cursor Prompt Guide for Ionic + React + Tailwind (Capacitor)

This guide defines design rules, prompts, and workflows to make the app look professional, clean, and consistent.

---

## 1. Repo-Wide Design Directive

Paste this once in a new Cursor chat at the repo root:

```
You are my Design Systems Pair for an Ionic + React + Tailwind app (Capacitor build).
Goals: modern, clean, mobile-first, accessible, with platform-correct behaviors.

Global rules:
- Structure screens with IonPage → IonHeader → IonContent. Use IonToolbar + IonTitle.
- Use Ionic components for nav, inputs, modals, toasts, pickers. Tailwind for layout/spacing/typography.
- 8px spacing scale: 4,8,12,16,20,24,32,40,48 (Tailwind: 1,2,3,4,5,6,8,10,12).
- Type scale: 32/24/20/16/14/12 (H1…caption). Line-height: 1.2 titles, 1.5 body.
- Min tap target: 44px height. Primary actions on the right; destructive in red.
- Empty states: icon + one sentence + primary CTA. Loading states: skeletons or shimmer.
- Lists: IonList + IonItem; one-line title + subtext. Dense but touch-friendly.
- Shadows: subtle only. Rounded-xl cards; rounded-full for pill buttons/chips.
- Dark mode supported; prefer system default. Respect safe-area insets.

Accessibility:
- Color contrast ≥ 4.5:1. Focus states visible. Labels on all inputs.
- VoiceOver/TalkBack friendly: aria-labels on icon-only buttons.

Brand tokens (map Tailwind to Ionic CSS vars):
- Primary: var(--ion-color-primary)
- Background: var(--ion-background-color)
- Surface: var(--ion-item-background)
- Text: var(--ion-text-color)

When I ask for a “design pass”, you will:
1) propose an information hierarchy,
2) convert generic HTML to Ionic equivalents,
3) normalize spacing/typography,
4) apply Tailwind utilities only for layout/spacing/typography,
5) add empty/loading/error states and basic a11y,
6) keep code minimal and idiomatic.
```

---

## 2. Per-Screen “Design Pass” Prompt

```
Design pass on this screen. Keep logic, improve layout and styling per the repo rules.
- Replace non-Ionic controls with Ionic equivalents.
- Normalize type to the scale (H1=32, H2=24, H3=20, body=16).
- Apply spacing scale and safe-area padding.
- Add loading, empty, and error states.
- Ensure tap targets ≥ 44px and add haptics to primary actions.
- Keep Tailwind limited to layout/spacing/typography.

Show a diff-only patch. Then explain hierarchy and spacing choices.
```

---

## 3. Component Refactor Prompt

```
Refactor this component to a reusable pattern:
- Variant props: primary | secondary | ghost; size: sm | md | lg.
- Use IonButton under the hood; expose left/right icon slots.
- Enforce min height 44px; consistent padding; disabled & loading states.
- Map colors to Ionic vars; accept className for Tailwind overrides.
Include usage examples and a quick visual test story.
```

---

## 4. “Critique and Fix” PR Review Prompt

```
Act as a UI reviewer. For changed files:
- Flag any non-Ionic interactive elements; suggest Ion* replacements.
- Check type and spacing scales; list deviations and fixes.
- Check a11y (labels, contrast, focus, semantics).
- Verify dark mode and safe-area. 
- Produce a checklist and an autofix patch for obvious items.
```

---

## 5. Tailwind Config Guardrails

```ts
// tailwind.config.ts
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "var(--ion-color-primary)",
        surface: "var(--ion-item-background)",
        bg: "var(--ion-background-color)",
        text: "var(--ion-text-color)",
      },
      borderRadius: { xl: "1rem", '2xl': "1.25rem" },
      boxShadow: { card: "0 4px 16px rgba(0,0,0,0.08)" },
      spacing: { 1: "4px", 2: "8px", 3: "12px", 4: "16px", 5: "20px", 6: "24px", 8: "32px", 10: "40px", 12: "48px" },
      fontSize: {
        h1: ["32px", { lineHeight: "1.2", fontWeight: "700" }],
        h2: ["24px", { lineHeight: "1.2", fontWeight: "700" }],
        h3: ["20px", { lineHeight: "1.2", fontWeight: "600" }],
        body: ["16px", { lineHeight: "1.5" }],
        sm: ["14px", { lineHeight: "1.5" }],
        xs: ["12px", { lineHeight: "1.5" }],
      },
    },
  },
  plugins: [],
};
```

---

## 6. Starter “Pro” Page Scaffold Prompt

```
Scaffold a professional Menu page using our rules:
- IonPage/Header/Toolbar/Title.
- Search input with debounced filtering.
- Category segment (chips) sticky under header.
- Grid list of items: image → name → price → add button.
- Empty state with icon + CTA to clear filters.
- Pull-to-refresh, infinite scroll placeholder.
- Proper skeletons while loading and aria-live for updates.
Return `src/pages/MenuPage.tsx` and `MenuCard.tsx`.
```

---

## 7. Visual Hierarchy Audit Prompt

```
Audit this screen’s visual hierarchy:
- Are headings sized per scale?
- Are controls grouped and aligned?
- Is the primary action dominant and thumb-friendly?
- Are destructive actions de-emphasized?
- Do loading/empty/error states prevent dead-ends?
Return a prioritized list (P1..P3) with code edits.
```

---

## 8. Dark Mode Check Prompt

```
Make this screen work in dark mode:
- Swap raw colors for Ionic CSS vars.
- Ensure contrast in both themes.
- Test selection, focus, and pressed states.
Provide a patch and before/after screenshots.
```

---

## 9. Haptics & Feedback Prompt

```
Add subtle haptics and feedback:
- Light haptic on Add to Cart, Medium on Order Placed.
- Toasts for success/fail with clear copy.
- Disable buttons and show spinner during network calls.
Return a minimal diff.
```

---

## 10. Early Project Prompts

- “Give me a design pass across all pages.”
- “Refactor buttons/inputs into design-system components with variants.”
- “Convert non-Ionic inputs to IonInput/Select/Datetime.”
- “Add consistent empty/loading/error states to all data screens.”
