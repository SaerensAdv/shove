---
version: alpha
name: Bofflebell
description: Een kermis in je zak. Tactiel pluche en vilt, warm lampjeslicht, de bel als signatuur. Speels en gezellig, nooit een casino.
colors:
  plum-950: "#1B0D18"
  plum-900: "#26121F"
  plum-800: "#341A2B"
  plum-700: "#4A2A3E"
  plum-500: "#7A5468"
  red-400: "#E5535D"
  red-500: "#C92F3B"
  red-600: "#AE2633"
  red-700: "#8E1C27"
  cream-50: "#FFF8EA"
  cream-100: "#F6EBD5"
  cream-300: "#D9C6A6"
  brass-300: "#F2CF73"
  brass-400: "#E2AE45"
  brass-600: "#A9741F"
  brass-800: "#6B4510"
  mint-300: "#A6DCC3"
  mint-500: "#5DB591"
  otter-600: "#7A4E32"
  background: "{colors.plum-950}"
  surface: "{colors.plum-900}"
  surface-raised: "{colors.plum-800}"
  on-surface: "{colors.cream-100}"
  on-surface-muted: "{colors.cream-300}"
  border: "{colors.plum-700}"
  border-trim: "{colors.brass-600}"
  primary: "{colors.red-500}"
  primary-hover: "{colors.red-600}"
  primary-pressed: "{colors.red-700}"
  on-primary: "{colors.cream-50}"
  reward: "{colors.brass-400}"
  reward-hover: "{colors.brass-300}"
  reward-pressed: "{colors.brass-600}"
  on-reward: "{colors.plum-950}"
  highlight: "{colors.brass-300}"
  paper: "{colors.cream-100}"
  on-paper: "{colors.plum-950}"
  on-paper-accent: "{colors.red-700}"
  success: "{colors.mint-300}"
  danger: "{colors.red-400}"
  disabled: "{colors.plum-500}"
  focus: "{colors.cream-50}"
typography:
  display-xl:
    fontFamily: Lilita One
    fontSize: 48px
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: 0.01em
  display-lg:
    fontFamily: Lilita One
    fontSize: 32px
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: 0.01em
  title-md:
    fontFamily: Lilita One
    fontSize: 22px
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: 0.02em
  number-hud:
    fontFamily: Lilita One
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: 0.02em
  label-md:
    fontFamily: Lilita One
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: 0.04em
  body-md:
    fontFamily: Nunito
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.4
  body-sm:
    fontFamily: Nunito
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.35
  caption:
    fontFamily: Nunito
    fontSize: 12px
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: 0.08em
rounded:
  sm: 10px
  md: 16px
  lg: 22px
  xl: 28px
  full: 9999px
spacing:
  1: 4px
  2: 8px
  3: 12px
  4: 16px
  6: 24px
  8: 32px
  12: 48px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 14px 28px
    height: 56px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-primary-pressed:
    backgroundColor: "{colors.primary-pressed}"
  button-primary-disabled:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.disabled}"
  button-reward:
    backgroundColor: "{colors.reward}"
    textColor: "{colors.on-reward}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 12px 24px
    height: 52px
  button-reward-hover:
    backgroundColor: "{colors.reward-hover}"
  button-reward-pressed:
    backgroundColor: "{colors.reward-pressed}"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 12px 24px
    height: 48px
  icon-button:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
    size: 48px
  hud-badge:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.number-hud}"
    rounded: "{rounded.full}"
    padding: 6px 14px 6px 6px
    height: 44px
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
    padding: 20px
  card-prize:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.on-paper}"
    rounded: "{rounded.lg}"
    padding: 12px 18px
  toast:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.on-paper}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 10px 16px
  tab:
    backgroundColor: "{colors.plum-950}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: 8px 14px
  tab-selected:
    backgroundColor: "{colors.reward}"
    textColor: "{colors.on-reward}"
---

# Bofflebell · design system v0.1 (draft)

