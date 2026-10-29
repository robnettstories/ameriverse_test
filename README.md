# AmeriVerse Hub

A responsive, static proof of concept for AmeriTech Contracting. Projects, customers, employees, vendors, benchmarks and financial records are synthetic. Procore and Sage Intacct are not connected. Tasks, inspections and staffing allocations are local demo interactions.

Live site: https://robnettstories.github.io/ameriverse_test/

## Explore

- **Executive:** nationwide portfolio filters, recovery at comparable progress, project billing and observation records, finite staffing allocations, weekly cash and a local prevention queue.
- **Job Site:** project health, weighted PM capacity, manpower and qualifications, equipment, observations normalized by labor hours, and a transparent proposed subcontractor index with human-review indicators.
- **Employee Resources:** searchable supplied workflows for AIA billing by date, AIA billing flow, subcontract buyout and the APM lifecycle; original DOCX downloads and illustrative learning profiles.
- **Insights Studio:** explicitly labeled future concept, invented benchmarks, decided-bid metrics and a separate fictional client report. Internal portfolio records are not exposed through the concept.
- **Datasphere:** a dedicated navigation tab for the original interactive Connected Enterprise graph, with search, department filtering, node selection, rotation/zoom and the observation walkthrough. It stays inside the hub, with a full-screen option at `connected-enterprise.html`.

Suggested walkthrough: open the $40M Federal Medical Center at 62% completion and compare Coastal Facilities Services at 64%. In Cash & capacity, allocate 1 APM FTE to each of Federal Medical and Pacific Research, then allocate the single billing FTE. Review submission and collection dates, PM load, weekly receipts, AP payments and assumptions; reset. Finish with the owner-filtered action queue.

## Run and verify

Requires Node.js 18+ and Python 3. No package installation or runtime dependencies are needed.

```sh
npm start
npm test
npm run build
```

Open http://localhost:8001/. The build validates local references, including workflow content, and regenerates the scoped, content-versioned service worker. Rebuild after application changes. GitHub Pages serves the repository root; no distribution folder is needed.

Browser checks require Playwright with Chromium and WebKit installed:

```sh
PLAYWRIGHT_MODULE=/path/to/node_modules/playwright npm run test:browser
PLAYWRIGHT_MODULE=/path/to/node_modules/playwright node tests/worker-update.cjs
```

The runner uses `/usr/bin/chromium`; set `CHROMIUM_PATH` when needed. `BASE_URL` selects another hosting URL, `QA_OUTPUT` selects the evidence folder, `ONLY_ENGINE` selects Chromium or WebKit, and `SKIP_PERF=1` skips the separate Chromium simulation. Default `test-results/` output is ignored by Git. Browser tooling is not shipped to visitors.

## Data and assumptions

`assets/model.js` owns the synthetic data and calculations; `assets/hub.js` renders the portals. Dollar amounts reconcile gross invoices to collected cash, open balances and retainage. Paid cycle times use paid invoice amounts; unpaid balances show days since invoice. The 12-week forecast combines $2.60M opening cash, assumed receipts, progress-based future project costs, incurred AP commitments and $310,000 weekly enterprise costs. Existing retainage and unapproved changes are excluded from receipts.

The forecast is a conservative illustration of current receivables and eligible existing unbilled work. It does not assume collections from future earned work, a credit facility or new awards. Staffing changes timing; it does not create revenue or guarantee recovery. Negative cash illustrates a funding need. Definitions and denominators are available in the app.

The incremental support pool contains 2.0 APM FTE and 1.0 billing FTE. Controls conserve both pools; existing APM commitments are separately counted. Saved scenarios and completed tasks use local device storage and have reset controls.

## Supplied materials

The fonts, workflow content, screenshots and DOCX files come from `AmeriTech-Workflows-App.zip`. The logo now uses the supplied `AmeriTech-Colored.svg` exactly, with navy `#0C273C` and red `#AF2838`; app icons are rendered from its emblem. Hub and workflow headers use the same vector asset. Workflows retain supplied content, with local asset paths and hub navigation adapted. Shared fixes provide 44-pixel close/previous/next controls, initial focus, focus containment, return focus, safe areas and reduced-motion handling. The untouched reference remains outside this checkout.

## Offline and updates

The manifest includes regular, maskable and Apple touch icons. On HTTPS or localhost, a service worker caches the synthetic app and workflows after initial installation. Caches are scoped to the site's path and versioned from application content and worker behavior. A waiting update offers a reload button; activation clears only this site's older caches.

See `QA-REPORT.md` for browser evidence and limits. Native iOS sharing, Home Screen installation, resume and hardware responsiveness require a physical iPhone/iPad check before a CEO presentation.

## Standalone datasphere export

Open the Datasphere tab and choose **Download HTML**, or use `downloads/AmeriVerse-Datasphere-Standalone.html` directly. The single file embeds its SVG logo, fonts, CSS and JavaScript. It works without a GitHub account, server or network connection. Save it locally, then open it in a modern browser. Search, department filters, node details, rotation/zoom, the complete observation walkthrough and reset are retained. It contains only synthetic demo data and no link back to the hub.

`npm run export:datasphere` regenerates this file; `npm run build` also regenerates it before validating and versioning the site's cache. `node tests/standalone.cjs` checks the exported bytes with networking disabled in Chromium and WebKit across five viewport profiles.

Typography uses Source Sans 3 for headings, navigation, workflow text and the datasphere. Financial and numerical labels use IBM Plex Mono. Both families are embedded in the standalone HTML; no commercial font files are required.
