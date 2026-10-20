# APIs (both brands — same gateway)

Base: `https://polar-download-gateway.mdmrksad1ksa.workers.dev`

## Shared
- GET `/updates/latest.yml`
- GET `/api/content`
- `/api/auth/discord/start`, `/api/auth/verify`, `/api/stats`
- `/api/download/authorize`, `/api/download/file`
- `/api/request-translation`

## Added / clearer in M3rab 1.0.70
- `/api/poll`, `/api/poll/vote`
- `/api/report`
- `/api/request-owned-game`

Header name observed: `X-Polar-Client`
