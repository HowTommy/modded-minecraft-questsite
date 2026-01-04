---
title: Implementation Plan - Minecraft Quest Tracker Website
description: Executable implementation plan for transforming Angular/Ionic app into a Minecraft-themed quest tracking website with categories, progress tracking, and achievement system. This file is designed to be consumed by Claude Code for incremental development across multiple sessions.
status: in_progress
created: 2026-01-04
updated: 2026-01-04
progress: 0
total_tasks: 64
tech_stack: Angular 20, Ionic 8, TypeScript 5.9, RxJS 7.8
architecture: Feature-based architecture with core/feature/ui separation
---

# 📋 HOW TO USE THIS PLAN

## For Claude Code / AI Implementation

**This file is your single source of truth for implementing this feature.**

### Quick Start

Simply provide this file to Claude Code:
```
Continue implementing the plan from plan.md
```

### Execution Workflow

1. **Read this entire file** before starting any work
2. **Find current task**: Locate the first `- [ ]` whose dependencies are all `- [x]`
3. **Execute**:
   - Follow **Action** instructions precisely
   - Modify only listed **Files**
   - Run **Verification** to confirm success
4. **Mark complete**: Change `- [ ]` to `- [x]`
5. **Update**: Change the frontmatter "updated" date and "progress" count
6. **Continue**: Move to next task

### Critical Rules

- ✅ Follow instructions exactly as written
- ✅ Respect all dependencies before starting a task
- ✅ Verify each task before marking complete
- ❌ Never install libraries not explicitly mentioned
- ❌ Never skip tasks or change their order
- ❌ Never modify files not listed in current task

---

# Implementation Plan: Minecraft Quest Tracker Website

## Overview

Transform an existing Angular/Ionic application into a desktop web-based Minecraft quest tracking system. The site features category-based quest organization, achievement points system (10× quest difficulty), progress persistence via localStorage, parallel/sequential quest unlocking, and engaging animations. Data is loaded dynamically from CSV file with export/import functionality.

## Project Context

- **Tech Stack**: Angular 20, Ionic 8, TypeScript 5.9, RxJS 7.8
- **Architecture Pattern**: Feature-based with core/feature/ui separation (per CLAUDE.md)
- **Key Constraints**: Desktop web only, Ionic components priority, minimal custom CSS, Minecraft retro aesthetic
- **Project Structure**: src/app/{core, feature, ui}, standalone components with OnPush

---

## Prerequisites (Developer Tasks)

> ⚠️ **Human Required**: These tasks must be completed by a developer before AI implementation.

### External Configuration
- [ ] Download Minecraft-style font (Mojangles or Minecrafter) and place at `src/assets/fonts/minecraft.ttf`

---

## Implementation Tasks (AI Editor)

### Phase: Setup

- [ ] **SETUP-01**: Move CSV data file to assets
  - **Files**: `src/assets/data/french.csv`
  - **Action**: Create `src/assets/data/` folder and copy `french.csv` from project root to this location
  - **Verification**: File exists at `src/assets/data/french.csv` with all quest data intact
  - **Dependencies**: None

- [ ] **SETUP-02**: Configure font-face in global styles
  - **Files**: `src/global.scss`
  - **Action**: Add @font-face declaration for Minecraft font pointing to `/assets/fonts/minecraft.ttf`, create utility class `.minecraft-font`
  - **Verification**: Font declaration present, no syntax errors, `pnpm run start` compiles
  - **Dependencies**: None (font file added manually by developer)

- [ ] **SETUP-03**: Create Minecraft color variables
  - **Files**: `src/theme/variables.scss`
  - **Action**: Add CSS variables to `:root` selector: `--minecraft-brown: #8B4513`, `--minecraft-dark-brown: #654321`, `--minecraft-green: #55FF55`, `--minecraft-gray: #555555`, `--minecraft-light-gray: #AAAAAA`, `--minecraft-gold: #FFAA00`, `--quest-locked: var(--minecraft-gray)`, `--quest-active: var(--minecraft-brown)`, `--quest-completed: var(--minecraft-green)`
  - **Verification**: Variables defined in existing file, no overwrites of critical Ionic vars
  - **Dependencies**: None

- [ ] **SETUP-04**: Create Minecraft theme stylesheet
  - **Files**: `src/theme/minecraft-theme.scss`
  - **Action**: Create new file with utility classes: `.minecraft-border` (pixelated border using multiple box-shadows), `.minecraft-shadow` (retro shadow effect), `.minecraft-card` (combines border + shadow + brown background)
  - **Verification**: File created, SCSS compiles without errors
  - **Dependencies**: SETUP-03

- [ ] **SETUP-05**: Import Minecraft theme in global styles
  - **Files**: `src/global.scss`
  - **Action**: Add `@import './theme/minecraft-theme.scss';` at the end of the file
  - **Verification**: `pnpm run start` runs without SCSS compilation errors, styles accessible
  - **Dependencies**: SETUP-04

