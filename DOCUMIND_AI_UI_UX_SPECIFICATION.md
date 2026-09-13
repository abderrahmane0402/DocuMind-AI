# DocuMind AI UI/UX Implementation Specification

**Purpose:** Pixel-consistent implementation guide for the React coding agent.  
**Reference image:** Use the accompanying high-resolution DocuMind AI design board as the visual direction.  
**Target:** Professional enterprise SaaS interface for document intelligence, invoice extraction, human validation, RAG chat, analytics, and administration.

---

## 1. Non-negotiable implementation rule

Do not improvise a different visual style. Implement the tokens, dimensions, spacing, states, and responsive behavior defined below. All screens must share the same shell, typography, button styles, forms, tables, status colors, and card geometry.

Do not use fake dashboard numbers in the final application. Loading prototypes may use clearly marked fixtures, but production screens must consume backend APIs.

---

## 2. Design personality

- Professional enterprise SaaS
- Bright, clean content area with a dark navy navigation shell
- Indigo as the main action color
- Compact but readable information density
- Subtle borders and shadows
- Minimal gradients, restricted mainly to the login background and brand accents
- No glassmorphism
- No oversized decorative illustrations in operational screens
- Charts use restrained colors and clear labels

---

## 3. Color tokens

```css
:root {
  --color-primary-50: #EEF2FF;
  --color-primary-100: #E0E7FF;
  --color-primary-200: #C7D2FE;
  --color-primary-300: #A5B4FC;
  --color-primary-400: #818CF8;
  --color-primary-500: #6366F1;
  --color-primary-600: #4F46E5;
  --color-primary-700: #4338CA;
  --color-primary-800: #3730A3;
  --color-primary-900: #312E81;

  --color-navy-950: #070B22;
  --color-navy-900: #0B102D;
  --color-navy-850: #10163A;
  --color-navy-800: #151C46;

  --color-background: #F6F8FC;
  --color-surface: #FFFFFF;
  --color-surface-subtle: #F9FAFB;
  --color-border: #E5E7EB;
  --color-border-strong: #D1D5DB;

  --color-text-primary: #111827;
  --color-text-secondary: #6B7280;
  --color-text-muted: #9CA3AF;
  --color-text-inverse: #F9FAFB;

  --color-success: #10B981;
  --color-success-bg: #ECFDF5;
  --color-warning: #F59E0B;
  --color-warning-bg: #FFFBEB;
  --color-danger: #EF4444;
  --color-danger-bg: #FEF2F2;
  --color-info: #3B82F6;
  --color-info-bg: #EFF6FF;

  --chart-1: #4F46E5;
  --chart-2: #2563EB;
  --chart-3: #10B981;
  --chart-4: #F59E0B;
  --chart-5: #EF4444;
  --chart-6: #8B5CF6;
}
```

### Status mapping

- Ready, completed, validated: success
- Processing, uploaded, queued: info
- Needs review, low confidence: warning
- Failed, rejected, destructive action: danger
- Draft, disabled, unknown: neutral gray

Never communicate status by color alone. Always include a label and, where useful, an icon.

---

## 4. Typography

Use `Inter`, with system fallback:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Weights: 400 regular, 500 medium, 600 semibold, 700 bold.

- Page title: 28 px, 34 px line height, 700
- Section title: 20 px, 28 px line height, 600
- Card title: 15 px, 22 px line height, 600
- Main body: 14 px, 21 px line height, 400
- Secondary body: 13 px, 20 px line height, 400
- Label: 12 px, 18 px line height, 500
- Metric value: 28 px, 34 px line height, 700
- Table text: 13 px, 20 px line height
- Caption: 11 px, 16 px line height

Use sentence case. Avoid all caps except compact metadata labels.

---

## 5. Spacing, radius, and shadows

Use a 4 px base grid.

Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 px.

- Page padding: 24 px desktop, 20 px tablet, 16 px mobile
- Card internal padding: 20 px
- Compact card padding: 16 px
- Form field gap: 16 px
- Dashboard grid gap: 16 px
- Major section gap: 24 px

Radius:

- Inputs and compact buttons: 8 px
- Cards and panels: 12 px
- Large dialogs: 16 px
- Badges: 999 px

Shadows:

