# Graph Report - gym-daily  (2026-09-01)

## Corpus Check
- Corpus is ~9,232 words - fits in a single context window. You may not need a graph.

## Summary
- 178 nodes · 240 edges · 19 communities (18 shown, 1 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.87)
- Token cost: 74,300 input · 0 output

## Community Hubs (Navigation)
- Firestore Daily Log Store
- README Domain Model & App Shell
- Firebase Auth & Session
- Svelte Build Toolchain
- Workout Programs & Home Dashboard
- Nutrition & Meal Planning
- Date Keys & Streak Logic
- Package Manifest & Scripts
- Progress Charts & Stats
- JS Config & Type Checking
- Firebase Deployment & Security
- SvelteKit Route Prerender Config
- Favicon Brand Identity

## God Nodes (most connected - your core abstractions)
1. `logRef()` - 8 edges
2. `Gym Daily (SvelteKit + Firebase workout tracker)` - 8 edges
3. `buildLog()` - 7 edges
4. `dateKey()` - 6 edges
5. `shiftKey()` - 6 edges
6. `SvelteKit App Shell (app.html)` - 6 edges
7. `saveProfile()` - 5 edges
8. `chooseProgram()` - 5 edges
9. `markStreak()` - 5 edges
10. `completeRestDay()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Gym Daily PR README (duplicate of README.md)` --semantically_similar_to--> `Gym Daily (SvelteKit + Firebase workout tracker)`  [INFERRED] [semantically similar]
  READMEPR.md → README.md
- `SvelteKit App Shell (app.html)` --conceptually_related_to--> `Gym Daily (SvelteKit + Firebase workout tracker)`  [INFERRED]
  src/app.html → README.md
- `Mobile-first Viewport (viewport-fit=cover)` --conceptually_related_to--> `Hari Ini (Daily Task View)`  [INFERRED]
  src/app.html → README.md
- `buildLog()` --calls--> `sessionForDate()`  [EXTRACTED]
  src/lib/stores/data.js → src/lib/data/programs.js
- `streak` --calls--> `shiftKey()`  [EXTRACTED]
  src/lib/stores/data.js → src/lib/utils/date.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Firestore per-user persistence model** — readme_firebase_auth, readme_firestore_security_rules, readme_user_document, readme_log_document, readme_weight_document [EXTRACTED 1.00]
- **Static content data files backing app features** — readme_programs_data_file, readme_foods_data_file, readme_tips_data_file [EXTRACTED 1.00]
- **Vercel deployment prerequisites flow** — readme_vercel_deployment, readme_public_firebase_env_vars, readme_authorized_domains, readme_firebase_auth [INFERRED 0.85]

## Communities (19 total, 1 thin omitted)

### Community 0 - "Firestore Daily Log Store"
Cohesion: 0.14
Nodes (25): tasksFromSession(), buildLog(), chooseProgram(), completeRestDay(), dayKey, defaultProfile(), ensureLog(), logRef() (+17 more)

### Community 1 - "README Domain Model & App Shell"
Cohesion: 0.13
Nodes (24): Streak Harian, Hari Ini (Daily Task View), Firestore Data Model (users/logs/weights), src/lib/data/foods.js, Gym Daily (SvelteKit + Firebase workout tracker), users/{uid}/logs/{YYYY-MM-DD} Document, Non-medical Estimate Disclaimer, Mifflin-St Jeor Equation (+16 more)

### Community 2 - "Firebase Auth & Session"
Cohesion: 0.11
Nodes (8): tipCategories, tips, auth, config, db, firebaseReady, authReady, user

### Community 3 - "Svelte Build Toolchain"
Cohesion: 0.12
Nodes (17): autoprefixer, devDependencies, autoprefixer, postcss, svelte, @sveltejs/adapter-vercel, @sveltejs/kit, @sveltejs/vite-plugin-svelte (+9 more)

### Community 4 - "Workout Programs & Home Dashboard"
Cohesion: 0.15
Nodes (8): getProgram(), groupColor, programs, rest, sessionForDate(), note, percent, waterTarget

### Community 5 - "Nutrition & Meal Planning"
Cohesion: 0.17
Nodes (11): goals, mealPlans, proteinSources, activityLevels, bmr(), macroTargets(), tdee(), editing (+3 more)

### Community 6 - "Date Keys & Streak Logic"
Cohesion: 0.19
Nodes (12): refreshDay(), streak, dateKey(), dayLong, dayShort, keyToDate(), monthLong, monthShort (+4 more)

### Community 7 - "Package Manifest & Scripts"
Cohesion: 0.17
Nodes (11): firebase, dependencies, firebase, name, private, scripts, build, dev (+3 more)

### Community 8 - "Progress Charts & Stats"
Cohesion: 0.22
Nodes (7): chart, kg, months, peakMonth, restDays, saved, trainingDays

### Community 9 - "JS Config & Type Checking"
Cohesion: 0.33
Nodes (5): compilerOptions, checkJs, moduleResolution, extends, ./.svelte-kit/tsconfig.json

### Community 10 - "Firebase Deployment & Security"
Cohesion: 0.50
Nodes (5): Firebase Authorized Domains, Firebase Email/Password Authentication, Firestore Security Rules (per-uid isolation), PUBLIC_FIREBASE_* Environment Variables, Vercel Deployment

### Community 12 - "Favicon Brand Identity"
Cohesion: 0.67
Nodes (3): Barbell Favicon Mark, Gym Daily Brand Palette (#0F1412 / #E7E3DA / #D6353B / #2C6BE0), Flat Geometric Iconography (rounded-rect primitives only)

## Knowledge Gaps
- **60 isolated node(s):** `extends`, `./.svelte-kit/tsconfig.json`, `checkJs`, `moduleResolution`, `name` (+55 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Svelte Build Toolchain` to `Package Manifest & Scripts`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `Firestore Data Model (users/logs/weights)` connect `README Domain Model & App Shell` to `Firebase Deployment & Security`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Gym Daily (SvelteKit + Firebase workout tracker)` (e.g. with `Gym Daily PR README (duplicate of README.md)` and `SvelteKit App Shell (app.html)`) actually correct?**
  _`Gym Daily (SvelteKit + Firebase workout tracker)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `extends`, `./.svelte-kit/tsconfig.json`, `checkJs` to the rest of the system?**
  _60 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Firestore Daily Log Store` be split into smaller, more focused modules?**
  _Cohesion score 0.13538461538461538 - nodes in this community are weakly interconnected._
- **Should `README Domain Model & App Shell` be split into smaller, more focused modules?**
  _Cohesion score 0.12681159420289856 - nodes in this community are weakly interconnected._
- **Should `Firebase Auth & Session` be split into smaller, more focused modules?**
  _Cohesion score 0.11428571428571428 - nodes in this community are weakly interconnected._