---

### Phase: Core Models

- [ ] **MODEL-01**: Create Quest model
  - **Files**: `src/app/core/models/quest.model.ts`
  - **Action**: Create folder structure `src/app/core/models/`, define and export `Quest` interface with properties: `numero: number`, `label: string`, `description: string`, `difficulty: number`, `points: number`, `categoryNumero: number`, `parallelWithPrevious: boolean`
  - **Verification**: File exports Quest interface, TypeScript compiles without errors
  - **Dependencies**: None

- [ ] **MODEL-02**: Create Category model
  - **Files**: `src/app/core/models/category.model.ts`
  - **Action**: Define and export `Category` interface with properties: `numero: number`, `name: string`, `parallelWithPrevious: boolean`, `quests: Quest[]`, `totalPoints: number`. Import Quest from `./quest.model`
  - **Verification**: File exports Category interface, imports Quest correctly, compiles
  - **Dependencies**: MODEL-01

- [ ] **MODEL-03**: Create Progress models
  - **Files**: `src/app/core/models/progress.model.ts`
  - **Action**: Define and export two interfaces: `QuestProgress` as `Record<number, boolean>` (maps quest numero to completion status), and `ProgressStats` with properties: `completedPoints: number`, `totalPoints: number`, `percentage: number`
  - **Verification**: Both interfaces exported, TypeScript compiles
  - **Dependencies**: None

---

### Phase: Core Utilities

- [ ] **UTIL-01**: Create CSV parser utility
  - **Files**: `src/app/core/utils/csv-parser.util.ts`
  - **Action**: Create folder `src/app/core/utils/`, implement and export function `parseCSV(csvText: string): any[]` that splits by newlines, parses header row for keys, maps each data row to object with headers as keys, handles quoted fields with commas inside
  - **Verification**: Function exported, handles test CSV string correctly with quoted values
  - **Dependencies**: None

- [ ] **UTIL-02**: Create points calculator utility
  - **Files**: `src/app/core/utils/points-calculator.util.ts`
  - **Action**: Export three functions: `calculateQuestPoints(difficulty: number): number` returns `difficulty * 10`, `calculateCategoryTotal(quests: Quest[]): number` sums all quest points, `calculateProgressStats(quests: Quest[], progress: QuestProgress): ProgressStats` calculates completed points and percentage
  - **Verification**: All functions exported with correct mathematical logic, imports Quest and Progress models
  - **Dependencies**: MODEL-01, MODEL-03

---

### Phase: Core Services

- [ ] **SERVICE-01**: Create QuestDataService skeleton
  - **Files**: `src/app/core/services/quest-data.service.ts`
  - **Action**: Create folder `src/app/core/services/`, create service with `@Injectable({ providedIn: 'root' })`, inject `HttpClient` in constructor, add method signatures: `loadQuestData(): Observable<Category[]>`, add private method `parseQuestData(csvText: string): Category[]`
  - **Verification**: Service compiles, can be injected in components
  - **Dependencies**: MODEL-01, MODEL-02

- [ ] **SERVICE-02**: Implement CSV loading in QuestDataService
  - **Files**: `src/app/core/services/quest-data.service.ts`
  - **Action**: Implement `loadQuestData()` to use `this.http.get('/assets/data/french.csv', { responseType: 'text' })` and pipe through `map()` to call `parseQuestData()`
  - **Verification**: Method returns Observable<Category[]>, HTTP call configured correctly
  - **Dependencies**: SERVICE-01, SETUP-01

- [ ] **SERVICE-03**: Implement CSV parsing in QuestDataService
  - **Files**: `src/app/core/services/quest-data.service.ts`
  - **Action**: Implement `parseQuestData()` to use `parseCSV()` utility, map CSV rows to Quest objects (parse difficulty as number, calculate points using utility, map column "quête faisable en même temps que la précédente" to parallelWithPrevious boolean), group quests by `numero catégorie` into Category objects with calculated totalPoints
  - **Verification**: Returns Category[] with quests properly grouped, points calculated correctly (difficulty × 10)
  - **Dependencies**: SERVICE-02, UTIL-01, UTIL-02

- [ ] **SERVICE-04**: Create ProgressService skeleton
  - **Files**: `src/app/core/services/progress.service.ts`
  - **Action**: Create service with `@Injectable({ providedIn: 'root' })`, add private `BehaviorSubject<QuestProgress>` initialized with empty object, expose as `progress$: Observable<QuestProgress>`, add method signatures for CRUD operations
  - **Verification**: Service compiles, can be injected, BehaviorSubject initialized
  - **Dependencies**: MODEL-03