```css
--shadow-xs: 0 1px 2px rgba(16, 24, 40, 0.05);
--shadow-sm: 0 1px 3px rgba(16, 24, 40, 0.08), 0 1px 2px rgba(16, 24, 40, 0.04);
--shadow-md: 0 8px 24px rgba(16, 24, 40, 0.10);
```

Default cards use a 1 px border and `shadow-xs`. Dialogs and menus use `shadow-md`.

---

## 6. Application shell

### Desktop, 1440 px and above

- Sidebar width: 240 px expanded, 72 px collapsed
- Top bar height: 64 px
- Main content minimum width: 0, fluid
- Main content max width: none for operational screens
- Sidebar fixed on the left
- Top bar sticky at top
- Main content scrolls independently

### Sidebar

- Background: `#0B102D`
- Logo row height: 64 px
- Horizontal padding: 16 px
- Navigation item height: 40 px
- Navigation item radius: 8 px
- Icon: 18 px
- Icon-to-label gap: 12 px
- Active item: indigo translucent background with white text
- Inactive text: `#CBD5E1`
- Hover: `#151C46`
- Bottom profile block anchored near bottom

Navigation order:

1. Dashboard
2. Documents
3. Upload
4. Chat (RAG)
5. Validation
6. Analytics
7. Workspaces
8. Users, admin only
9. Audit logs, admin/reviewer permissions as configured
10. Settings

### Top bar

- Height: 64 px
- White surface
- Bottom border: 1 px solid border token
- Search width: 320 px desktop
- Right actions: notifications, help if implemented, user menu
- Breadcrumbs belong under the title or at the top of page content, not inside the global search row

---

## 7. Responsive breakpoints

- Mobile: below 768 px
- Tablet: 768 to 1199 px
- Desktop: 1200 px and above
- Wide desktop: 1600 px and above

Behavior:

- Below 1200 px, collapse the sidebar to 72 px by default.
- Below 768 px, hide sidebar off-canvas and show a menu button.
- Dashboard metric grid: 5 columns wide desktop, 3 desktop, 2 tablet, 1 mobile.
- Two-column panels stack below 1024 px.
- Document validation split view becomes tabbed on mobile.
- Tables become horizontally scrollable, never squeeze columns into unreadable widths.
- RAG source panel becomes a drawer below 1100 px.

---

## 8. Shared components

### Buttons

Heights:

- Small: 32 px
- Default: 40 px
- Large: 48 px

Horizontal padding: 12, 16, and 20 px respectively.

Primary button:

- Background primary-600
- White text
- Hover primary-700
- Active primary-800
- Focus ring 3 px primary-200
- Disabled opacity 45%, no shadow

Secondary button:

- White background
- Border strong
- Text primary
- Hover surface-subtle

Danger button:

- Danger background or white with danger border for low-emphasis destructive actions

Buttons require visible loading, disabled, hover, focus, and active states.

### Inputs

- Height: 40 px
- Text area minimum height: 96 px
- Border: 1 px border-strong
- Radius: 8 px
- Horizontal padding: 12 px
- Label margin-bottom: 6 px
- Help/error text margin-top: 6 px
- Error border danger, with explicit text
- Focus border primary-500 and 3 px primary-100 ring

### Cards

- White background
- Border `#E5E7EB`
- Radius 12 px
- Padding 20 px
- Avoid nested shadows

### Badges

- Height: 24 px
- Horizontal padding: 8 px
- Text: 11 px, 600
- Dot or icon: 6 to 12 px depending on icon type

### Tables

- Header height: 44 px
- Body row: minimum 52 px
- Header background: `#F9FAFB`
- Horizontal cell padding: 16 px
- Dividers: 1 px border
- Checkbox column: 44 px
- Row hover: `#F9FAFB`
- Sticky header in long lists
- Actions menu aligned right

### Dialogs

- Small: 440 px
- Medium: 640 px
- Large: 880 px
- Maximum width: calc(100vw - 32px)
- Overlay: rgba(7, 11, 34, 0.55)

---

## 9. Screen specifications

### 9.1 Login

Desktop uses a 58/42 split layout.

Left brand panel:

- Dark navy gradient from `#0B102D` to `#171A55`
- Centered logo and product name
- Short line: “AI-powered document intelligence”
- Optional subtle geometric brand pattern at low opacity

