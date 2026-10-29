# AmeriVerse Hub verification

Date: October 21, 2026. Application: `robnettstories/ameriverse_test`.

## Result

- All four portals are implemented, with the original Connected Enterprise and supplied workflow library preserved.
- **200 acceptance checks passed**, with zero failed checks, uncaught JavaScript errors or failed HTTP resource responses.
- **680 workflow step visits** verified titles, previous/next boundaries, closing and returning to the hub.
- **90 additional final responsive checks passed** after the last mobile input and safe-area adjustments. Every visible command-center button, select, input and summary met the 44 × 44 CSS-pixel criterion. No page-wide horizontal overflow occurred; wide tables scroll inside labeled regions.
- **Six financial and scenario tests passed:** record reconciliation; paid-cycle and billing denominators; finite support capacity; weekly cash reconciliation and timing effects; comparable-progress cohorts; transparent quality scoring and decided-bid denominators.
- Local references resolve, including references embedded in workflow content. The generated worker precaches 70 entries (69 files and the application root). Workflow directory navigation also resolves from the cached index file.

## Browser and viewport coverage

Chromium **154.0.8037.57** and Playwright WebKit **26.5** both tested:

| Profile | CSS viewport |
| --- | --- |
| Desktop | 1440 × 1000 |
| iPhone small | 375 × 812 |
| iPhone | 390 × 844 |
| iPad portrait | 768 × 1024 |
| iPad landscape | 1024 × 768 |

Coverage includes all nine portal subviews, region/risk and project search filtering, coherent totals, empty results and reset, project details, comparable services comparison, native dialog keyboard containment, resource conservation, scenario save/load/reset, assumption changes, local task persistence/reset, workflow search, original DOCX downloads, concept-report downloads and the original data sphere.

The final 90-check sweep covers the same widths in both engines at 900-pixel height, including 16-pixel inputs for coarse pointers, safe-area CSS and final control dimensions.

## Original QA issues fixed

1. Workflow close, previous and next controls are at least 44 × 44 CSS pixels on all four workflows.
2. Opening a workflow sets a usable initial focus target. Tab and Shift+Tab remain within the foremost open overlay, including its navigation controls. Closing restores the initiating focus. This also covers nested image overlays.
3. Workflow pages include a direct return to Employee Resources. The standalone workflow hub remains available.

Additional observed issue fixed: the cash view's nested grid could expand beyond the mobile viewport. Its grid children now permit shrinking, and its tables retain their own scroll areas.

## Offline and updates

Both engines passed first installation, waiting-version detection, user-initiated update activation and old-cache cleanup. Cache names include the site's path and content/worker version. The worker serves cached application resources first and resolves directory URLs to cached index files.

Chromium's five device profiles passed offline navigation through all four portals and all five workflow pages using the browser context offline flag. WebKit's five profiles passed the same navigation **after the local origin server was stopped**, with every page served from the installed cache. WebKit's inspector offline flag fails before service-worker dispatch in this environment, so stopping the origin was used to exercise network loss without that inspector limitation. This distinction is preserved in the evidence.

WebKit was downloaded from the official Playwright endpoint. Missing shared libraries were obtained through Debian's signed package repository and unpacked under workspace cache directories. No TLS checks were disabled. Playwright's host-library inventory check was skipped after locally supplying its libraries, because it checks the system linker cache rather than workspace library locations.

## Simulated performance

Three cold-cache Chromium runs at 390 × 844, **4× CPU slowdown, 1.6 Mbps download, 150 ms latency**, with service workers blocked:

| Metric | Observed range |
| --- | --- |
| Largest contentful paint | 1712–1824 ms |
| Cumulative layout shift | 0.0000 |
| First contentful paint | 1116–1176 ms |
| Load event | 1972–2084 ms |
| Filter update to two animation frames | 54–74 ms |

These measurements meet the selected LCP ≤ 2.5 s and CLS ≤ 0.1 targets in this simulation. The interaction measurement is an application rendering probe, not a field INP measurement or physical-iOS result.

## Evidence and reproduction