- [ ] **SERVICE-05**: Implement localStorage read/write in ProgressService
  - **Files**: `src/app/core/services/progress.service.ts`
  - **Action**: Add constant `STORAGE_KEY = 'minecraft-quest-progress'`, implement `loadFromStorage(): QuestProgress` to read from localStorage and parse JSON (return {} if not found), implement `saveToStorage(progress: QuestProgress): void` to stringify and save, call `loadFromStorage()` in constructor to initialize BehaviorSubject
  - **Verification**: Data persists in localStorage across browser refresh
  - **Dependencies**: SERVICE-04

- [ ] **SERVICE-06**: Implement quest toggle in ProgressService
  - **Files**: `src/app/core/services/progress.service.ts`
  - **Action**: Implement `toggleQuest(questNumero: number): void` that gets current value from BehaviorSubject, toggles the boolean for questNumero (or sets to true if undefined), updates BehaviorSubject with new object, calls `saveToStorage()`
  - **Verification**: Toggling quest updates observable and localStorage reactively
  - **Dependencies**: SERVICE-05

- [ ] **SERVICE-07**: Implement progress calculation in ProgressService
  - **Files**: `src/app/core/services/progress.service.ts`
  - **Action**: Add methods `getCategoryProgress(category: Category): ProgressStats` and `getGlobalProgress(categories: Category[]): ProgressStats` that use `calculateProgressStats()` utility with current progress state
  - **Verification**: Methods return correct ProgressStats based on completed quests
  - **Dependencies**: SERVICE-06, UTIL-02

- [ ] **SERVICE-08**: Implement export/import in ProgressService
  - **Files**: `src/app/core/services/progress.service.ts`
  - **Action**: Implement `exportProgress(): void` to create Blob from JSON stringified progress, trigger download with filename `minecraft-progress-${date}.json`, implement `importProgress(file: File): void` to read file, parse JSON, validate structure, update BehaviorSubject and storage
  - **Verification**: Can download JSON file with progress, upload file restores exact state
  - **Dependencies**: SERVICE-07

- [ ] **SERVICE-09**: Implement reset in ProgressService
  - **Files**: `src/app/core/services/progress.service.ts`
  - **Action**: Implement `resetProgress(): void` that sets BehaviorSubject to empty object {}, calls saveToStorage() to persist empty state (note: double confirmation handled by caller component)
  - **Verification**: Calling method clears all progress from localStorage and observable
  - **Dependencies**: SERVICE-08

- [ ] **SERVICE-10**: Create AnimationService
  - **Files**: `src/app/core/services/animation.service.ts`
  - **Action**: Create service with `@Injectable({ providedIn: 'root' })`, add `Subject<void>` named `triggerConfetti$`, add method `triggerConfetti(): void` that calls next() on subject
  - **Verification**: Service compiles, can be injected, subject emits when method called
  - **Dependencies**: None

---

### Phase: UI Components

- [ ] **UI-01**: Create ProgressBarComponent skeleton
  - **Files**: `src/app/ui/progress-bar/progress-bar.component.ts`, `src/app/ui/progress-bar/progress-bar.component.html`, `src/app/ui/progress-bar/progress-bar.component.scss`
  - **Action**: Create folder `src/app/ui/progress-bar/`, create standalone component with `changeDetection: ChangeDetectionStrategy.OnPush`, add `@Input() currentPoints: number = 0`, `@Input() totalPoints: number = 1`, import IonicModule
  - **Verification**: Component compiles, renders empty template
  - **Dependencies**: None

- [ ] **UI-02**: Implement ProgressBarComponent template
  - **Files**: `src/app/ui/progress-bar/progress-bar.component.html`
  - **Action**: Add `<ion-progress-bar>` with `[value]="currentPoints / totalPoints"`, add div with text showing "{{currentPoints}} / {{totalPoints}} points" and percentage
  - **Verification**: Progress bar displays with correct values when inputs provided
  - **Dependencies**: UI-01

- [ ] **UI-03**: Add animation to ProgressBarComponent
  - **Files**: `src/app/ui/progress-bar/progress-bar.component.scss`
  - **Action**: Add CSS transition on ion-progress-bar value change: `transition: all 0.5s ease-out`, style text with minecraft-font class, use `--minecraft-gold` color for text, use `--minecraft-green` for progress bar color
  - **Verification**: Progress bar animates smoothly when currentPoints input changes
  - **Dependencies**: UI-02, SETUP-05

- [ ] **UI-04**: Create CategoryCardComponent skeleton
  - **Files**: `src/app/ui/category-card/category-card.component.ts`, `src/app/ui/category-card/category-card.component.html`, `src/app/ui/category-card/category-card.component.scss`
  - **Action**: Create folder `src/app/ui/category-card/`, create standalone component with OnPush, add `@Input() category!: Category`, `@Input() stats!: ProgressStats`, import IonicModule and RouterModule
  - **Verification**: Component compiles, imports correct models
  - **Dependencies**: MODEL-02, MODEL-03