Status: **draft, niet goedgekeurd.** Route: herwerk van de SHOVE v0.8-UI naar het merk uit DEC-112 (ClickUp, Decisions). Visuele check: de UI-kit (HTML) en screenshots op de ClickUp-taak "Keur het Bofflebell design system v0.1 goed". Tokens hier zijn normatief; `brand/tokens.css` is de CSS-laag voor de game.

## Overview

**Concept: een kermis in je zak.** Elk scherm is een kraam in Bofflebell. Alles lijkt gemaakt van dezelfde spullen als een echte kermisprijs: vilt, stiksels, koper en gloeilampjes. Boffle, een pluche otter-kermisroeper, is de gids. De bel is de signatuur: hij zit in het logo, gaat bij elke echte mijlpaal en sluit de intro af.

Principes:

1. **Tactiel boven glanzend.** Vilt, stiksel en borduursel in plaats van glas, chroom en neon. Glans enkel op munten, messing en lampjes.
2. **Eén ding gloeit.** Per scherm krijgt maar één element het warme licht: de volgende actie of de beloning. De rest blijft rustig.
3. **De bel betekent iets.** Het belgeluid en de belanimatie zijn voorbehouden aan echte mijlpalen (set compleet, kop-van-Jut-bel, level-up). Niet bij elke munt.
4. **Gezellig, geen gokhal.** Geen slotrollen, geen muntenregens als beloning, geen dollartekens, geen "JACKPOT"-geschreeuw in rood en goud. Zie DEC-101.
5. **Boffle spreekt, de UI zwijgt.** Uitleg komt uit Boffles tekstballon in korte zinnen, niet uit lange panelen.

## Colors

Drie lagen: primitives (`plum-*`, `red-*`, `cream-*`, `brass-*`, `mint-*`, `otter-*`) → rollen (`background`, `primary`, `reward`, ...) → componenten. Componenten gebruiken alleen rollen.

- **Pruim** is de nacht: achtergrond (`plum-950`), panelen (`plum-900`), badges en knoppen (`plum-800`), randen (`plum-700`).
- **Kermisrood** (`primary`) is de hoofdactie: DROP, PLAY, bevestigen. Maximaal één rode knop per scherm.
- **Messing/goud** (`reward`) is alles wat je verdient: munten, tickets, claimen. Ook de borduurrand (`border-trim`) van panelen.
- **Crème** is tekst op donker en het "papier" van prijskaartjes, toasts en Boffles tekstballon.
- **Mint** is succes en "nieuw". Spaarzaam.
- **Otterbruin** is enkel voor Boffle en pluche-illustraties, nooit voor UI.

Kraamthema's (Kermis, Night Market, Winter Fair) mogen de achtergrond van een kraam kleuren, maar de UI-rollen blijven gelijk.

### Contrast (WCAG 2.1, gemeten)

| Voorgrond | Achtergrond | Gebruik | Ratio | AA |
|---|---|---|---|---|
| cream-100 | plum-950 | body op achtergrond | 15.90 | pass |
| cream-100 | plum-900 | tekst op panel | 14.94 | pass |
| cream-100 | plum-800 | tekst op badge/knop | 13.37 | pass |
| cream-300 | plum-900 | muted tekst op panel | 10.58 | pass |
| cream-50 | red-500 | label primaire knop | 5.03 | pass |
| cream-50 | red-600 | label primaire knop hover | 6.36 | pass |
| cream-50 | red-700 | label primaire knop pressed | 8.47 | pass |
| plum-950 | brass-400 | label beloningsknop | 9.28 | pass |
| plum-950 | brass-300 | label beloningsknop hover, tab selected | 12.48 | pass |
| brass-300 | plum-900 | gouden cijfers en titels op panel | 11.73 | pass |
| plum-950 | cream-100 | tekst op prijskaart/toast | 15.90 | pass |
| red-700 | cream-100 | rode accenttekst op crème | 7.57 | pass |
| mint-300 | plum-900 | success-tekst | 11.48 | pass |
| red-400 | plum-900 | fouttekst op panel | 4.82 | pass |
| cream-50 | plum-950 | focusring (non-text, 3:1) | 17.78 | pass |
| brass-600 | plum-900 | borduurrand (non-text, 3:1) | 4.38 | pass |
| plum-500 | plum-900 | disabled label | 2.77 | uitgezonderd (disabled), nooit voor info |

