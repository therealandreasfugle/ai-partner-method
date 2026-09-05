# Reusing a template for a trade it was not built for

There are 20 templates. There are more than 20 trades. This is how you cover the
gap, and it takes about twenty minutes.

**A template is a skin, not a trade.** Underneath, every one of them is the same
site: hero, services, service areas, gallery, reviews, FAQ, contact, blog. The
only things that make one "plumbing" and another "landscaping" are the words, the
photos and the colours. Change those three and it is whatever trade you want.

---

## Pick by feel, not by name

Ignore the folder name. Pick the one whose **layout and mood** already suits the
business, then re-skin it.

| You are building for | Start from | Why |
|---|---|---|
| Electrician | `plumbing-services` | Same shape of business: emergency work, service areas, trust badges |
| Roofer, builder, plasterer, driveways | `landscaping-services` | Big photo-led layout, made for showing finished work |
| Heating, aircon, boiler | `hvac-management` | Already built around it |
| Cleaner, window cleaner, oven cleaner | `wellness-center` | Light, clean, service-list led |
| Garage, mobile mechanic, valeting | `auto-detailing` | Already built around it |
| Removals, skip hire, waste | `landscaping-services` | Job-photo led, area coverage |
| Pest control, locksmith, glazier | `plumbing-services` | Emergency and callout shaped |
| Physio, chiropractor, dentist, clinic | `dental-practice` or `med-spa` | Appointment shaped, softer |
| Cafe, takeaway, bar | `coffee-shop` | Already built around it |
| Salon, barber, nails, tattoo | `med-spa` | Appointment and gallery led |
| Estate or letting agent | `real-estate-agency` | Already built around it |
| Anything else with a van and a phone | `plumbing-services` | The safest default for a trade |

⚠️ Nine of the twenty are not local-business skins at all: `ai-consulting`,
`ai-email-platform`, `ai-ugc-creator`, `creative-portfolio`, `natural-skincare`,
`perfume-brand`, `personal-blogger`, `product-showcase`, `web-agency`. They are
good looking sites and you may want one for **your own** agency. Do not start a
plumber on one.

---

## What you actually change

Run `/build-site` and it does most of this from their onboarding answers. This is
what to check afterwards.

**1. The words.** Every mention of the original trade. Search the whole folder for
the template's trade name and the template's business name. Nothing should
survive.

**2. The photos.** This is the whole job. A landscaping skin with roofing photos
reads as a roofing site immediately. Use their own photos, and if they have none,
get them to walk round a finished job with their phone.

**3. The colours.** One line in their brand file. A trade with a van has a colour
already, use theirs.

**4. The services and areas.** From their form, exactly.

**5. The FAQ.** Real questions their customers ask. This is what makes them
quotable to an AI assistant, so it is worth ten minutes of thinking rather than
keeping the template's.

---

## The check that catches a bad reskin

Open the finished site and read it as if you were a customer of **that trade**.

- Does any sentence still sound like the trade it came from
- Do the photos match the work being sold
- Would a competitor in that trade think it looked like a template

⚠️ Search the built site for the template's own business name before you hand it
over. It is the single most common thing left behind, and it is usually in the
footer, an alt tag, or a blog post nobody read.
