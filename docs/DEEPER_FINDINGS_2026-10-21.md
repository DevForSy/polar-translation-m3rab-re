# Deeper findings (2026-10-21)

Extra notes after a second pass on **M3rab 1.0.70** + related Polar ecosystem.
These are **observations only** — not secrets stolen from a private backend.

## Gateway status (re-probed)

Base: `https://polar-download-gateway.mdmrksad1ksa.workers.dev`

| Path | Unauthenticated result |
|------|------------------------|
| `GET /api/content` | **200** — public catalog |
| `GET /updates/latest.yml` | **200** — still points to M3rab 1.0.70 |
| `/api/poll`, `/api/stats`, `/api/auth/verify` | 404 without session |
| `/api/download/authorize`, `/api/download/file` | 404 without session |
| `/api/report`, `/api/request-owned-game`, `/api/request-translation` | 404 without session |

Protected routes need a real Discord session from the app; they are not openly callable.

## Public catalog (`/api/content`) — structure

Observed top-level JSON keys:

- `lastUpdated`
- `categories` (Action, Adventure, Horror, RPG, …)
- `games` (about **241** entries at probe time)
- `contentVersion`

Per-game fields seen:

- `id`, `title`, `category`, `rating`, `description`, `descriptionAr`
- `bannerImage`, `thumbnailImage` (often Steam CDN URLs)
- `executable`, `releaseYear`
- `translations[]` with items like:
  - `id`, `name`, `version`, `type` (e.g. `community`)
  - `size`, `author`, `releaseDate`, `changelog`
  - **`assetKey`** — storage-style path, e.g.  
    `games/Amnesia_The_Bunker/ar/v1/Amnesia_etrdream.zip`
  - `archiveFormat` (e.g. `zip`)

`assetKey` reveals internal packaging layout. It is **not** a direct public download URL; installs still go through `/api/download/authorize`.

## Environment / config names in bytecode

String names only (no secret values found in the asar):

```
POLAR_GATEWAY_URL
AUTH_GATEWAY_URL
CONTENT_ALLOWED_HOSTS
POLAR_GATEWAY_STRICT
POLAR_RELAUNCH_CLEAN_ENV
POLAR_SMOKE_TEST
POLAR_SMOKE_SHOT
```

App id style string: `com.polar.translation`  
Local session file name: `polar-session.json`  
Client header name: `X-Polar-Client`

## Installer / automation strings (M3rab main)

```
polaris-tlou-automation-
polaris-elevated-
polaris-archive-
polaris-stage-
core.psarc
TLOU PSARC Tool.exe
```

Indicates special handling for **The Last of Us Part I** (PSARC tooling), not a separate public API.

## Related products (same public footprint)

| Product | Evidence |
|---------|----------|
| **PolarSteam** | `https://api.polarwgames.com/updates/latest.yml` → ~0.0.120 |
| **Polar Translation / M3rab** | this gateway + asar |
| **Polar Account Switcher** | GitHub `PolarWoIF/PolarAccountsSwitcher` (.NET account switcher) |
| **GameServer Pro** | GitHub `PolarWoIF/gameserver-pro-releases` |

Discord invite still referenced in client ecosystem notes: `https://discord.gg/plr`

## What was still not found

- No hardcoded API keys, Discord client secrets, or long-lived tokens in the asar strings
- No bulk public download of translation ZIPs without authorize
- `.jsc` remains bytecode — not recovered TypeScript source

## Accuracy

Only paths and behaviors verified by file strings and/or HTTP probes are listed above.