- `tests/evidence/browser-results.json`: all 200 checks, versions, viewport details, workflow step counts and raw performance samples.
- `tests/evidence/responsive-results.json`: final 90 responsive/control checks.
- `tests/evidence/worker-update.txt`: update lifecycle results in both engines.
- `tests/model.test.mjs`, `tests/browser.cjs`, `tests/responsive.cjs`, `tests/worker-update.cjs`: executable checks; see README for commands.
- `/workspace/ameriverse-review/verified-browser/`: screenshots captured during browser acceptance.

## Physical-device limits

Headless WebKit and Chromium do not establish physical Safari behavior. Native iOS sharing, Home Screen installation, resume, actual safe-area appearance and device responsiveness still need a real iPhone/iPad check over the deployed HTTPS URL before a CEO presentation. The app makes no production offline or live-integration claim.

## Datasphere navigation update

Added **Datasphere** as a fifth primary navigation tab at `#datasphere`. The existing interactive Connected Enterprise graph now opens inside the hub, with an optional full-screen window. Embedded mode keeps the hub navigation visible, and the standalone graph returns to the Datasphere tab. Mobile navigation accommodates all five tabs and the graph controls provide 44-pixel touch targets.

- Ten focused interaction scenarios passed: Chromium and WebKit at desktop, iPhone 375/390, iPad portrait and iPad landscape sizes. These cover navigation, search, department filtering, real pointer node selection and rotation, desktop wheel zoom, simulated pinch handlers, all 13 walkthrough steps, replay/exit, reset, full-screen return and layout.
- Chromium additionally verified the embedded graph works after reloading offline on all five profiles.
- The updated responsive suite passed 100 portal/viewport checks in both engines, including the Datasphere route.
- All six model tests and the local-resource build validation passed.
- Headless pinch-handler checks do not establish physical-device gesture behavior.

Evidence: `tests/evidence/datasphere-results.json`; focused runner: `tests/datasphere.cjs`.

## Exact vector branding and standalone export

The supplied `AmeriTech-Colored.svg` is preserved as `assets/brand/ameritech-colored.svg`. Its exact navy (`#0C273C`) and red (`#AF2838`) are used in the hub and datasphere. Headers, workflow logos/watermarks and app icons now use this reference. Existing status and department colors continue to distinguish functional categories.

`downloads/AmeriVerse-Datasphere-Standalone.html` embeds all code, styles, the vector logo and six local font faces. It has no external asset dependencies or navigation back to GitHub/the hub. The Datasphere tab provides a direct HTML download. Every site build regenerates the export.

- Ten standalone scenarios passed in Chromium and WebKit across desktop, 375/390-pixel phones, iPad portrait and landscape. The exact exported HTML was rendered with networking disabled; all interactions passed and zero external requests were observed.
- Native `file://` opening and node search were also verified in WebKit with zero HTTP requests. This managed Chromium blocks `file://` navigation by policy, so its check renders the exact file bytes directly. WebKit's inspector offline flag also blocks navigation before file dispatch; the cross-engine offline checks use direct HTML rendering without changing browser security settings.
- Ten hosted-datasphere scenarios and 100 responsive/control checks passed locally in both engines.
- Twenty workflow page/logo/layout checks and four byte-matching HTML download checks passed in Chromium and WebKit at 390 and 1440 pixels.
- Local references resolve and the regenerated service worker precaches 73 entries.

Evidence: `tests/evidence/standalone-results.json`, `branded-datasphere-results.json`, `branded-responsive-results.json` and `branded-pages-results.json`. Physical iOS installation/share/resume limits stated above continue to apply.

## Source Sans 3 typography selection

Source Sans 3 is the primary face for portal headings, navigation, workflow headings/diagrams and the datasphere. IBM Plex Mono serves numerical and technical labels. Active Barlow Condensed face declarations and preload were removed. The standalone export now embeds four font faces and is 256,091 bytes.

- All 100 responsive/control checks passed in Chromium and WebKit.
- Ten offline standalone scenarios passed with no external requests and the selected Source Sans 3 faces loaded.
- Twenty workflow heading/logo/layout checks and four exact-byte HTML download checks passed in both engines at 390 and 1440 pixels.

Evidence: `tests/evidence/source-sans-responsive-results.json`, `source-sans-standalone-results.json`, `source-sans-pages-results.json`.
