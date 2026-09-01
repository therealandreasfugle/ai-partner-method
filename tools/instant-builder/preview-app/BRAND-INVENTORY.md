# Brand DNA Inventory (website template)

This file documents every visible brand value in the template — where it
lives in the JSX/HTML, and which `brandDNA` path replaces it at Stage 10.1.

The template is sentinel-driven. Every value below is either:
- a `__REQUIRED__*__` sentinel (Stage 10.1 fills it from client data)
- a placeholder rendered until brand-dna is composed

No real client data ships in this template. The inventory is a contract
between component code and the `brandDNA` schema, not a record of any
specific client.

## index.html

| Field | brandDNA path |
|---|---|
| `<title>` | `brandDNA.meta.title` |
| `<meta name="description">` | `brandDNA.meta.description` |
| ld+json `name` | `brandDNA.company.legalName` |
| ld+json `url` | `brandDNA.company.url` |
| ld+json `telephone` | `brandDNA.contact.phone` |
| ld+json `email` | `brandDNA.contact.email` |
| ld+json address | `brandDNA.address.{street, city, state, zip, country}` |
| ld+json hours | `brandDNA.hours.weekday`, `brandDNA.hours.saturday` |
| ld+json rating | `brandDNA.reviews.rating`, `brandDNA.reviews.totalReviewCount` |
| ld+json description | `brandDNA.company.description` |
| ld+json areaServed | `brandDNA.company.serviceRegion` |
| ld+json founder | `brandDNA.team.founders[]` |

## src/components/Hero.jsx

| Slot | brandDNA path |
|---|---|
| img alt | `brandDNA.copy.hero.imageAlt` |
| eyebrow copy | `brandDNA.copy.hero.eyebrow` |
| h1 headline | `brandDNA.copy.hero.headline` |
| subheadline | `brandDNA.copy.hero.subheadline` |
| google maps url | `brandDNA.contact.googleMapsUrl` |
| rating badge | `brandDNA.reviews.rating` |
| review count google | `brandDNA.reviews.googleCount` |
| review source label | `brandDNA.reviews.googleLabel` |
| facebook url | `brandDNA.social.facebook` |
| review count facebook | `brandDNA.reviews.facebookCount` |
| trust claims (4-item list) | `brandDNA.copy.trustClaims[]` |
| form header | `brandDNA.copy.formHeader` |
| form subtext | `brandDNA.copy.formSubtext` |
| service options dropdown | `brandDNA.services[]` |
| button text | `brandDNA.copy.buttonText` |

## src/components/Services.jsx

| Slot | brandDNA path |
|---|---|
| service labels | `brandDNA.services[]` (loop) |
| section img src | `brandDNA.copy.services.image` (from photo manifest) |
| logo src | `brandDNA.assets.logo` |
| section label | `brandDNA.copy.services.label` |
| section heading | `brandDNA.copy.services.heading` |
| section body | `brandDNA.copy.services.body` |

## src/components/Reviews.jsx

| Slot | brandDNA path |
|---|---|
| review author | `brandDNA.reviews.items[N].author` |
| review source | `brandDNA.reviews.items[N].source` |
| review text | `brandDNA.reviews.items[N].text` |
| section label | `brandDNA.copy.reviews.label` |
| section heading | `brandDNA.copy.reviews.heading` |
| section body | `brandDNA.copy.reviews.body` |
| summary text | `brandDNA.copy.reviews.summary` |
| google maps link | `brandDNA.contact.googleMapsUrl` |
| facebook reviews link | `brandDNA.social.facebookReviews` |

## src/components/Founder.jsx

| Slot | brandDNA path |
|---|---|
| accent label | `brandDNA.copy.founder.label` |
| heading | `brandDNA.copy.founder.heading` |
| body paragraphs | `brandDNA.copy.founder.body[]` |
| founder name | `brandDNA.team.founder.name` |
| founder title | `brandDNA.team.founder.title` |
| years exp | `brandDNA.team.founder.yearsExp` |
| portrait src | `brandDNA.assets.founderPortrait` |
| signature src | `brandDNA.assets.founderSignature` |

## src/components/WhyChooseUs.jsx

| Slot | brandDNA path |
|---|---|
| reason title | `brandDNA.why_choose_us[N].title` |
| reason body | `brandDNA.why_choose_us[N].body` |
| reason icon name | `brandDNA.why_choose_us[N].icon` |

## src/components/ServiceAreas.jsx

| Slot | brandDNA path |
|---|---|
| section label | `brandDNA.copy.serviceAreas.label` |
| section heading | `brandDNA.copy.serviceAreas.heading` |
| area entries | `brandDNA.serviceAreas[]` |

## src/components/OurProcess.jsx

| Slot | brandDNA path |
|---|---|
| step number | `brandDNA.process_steps[N].number` |
| step title | `brandDNA.process_steps[N].title` |
| step body | `brandDNA.process_steps[N].body` |
| step icon | `brandDNA.process_steps[N].icon` |

## src/components/SpecialOffers.jsx

| Slot | brandDNA path |
|---|---|
| offer label | `brandDNA.special_offers[N].label` |
| offer amount | `brandDNA.special_offers[N].amount` |
| offer detail | `brandDNA.special_offers[N].detail` |

## src/components/OurWork.jsx

| Slot | brandDNA path |
|---|---|
| project title | `brandDNA.previous_projects[N].title` |
| project subtitle | `brandDNA.previous_projects[N].subtitle` |
| project image | `brandDNA.previous_projects[N].image` |

## src/components/FAQ.jsx

| Slot | brandDNA path |
|---|---|
| question | `brandDNA.faq[N].q` |
| answer | `brandDNA.faq[N].a` |

## src/components/TrustStrip.jsx

| Slot | brandDNA path |
|---|---|
| trust claims | `brandDNA.copy.trustClaims[]` |

## src/components/Footer.jsx + TopBar.jsx + Navbar.jsx

| Slot | brandDNA path |
|---|---|
| company name | `brandDNA.company.name` |
| phone display | `brandDNA.contact.phone` |
| email display | `brandDNA.contact.email` |
| address display | `brandDNA.address.full` |
| social handles | `brandDNA.social.{facebook, instagram, ...}` |
| credit | `brandDNA.credit.agency` |

## src/components/MobileCtaBar.jsx

| Slot | brandDNA path |
|---|---|
| mobile call label | `brandDNA.copy.mobileCallLabel` |
| phone number | `brandDNA.contact.phone` |

## src/pages/*

Pages compose the components above. Page-specific copy comes from:
- `brandDNA.pages.{contact, gallery, blog, financing}.{heading, intro, ...}`

## Color tokens (CSS variables)

Defined in `src/index.css` `:root`:
- `--primary`, `--primary-dark`, `--primary-slate`
- `--accent`, `--accent-light`, `--accent-dark`
- `--neutral`, `--neutral-dim`, `--silver`, `--ink`

Mapped from `brandDNA.palette` via `scripts/inject-theme.mjs` at prebuild time.

## Typography tokens

- `--font-heading` from `brandDNA.typography.heading`
- `--font-body` from `brandDNA.typography.body`

Google Fonts URLs from `brandDNA.typography.{headingFontUrl, bodyFontUrl}`.

## Validation

The build halts at Stage 10.1 if any `__REQUIRED__` sentinel survives in the
generated `src/config/brand-dna.js`. The validator runs against
`src/config/brand-dna.schema.json` which is the source-of-truth contract.
