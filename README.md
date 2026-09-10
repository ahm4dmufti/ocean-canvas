# The Ocean That Paints Itself

A generative art piece for one specific beach — Benghazi, Libya — that repaints itself once a day from that day's real ocean conditions. No two days ever look the same, and the same day never looks different twice.

Built on Laravel, Inertia, and React, styled with Tailwind and shadcn, animated with Motion.

## What it does

Every day, the app fetches live marine and wind data for a fixed set of coordinates — wave height, wave period, wave direction, wind speed, wind direction, sea surface temperature — and turns it into a painting. A seeded PRNG keyed to the date drives a flow-field of brush strokes over a simplex-noise field, so the result is deterministic (reload it ten times, get the same picture) but never repeats from one day to the next.

- **The art brain** — conditions map directly onto the canvas, not just a color swatch:

    | Signal          | Drives                                                                       |
    | --------------- | ---------------------------------------------------------------------------- |
    | Wave height     | Palette boldness, stroke width, foam density                                 |
    | Wave period     | Layer count and spacing — long-period swell reads calmer and more spread out |
    | Wind speed      | Turbulence and jitter along each stroke's path                               |
    | Wind direction  | The dominant angle every stroke flows along                                  |
    | Sea temperature | Warm/cool hue bias of the whole palette                                      |

- **Download as wallpaper** — renders a separate high-resolution pass (2560x1440) on demand, independent of the on-screen preview.
- **Surf call** — a plain-language read of the day's conditions (Flat, Marginal, Fun, Firing, Blown out), not just raw numbers.
- **Daily quote** — a beach/ocean quote, re-rolled on every visit.
- **Beach journal** — a calendar of every day the app has painted. Click a day to open it full-screen and swipe through that day's painting and your own photos, drag-and-drop style, with the calendar marking which days have art, which have photos, and which have both.

## Stack

- **Backend**: Laravel 13, Fortify (auth, 2FA, passkeys), MySQL
- **Frontend**: Inertia.js, React 19, TypeScript (strict), Tailwind v4, shadcn/Radix UI, Motion
- **Rendering**: HTML5 Canvas, `simplex-noise`, a hand-rolled mulberry32 PRNG
- **Data**: [Open-Meteo](https://open-meteo.com) marine and forecast APIs — free, no API key

## Getting started

```bash
composer install
npm install

cp .env.example .env
php artisan key:generate

# point DB_* in .env at a MySQL database, then:
php artisan migrate
php artisan storage:link

composer run dev
```

This starts the PHP server, queue listener, and Vite dev server together. Visit `/beach` (behind login) to see today's painting.

To manually (re)generate a day's painting from the CLI:

```bash
php artisan ocean:paint            # today
php artisan ocean:paint 2026-01-01 # a specific date, if it's within the forecast window
```

Re-running it for a day that's already been painted updates the row in place — it never duplicates.

## Why Benghazi

That's the beach. The coordinates are hardcoded on purpose — this isn't a general-purpose weather-art generator, it's a window onto one specific stretch of coastline.