**Niet doen:** `red-500` als tekst op crème (4.49, faalt net): gebruik `on-paper-accent` (`red-700`). `cream-50` op `red-400` (3.47) mag niet: `red-400` is enkel fouttekst op donker.

## Typography

- **Display en cijfers: Lilita One.** Rond, dik en vriendelijk, dicht bij de geschilderde kermisletters van het logo. Vervangt Bungee (te hoekig en "arcade" naast pluche).
- **Tekst en labels: Nunito** (600 tot 800). Ronde uitlopers passen bij vilt, goed leesbaar op klein formaat. Vervangt DM Sans.
- Het logo is artwork, geen font. Gebruik altijd het logobestand, nooit "BOFFLEBELL" in Lilita One als logo.

| Token | Mobiel | Tablet/desktop | Gebruik |
|---|---|---|---|
| display-xl | 40px | 48px | splash, set compleet |
| display-lg | 28px | 32px | paneltitels |
| title-md | 20px | 22px | kaarttitels, kraamnamen |
| number-hud | 22px | 24px | munten, tickets, scores |
| label-md | 17px | 18px | knoplabels (hoofdletters) |
| body-md | 16px | 16px | uitleg, Boffle-ballon |
| body-sm | 14px | 14px | metadata, kosten |
| caption | 12px | 12px | tags (NEW, LV), hoofdletters, tracking 0.08em |

Minimum 12px, en dat enkel voor korte tags in hoofdletters. Uitleg nooit onder 14px. Max. 38 tekens per regel in Boffles ballon, 60 in panelen. Lange woorden mogen afbreken met `hyphens: auto`; cijfers nooit afbreken.

## Layout

- Spacing op een 4px-grid: 4, 8, 12, 16, 24, 32, 48.
- Schermrand: 12px (mobiel portret), 8px (landscape met hoogte tot 520px). Altijd `env(safe-area-inset-*)` erbij.
- Tap targets minimaal 44×44px, primaire acties 52 tot 56px hoog.
- Mobiel portret is leidend (360 tot 430px breed). Landscape compact vanaf `max-height: 520px`. Tablet: panelen max. 420px breed, gecentreerd.
- HUD-zones: boven (munten, tickets, level), rechts (iconknoppen, verticaal), onder (power-ups en DROP). De machine in het midden blijft vrij.

## Elevation & Depth

Diepte komt van gestapeld vilt, niet van zwevende schaduw.

- `elev-felt`: `0 4px 0` in een donkere variant van de vlakkleur, plus `0 8px 18px rgba(10,4,8,.35)`. Voor knoppen, badges, kaarten.
- `elev-panel`: `0 18px 40px rgba(10,4,8,.55)`. Voor modals en sheets.
- Pressed: 3px omlaag en de onderrand bijna weg (de knop zakt in het vilt).
- Glow enkel op het ene `highlight`-element per scherm: `0 0 18px rgba(242,207,115,.55)`.

## Shapes

- Knoppen, badges, tabs: pill (`rounded.full`).
- Kaarten: `lg` 22px. Panelen en sheets: `xl` 28px. Kleine chips: `sm` 10px.
- **Stiksel** is het herkenningsdetail: een gestippelde lijn 5 tot 8px binnen de rand (`outline: 2px dashed`, 45% crème op donker, 35% pruim op crème). Op knoppen, panelen en kaarten. Niet op tekstvelden en niet op tabs.
- **Borduurrand**: panelen, badges en iconknoppen krijgen een 3px rand in `border-trim`.
- **Viltstructuur**: subtiele ruis (SVG feTurbulence, 9% wit) over vlakken.

## Components

Elk interactief component heeft: default, hover (enkel pointer), focus-visible, pressed en disabled. Loading alleen waar echt gewacht wordt (ad-placeholder, restore).