- [ ] **UI-05**: Implement CategoryCardComponent template
  - **Files**: `src/app/ui/category-card/category-card.component.html`
  - **Action**: Use `<ion-card button [routerLink]="['/category', category.numero]">` containing ion-card-header with category name, ion-card-content with progress percentage display, points text (stats.completedPoints / stats.totalPoints)
  - **Verification**: Card displays category info, navigates on click
  - **Dependencies**: UI-04

- [ ] **UI-06**: Style CategoryCardComponent
  - **Files**: `src/app/ui/category-card/category-card.component.scss`
  - **Action**: Apply `.minecraft-card` class styles, use minecraft-font for title, add hover effect with brightness increase, add pixelated border from theme, use `--minecraft-brown` background
  - **Verification**: Card has Minecraft aesthetic, hover works
  - **Dependencies**: UI-05, SETUP-05

- [ ] **UI-07**: Create QuestCardComponent skeleton
  - **Files**: `src/app/ui/quest-card/quest-card.component.ts`, `src/app/ui/quest-card/quest-card.component.html`, `src/app/ui/quest-card/quest-card.component.scss`
  - **Action**: Create folder `src/app/ui/quest-card/`, create standalone component with OnPush, add `@Input() quest!: Quest`, `@Input() completed: boolean = false`, `@Input() locked: boolean = false`, `@Output() toggle = new EventEmitter<void>()`, add `expanded: boolean = false` property
  - **Verification**: Component compiles, has correct inputs/outputs
  - **Dependencies**: MODEL-01

- [ ] **UI-08**: Implement QuestCardComponent template
  - **Files**: `src/app/ui/quest-card/quest-card.component.html`
  - **Action**: Use `<ion-card [disabled]="locked">`, ion-item with quest label and difficulty stars, click toggles `expanded`, `<div *ngIf="expanded">` shows description and `<ion-button (click)="toggle.emit()">` with text "Marquer comme complétée" or "Pas complétée" based on completed input, show points value (quest.points)
  - **Verification**: Quest expands on click, button emits toggle event
  - **Dependencies**: UI-07

- [ ] **UI-09**: Style QuestCardComponent
  - **Files**: `src/app/ui/quest-card/quest-card.component.scss`
  - **Action**: Apply conditional styling: locked state (gray background, reduced opacity), completed state (green checkmark, `--quest-completed` color), active state (`--quest-active` color), use minecraft-border, smooth expand/collapse animation
  - **Verification**: Visual states match specifications (locked=gray, completed=green checkmark)
  - **Dependencies**: UI-08, SETUP-05

- [ ] **UI-10**: Create ConfettiComponent skeleton
  - **Files**: `src/app/ui/confetti/confetti.component.ts`, `src/app/ui/confetti/confetti.component.html`, `src/app/ui/confetti/confetti.component.scss`
  - **Action**: Create folder `src/app/ui/confetti/`, create standalone component with OnPush, add `@Input() trigger$!: Observable<void>`, add `particles: any[] = []` property, import CommonModule
  - **Verification**: Component compiles
  - **Dependencies**: None

- [ ] **UI-11**: Implement confetti animation logic
  - **Files**: `src/app/ui/confetti/confetti.component.ts`, `src/app/ui/confetti/confetti.component.html`, `src/app/ui/confetti/confetti.component.scss`
  - **Action**: In ngOnInit, subscribe to trigger$ observable, on emit generate 50 particle objects with random x/y positions and colors (minecraft palette), template uses `*ngFor` to render particle divs with absolute positioning, SCSS animates particles falling and fading out over 3 seconds, clear particles array after animation
  - **Verification**: Confetti displays when trigger$ emits, particles animate then disappear
  - **Dependencies**: UI-10

---

### Phase: Feature Pages

- [ ] **PAGE-01**: Create HomePage skeleton
  - **Files**: `src/app/feature/home/home.page.ts`, `src/app/feature/home/home.page.html`, `src/app/feature/home/home.page.scss`
  - **Action**: Create folders `src/app/feature/home/`, create standalone component with OnPush, inject QuestDataService and ProgressService in constructor, add `categories$!: Observable<Category[]>`, add `progress$!: Observable<QuestProgress>`, import IonicModule
  - **Verification**: Page compiles, services injected correctly
  - **Dependencies**: SERVICE-03, SERVICE-07

- [ ] **PAGE-02**: Implement HomePage data loading
  - **Files**: `src/app/feature/home/home.page.ts`
  - **Action**: In ngOnInit, set `categories$ = this.questDataService.loadQuestData()`, set `progress$ = this.progressService.progress$`, add method `getGlobalStats(categories: Category[]): ProgressStats` that calls progressService.getGlobalProgress(), add method `getCategoryStats(category: Category): ProgressStats` that calls progressService.getCategoryProgress()
  - **Verification**: Data streams initialized, stat methods return correct values
  - **Dependencies**: PAGE-01