Right panel:

- Maximum form width: 420 px
- Heading, supporting text, email, password, forgot-password link, primary sign-in button, sign-up link
- 24 px vertical rhythm between major groups
- Password visibility toggle inside field
- Inline errors and general authentication error alert

Mobile: hide decorative left panel and keep a compact logo above the form.

### 9.2 Dashboard

Header includes title, description, date range, and optional upload action.

Metric cards:

- Minimum width: 190 px
- Height: approximately 112 px
- Label at top
- 28 px metric
- Change indicator underneath
- Optional 28 px icon container on upper right

Main grid:

- Processing trend uses 2/3 width
- Document type donut uses 1/3 width
- Second row: recent documents 2/3, processing status 1/3
- Chart panel minimum height: 320 px
- Charts must show axes, units, tooltip, legend where relevant, and empty state

### 9.3 Documents

Toolbar:

- Search 280 to 360 px
- Type filter
- Status filter
- Sort selector
- View toggle if grid view is implemented
- Upload button aligned right

Table columns:

```text
selection | name | type | status | uploaded by | date | size | actions
```

Filename column has a file-type icon and truncates with a tooltip. Pagination sits at the bottom right, with result count on the left.

### 9.4 Upload center

- Drop zone minimum height: 280 px
- Dashed 1.5 px primary-200 border
- Primary-50 background on drag-over
- Central upload icon 40 px
- Choose files button
- Accepted type and size text

Queue appears next to or below drop zone:

- File icon/name/size
- Status
- Progress bar, 6 px high
- Percentage
- Cancel or retry action
- Precise validation error

### 9.5 Document details and extraction

Header:

- Filename and breadcrumbs
- Download, reprocess, delete

Tabs:

```text
Overview | Extraction | Pages | Activity | Chat
```

Extraction layout on desktop:

- Document preview: 55 to 60% width
- Extracted fields: 40 to 45% width
- Minimum panel height: calc(100vh - 190px)
- Preview toolbar: page, zoom, rotate, fit, full screen
- Fields are grouped logically and show value, confidence, state, and source page

Confidence:

- 90 to 100: green
- 75 to 89: amber
- Below 75: red

Thresholds must be configuration-driven, not duplicated in components.

### 9.6 Validation workspace

Desktop 3-column option:

- Preview: 32%
- Field list: 38%
- Field details/audit information: 30%

Alternative 2-column mode is allowed when the detail panel is a drawer.

Low-confidence items are first. Selected field has an indigo border and subtle background. Provide Confirm, Correct, Reject, Previous, Next, Save, and Validate Document actions. Destructive/rejection choices need a reason where required.

### 9.7 RAG chat

Desktop layout:

- Conversation list: 260 px
- Chat canvas: fluid, minimum 520 px
- Sources panel: 340 px

Chat messages:

- User message max width: 70%, aligned right, primary-50 background
- Assistant message max width: 82%, white or transparent background
- Body: 14 px with 22 px line height
- Citation chips directly after supported claims
- Composer sticky at bottom, minimum 56 px, maximum 160 px auto-grow

Sources panel card shows filename, page, retrieval score when suitable, evidence snippet, preview thumbnail, and “Open in viewer”.

Unanswerable response must use neutral wording and show no invented sources.

### 9.8 Analytics

- Date range at upper right
- Shared filters for workspace, document class, and period
- Top metric row
- Two-column chart grid, stacking responsively
- Every chart includes title, optional description, accessible tooltip, empty state, and data source from backend

### 9.9 Administration

Separate tabs or routes for users, audit logs, system status, and failed jobs. Use server-side pagination for potentially large lists. Role changes and retries need confirmation and audit logging.

---

## 10. Interaction states

Every asynchronous view must implement:

1. Initial loading skeleton
2. Empty state with useful next action
3. Success state
4. Partial data state where applicable
5. Recoverable error with retry
6. Forbidden state
7. Not-found state
8. Offline/network failure state

Do not display an endless spinner. After a reasonable delay, show progress or explanatory text.

Processing status may be polled initially. Poll active jobs every 2 to 5 seconds with backoff, stop polling at terminal status, and invalidate relevant TanStack Query caches.

---

