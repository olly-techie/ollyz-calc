# PRD: ollyz-calc — Scientific Calculator Android App

**Course:** SEN 104 & 214
**Deadline:** June 30, 2026
**Build target:** Working APK in ~1 hour. Ship safe, polish later.

---

## 1. Goal

Android calculator app satisfying the assignment's core + bonus requirements, built as an **HTML/CSS/JS UI wrapped in a native Android WebView**, with real lifecycle method usage (not just stubs) to satisfy the SEN coursework requirement on Activity lifecycle.

## 2. Stack (do not deviate — speed matters)

- **Wrapper:** Java, single `Activity` (`MainActivity.java`) hosting a `WebView`
- **UI/Logic:** HTML/CSS/JS in `app/src/main/assets/` — `index.html`, `style.css`, `script.js`
- **Build:** Gradle Wrapper (`./gradlew assembleDebug`) — generate the wrapper files, don't assume Android Studio
- **Min SDK:** 24 (covers virtually all test devices) · **Target SDK:** 34
- **No external libraries.** Pure JS math (`Math.*`), hand-rolled matrix/combinatorics functions.

## 3. Project structure

```
ollyz-calc/
├── app/
│   ├── build.gradle
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── java/com/olly/ollyzcalc/MainActivity.java
│       └── assets/
│           ├── index.html
│           ├── style.css
│           └── script.js
├── build.gradle
├── settings.gradle
└── gradle/wrapper/  (+ gradlew, gradlew.bat)
```

## 4. Lifecycle requirement (graded item — do not skip)

`MainActivity.java` must override and **meaningfully use**, not just log:

| Method | Required behavior |
|---|---|
| `onCreate()` | Init WebView, load `file:///android_asset/index.html`, enable JS (`setJavaScriptEnabled(true)`) |
| `onStart()` | Log lifecycle event to Logcat (`Log.d("Lifecycle", "onStart")`) |
| `onResume()` | Restore last calculator state from `SharedPreferences` (last expression/result) by calling a JS bridge function `restoreState(json)` via `webView.evaluateJavascript(...)` |
| `onPause()` | Save current calculator state (current display value + mode tab) to `SharedPreferences` — call a JS function `getState()` via `evaluateJavascript` to pull state out of the page first |
| `onStop()` | Log lifecycle event |
| `onDestroy()` | Log lifecycle event, null out WebView reference |

This state save/restore on pause/resume is the easiest way to make the lifecycle methods *functionally real* instead of decorative — examiner-visible difference.

## 5. UI spec

Single screen, **3 mode tabs** at the top: `Basic | Scientific | Matrix`. Tab switch shows/hides the relevant panel via JS (no page reload).

### 5a. Basic mode
Standard calculator layout: digit buttons 0-9, `.`, `+ − × ÷`, `=`, `C` (clear), `⌫` (backspace). Display shows running expression + result.

### 5b. Scientific mode
Adds: `sin cos tan` · `sinh cosh tanh` · `√ x² xʸ` · `log ln` · `π e` · `(` `)` · `±` · `%`
- Trig functions operate in **degrees** by default (convert internally: `Math.sin(deg * Math.PI/180)`) — add a `DEG/RAD` toggle button.
- Also include in this tab or a sub-section: **Permutations & Combinations** — two number inputs (n, r) + `nPr` and `nCr` buttons, result shown below.
- Also include: basic **statistics** — a text input for comma-separated numbers + buttons for `Mean`, `Median`, `Mode`, `Std Dev`, `Sum`.

### 5c. Matrix mode
- Size selector: `2×2` / `3×3` (radio buttons or dropdown)
- Two matrix input grids (Matrix A, Matrix B) that resize based on selected dimension
- Operations: `A + B`, `A − B`, `A × B`, `det(A)`, `inverse(A)`, `transpose(A)`
- Result rendered as a grid below

## 6. Math logic — implementation notes for `script.js`

- **Core arithmetic:** standard expression evaluator. Do NOT use raw `eval()` of unsanitized expression strings as the final approach if avoidable — but given the 1-hour budget, a guarded `eval()` (only digits/operators allowed via regex whitelist before evaluating) is an acceptable shortcut. Note it as a "would harden in v2" item, not a silent shortcut.
- **Trig/hyperbolic:** direct `Math.sin/cos/tan/sinh/cosh/tanh`, with degree conversion wrapper for the non-hyperbolic set.
- **nPr / nCr:** factorial-based helper `factorial(n)`, then `nPr = n!/(n-r)!`, `nCr = n!/(r!(n-r)!)`. Guard against `r > n`.
- **Stats:** parse comma-separated input → array of floats → compute mean/median/mode/sum/std-dev (population std dev is fine, note assumption in UI as a tooltip or label).
- **Matrices:** implement as 2D arrays.
  - `add`/`subtract`: element-wise, same dimensions required
  - `multiply`: standard matrix multiplication, validate inner dimensions match
  - `det`: direct formula for 2×2; cofactor expansion for 3×3
  - `inverse`: adjugate/cofactor method for 2×2 and 3×3; show "singular matrix, no inverse" if det = 0
  - `transpose`: straightforward swap

## 7. Visual style (Olly's brand — apply throughout, not an afterthought)

- Dark background (`#0a0a0f` or similar near-black)
- Neon green accent `#00FF88` for primary actions (`=`, active tab, operator buttons)
- Font: `Orbitron` for headings/display, `JetBrains Mono` for button labels/numbers (bundle as local font files or use system monospace fallback if no internet for CDN at build time — **assets folder has no network access at runtime**, so self-host fonts or skip web fonts and use a clean system mono stack)
- Glassmorphism on button panels: subtle `backdrop-filter: blur()`, semi-transparent panel backgrounds, soft borders
- Subtle glow/box-shadow on the active display and primary action buttons

## 8. Explicit non-goals (for v1, given the time crunch)

- No 4×4 matrices (cut from scope to hit deadline — mention as "future work" in any submission notes)
- No persistent calculation history list (only last-state restore via lifecycle, per §4)
- No automated tests
- No landscape-specific layout (portrait-first is fine)

## 9. Build & run instructions (Codex should generate these as a README too)

```bash
cd ~/dev/ollyz-calc
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

## 10. Acceptance checklist

- [ ] App installs and opens without crash
- [ ] Basic arithmetic (all 4 ops) works correctly
- [ ] Tab switching works, state persists per tab while app is open
- [ ] Trig + hyperbolic functions return correct values (spot-check `sin(30)=0.5`)
- [ ] nPr/nCr correct for at least 2 manual test cases
- [ ] Stats functions correct for a known dataset
- [ ] 2×2 and 3×3 matrix add/subtract/multiply/det/inverse/transpose all correct
- [ ] Backgrounding the app (Home button) and returning restores last state (proves lifecycle methods work)
- [ ] Logcat shows lifecycle method logs when filtering by tag `Lifecycle`