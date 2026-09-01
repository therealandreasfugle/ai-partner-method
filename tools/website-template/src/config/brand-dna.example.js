/**
 * brand-dna.example.js
 *
 * CANONICAL SHAPE CONTRACT. Every component in the website-template reads from
 * this object. Every per-client `brand-dna.js` must match this exact shape.
 * Stage 10.1's `tools/build-from-template.py` writes `src/config/brand-dna.js`
 * from pipeline data, and `tools/validate-brand-dna.mjs` (run by the prebuild
 * hook) walks every documented path and halts on missing fields or wrong types.
 *
 * Every string value below is either a `__REQUIRED__*__` sentinel (must be
 * filled before build) or `null` (truly optional). Arrays default to `[]` and
 * Module 2D / Stage 10.1 fill them from the niche playbook + client research.
 *
 * Two parallel paths exist for business hours:
 *   - `hours`         human-readable display + JSON-LD openingHoursSpecification
 *   - `businessHours` programmatic open/close detection via useAvailableNow hook
 *
 * Both must be present; they encode the same calendar in two different shapes
 * because the consumers need different views.
 *
 * Array-item shape contracts are documented inline below.
 */

export const brandDNA = {
  meta: {
    title: "__REQUIRED__META_TITLE__",
    description: "__REQUIRED__META_DESCRIPTION__",
  },

  company: {
    name: "__REQUIRED__COMPANY_NAME__",
    shortName: "__REQUIRED__COMPANY_SHORT_NAME__",
    tagline: "__REQUIRED__COMPANY_TAGLINE__",
    url: "__REQUIRED__COMPANY_URL__",
    licenseNumber: null,
    description: "__REQUIRED__COMPANY_DESCRIPTION__",
    serviceRegion: "__REQUIRED__SERVICE_REGION__",
  },

  contact: {
    phone: "__REQUIRED__PHONE__",
    phoneTelLink: "__REQUIRED__PHONE_TEL_LINK__",
    email: "__REQUIRED__EMAIL__",
    googleMapsUrl: null,
    mapsEmbedUrl: null,
  },

  address: {
    street: "__REQUIRED__STREET__",
    city: "__REQUIRED__CITY__",
    state: "__REQUIRED__STATE_CODE__",
    zip: "__REQUIRED__ZIP__",
    full: "__REQUIRED__ADDRESS_FULL__",
    // ISO 3166-1 alpha-2 (e.g. "US", "GB", "AU"). Null defaults to "US" in the
    // JSON-LD. Set it for non-US clients so the LocalBusiness schema is correct.
    country: null,
    lat: null,
    lng: null,
  },

  // Human-readable display blocks rendered by ContactPage + JSON-LD source.
  hours: {
    weekday: {
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "__REQUIRED__HOURS_OPEN__",
      closes: "__REQUIRED__HOURS_CLOSE__",
    },
    saturday: null,
    display: [
      { label: "Weekdays", value: "__REQUIRED__HOURS_WEEKDAYS__" },
    ],
    emergencyBadge: null,
  },

  // Programmatic open/close detection for the available-now indicator.
  // Read by useAvailableNow hook. Both `open` and `close` are 24-hour HH:MM.
  businessHours: {
    tz: "__REQUIRED__BUSINESS_HOURS_TZ__",
    open: "__REQUIRED__BUSINESS_HOURS_OPEN__",
    close: "__REQUIRED__BUSINESS_HOURS_CLOSE__",
  },

  social: {
    facebook: null,
    facebookReviews: null,
    instagram: null,
    linkedin: null,
    youtube: null,
  },

  team: {
    founder: {
      name: "__REQUIRED__FOUNDER_NAME__",
      displayName: "__REQUIRED__FOUNDER_DISPLAY_NAME__",
      title: "__REQUIRED__FOUNDER_TITLE__",
      yearsExp: "__REQUIRED__FOUNDER_YEARS_EXP__",
      expLabel: "__REQUIRED__FOUNDER_EXP_LABEL__",
    },
    founders: [],
  },

  // Optional team photo filename. Resolves to `/team/{filename}`. Set null to omit.
  team_group_photo: null,

  // Optional team-member tiles. Each entry: { filename, name, role }.
  // Filename is rendered at `/team/{filename}`.
  team_members: [],

  theme_mode: "light",
  voice_register: "__REQUIRED__VOICE_REGISTER__",

  shape_motif: "__REQUIRED__SHAPE_MOTIF__",

  // Per-section decorative corner overlay. Set null to disable section overlays.
  corner_overlay: {
    motif: "__REQUIRED__CORNER_OVERLAY_MOTIF__",
    color: "__REQUIRED__CORNER_OVERLAY_COLOR__",
    opacity: 0.08,
  },

  // ── Variance engine ──────────────────────────────────────────────────────
  // These three axes (plus palette, fonts, and photos) make two builds read
  // like different studios made them, WITHOUT breaking the conversion spine
  // (hero lead form, sticky call bar, trust, reviews, FAQ, schema all stay) or
  // the QA gates. inject-theme.mjs writes `blueprint` + `vibe` onto
  // <html data-blueprint=... data-vibe=...>. Section order per blueprint lives
  // in src/config/blueprints.js. Pick the combination that fits the niche and
  // the end customer; do not invent values outside the allowed sets.
  layout: {
    // Section ORDER + the hero it pairs with.
    //   trust-first     hero + form, trust and reviews up top. Urgent trades
    //                   (roofer, plumber, HVAC) where the buyer wants proof fast.
    //   showcase-first  work and services lead. Visual proof sells (auto, remodel,
    //                   landscaping, detailing).
    //   story-first     founder story leads. Personal / boutique local brands
    //                   (florist, salon, specialist clinic).
    blueprint: "trust-first",
    // Hero composition: split-form | full-bleed | editorial-split.
    hero: "split-form",
    // Feel (radius / card edge / button shape / eyebrow): signal | editorial | structural.
    vibe: "signal",
    // Optional per-section variant overrides. Omit a key to use the blueprint
    // default. Allowed: services = grid | bento | list ; reviews = cards | marquee.
    sections: {},
  },

  palette: {
    primary: "__REQUIRED__PALETTE_PRIMARY__",
    primary_dark: "__REQUIRED__PALETTE_PRIMARY_DARK__",
    primary_slate: "__REQUIRED__PALETTE_PRIMARY_SLATE__",
    accent: "__REQUIRED__PALETTE_ACCENT__",
    accent_light: "__REQUIRED__PALETTE_ACCENT_LIGHT__",
    accent_dark: "__REQUIRED__PALETTE_ACCENT_DARK__",
    neutral: "__REQUIRED__PALETTE_NEUTRAL__",
    neutral_dim: "__REQUIRED__PALETTE_NEUTRAL_DIM__",
    silver: "__REQUIRED__PALETTE_SILVER__",
    ink: "__REQUIRED__PALETTE_INK__",
  },

  typography: {
    heading: "__REQUIRED__TYPOGRAPHY_HEADING__",
    body: "__REQUIRED__TYPOGRAPHY_BODY__",
    headingFontUrl: "__REQUIRED__TYPOGRAPHY_HEADING_URL__",
    bodyFontUrl: "__REQUIRED__TYPOGRAPHY_BODY_URL__",
  },

  // Review aggregates + individual review cards.
  // items[] shape: { author?, name?, source, rating, text }
  //   - Use `author` (preferred) OR `name`; Reviews.jsx falls back through both.
  //   - `source` is a string label normalised by sourceLabel() (e.g. "google", "facebook").
  //   - `rating` is per-review (falls back to top-level `reviews.rating`).
  reviews: {
    rating: 0,
    googleCount: 0,
    facebookCount: 0,
    totalReviewCount: 0,
    googleLabel: "__REQUIRED__GOOGLE_LABEL__",
    facebookLabel: "__REQUIRED__FACEBOOK_LABEL__",
    googleStat: "__REQUIRED__GOOGLE_STAT__",
    facebookStat: "__REQUIRED__FACEBOOK_STAT__",
    items: [],
  },

  // services[] shape: { slug, name, iconPath?, body? }
  //   - `slug` (preferred) OR `name` for React keys.
  //   - `iconPath` is an inline SVG path string for the service-card icon.
  services: [],

  // serviceAreas[] shape: ARRAY OF STRINGS (city names).
  // Do NOT use objects like {name, slug} here; Footer.jsx and ServiceAreas.jsx
  // render each entry directly as a string. Use camelCase city names.
  serviceAreas: [],

  // trust_badges[] shape: { filename, alt }
  // Files resolve to `/badges/{filename}` (Stage 10.1 copies these into public/badges/).
  trust_badges: [],

  // press_logos[] shape: { filename, alt }
  // Optional. Rendered by TrustStrip when trust_badges is empty.
  press_logos: [],

  // previous_projects[] shape: { filename, alt, type?, caption?, category? }
  //   - Files resolve to `/work/{filename}`.
  //   - `type` may be "video" (then `src` plays as a video element).
  //   - `category` is optional; GalleryPage groups by it.
  previous_projects: [],

  copy: {
    hero: {
      eyebrow: "__REQUIRED__HERO_EYEBROW__",
      headline: "__REQUIRED__HERO_HEADLINE__",
      subheadline: "__REQUIRED__HERO_SUBHEADLINE__",
      imageAlt: "__REQUIRED__HERO_IMAGE_ALT__",
    },

    // ARRAYS OF STRINGS (not objects). Both Hero.jsx and TrustStrip.jsx
    // render each entry as bare text inside `{claim}`.
    heroTrustChips: [],
    trustClaims: [],

    // Universal locked phrases, all resolved from the niche playbook's
    // copy-locks.json (Module 2D writes them per niche).
    formHeader: "__REQUIRED__FORM_HEADER__",
    formSubtext: "__REQUIRED__FORM_SUBTEXT__",
    buttonText: "__REQUIRED__BUTTON_TEXT__",
    submitButton: "__REQUIRED__SUBMIT_BUTTON__",
    privacyLine: "__REQUIRED__PRIVACY_LINE__",
    mobileCallLabel: "__REQUIRED__MOBILE_CALL_LABEL__",
    availableNow: "__REQUIRED__AVAILABLE_NOW__",
    footerCta: "__REQUIRED__FOOTER_CTA__",
    copyright: "__REQUIRED__COPYRIGHT__",

    // Per-section label/heading/body bundles. Every section component reads
    // these for its section header. All three fields are required per section.
    topBar: {
      cta: "__REQUIRED__TOPBAR_CTA__",
    },
    blog: {
      label: "__REQUIRED__BLOG_LABEL__",
      heading: "__REQUIRED__BLOG_HEADING__",
      body: "__REQUIRED__BLOG_BODY__",
      featuredLabel: "__REQUIRED__BLOG_FEATURED_LABEL__",
    },
    cta: {
      label: "__REQUIRED__CTA_LABEL__",
      heading: "__REQUIRED__CTA_HEADING__",
      body: "__REQUIRED__CTA_BODY__",
    },
    faq: {
      label: "__REQUIRED__FAQ_LABEL__",
      heading: "__REQUIRED__FAQ_HEADING__",
    },
    founder: {
      label: "__REQUIRED__FOUNDER_LABEL__",
      heading: "__REQUIRED__FOUNDER_HEADING__",
      para1: "__REQUIRED__FOUNDER_PARA1__",
      para2: "__REQUIRED__FOUNDER_PARA2__",
      visionLabel: "__REQUIRED__FOUNDER_VISION_LABEL__",
      vision: "__REQUIRED__FOUNDER_VISION__",
      missionLabel: "__REQUIRED__FOUNDER_MISSION_LABEL__",
      mission: "__REQUIRED__FOUNDER_MISSION__",
    },
    gallery: {
      label: "__REQUIRED__GALLERY_LABEL__",
      heading: "__REQUIRED__GALLERY_HEADING__",
      body: "__REQUIRED__GALLERY_BODY__",
    },
    offers: {
      label: "__REQUIRED__OFFERS_LABEL__",
      heading: "__REQUIRED__OFFERS_HEADING__",
      body: "__REQUIRED__OFFERS_BODY__",
      detail: "__REQUIRED__OFFERS_DETAIL__",
    },
    process: {
      label: "__REQUIRED__PROCESS_LABEL__",
      heading: "__REQUIRED__PROCESS_HEADING__",
      body: "__REQUIRED__PROCESS_BODY__",
      badgeText: "__REQUIRED__PROCESS_BADGE_TEXT__",
      badgeSubtext: "__REQUIRED__PROCESS_BADGE_SUBTEXT__",
    },
    reviews: {
      label: "__REQUIRED__REVIEWS_LABEL__",
      heading: "__REQUIRED__REVIEWS_HEADING__",
      body: "__REQUIRED__REVIEWS_BODY__",
      summary: "__REQUIRED__REVIEWS_SUMMARY__",
    },
    serviceAreaCard: {
      heading: "__REQUIRED__SERVICEAREACARD_HEADING__",
      body: "__REQUIRED__SERVICEAREACARD_BODY__",
    },
    serviceAreas: {
      label: "__REQUIRED__SERVICEAREAS_LABEL__",
      heading: "__REQUIRED__SERVICEAREAS_HEADING__",
      body: "__REQUIRED__SERVICEAREAS_BODY__",
    },
    services: {
      label: "__REQUIRED__SERVICES_LABEL__",
      heading: "__REQUIRED__SERVICES_HEADING__",
      body: "__REQUIRED__SERVICES_BODY__",
    },
    whyChoose: {
      label: "__REQUIRED__WHYCHOOSE_LABEL__",
      heading: "__REQUIRED__WHYCHOOSE_HEADING__",
      body: "__REQUIRED__WHYCHOOSE_BODY__",
    },
  },

  // process_steps[] shape: { n, title, body }
  //   - `n` is a small integer (1, 2, 3, ...) rendered as the step number.
  //   - Step count + content come from the niche playbook's process.json.
  process_steps: [],

  // why_choose_us[] shape: ARRAY OF STRINGS (titles only).
  // WhyChooseUs.jsx maps each entry as `{title}` in a bullet row.
  why_choose_us: [],

  // special_offers[] shape: { label, description }
  //   - SpecialOffers.jsx renders zero/one/two/three+ layouts based on length.
  //   - `description` falls back to `copy.offers.body` if missing.
  special_offers: [],

  // faq[] shape: { q, a }
  faq: [],

  // blog_posts[] shape:
  //   { slug, cover, title, date, category, excerpt, readTime,
  //     content?: [{ type: 'p' | 'h2' | 'list', text? | items? }],
  //     body?: markdown-string }
  // content[] is the structured render path; body is the markdown fallback.
  blog_posts: [],
  blog_categories: [],

  // location_pages[] shape: { slug, city, state, ... } — Stage 10.1 fills.
  // Set to [] when the niche doesn't ship per-city sub-pages.
  location_pages: [],

  pages: {
    about: {
      heroLabel: "__REQUIRED__ABOUT_HERO_LABEL__",
      heroHeadline: "__REQUIRED__ABOUT_HERO_HEADLINE__",
      storyLabel: "__REQUIRED__ABOUT_STORY_LABEL__",
      storyHeading: "__REQUIRED__ABOUT_STORY_HEADING__",
      storyClosing: "__REQUIRED__ABOUT_STORY_CLOSING__",
      // stats[] shape: { value, label }
      stats: [],
      // values[] shape: { title, text, iconPath? }
      values: [],
      crewLabel: "__REQUIRED__ABOUT_CREW_LABEL__",
      crewHeading: "__REQUIRED__ABOUT_CREW_HEADING__",
      crewBody: "__REQUIRED__ABOUT_CREW_BODY__",
      crewCaption: "__REQUIRED__ABOUT_CREW_CAPTION__",
      valuesLabel: "__REQUIRED__ABOUT_VALUES_LABEL__",
      valuesHeading: "__REQUIRED__ABOUT_VALUES_HEADING__",
      valuesIntro: "__REQUIRED__ABOUT_VALUES_INTRO__",
      secondaryButton: "__REQUIRED__ABOUT_SECONDARY_BUTTON__",
    },
    serviceAreas: {
      // coverageHighlights[] shape: { title, body }
      coverageHighlights: [],
      mapLabel: "__REQUIRED__SA_MAP_LABEL__",
      mapHeading: "__REQUIRED__SA_MAP_HEADING__",
      mapBody: "__REQUIRED__SA_MAP_BODY__",
      citiesHeading: "__REQUIRED__SA_CITIES_HEADING__",
      citiesEmpty: "__REQUIRED__SA_CITIES_EMPTY__",
      citiesFallback: "__REQUIRED__SA_CITIES_FALLBACK__",
      readyLabel: "__REQUIRED__SA_READY_LABEL__",
      readyHeading: "__REQUIRED__SA_READY_HEADING__",
      readyBody: "__REQUIRED__SA_READY_BODY__",
    },
    locationDetail: {
      eyebrow: "__REQUIRED__LD_EYEBROW__",
      nearbyLabel: "__REQUIRED__LD_NEARBY_LABEL__",
    },
    blogPost: {
      sidebarCtaHeading: "__REQUIRED__BP_SIDEBAR_HEADING__",
      sidebarCtaBody: "__REQUIRED__BP_SIDEBAR_BODY__",
      sidebarCtaButton: "__REQUIRED__BP_SIDEBAR_BUTTON__",
      sidebarCallLabel: "__REQUIRED__BP_SIDEBAR_CALL_LABEL__",
      sidebarCallNote: "__REQUIRED__BP_SIDEBAR_CALL_NOTE__",
      moreArticlesLabel: "__REQUIRED__BP_MORE_LABEL__",
      backToListLabel: "__REQUIRED__BP_BACK_LABEL__",
    },
    blog: {
      label: "__REQUIRED__BLOG_PAGE_LABEL__",
      heading: "__REQUIRED__BLOG_PAGE_HEADING__",
      intro: "__REQUIRED__BLOG_PAGE_INTRO__",
    },
    contact: {
      heading: "__REQUIRED__CONTACT_HEADING__",
      intro: "__REQUIRED__CONTACT_INTRO__",
      formHeading: "__REQUIRED__CONTACT_FORM_HEADING__",
      formIntro: "__REQUIRED__CONTACT_FORM_INTRO__",
      contactHeading: "__REQUIRED__CONTACT_CONTACT_HEADING__",
    },
    services: {
      label: "__REQUIRED__SERVICES_PAGE_LABEL__",
      heading: "__REQUIRED__SERVICES_PAGE_HEADING__",
      intro: "__REQUIRED__SERVICES_PAGE_INTRO__",
      // list[] shape: { slug, title, subtitle, body, features: [], image, imgAlt }
      list: [],
    },
    financing: {
      label: "__REQUIRED__FINANCING_LABEL__",
      heading: "__REQUIRED__FINANCING_HEADING__",
      intro: "__REQUIRED__FINANCING_INTRO__",
      processLabel: "__REQUIRED__FINANCING_PROCESS_LABEL__",
      processHeading: "__REQUIRED__FINANCING_PROCESS_HEADING__",
      processIntro: "__REQUIRED__FINANCING_PROCESS_INTRO__",
      // steps[] shape: { num, title, desc }
      steps: [],
      optionsLabel: "__REQUIRED__FINANCING_OPTIONS_LABEL__",
      optionsHeading: "__REQUIRED__FINANCING_OPTIONS_HEADING__",
      optionsIntro: "__REQUIRED__FINANCING_OPTIONS_INTRO__",
      // options[] shape: { name, headline, details, tag, highlight }
      options: [],
      calloutTitle: "__REQUIRED__FINANCING_CALLOUT_TITLE__",
      calloutBody: "__REQUIRED__FINANCING_CALLOUT_BODY__",
      faqLabel: "__REQUIRED__FINANCING_FAQ_LABEL__",
      faqHeading: "__REQUIRED__FINANCING_FAQ_HEADING__",
      // faq[] shape: { q, a }
      faq: [],
      ctaFootnote: "__REQUIRED__FINANCING_CTA_FOOTNOTE__",
    },
  },

  credit: {
    agency: "__REQUIRED__AGENCY_NAME__",
    url: null,
  },
};

export default brandDNA;