## 11. Accessibility

- Meet WCAG AA contrast for normal text and controls
- Visible keyboard focus on every interactive control
- Semantic heading hierarchy
- Proper labels and descriptions for form fields
- Accessible names for icon-only buttons
- Escape closes menus/dialogs where safe
- Focus trapped inside modal dialogs
- Return focus to triggering element
- Minimum pointer target 40 by 40 px
- Charts need text summaries or accessible tabular alternatives
- Document confidence and status cannot rely only on color
- Respect `prefers-reduced-motion`

---

## 12. Icons and charts

Use one icon library, preferably `lucide-react`.

- Sidebar icons: 18 px
- Button icons: 16 px
- Empty-state icons: 40 to 48 px
- Stroke width: consistent default

Use Recharts for analytics. Use 2 px line strokes, 6 px point markers only on hover or sparse datasets, light grid lines, and restrained animation. Do not use 3D charts.

---

## 13. Implementation architecture

Organize frontend code by feature. Do not create one giant dashboard component.

```text
src/
  app/
  api/
  components/
    ui/
    layout/
    feedback/
  features/
    auth/
    dashboard/
    documents/
    upload/
    validation/
    chat/
    analytics/
    administration/
  hooks/
  routes/
  schemas/
  styles/
  types/
  utils/
```

Use central token definitions in Tailwind configuration and CSS variables. Do not scatter hexadecimal colors, z-index values, confidence thresholds, or spacing constants throughout JSX.

---

## 14. Required reusable components

```text
AppShell
Sidebar
TopBar
PageHeader
Breadcrumbs
MetricCard
StatusBadge
ConfidenceBadge
DataTable
TableToolbar
EmptyState
ErrorState
LoadingSkeleton
ConfirmDialog
FileDropzone
UploadQueueItem
ProcessingTimeline
DocumentViewer
ExtractionFieldRow
FieldReviewPanel
ChatMessage
ChatComposer
CitationChip
SourceEvidenceCard
ChartCard
DateRangeFilter
RoleGuard
PermissionGuard
```

Each shared component must have typed props and tests for critical behavior.

---

## 15. Acceptance checklist for the coding agent

The design implementation is complete only when:

- Sidebar dimensions and navigation ordering match this specification.
- Global colors, typography, spacing, radius, and shadows use shared tokens.
- Login, dashboard, documents, upload, extraction, validation, chat, analytics, and admin screens exist.
- Desktop, tablet, and mobile layouts were tested.
- Tables remain readable on small screens.
- Validation and RAG layouts adapt to narrow widths.
- All asynchronous screens include loading, empty, success, and error states.
- Focus states and keyboard navigation work.
- Statuses include text, not color alone.
- No fake metrics remain in production paths.
- Screens use real API contracts or clearly isolated development fixtures.
- Frontend lint, type checking, unit tests, E2E tests, and production build pass.
- Screenshots at 1440x900, 1280x800, 768x1024, and 390x844 are captured for comparison.

---

## 16. Visual QA procedure

For every completed screen:

1. Render at 1440x900.
2. Compare shell dimensions, margins, card alignment, typography, colors, and density with the reference.
3. Render at 1280x800 and verify no overlapping controls.
4. Render at 768x1024 and verify collapsed navigation and stacked grids.
5. Render at 390x844 and verify off-canvas navigation, readable forms, and functional tables/cards.
6. Verify light and dark themes where supported.
7. Verify 100%, 125%, and 150% browser zoom.
8. Run keyboard-only navigation.
9. Run automated accessibility checks.
10. Record discrepancies in `PROJECT_STATUS.md` and fix high-impact issues before completion.

---

## 17. Instruction to paste before coding

```text
Implement the DocuMind AI frontend exactly from
DOCUMIND_AI_UI_UX_SPECIFICATION.md and the accompanying visual reference.

Do not redesign the product. Start by defining shared design tokens and the
application shell. Then implement one screen at a time using reusable,
feature-oriented components.

For each screen, verify desktop, tablet, and mobile layouts; loading, empty,
error, and success states; keyboard accessibility; type checking; tests; and
the production build. Do not use hard-coded production metrics or permanently
mocked API responses. Document visual discrepancies and verification results
in PROJECT_STATUS.md.
```
