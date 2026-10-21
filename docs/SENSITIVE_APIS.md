# Observed APIs and infrastructure

Notes from static analysis of Polar Translation / M3rab clients and limited public probes.  
**Not** a claim of a complete server-side API surface.

## Base gateway (Translation / M3rab)

```
https://polar-download-gateway.mdmrksad1ksa.workers.dev
```

## Updates (`app-update.yml`)

```yaml
provider: generic
url: https://polar-download-gateway.mdmrksad1ksa.workers.dev/updates
updaterCacheDirName: polar-translation-updater
```

| Path | Notes |
|------|--------|
| GET `/updates/latest.yml` | Public feed; observed target **M3rab-Setup-1.0.70.exe** |
| GET `/updates/M3rab-Setup-1.0.70.exe` | Current installer name |
| GET `/updates/Polar-Translation-Setup-1.0.xx.exe` | Older builds still hosted |

## Application API

| Path | Role | Unauthenticated probe |
|------|------|------------------------|
| GET `/api/content` | Game / translation catalog JSON | **200** public (~241 games when last checked) |
| `/api/auth/discord/start?port=` | Start Discord OAuth | Needs valid local port flow |
| `/api/auth/verify` | Session verify | Protected / not public |
| `/api/stats` | Stats | Referenced in client; probe **404** |
| `/api/download/authorize` | Issue signed download | Protected (**404** without session) |
| `/api/download/file` | File download after authorize | Protected |
| `/api/request-translation` | Request a translation | Protected (**404** without session) |

### Extra paths in M3rab 1.0.70 client

| Path | Role | Unauthenticated probe |
|------|------|------------------------|
| `/api/poll` | Polls | **404** without session |
| `/api/poll/vote` | Vote | **404** without session |
| `/api/report` | Problem report | **404** without session |
| `/api/request-owned-game` | Request for owned game | **404** without session |

Protected routes expect a real Discord session from the app.

## Public catalog shape (`/api/content`)

Top-level keys observed: `lastUpdated`, `categories`, `games`, `contentVersion`.

Per-game fields include: `id`, `title`, `category`, `rating`, `description`, `descriptionAr`, `bannerImage`, `thumbnailImage`, `executable`, `releaseYear`, `translations[]`.

Each translation entry can include: `id`, `name`, `version`, `type` (e.g. `community`), `size`, `author`, `releaseDate`, `changelog`, **`assetKey`**, `archiveFormat`.

Example `assetKey` pattern:

```text
games/Amnesia_The_Bunker/ar/v1/Amnesia_etrdream.zip
```

`assetKey` is a **storage-style path**, not a free public download URL. Real bytes still go through `/api/download/authorize`.

## Client header / local session

```http
X-Polar-Client: …
```

- Local session file name pattern: `polar-session.json`
- Helpers referenced in bytecode strings: `getSessionToken`, `storeSession`, `clearStoredSession`, …
- App id style string: `com.polar.translation`

## Config / env **names** in bytecode (no secret values found)

```
POLAR_GATEWAY_URL
AUTH_GATEWAY_URL
CONTENT_ALLOWED_HOSTS
POLAR_GATEWAY_STRICT
POLAR_RELAUNCH_CLEAN_ENV
POLAR_SMOKE_TEST
POLAR_SMOKE_SHOT
```

## External references

- Discord: `https://discord.gg/plr`
- GitHub API (UI): `https://api.github.com/repos/PolarWoIF/polaris-translation-manager/releases/latest`

## PolarSteam (separate host — do not mix with M3rab base)

```
https://api.polarwgames.com
```

| Path | Notes |
|------|--------|
| GET `/updates/latest.yml` | PolarSteam feed (observed ~0.0.120) |

PolarSteam has its own RE notes elsewhere; endpoints above are **not** on the M3rab Worker.

## What was not found in the asar

- No hardcoded API keys, Discord client secrets, or long-lived tokens in cleartext strings
- No bulk public ZIP download of all translation packs without authorize