- [ ] **PAGE-03**: Implement HomePage template
  - **Files**: `src/app/feature/home/home.page.html`
  - **Action**: Add `<ion-header>` with ion-toolbar, title "Minecraft Quests", and app-progress-bar component bound to global stats using async pipe and getGlobalStats(), add `<ion-content>` with `<ion-grid>`, use `<ion-row>` and `<ion-col size="12" size-md="6" size-lg="4">` for responsive grid, `*ngFor` categories with app-category-card component passing category and getCategoryStats()
  - **Verification**: Categories display in grid with progress bars
  - **Dependencies**: PAGE-02, UI-03, UI-06

- [ ] **PAGE-04**: Add export/import/reset buttons to HomePage
  - **Files**: `src/app/feature/home/home.page.ts`, `src/app/feature/home/home.page.html`
  - **Action**: Add three methods: `exportProgress()` calls progressService.exportProgress(), `importProgress()` creates file input programmatically and calls progressService.importProgress(), `resetProgress()` shows ion-alert with 2-step confirmation ("Are you sure?" → "This will delete ALL progress. Continue?") before calling progressService.resetProgress(). Add ion-buttons in toolbar with ion-button for each action, add hidden file input for import
  - **Verification**: Export downloads JSON, import loads file, reset requires 2 confirmations and clears data
  - **Dependencies**: PAGE-03, SERVICE-09

- [ ] **PAGE-05**: Style HomePage
  - **Files**: `src/app/feature/home/home.page.scss`
  - **Action**: Add grid gap using `ion-grid { padding: 16px; }`, style header with `--minecraft-brown` background, apply minecraft-font to title, ensure category cards have consistent height
  - **Verification**: Clean desktop layout, Minecraft-themed header
  - **Dependencies**: PAGE-04, SETUP-05

- [ ] **PAGE-06**: Create CategoryPage skeleton
  - **Files**: `src/app/feature/category/category.page.ts`, `src/app/feature/category/category.page.html`, `src/app/feature/category/category.page.scss`
  - **Action**: Create folders `src/app/feature/category/`, create standalone component with OnPush, inject ActivatedRoute, QuestDataService, ProgressService, AnimationService, add properties: `category$!: Observable<Category | undefined>`, `progress$!: Observable<QuestProgress>`, `categoryNumero!: number`, import IonicModule, CommonModule, RouterModule
  - **Verification**: Page compiles, services injected, receives route params
  - **Dependencies**: SERVICE-03, SERVICE-07, SERVICE-10

- [ ] **PAGE-07**: Implement CategoryPage data loading
  - **Files**: `src/app/feature/category/category.page.ts`
  - **Action**: In ngOnInit, get categoryNumero from `route.snapshot.params['numero']` (parse as number), set `category$ = questDataService.loadQuestData().pipe(map(cats => cats.find(c => c.numero === this.categoryNumero)))`, set `progress$ = progressService.progress$`, add method `isQuestLocked(quest: Quest, category: Category): boolean` that checks if previous quest in category is completed (return false if parallelWithPrevious is true or quest is first)
  - **Verification**: Category data loaded for specific numero, lock logic implemented
  - **Dependencies**: PAGE-06

- [ ] **PAGE-08**: Implement CategoryPage template with quest list
  - **Files**: `src/app/feature/category/category.page.html`
  - **Action**: Add sticky `<ion-header>` with back button, category name title, app-progress-bar for category stats, add `<ion-content>`, use `*ngIf="category$ | async as category"` to render quest list, group parallel quests using `<ion-row>` with `<ion-col>` for each, sequential quests in single columns, use app-quest-card with quest, completed state from progress, locked from isQuestLocked()
  - **Verification**: Quests display correctly, parallel quests side-by-side, sequential stacked
  - **Dependencies**: PAGE-07, UI-03, UI-09

- [ ] **PAGE-09**: Implement quest toggle handler
  - **Files**: `src/app/feature/category/category.page.ts`
  - **Action**: Add method `onQuestToggle(quest: Quest, currentlyCompleted: boolean)` that calls progressService.toggleQuest(), then shows ion-toast with message "+X points!" (where X is quest.points) if newly completed, or "Quest unmarked" if uncompleted, toast duration 2000ms with Minecraft styling
  - **Verification**: Quest toggles state, toast appears with points gained, progress updates
  - **Dependencies**: PAGE-08

- [ ] **PAGE-10**: Add category completion detection
  - **Files**: `src/app/feature/category/category.page.ts`
  - **Action**: In `onQuestToggle()`, after toggling, check if all quests in category are now completed by comparing category stats (percentage === 100), if true call `animationService.triggerConfetti()`, add ConfettiComponent to template with `[trigger$]="animationService.triggerConfetti$"`
  - **Verification**: Confetti displays when last quest in category completed
  - **Dependencies**: PAGE-09, UI-11, SERVICE-10

