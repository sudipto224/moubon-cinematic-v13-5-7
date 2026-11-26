# Moubon V13.3.5 — Development Dependency Security Note

The owner supplied a V13.3.1 `npm audit` report with 30 advisories (20 moderate, 10 high) in the Lighthouse/Puppeteer development and QA tool chain, including OpenTelemetry instrumentation, `basic-ftp`, `extract-zip`, `minimatch`, and `zod`.

## Change made

- Updated the pinned Lighthouse development dependency from 12.8.2 to 13.6.0, the patched release identified by the supplied audit remediation path.
- Kept the dependency pinned; did not use `npm audit fix --force`.
- The owner ran `npm install` on V13.3.2 and reported **0 vulnerabilities**. V13.3.5 changes no dependencies, so this remains the latest owner-reported audit result.
- A separate fresh `npm install` / `npm audit` was not completed in this sandbox.

## Owner verification

Run on V13.3.5 if you want a version-specific confirmation:

```powershell
npm install
npm audit
```

If advisories remain, save the full output:

```powershell
npm audit *> npm-audit.txt
```

Do not run `npm audit fix --force` without reviewing the exact proposed package changes and re-running all tests.

**Status:** Owner-reported V13.3.2 audit: 0 vulnerabilities. V13.3.5 dependency tree is unchanged; V13.3.5-specific install/audit is **NOT MEASURED** in this sandbox.
