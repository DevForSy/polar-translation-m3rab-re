# Polar Translation / M3rab > reverse engineering notes

This repo is a personal dump of what I pulled out of the **Polar Translation** desktop app and the later **M3rab** build. Same product line, different name on the latest installer.

I’m not the vendor, and this is **not** their official source tree.

## What you’re looking at

When you install the app, the interesting bits live in `app.asar`. I unpacked that and kept:

- Readable files: `preload.cjs`, `package.json`, `main-loader.cjs`, `app-update.yml`
- The main process as it actually ships: `electron.jsc` and `polar-main.jsc` (V8 bytecode via bytenode > you can’t open these like normal TypeScript)
- Short notes and string greps under each version folder
- A small comparison of 1.0.51 vs 1.0.70

If you expected a clean original repo with `.ts` files and comments from the authors: that isn’t here. The app doesn’t ship that.

## Versions in the repo

| Folder | Version | Name on the box |
|--------|---------|-----------------|
| `v1.0.51-polar-translation/` | 1.0.51 | Polar Translation |
| `v1.0.70-m3rab/` | 1.0.70 | M3rab |

The public update feed (`latest.yml`) currently points at **M3rab-Setup-1.0.70.exe**. Older builds on the same host are still named `Polar-Translation-Setup-1.0.xx.exe`.

## How the app is put together (short version)

- Electron + React UI
- Main logic compiled with **bytenode** so it isn’t plain JS in the asar
- Renderer only talks to main through `window.polar` (see `preload.cjs`)
- Updates use electron-updater with a generic URL
- Auth is Discord-based; some actions expect server membership / roles
- Translation packs are downloaded through a gateway after an authorize step > they aren’t all sitting as plain files inside the asar

Update config observed:

```yaml
provider: generic
url: https://polar-download-gateway.mdmrksad1ksa.workers.dev/updates
updaterCacheDirName: polar-translation-updater
```

Yes, the cache folder name still says `polar-translation` even on the M3rab build.

## APIs I actually saw

Base host:

`https://polar-download-gateway.mdmrksad1ksa.workers.dev`

These paths showed up in client strings and/or simple unauthenticated requests. **This is not a promise that the server has nothing else.**

**Updates**

- `GET /updates/latest.yml`
- installer binaries under `/updates/…`

**App API**

- `/api/content` — catalog (responded publicly when I tried)
- `/api/auth/discord/start`
- `/api/auth/verify`
- `/api/stats` (mentioned in the client; my probe got 404)
- `/api/download/authorize`
- `/api/download/file`
- `/api/request-translation`

**Extra paths in the 1.0.70 client**

- `/api/poll`
- `/api/poll/vote`
- `/api/report`
- `/api/request-owned-game`

Also saw the header name `X-Polar-Client` in bytecode strings, Discord invite `https://discord.gg/plr`, and a GitHub releases URL under `PolarWoIF/polaris-translation-manager`.

## What’s new in M3rab vs 1.0.51

Same gateway, same overall design. The 1.0.70 preload adds things like polls, problem reports, “owned game” requests, installed-game listing, and a simple “what’s new” seen flag. Branding in `package.json` is M3rab; the technical spine is still Polar Translation.

## How I worked

1. Read `app-update.yml`
2. Unpacked `app.asar`
3. Kept the readable entry files
4. Ran strings on the `.jsc` files
5. Hit a few public endpoints on the gateway

## Please don’t misread this repo

| Don’t say | Reality |
| “Official source” > No |
| “Full original source recovered” > No > main is bytecode |
| “Complete list of every server API” > Only what the client exposed or what public GETs showed |
| “Patch pack mirror” >Translation binaries are not included on purpose |

## Disclaimer

If you only need the human-readable bridge, start with `preload.cjs` in each version folder. Everything else is either metadata, bytecode, or my notes.

## By DevForSy