- [ ] **PAGE-11**: Style CategoryPage
  - **Files**: `src/app/feature/category/category.page.scss`
  - **Action**: Make header sticky with `ion-header { position: sticky; top: 0; z-index: 10; }`, style with minecraft-brown background, add flexbox layout for parallel quests `ion-row { display: flex; gap: 8px; }`, ensure quest cards fill column width
  - **Verification**: Sticky header works, parallel quests layout correctly on desktop
  - **Dependencies**: PAGE-10, SETUP-05

---

### Phase: Routing

- [ ] **ROUTE-01**: Create home.routes.ts
  - **Files**: `src/app/feature/home/home.routes.ts`
  - **Action**: Create file exporting `export const routes: Routes = [{ path: '', component: HomePage }];`, import HomePage and Routes type
  - **Verification**: File compiles, exports routes array
  - **Dependencies**: PAGE-05

- [ ] **ROUTE-02**: Create category.routes.ts
  - **Files**: `src/app/feature/category/category.routes.ts`
  - **Action**: Create file exporting `export const routes: Routes = [{ path: '', component: CategoryPage }];`, import CategoryPage and Routes type
  - **Verification**: File compiles, exports routes array
  - **Dependencies**: PAGE-11

- [ ] **ROUTE-03**: Update app.routes.ts
  - **Files**: `src/app/app.routes.ts`
  - **Action**: Replace entire routes array with: `{ path: '', redirectTo: 'home', pathMatch: 'full' }`, `{ path: 'home', loadChildren: () => import('./feature/home/home.routes').then(m => m.routes) }`, `{ path: 'category/:numero', loadChildren: () => import('./feature/category/category.routes').then(m => m.routes) }`
  - **Verification**: Routes configured for lazy loading, app navigates between home and category pages
  - **Dependencies**: ROUTE-01, ROUTE-02

---

### Phase: Integration & Testing

- [ ] **INT-01**: Test CSV loading with real data
  - **Files**: N/A (testing)
  - **Action**: Run `pnpm run start`, navigate to home page, verify all categories from french.csv display (should be 4 categories: Vanilla Start, Minage, Tinker quests, Tinker alloys), verify quest counts match CSV (category 0 has 20 quests, category 1 has 6 quests, category 2 has 17 quests, category 3 has 12 quests)
  - **Verification**: All 57 quests visible across 4 categories with correct data
  - **Dependencies**: ROUTE-03

- [ ] **INT-02**: Test quest unlocking logic
  - **Files**: N/A (testing)
  - **Action**: Navigate to a category, verify first quest is unlocked, complete it, verify next quest unlocks, test parallel quests (e.g., category 1 quests 100-102 should unlock in parallel), verify locked quests are grayed out and disabled
  - **Verification**: Sequential unlocking works, parallel quests unlock together
  - **Dependencies**: INT-01

- [ ] **INT-03**: Test progress persistence
  - **Files**: N/A (testing)
  - **Action**: Mark several quests as complete across different categories, note the progress, refresh browser (F5), verify all completed quests remain checked, verify progress bars show same values
  - **Verification**: localStorage maintains state across refresh
  - **Dependencies**: INT-02

- [ ] **INT-04**: Test export/import flow
  - **Files**: N/A (testing)
  - **Action**: Complete some quests, click export button to download JSON file, open browser localStorage and manually clear "minecraft-quest-progress" key, reload page to verify progress is gone, click import button and select the downloaded JSON file, verify all progress is restored exactly as before
  - **Verification**: Export/import cycle preserves exact progress state
  - **Dependencies**: INT-03

- [ ] **INT-05**: Test reset with double confirmation
  - **Files**: N/A (testing)
  - **Action**: With some completed quests, click reset button, click "Cancel" on first confirmation (verify nothing happens), click reset again, click "OK" on first confirmation, click "Cancel" on second confirmation (verify nothing happens), click reset again, click "OK" on both confirmations, verify all progress is cleared and localStorage is empty
  - **Verification**: Reset requires 2 confirmations, successfully clears all data
  - **Dependencies**: INT-04

- [ ] **INT-06**: Test animations
  - **Files**: N/A (testing)
  - **Action**: Complete a quest and verify toast appears with "+X points!" message and fades out, complete all quests in a category and verify confetti animation triggers, watch progress bars animate smoothly as points are added
  - **Verification**: Toast animation works, confetti triggers on category completion, progress bars animate
  - **Dependencies**: INT-05

- [ ] **INT-07**: Test responsive desktop layout
  - **Files**: N/A (testing)
  - **Action**: Open browser DevTools, resize to 1024px width (verify 2 category cards per row), resize to 1440px (verify 3 cards per row), resize to 1920px (verify layout remains clean), test parallel quest layout at different widths
  - **Verification**: Clean responsive layout at various desktop widths
  - **Dependencies**: INT-06

