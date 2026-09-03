# Club de lo Roto — Project Brief

## What this is

A community repair event series starting in Miami, FL. People bring broken
things (electronics, furniture, bikes, clothing) to a free event and sit with
a volunteer "fixer" who diagnoses and repairs the item with them.

It is **independent** — deliberately NOT affiliated with the international
Repair Café Foundation, whose license would require the name "Repair Café",
their logo, and non-commercial operation. We want brand ownership and the
option to monetize later.

Currently a solo project (one founder, plus one furniture-designer friend
lined up as the first fixer). No venue booked, no events run yet.

## Current stage

Pre-launch. The immediate goal is a **volunteer recruitment funnel**:
build Instagram presence → make one test post → drive interested people to
a website form to sign up as fixers.

Rollout plan after that:
1. Recruit 4–6 fixers across 3+ categories
2. Private invite-only pilot (friends only, no production)
3. First public event embedded in an existing Miami market (Little River Flea,
   a Zero Waste Miami event, or a gallery/coffee shop patio)
4. Recurring monthly event + monetization (paid workshops, sponsors,
   corporate activations, vendor fees)

## Brand

- **Name:** Club de lo Roto (Spanish — "the club of broken things")
- **Voice:** Bilingual, Miami-flavored, warm but not precious. Site copy is
  currently in Spanish. Tagline: "Trae lo roto. Nos sentamos. Lo arreglamos."
- **Logo:** hand-lettered brush wordmark, black on gold, with gold drip/crack
  details running through the strokes (a kintsugi nod — broken things have
  value). Lives at `assets/logo.png`.
- **Colors (exact, pulled from the logo):**
  - Black `#000000` (site uses `#141210` for ink/borders)
  - Gold `#e5b415`
  - Warm cream `#fff6eb`
- **Instagram:** @clubdeloroto

## The website

Single static `index.html` + `assets/logo.png`. No build step, no framework,
no dependencies beyond Google Fonts (IBM Plex Mono).

### Design system

Modeled on the MotherDuck design system (neo-brutalist, technical-playful):
https://styles.refero.design/style/2bd7363d-7aae-4b1f-9d5a-1edeb17ca567

Non-negotiable rules carried over from that system:
- **2px border radius everywhere.** No pills, no rounded cards.
- **Hard offset shadows only:** `-6px 6px 0 0 <ink>`. Never blur, never
  ambient. Buttons translate `(-6px, 6px)` on hover to "press into" the shadow.
- **Monospace for everything** — IBM Plex Mono, weights 300–600.
  Letter-spacing `0.02em`. Headings are weight 300; labels/nav are 600.
- **Flat fills only.** No gradients anywhere, including text.
- **Layer white cards on the cream canvas.** Never cream-on-cream.
- Gold is the single filled-action color (CTAs). Rust `#b5482a` and
  sea green `#2b6f68` appear ONLY as illustration strokes, never as UI fills.
- Section gaps 56–76px. Max width 1180px.

### Sections currently built

nav (sticky) → hero (split: copy + framed logo, stat row) → gold scrolling
marquee → mission split (with SVG repair-bench illustration) → 5 station
cards (each with a hand-drawn SVG icon) → 3 numbered steps → manifesto quote
block → FAQ grid → volunteer form (dark section) → footer

All illustrations are hand-drawn inline SVG, not raster images. Keep them
that way unless replacing with real event photography later.

### The five repair stations

Electrónica · Muebles · Bicicletas · Ropa y textiles · General
(These are categories, not a sequence — don't imply order.)

## What still needs doing

1. **Wire up the form.** It currently validates inline and shows a success
   message but posts nowhere. Needs a Formspree endpoint (or Tally/Jotform)
   so signups actually land somewhere.
2. **Deploy.** Needs hosting so there's a real link for the Instagram bio —
   GitHub Pages, Netlify, or Vercel. Free tier is fine.
3. **Custom domain** (optional) — clubdeloroto.com or similar.
4. Possibly an English toggle, since Miami is bilingual and some fixers
   won't read Spanish.

## Constraints / preferences

- Keep it a single static file if possible. No React, no build pipeline,
  no CMS. This has to stay editable by hand.
- Direct feedback preferred over hedging. If something's a bad idea, say so.
- Deliverables over discussion — working code beats explanation.
