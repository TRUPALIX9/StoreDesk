# StoreDesk brand kit

Canonical visual identity for **StoreDesk**, **StoreDesk Worker**, **StoreDesk Mobile**, **StoreDesk Web**, and **Cloud Hub** marketing/docs.

Product display names:

| Surface | Name shown to users |
|---------|---------------------|
| Desktop app | **StoreDesk** |
| Phone app (Play / launcher) | **StoreDesk** |
| Edge API (docs/ops) | **StoreDesk Worker** |
| Marketing + licenses | **StoreDesk Web** |
| WSS relay | **StoreDesk Cloud Hub** |

Do **not** use legacy names “Buddy” or “StoreDesk Server” in new copy.

## Canonical filenames

| File | Use |
|------|-----|
| `logo-mark.svg` / `logo-mark.jpg` | Hexagon + S mark (favicons, app icon source, compact headers) |
| `logo-lockup-horizontal.svg` / `.jpg` | Mark + StoreDesk wordmark (READMEs, splash, marketing) |
| `wordmark-horizontal.jpg` | Wordmark only |
| `app-icon.ico` | Desktop / Windows package icon |

Messy originals may remain for archival; prefer the names above in apps and docs.

Mobile submodule mirrors (for GitHub README rendering): `store-desk-mobile/docs/brand/`.

## Colors

| Token | Hex | Role |
|-------|-----|------|
| Primary / mark blue | `#1A63F4` | Primary actions, links, focus |
| Blue shadow | `#0E43D8` | Pressed / depth on blue |
| Secondary / mark green | `#00A87B` | Success, accents, secondary CTA |
| Mint | `#28C88B` | Highlights, soft success fills |
| Wordmark STORE | `#2361DA` | Lockup text (STORE) |
| Wordmark DESK | `#27AD83` | Lockup text (DESK) |
| Soft background | `#F4F6F8` | App scaffold / page wash |
| Ink | `#17202A` | Primary body text |
| Border | `#E1E6EC` | Cards / dividers |

Flutter / MUI / CSS should use these tokens — do not invent random blues/greens per screen.

## Usage rules

1. Prefer SVG in docs and web; JPG/ICO for legacy Windows packaging.
2. Keep clear space around the mark roughly equal to the hexagon corner radius.
3. On dark surfaces, use the mark on a white/light chip or invert carefully — do not recolor the mark arbitrarily.
4. In-app launcher label for the phone is **StoreDesk** (`android:label`); docs may say “StoreDesk Mobile” to distinguish the Flutter repo.