---

### Phase: Final Verification

- [ ] **VERIFY-01**: Check Ionic component usage
  - **Files**: All `.html` template files
  - **Action**: Review all component templates, verify using Ionic components for all major UI: ion-card, ion-progress-bar, ion-button, ion-item, ion-header, ion-toolbar, ion-content, ion-grid, ion-row, ion-col, ion-alert, ion-toast, verify minimal custom HTML elements
  - **Verification**: All major UI uses Ionic components
  - **Dependencies**: INT-07

- [ ] **VERIFY-02**: Check minimal custom CSS
  - **Files**: All `.scss` files
  - **Action**: Review all component stylesheets, verify using Ionic CSS utilities for spacing/layout, verify custom CSS is limited to minecraft-theme.scss and component-specific Minecraft styling, ensure no redundant styles that could use Ionic utilities
  - **Verification**: Minimal custom CSS, primarily Minecraft theming
  - **Dependencies**: VERIFY-01

- [ ] **VERIFY-03**: Check code guidelines compliance
  - **Files**: All component `.ts` files
  - **Action**: Verify all components have `standalone: true`, verify all use `changeDetection: ChangeDetectionStrategy.OnPush`, verify multi-file structure (no single-file components), verify naming: models have no suffix, pages are `*.page.ts`, services are `*.service.ts`, verify core services use providedIn root, verify no imports between feature folders
  - **Verification**: All code follows CLAUDE.md guidelines
  - **Dependencies**: VERIFY-02

- [ ] **VERIFY-04**: Final build test
  - **Files**: N/A
  - **Action**: Run `pnpm run build --configuration production` to ensure production build succeeds without errors or warnings
  - **Verification**: Build completes successfully with no errors
  - **Dependencies**: VERIFY-03

---

## Architecture Reference

### Folder Structure

```
website/
├── src/
│   ├── app/
│   │   ├── core/                           # Shared across features
│   │   │   ├── models/
│   │   │   │   ├── quest.model.ts
│   │   │   │   ├── category.model.ts
│   │   │   │   └── progress.model.ts
│   │   │   ├── services/
│   │   │   │   ├── quest-data.service.ts   # CSV loading & parsing
│   │   │   │   ├── progress.service.ts     # localStorage management
│   │   │   │   └── animation.service.ts    # Celebration animations
│   │   │   └── utils/
│   │   │       ├── csv-parser.util.ts
│   │   │       └── points-calculator.util.ts
│   │   │
│   │   ├── feature/
│   │   │   ├── home/                       # Category list page
│   │   │   │   ├── home.page.ts
│   │   │   │   ├── home.page.html
│   │   │   │   ├── home.page.scss
│   │   │   │   └── home.routes.ts
│   │   │   │
│   │   │   └── category/                   # Quest list for category
│   │   │       ├── category.page.ts
│   │   │       ├── category.page.html
│   │   │       ├── category.page.scss
│   │   │       └── category.routes.ts
│   │   │
│   │   ├── ui/                             # Dumb components
│   │   │   ├── progress-bar/
│   │   │   │   ├── progress-bar.component.ts
│   │   │   │   ├── progress-bar.component.html
│   │   │   │   └── progress-bar.component.scss
│   │   │   ├── quest-card/
│   │   │   │   ├── quest-card.component.ts
│   │   │   │   ├── quest-card.component.html
│   │   │   │   └── quest-card.component.scss
│   │   │   ├── category-card/
│   │   │   │   ├── category-card.component.ts
│   │   │   │   ├── category-card.component.html
│   │   │   │   └── category-card.component.scss
│   │   │   └── confetti/
│   │   │       ├── confetti.component.ts
│   │   │       ├── confetti.component.html
│   │   │       └── confetti.component.scss
│   │   │
│   │   ├── app.component.ts
│   │   └── app.routes.ts
│   │
│   ├── assets/
│   │   ├── data/
│   │   │   └── french.csv                  # Quest data
│   │   └── fonts/
│   │       └── minecraft.ttf               # Minecraft font
│   │
│   ├── theme/
│   │   ├── variables.scss                  # Minecraft colors
│   │   ├── common-classes.scss
│   │   └── minecraft-theme.scss            # Custom Minecraft styles
│   │
│   └── global.scss
```

### Key Components

**Core Services (providedIn: 'root')**
- **QuestDataService**: Loads french.csv via HTTP, parses CSV into Quest/Category models with calculated points
- **ProgressService**: Manages quest completion state in localStorage, provides reactive progress observables, handles export/import/reset
- **AnimationService**: Provides Subject for triggering confetti celebration on category completion

