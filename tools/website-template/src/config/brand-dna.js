/**
 * brand-dna.js, per-client config contract for the website template.
 *
 * Stage 10.1 (`tools/build-from-template.py`) generates this file fresh per
 * client by composing earlier-stage outputs (intake, research, copy-deck,
 * brand-dna.json from Stage 7, brand-resonance from Stage 7.5).
 *
 * Every field marked '__REQUIRED__' MUST be replaced by Stage 10.1. The build
 * validator fails closed if any sentinel survives in the per-client config.
 *
 * Reference values for the smoke test live at brand-dna.example.js.
 * Schema lives at brand-dna.schema.json.
 */

export const brandDNA = {
  meta: {
    title: "__REQUIRED__",
    description: "__REQUIRED__",
  },

  company: {
    name: "__REQUIRED__",
    shortName: "__REQUIRED__",
    tagline: "__REQUIRED__",
    url: "__REQUIRED__",
    licenseNumber: null,
    description: "__REQUIRED__",
    serviceRegion: "__REQUIRED__",
  },

  contact: {
    phone: "__REQUIRED__",
    phoneTelLink: "__REQUIRED__",
    email: "__REQUIRED__",
    googleMapsUrl: null,
    mapsEmbedUrl: null,
  },

  address: {
    street: "__REQUIRED__",
    city: "__REQUIRED__",
    state: "__REQUIRED__",
    zip: "__REQUIRED__",
    full: "__REQUIRED__",
    lat: null,
    lng: null,
  },

  hours: {
    weekday: { dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "07:00", closes: "17:00" },
    saturday: null,
    display: [],
    emergencyBadge: null,
  },

  social: {
    facebook: null,
    facebookReviews: null,
  },

  team: {
    founder: {
      name: "__REQUIRED__",
      displayName: "__REQUIRED__",
      title: "__REQUIRED__",
      yearsExp: "__REQUIRED__",
      expLabel: "__REQUIRED__",
    },
    founders: [],
  },

  // "light" | "dark", single mode, decided at Stage 7. Default light.
  theme_mode: "light",

  // "commercial" | "family" | "premium", copy tone hint
  voice_register: "family",

  // One of: polygon | triangle | wave | arc | dot-grid | hexagon | chevron |
  // diamond | cross-hatch | mountain | topographic
  shape_motif: "polygon",

  palette: {
    primary: "__REQUIRED__",
    primary_dark: "__REQUIRED__",
    primary_slate: "__REQUIRED__",
    accent: "__REQUIRED__",
    accent_light: "__REQUIRED__",
    accent_dark: "__REQUIRED__",
    neutral: "__REQUIRED__",
    neutral_dim: "__REQUIRED__",
    silver: "__REQUIRED__",
    ink: "__REQUIRED__",
  },

  typography: {
    heading: "__REQUIRED__",
    body: "__REQUIRED__",
    headingFontUrl: "__REQUIRED__",
    bodyFontUrl: "__REQUIRED__",
  },

  reviews: {
    rating: 5.0,
    googleCount: 0,
    facebookCount: 0,
    totalReviewCount: 0,
    googleLabel: "Google Reviews",
    facebookLabel: "Facebook Reviews",
    googleStat: "Google 5.0 ★ (0)",
    facebookStat: "Facebook 5.0 ★ (0)",
    items: [],
  },

  services: [],
  serviceAreas: [],
  trust_badges: [],
  previous_projects: [],
  team_members: [],

  // AI chat widget (see api/chat.mjs + CHATBOT-SETUP.md). On for every build;
  // needs one free API key env var on the site's Vercel project to answer.
  // greeting/teaser: null = sensible defaults. avatar: the photo on the teaser
  // message; defaults to /owner.webp, falls back to a brand-accent initial.
  chatbot: {
    enabled: true,
    assistantName: null,
    greeting: null,
    teaser: null,
    avatar: null,
  },

  // GA4: set the client's Measurement ID (G-XXXXXXXXXX) once their property
  // exists and every page tracks traffic, visitors, time on page, and country.
  analytics: {
    ga4MeasurementId: null,
  },

  copy: {
    hero: {
      eyebrow: "__REQUIRED__",
      headline: "__REQUIRED__",
      subheadline: "__REQUIRED__",
    },
    formHeader: "__REQUIRED__CTA_PRIMARY__",
    formSubtext: "__REQUIRED__FORM_HEADER__",
    buttonText: "__REQUIRED__CTA_PRIMARY__",
    submitButton: "SEND MY MESSAGE",
    trustClaims: [
      "__REQUIRED__TRUST_CLAIM_1__",
      "__REQUIRED__TRUST_CLAIM_2__",
      "__REQUIRED__TRUST_CLAIM_3__",
      "__REQUIRED__TRUST_CLAIM_4__",
    ],
    heroTrustChips: [],
    services: { label: "OUR SERVICES", heading: "__REQUIRED__", body: "__REQUIRED__" },
    reviews: { label: "REVIEWS", heading: "__REQUIRED__", body: "__REQUIRED__", summary: "__REQUIRED__" },
    founder: {
      label: "__REQUIRED__",
      heading: "__REQUIRED__",
      para1: "__REQUIRED__",
      para2: "__REQUIRED__",
      visionLabel: "VISION",
      vision: "__REQUIRED__",
      missionLabel: "MISSION",
      mission: "__REQUIRED__",
    },
    process: {
      label: "OUR PROCESS",
      heading: "__REQUIRED__",
      body: "__REQUIRED__",
      badgeText: "__REQUIRED__",
      badgeSubtext: "__REQUIRED__",
    },
    whyChoose: { label: "WHY CHOOSE US", heading: "__REQUIRED__", body: "__REQUIRED__" },
    offers: { label: "SPECIAL OFFERS", heading: "__REQUIRED__", body: "__REQUIRED__", detail: "__REQUIRED__" },
    blog: { label: "FROM THE BLOG", heading: "__REQUIRED__", body: "__REQUIRED__", featuredLabel: "FEATURED POST" },
    gallery: { label: "OUR WORK", heading: "__REQUIRED__", body: "__REQUIRED__" },
    serviceAreas: { label: "SERVICE AREAS", heading: "__REQUIRED__", body: "__REQUIRED__" },
    cta: { label: "GET STARTED TODAY", heading: "__REQUIRED__", body: "__REQUIRED__" },
    faq: { label: "GOT QUESTIONS?", heading: "FREQUENTLY ASKED QUESTIONS" },
    topBar: { cta: "Need help? Call us now!" },
    serviceAreaCard: { heading: "__REQUIRED__", body: "__REQUIRED__" },
    footerCta: "__REQUIRED__",
    privacyLine: "__REQUIRED__",
    copyright: "__REQUIRED__",
  },

  process_steps: [],
  why_choose_us: [],
  special_offers: [],
  faq: [],
  blog_posts: [],
  blog_categories: ["All"],

  pages: {
    contact: {
      heading: "CONTACT US",
      intro: "__REQUIRED__",
      formHeading: "SEND US A MESSAGE",
      formIntro: "__REQUIRED__",
      contactHeading: "CONTACT INFO",
    },
    blog: {
      label: "KNOWLEDGE & ADVICE",
      heading: "__REQUIRED__",
      intro: "__REQUIRED__",
    },
    about: {
      heroLabel: "ABOUT US",
      heroHeadline: "FAMILY-OWNED.\nOWNER-MANAGED.",
      storyLabel: "OUR STORY",
      storyHeading: "BUILT ON\nTRUST & CRAFT",
      storyClosing: "__REQUIRED__",
      stats: [],
      values: [],
      crewLabel: "OUR CREW",
      crewHeading: "MEET THE TEAM",
      crewBody: "__REQUIRED__",
      crewCaption: "__REQUIRED__",
      valuesLabel: "HOW WE OPERATE",
      valuesHeading: "THE VALUES WE WORK BY",
      valuesIntro: "__REQUIRED__",
      secondaryButton: "VIEW OUR WORK",
    },
    serviceAreas: {
      coverageHighlights: [],
      mapLabel: "OUR SERVICE AREA",
      mapHeading: "WHERE WE WORK",
      mapBody: "__REQUIRED__",
      citiesHeading: "Cities We Serve",
      citiesEmpty: "Call us to confirm if you're in our service area.",
      citiesFallback: "Don't see your city? Call us and we'll confirm.",
      readyLabel: "READY TO START",
      readyHeading: "IN YOUR AREA.\nREADY TO HELP.",
      readyBody: "__REQUIRED__",
    },
    locationDetail: {
      eyebrow: "__REQUIRED__",
      nearbyLabel: "NEARBY AREAS WE SERVE",
    },
    blogPost: {
      sidebarCtaHeading: "__REQUIRED__",
      sidebarCtaBody: "__REQUIRED__",
      sidebarCtaButton: "BOOK NOW",
      sidebarCallLabel: "CALL US DIRECT",
      sidebarCallNote: "",
      moreArticlesLabel: "MORE ARTICLES",
      backToListLabel: "Back to all articles",
    },
  },

  credit: {
    agency: "{{AGENCY_NAME}}",
    url: null,
  },
};