| Component | Default | Hover | Focus-visible | Pressed | Disabled | Loading |
|---|---|---|---|---|---|---|
| button-primary | rood vilt, stiksel, crème label | red-600 | ring cream-50 3px met 3px offset | red-700, 3px omlaag | plum-800 vlak, plum-500 label, geen stiksel | bel zwaait naast label |
| button-reward | messing, pruim label | brass-300 + glow | idem | brass-600 | idem disabled | n.v.t. |
| button-secondary | plum-800 met messing rand | rand brass-400 | idem | omlaag | randen plum-700, disabled-rollen | n.v.t. |
| icon-button | rond 48px, plum-800, icoon 22px | rand brass-400 | idem | omlaag | grijs icoon, rand plum-700 | n.v.t. |
| hud-badge | munt/ticket links, cijfer number-hud | n.v.t. | n.v.t. | n.v.t. | n.v.t. | cijfer telt op (bump) |
| tab | transparant, muted caption | on-surface | idem | n.v.t. | idem | n.v.t. |
| toggle | uit = plum-800, aan = mint-500 | rand | idem | n.v.t. | plum-900, knop plum-500 | n.v.t. |
| progress (XP, missie) | 10px pill, track plum-950, vulling brass-400 naar brass-300 | n.v.t. | n.v.t. | n.v.t. | n.v.t. | n.v.t. |
| card-prize | crème papier, rode bovenstrook (ticket), knuffel links | n.v.t. | n.v.t. | n.v.t. | n.v.t. | n.v.t. |
| booth-card | kraamkleur verloop, title-md, kost body-sm | rand brass-400 | idem | omlaag | locked: slot + "Reach LV 7", tekst blijft AA | n.v.t. |
| boffle-bubble | crème ballon met staart naar Boffle, body-md | n.v.t. | n.v.t. | n.v.t. | n.v.t. | n.v.t. |
| toast | crème, rode rand 3px | n.v.t. | n.v.t. | n.v.t. | n.v.t. | n.v.t. |
| panel/modal | plum-900, messing rand, stiksel, sluitknop 44px | n.v.t. | focus naar eerste knop | n.v.t. | n.v.t. | n.v.t. |
| empty state | Boffle + 1 zin + 1 knop | | | | | |

Locked- en empty-states tonen altijd wat je moet doen om verder te kunnen ("Reach LV 4", "Win your first plushie"), nooit enkel een slotje.

## Do's and Don'ts

- Doe: één rode actie per scherm. Doe: beloningen in messing. Doe: stiksel op knoppen en panelen.
- Doe: Boffle gebruiken voor uitleg en lege toestanden.
- Niet: neon, chroom, glas of harde zwarte schaduwen.
- Niet: gouden muntenregens, slotrollen, "JACKPOT", dollartekens of knipperende lampen als beloning.
- Niet: opacity gebruiken voor disabled (geeft onleesbare tekst), gebruik de disabled-rollen.
- Niet: hex-waarden in componenten. Niet: een tweede display-font.

## Motion

| Token | Waarde | Gebruik |
|---|---|---|
| dur-fast | 120ms | hover, pressed |
| dur-base | 200ms | toggles, tabs, toasts |
| dur-slow | 350ms | panelen in en uit |
| dur-bell | 600ms | belzwaai, kaart-in |
| ease-out | cubic-bezier(.2,.8,.2,1) | standaard |
| ease-bounce | cubic-bezier(.2,1.6,.4,1) | kaart-in, badge-bump, Boffle-sprong |
| ease-swing | cubic-bezier(.36,0,.66,1.4) | belzwaai (heen en terug, gedempt) |

- Pluche beweegt zacht: squash & stretch klein houden (max. 6%), niets veert hard.
- Idle: lampjes ademen traag (2.4s), Boffle knippert af en toe.
- `prefers-reduced-motion: reduce`: geen bounce, geen zwaai, geen camera-schudden; enkel fades tot 200ms. De intro wordt een stil logokader met de belklank.

