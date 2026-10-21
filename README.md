# Polar Translation / M3rab — reverse engineering notes

This repo is a personal dump of what I pulled out of the **Polar Translation** desktop app and the later **M3rab (معراب)** build. Same product line, different name on the latest installer.

I’m not the vendor, and this is **not** their official source tree.

## What you’re looking at

When you install the app, the interesting bits live in `app.asar`. I unpacked that and kept:

- Readable files: `preload.cjs`, `package.json`, `main-loader.cjs`, `app-update.yml`
- The main process as it actually ships: `electron.jsc` and `polar-main.jsc` (V8 bytecode via bytenode — you can’t open these like normal TypeScript)
- Notes and string greps under each version folder
- Comparison of 1.0.51 vs 1.0.70
- Deeper notes from a second pass (Oct 2026)

If you expected a clean original repo with `.ts` files from the authors: that isn’t here. The app doesn’t ship that.

## Versions in the repo

| Folder | Version | Name on the box |
|--------|---------|-----------------|
| `v1.0.51-polar-translation/` | 1.0.51 | Polar Translation |
| `v1.0.70-m3rab/` | 1.0.70 | M3rab |

The public update feed (`latest.yml`) points at **M3rab-Setup-1.0.70.exe**. Older builds on the same host are still named `Polar-Translation-Setup-1.0.xx.exe`.

## How the app is put together (short version)

- Electron + React UI
- Main logic compiled with **bytenode** so it isn’t plain JS in the asar
- Renderer only talks to main through `window.polar` (see `preload.cjs`)
- Updates use electron-updater with a generic URL
- Auth is Discord-based; some actions expect server membership / roles
- Translation packs download through a gateway after an authorize step — they aren’t all plain files inside the asar

Update config observed:

```yaml
provider: generic
url: https://polar-download-gateway.mdmrksad1ksa.workers.dev/updates
updaterCacheDirName: polar-translation-updater
```

The cache folder name still says `polar-translation` even on the M3rab build.

## APIs I actually saw

Base host:

`https://polar-download-gateway.mdmrksad1ksa.workers.dev`

Paths from client strings and/or simple unauthenticated requests. **Not a full server API catalog.**

### Updates
- `GET /updates/latest.yml`
- installer binaries under `/updates/…`

### App API
- `/api/content` — **public** catalog (large; ~241 games when last checked)
- `/api/auth/discord/start`
- `/api/auth/verify`
- `/api/stats` (referenced in client; unauthenticated probe got 404)
- `/api/download/authorize` — signed download (needs session)
- `/api/download/file`
- `/api/request-translation`

### Extra in the 1.0.70 client
- `/api/poll` / `/api/poll/vote`
- `/api/report`
- `/api/request-owned-game`

Without a Discord session, most of those protected routes return 404.  
Client header name seen in strings: `X-Polar-Client`.

Also referenced: Discord `https://discord.gg/plr`, and a GitHub releases URL under `PolarWoIF/polaris-translation-manager`.

### Public catalog detail (`/api/content`)

Each game can include `translations[]` with metadata such as size, author, and an **`assetKey`** (storage-style path, e.g. `games/.../ar/v1/....zip`).  
That is **not** a free public download link; the app still goes through authorize for the real file.

## Related products (same public footprint)

| Product | Evidence |
|---------|----------|
| **PolarSteam** | Separate host `https://api.polarwgames.com` |
| **Polar Translation / M3rab** | This gateway + asar |
| **Polar Account Switcher** | https://github.com/PolarWoIF/PolarAccountsSwitcher |
| **GameServer Pro** | https://github.com/PolarWoIF/gameserver-pro-releases |

Org: https://github.com/PolarWoIF

## What’s new in M3rab vs 1.0.51

Same gateway and overall design. 1.0.70 preload adds polls, problem reports, “owned game” requests, installed-game listing, and a simple “what’s new” flag. Branding is M3rab; the technical spine is still Polar Translation.

Bytecode strings also mention TLOU/PSARC-style automation helpers (`polaris-tlou-automation-`, `core.psarc`, etc.) — special install paths, not a separate public API.

## How I worked

1. Read `app-update.yml`
2. Unpacked `app.asar`
3. Kept readable entry files
4. Ran strings on the `.jsc` files
5. Hit a few public endpoints on the gateway
6. Second pass: catalog shape, related PolarWoIF apps, re-probe of auth-gated routes

I did **not** fully map every authenticated download live, and I did **not** recover original TypeScript. No hardcoded API secrets showed up in the asar strings.

## Please don’t misread this repo

| Don’t say | Reality |
|-----------|---------|
| “Official source” | No |
| “Full original source recovered” | No — main is bytecode |
| “Complete list of every server API” | Only what the client exposed or public GETs showed |
| “Patch pack mirror” | Translation binaries are not included |

## Docs in this repo

- `docs/SENSITIVE_APIS.md` — observed APIs, catalog shape, and public probes
- `docs/COMPARISON.md` — 1.0.51 vs 1.0.70
- `docs/DEEPER_FINDINGS_2026-10-21.md` — second pass
- `docs/RELATED_APPS.md` — PolarSteam / Account Switcher / GameServer Pro

## Disclaimer

Not affiliated with Polar Translation, M3rab, or related authors.  
Notes are for learning / documentation. Don’t use them to break auth, dodge membership checks, or reshare localization packs.

If you only need the human-readable bridge, start with `preload.cjs` in each version folder. Everything else is metadata, bytecode, or notes.

# By DevForSy
