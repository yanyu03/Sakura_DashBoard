# Versioning

SakuraEdu keeps application, design-standard, and API versions separate:

- `package.json` is the canonical application version. Use SemVer (`MAJOR.MINOR.PATCH`) with an optional release channel, such as `1.0.1-sakura`.
- The visual-system version is `1.0Sakura`. It describes the CSS and interaction standard and does not change when application logic receives a patch.
- The API path remains `/api/v1` until a breaking API contract requires a new major API version.

The application version is imported from `package.json` by both the frontend and the local/Cloudflare backends. The workspace and authentication portal display it, and `GET /api/v1/meta/version` returns the same values with `Cache-Control: no-store` so the response cannot go stale in caches.

## Releasing

1. Choose the next SemVer value and update `package.json` plus `package-lock.json` together, for example:

   ```powershell
   npm version 1.0.2-sakura --no-git-tag-version
   ```

2. Update the release notes in `docs/releases/` and run `npm run version:check` against the local app or a Worker preview.
3. Build and review the release, then create a Git tag matching the package version with a `v` prefix (for example, `v1.0.2-sakura`).
4. Deploy only after the version endpoint and normal application checks pass. Do not change the CSS standard or API major version just to reflect an application patch.

## Current release

Application: `1.0.1-sakura`  
Design standard: `1.0Sakura`  
API: `v1`