## Iconography

- Fase 1 (nu): emoji blijven toegestaan in iconknoppen, altijd met `aria-label`.
- Fase 2: eigen iconenset in viltstijl (24px grid, 2px stiksel, gevulde vormen in rollen). Volgorde: kraam, kermisspellen, prijzenkast, album, taken, shop, instellingen.
- Munt: messing met ingeslagen bel (niet langer de ster of "S"). Ticket: rood met crème rand en tentje.

## Imagery

- **Mascotte:** Boffle volgens het brand board in DEC-112. Niet herontwerpen: bruin vilt, crème gezicht en buik, zwarte kraaloogjes, roze neus, rood-crème gestreept gilet, rode strik, koperen bel aan een lint.
- **Knuffels:** zelfde vilt- en stikselwereld als Boffle.
- **Kermis:** warme gloeilampjes, gestreepte tenten, reuzenrad in de verte, natte kasseien bij nacht.
- Gegenereerde beelden zijn sfeer en concept, nooit een "screenshot" in een store-listing zonder echte build.

## Accessibility

- Alle tekstparen hierboven halen AA. Focusring altijd zichtbaar (cream-50, 3px, offset 3px).
- Tap targets minimaal 44px. Geen informatie enkel via kleur: locked toont ook een icoon en tekst.
- Dialogs: `role="dialog"`, `aria-modal`, `aria-labelledby`, Escape sluit (bestaat al sinds PR5).
- Geluid is nooit de enige feedback: elke bel heeft ook een visuele puls. Haptics optioneel.
- Reduced motion zoals hierboven.

## Content & Claims

- UI-taal: Engels (internationaal), kort en warm, in Boffles stem: "Step right up!", "Ring the bell!", "Nice shove!".
- Geen kans- of winstbeloftes ("win big", "jackpot"). Het odds-scherm blijft bereikbaar.
- Geen verzonnen ratings, reviews of spelersaantallen in store- of marketingbeelden.

## Agent Rules

1. Gebruik alleen tokens uit dit bestand of `tokens.json`; geen nieuwe hex-waarden.
2. Componenten verwijzen naar rollen (`primary`, `surface`, ...), nooit naar primitives of hex.
3. Blijf op de spacingschaal (4, 8, 12, 16, 24, 32, 48) en de radiusschaal.
4. Maximaal één `button-primary` per scherm; beloningen zijn `button-reward`.
5. Display-tekst in Lilita One, alle overige tekst in Nunito. Geen andere fonts.
6. Elk interactief element heeft hover, focus-visible, pressed en disabled volgens de tabel.
7. Disabled nooit via opacity.
8. Respecteer `prefers-reduced-motion`.
9. Geen casino-signalen (zie Do's and Don'ts); bij twijfel: DEC-101.
10. Boffle niet herontwerpen; gebruik de referentie uit DEC-112.

## Implementatie

De game is vanilla HTML, CSS en JS (geen Tailwind). Laad `brand/tokens.css` en vervang de huidige `--red`, `--gold`, `--cream`, `--ink`, `--sky` en de losse hex-waarden in `index.html` (o.a. `#8A5A12`, `#3A2430`, `#24131C`, `#FF8A3D`) stap voor stap door rollen. `tokens.json` (W3C DTCG) is de machineleesbare bron.

| Route | Bronnen gebruikt | Gemaakt | Beslissingen genomen | Open voor Axel | Contrast | Volgende gate |
|---|---|---|---|---|---|---|
| Herwerk (SHOVE v0.8 naar Bofflebell) | DEC-112, brand board, mobiele mockup, intro-storyboard, `index.html` op `play` (54b8bbf) | DESIGN.md, tokens.json, brand/tokens.css, UI-kit (ClickUp) | rollen, contrast, stiksel, één rode actie, geen casino | fonts, munticoon, emoji of eigen iconen, kraamthema's | alle tekstparen AA, disabled uitgezonderd | goedkeuring Axel, daarna UI-pass in de build |