**Feature Pages (lazy-loaded)**
- **HomePage**: Displays all categories in responsive grid with global progress bar, export/import/reset controls
- **CategoryPage**: Shows sequential/parallel quest layout for selected category with sticky progress bar

**UI Components (dumb, reusable, standalone, OnPush)**
- **ProgressBarComponent**: Animated Ionic progress bar with points text display
- **QuestCardComponent**: Expandable quest card with locked/active/completed states, toggle button
- **CategoryCardComponent**: Clickable category card showing name, progress %, and achievement points
- **ConfettiComponent**: Particle animation overlay triggered by observable

### Data Models

```typescript
// Quest represents a single quest
interface Quest {
  numero: number;                 // Unique quest ID
  label: string;                  // Quest title
  description: string;            // Quest details/tips
  difficulty: number;             // 1-5 scale
  points: number;                 // difficulty × 10
  categoryNumero: number;         // Parent category ID
  parallelWithPrevious: boolean;  // Can be done alongside previous quest
}

// Category groups quests together
interface Category {
  numero: number;                 // Unique category ID
  name: string;                   // Category title
  parallelWithPrevious: boolean;  // Display alongside previous category
  quests: Quest[];                // All quests in this category
  totalPoints: number;            // Sum of all quest points
}

// Progress tracks completed quests
interface QuestProgress {
  [questNumero: number]: boolean; // true = completed, false/undefined = not completed
}

// ProgressStats for display
interface ProgressStats {
  completedPoints: number;        // Points earned
  totalPoints: number;            // Maximum possible points
  percentage: number;             // completedPoints / totalPoints * 100
}
```

### Data Flow

```
french.csv → HTTP GET → QuestDataService
                            ↓
                    Parse CSV → Categories with Quests
                            ↓
HomePage ← Categories ← QuestDataService
    ↓                           ↓
CategoryCard            CategoryPage ← Route Param (numero)
    ↓                           ↓
Navigate                   QuestCard → Toggle Event
                                ↓
                        ProgressService → localStorage
                                ↓
                        BehaviorSubject → All subscribers update
                                ↓
                        (100%?) → AnimationService → Confetti
```

### localStorage Schema

```json
{
  "minecraft-quest-progress": {
    "0": true,
    "1": false,
    "2": true,
    "15": true
  }
}
```

### Environment Variables

None required. All configuration is in code.

---

## Implementation Guidelines

### Code Standards

- **Components**: All standalone with `changeDetection: ChangeDetectionStrategy.OnPush`
- **File Structure**: Multi-file components (separate .ts, .html, .scss)
- **Naming**: Models have no suffix, pages use `.page.ts`, services use `.service.ts`
- **Services**: Core services use `providedIn: 'root'`, feature services injected in route providers
- **Architecture**: No imports between feature folders, shared code goes in core/

### Angular/Ionic Patterns

- **Lazy Loading**: All pages lazy-loaded via route children
- **Reactive**: Use Observables with async pipe in templates
- **Ionic Components**: Use ion-* components for all major UI elements
- **CSS**: Prefer Ionic CSS utilities, minimal custom CSS in minecraft-theme.scss only

### Execution Rules

- **Never** install additional libraries (use only existing: Angular 20, Ionic 8, RxJS)
- **Always** follow task order and respect dependencies
- **Always** verify each task before marking complete
- **Never** skip verification steps
- **Always** update frontmatter progress count after completing tasks
- **Never** ask for confirmation - execute all steps autonomously

### Error Handling

- If verification fails, **stop** and report the issue with specific error details
- Do not proceed to next task until current task passes verification
- If blocked, re-read task instructions, check dependencies, and review architecture

### CSV Parsing Notes

- CSV has header row with French column names
- Map "numero catégorie" → categoryNumero
- Map "numero quête" → numero (quest ID)
- Map "difficulté (1 à 5)" → difficulty (parse as number)
- Map "Label" → label
- Map "Conseils / description détaillée" → description
- Map "quête faisable en même temps que la précédente" → parallelWithPrevious (parse "oui"/"non" to boolean)
- Calculate points = difficulty × 10
- Handle quoted fields with commas inside quotes

---

## Progress Tracking

### Completion by Phase

- **Setup**: 0/5 tasks
- **Core Models**: 0/3 tasks
- **Core Utilities**: 0/2 tasks
- **Core Services**: 0/10 tasks
- **UI Components**: 0/11 tasks
- **Feature Pages**: 0/11 tasks
- **Routing**: 0/3 tasks
- **Integration & Testing**: 0/7 tasks
- **Final Verification**: 0/4 tasks
- **Total**: 0/64 tasks (0%)

### Current Status

- **Current Task**: SETUP-01
- **Next Tasks**: SETUP-02, SETUP-03, SETUP-04, SETUP-05
- **Blocked Tasks**: None

### Session History

- **2026-01-04**: Plan created
