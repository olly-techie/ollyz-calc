# ollyz-calc

A scientific calculator Android app built for **SEN 104 & 214**, demonstrating Android Activity lifecycle methods alongside a full-featured calculator engine.

## Overview

The app wraps an HTML/CSS/JS calculator UI inside a native Android `WebView`. All calculation logic lives in JavaScript; the Java side handles the Activity lifecycle and persists calculator state across pause/resume.

## Features

### Basic Mode
- Addition, subtraction, multiplication, division
- Clear, backspace, decimal point

### Scientific Mode
- Trigonometric functions: `sin`, `cos`, `tan` (degree mode, with DEG/RAD toggle)
- Hyperbolic functions: `sinh`, `cosh`, `tanh`
- `√`, `x²`, `xʸ`, `log`, `ln`, `π`, `e`, parentheses, sign toggle, percent
- Permutations (`nPr`) and combinations (`nCr`)
- Statistics: mean, median, mode, sum, standard deviation on a comma-separated dataset

### Matrix Mode
- 2×2 and 3×3 matrix support
- Operations: addition, subtraction, multiplication, determinant, inverse, transpose


## Tech Stack

| Layer | Technology |
|---|---|
| UI & calculator logic | HTML, CSS, JavaScript |
| Native wrapper | Java (`WebView` in a single `Activity`) |
| Build | Gradle Wrapper |
| Min SDK / Target SDK | 24 / 34 |

No external libraries — all math (trig, matrices, combinatorics, statistics) is implemented from scratch in vanilla JS.

## Project Structure

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
└── gradlew / gradlew.bat
```

## Lifecycle Implementation

`MainActivity.java` overrides the core Activity lifecycle methods with real, functional behavior rather than placeholder logging:

| Method | What it does |
|---|---|
| `onCreate()` | Initializes the `WebView`, enables JavaScript, loads `index.html` from assets |
| `onStart()` | Logs lifecycle event (tag: `Lifecycle`) |
| `onResume()` | Restores the last calculator state (display value, active mode tab) from `SharedPreferences` via a JS bridge call |
| `onPause()` | Pulls current calculator state from the page and saves it to `SharedPreferences` |
| `onStop()` | Logs lifecycle event |
| `onDestroy()` | Logs lifecycle event, releases the `WebView` reference |

This means backgrounding the app and returning to it restores exactly where you left off — a visible, testable proof that the lifecycle methods are doing real work.

## Build & Run

### Prerequisites
- JDK 17
- Android SDK with `platform-tools` and `platforms;android-34` installed
- `ANDROID_HOME` set, or a `local.properties` file with `sdk.dir=/path/to/Android/sdk`

### Build

```bash
cd ollyz-calc
./gradlew assembleDebug
```

The debug APK is output to:

```
app/build/outputs/apk/debug/app-debug.apk
```

### Install on a device/emulator

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

## Testing Notes

- **Trig check:** `sin(30°) = 0.5`
- **nPr/nCr check:** verify against manual calculation for small `n`, `r`
- **Matrix check:** verify determinant/inverse against a known 2×2 or 3×3 example
- **Lifecycle check:** filter Logcat by tag `Lifecycle` to see `onStart`/`onStop`/`onDestroy` events; background and resume the app to confirm state restoration

## Known Limitations / Future Work

- Matrix support capped at 3×3 (4×4 not implemented in this version)
- No persistent calculation history (only last-session state is restored)
- Expression parsing uses a guarded, whitelist-filtered evaluation rather than a full custom parser — flagged here as a deliberate scope decision, not an oversight
- No dedicated landscape layout

## Author

Olayiwola Abdullah — [@devollycodes]
https://devollycodes.aqinode.click