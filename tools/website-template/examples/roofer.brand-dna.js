/**
 * brand-dna.js, Copperline Roofing & Exteriors (reference demo build)
 * Authored to the canonical brand-dna.example.js shape (mirrors the validated
 * Summit Roofing shape). Dark graphite + weathered-copper, Denver Colorado,
 * storm/hail + insurance-claim positioning, premium craft voice.
 */

export const brandDNA = {
  meta: {
    title: "Copperline Roofing & Exteriors | Roofing & Storm Repair in Denver, CO",
    description:
      "Denver's owner-led roofing crew. Free inspections, insurance claims handled start to finish, and roofs built to take a Colorado hail season. Call Copperline.",
  },

  company: {
    name: "Copperline Roofing & Exteriors",
    shortName: "Copperline",
    tagline: "Roofs built for Colorado weather.",
    url: "https://copperlineroofing.com",
    licenseNumber: "CO-2009-RF-4471",
    description:
      "Copperline Roofing & Exteriors is an owner-led roofing company serving Denver and the Front Range. We handle full roof replacements, hail and storm restoration, repairs, and exterior work for homeowners who want it done once and done right.",
    serviceRegion: "Denver and the Colorado Front Range",
  },

  contact: {
    phone: "(720) 555-0148",
    phoneTelLink: "7205550148",
    email: "office@copperlineroofing.com",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Copperline+Roofing+Denver",
    mapsEmbedUrl: null,
  },

  address: {
    street: "2241 South Broadway",
    city: "Denver",
    state: "CO",
    zip: "80210",
    full: "2241 South Broadway, Denver, CO 80210",
    lat: null,
    lng: null,
  },

  hours: {
    weekday: {
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "7:00 AM",
      closes: "6:00 PM",
    },
    saturday: { opens: "8:00 AM", closes: "2:00 PM" },
    display: [
      { label: "Mon to Fri", value: "7:00 AM to 6:00 PM" },
      { label: "Saturday", value: "8:00 AM to 2:00 PM" },
    ],
    emergencyBadge: "24/7 storm tarp response",
  },

  businessHours: { tz: "America/Denver", open: "07:00", close: "18:00" },

  social: {
    facebook: "https://facebook.com/copperlineroofing",
    facebookReviews: "https://facebook.com/copperlineroofing/reviews",
    instagram: "https://instagram.com/copperlineroofing",
    linkedin: null,
    youtube: null,
  },

  team: {
    founder: {
      name: "Marcus Hale",
      displayName: "Marcus",
      title: "Owner and Master Estimator",
      yearsExp: "16",
      expLabel: "years on Colorado roofs",
    },
    founders: [],
  },

  team_group_photo: null,
  team_members: [],

  theme_mode: "dark",
  layout: {
    blueprint: "trust-first",
    hero: "split-form",
    vibe: "signal",
    sections: {},
  },
  voice_register: "premium",
  jsonLdType: "RoofingContractor",

  shape_motif: "mountain",

  corner_overlay: { motif: "mountain", color: "#BC6A3A", opacity: 0.08 },

  palette: {
    primary: "#181B21",
    primary_dark: "#0E1014",
    primary_slate: "#23272F",
    accent: "#BC6A3A",
    accent_light: "#D98C5A",
    accent_dark: "#8E4E27",
    neutral: "#A6AEB9",
    neutral_dim: "#6C7480",
    silver: "#C3C8D0",
    ink: "#0E1014",
  },

  typography: {
    heading: "Archivo",
    body: "Hanken Grotesk",
    headingFontUrl:
      "https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800;900&display=swap",
    bodyFontUrl:
      "https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&display=swap",
  },

  reviews: {
    rating: 4.9,
    googleCount: 184,
    facebookCount: 73,
    totalReviewCount: 257,
    googleLabel: "Google Reviews",
    facebookLabel: "Facebook Recommendations",
    googleStat: "4.9 stars on Google",
    facebookStat: "Recommended by 73 neighbors",
    items: [
      {
        author: "Hannah M.",
        source: "google",
        rating: 5,
        text: "The May hail storm wrecked our roof. Marcus was on it the next morning, met our adjuster on the roof, and documented damage the insurer would have missed. Full replacement, and we paid our deductible and nothing more.",
      },
      {
        author: "Derek S.",
        source: "google",
        rating: 5,
        text: "Got four quotes. Copperline was the only crew that actually got up on the roof instead of guessing from the driveway. Clean work, done in two days, every nail swept out of the yard.",
      },
      {
        author: "Priscilla A.",
        source: "facebook",
        rating: 5,
        text: "Honest people. They told me I had a few good years left instead of selling me a new roof. When the next storm finally got me, there was no question who I was calling.",
      },
      {
        author: "Tony R.",
        source: "google",
        rating: 5,
        text: "The insurance side was a maze until Copperline stepped in and dealt with the adjuster directly. They knew exactly what to file. Saved us thousands and a month of headaches.",
      },
    ],
  },

  services: [
    {
      slug: "roof-replacement",
      name: "Roof Replacement",
      body: "Full tear-off and replacement with impact-rated architectural shingles built for Front Range hail. One crew, start to finish.",
    },
    {
      slug: "storm-hail-restoration",
      name: "Storm & Hail Restoration",
      body: "Fast after the storm. We tarp, document every bit of damage for your insurer, and restore your roof to better than it was.",
    },
    {
      slug: "roof-repair",
      name: "Roof Repair",
      body: "Leaks, missing shingles, failed flashing. We trace the leak to its real source and fix the cause, not the stain.",
    },
    {
      slug: "inspections-maintenance",
      name: "Inspections & Maintenance",
      body: "Free, photo-documented inspections and maintenance that adds years to the roof you already have.",
    },
  ],

  serviceAreas: [
    "Denver",
    "Aurora",
    "Lakewood",
    "Littleton",
    "Centennial",
    "Highlands Ranch",
    "Arvada",
    "Parker",
  ],

  trust_badges: [],
  press_logos: [
    { label: "GAF Master Elite" },
    { label: "Owens Corning Preferred" },
    { label: "HAAG Certified Inspector" },
    { label: "BBB A+ Accredited" },
    { label: "Licensed & Insured in Colorado" },
  ],

  previous_projects: [
    { filename: "project-1.webp", alt: "New charcoal architectural shingle roof on a Denver craftsman home", category: "Replacement" },
    { filename: "project-2.webp", alt: "Hail-damaged roof restored after a Front Range storm", category: "Storm" },
    { filename: "project-3.webp", alt: "Bronze standing seam metal roof on a Colorado mountain home", category: "Metal" },
    { filename: "project-4.webp", alt: "Crew installing new underlayment and flashing on a steep roof", category: "Replacement" },
  ],

  copy: {
    hero: {
      eyebrow: "Denver & the Colorado Front Range",
      headline: "A roof built to take a Colorado hail season.",
      subheadline:
        "Owner-led crews, insurance claims handled for you, and a job site left spotless. Get a free inspection from a roofer who actually climbs up there.",
      imageAlt: "Copperline Roofing finishing a new roof on a Denver home under dramatic Front Range light",
    },

    heroTrustChips: ["Licensed & insured", "Free roof inspections", "4.9 stars, 257 reviews"],
    trustClaims: [
      "Owner on every job",
      "Insurance claims handled",
      "Every nail swept up",
      "Lifetime workmanship warranty",
    ],

    formHeader: "Get your free roof inspection",
    formSubtext: "Tell us what is going on up there. We call back within the hour.",
    buttonText: "Get my free inspection",
    submitButton: "Send it to Copperline",
    privacyLine: "No spam, no pressure. We only use your details to call you back about your roof.",
    mobileCallLabel: "Call Copperline",
    availableNow: "We are open now",
    footerCta: "Ready for a roof you can stop worrying about?",
    copyright: "Copperline Roofing & Exteriors",

    topBar: { cta: "Free Inspection" },
    blog: {
      label: "Roofing Notes",
      heading: "Straight talk from the roof",
      body: "No fluff. Just what Denver homeowners actually need to know before the next storm.",
      featuredLabel: "Featured",
    },
    cta: {
      label: "Let's talk",
      heading: "Get a roof you can stop thinking about.",
      body: "Book a free inspection today. We will tell you the truth about your roof, even if the truth is that you do not need us yet.",
    },
    faq: { label: "Questions", heading: "The things Denver homeowners ask us most" },
    founder: {
      label: "Who you're hiring",
      heading: "Meet Marcus, the owner who climbs the roof himself.",
      para1:
        "Marcus Hale started Copperline after sixteen years of watching homeowners get burned by storm chasers who blow into Denver after a hail event, slap on a roof, and vanish before the first leak. He built Copperline to be the opposite: local, accountable, and on the roof himself for every estimate.",
      para2:
        "That means when you call Copperline, you are talking to the person whose name is on the truck. No call center, no pressure script, no surprise line items. Just an honest read on your roof and a crew that treats your home like their own.",
      visionLabel: "What we're after",
      vision: "To be the roofer Denver recommends without thinking twice.",
      missionLabel: "How we get there",
      mission: "One honest job at a time, with the owner on every roof.",
    },
    gallery: {
      label: "Our Work",
      heading: "Roofs we are proud to put our name on",
      body: "A few recent jobs around Denver and the Front Range.",
    },
    offers: {
      label: "This month",
      heading: "Free drone roof inspection",
      body: "Book this month and we include a full drone inspection with photos, no charge and no obligation.",
      detail: "Offer good through the end of the month for Front Range homeowners.",
    },
    process: {
      label: "How it works",
      heading: "Simple, honest, no surprises",
      body: "Four steps from first call to a finished roof you can forget about.",
      badgeText: "Most roofs",
      badgeSubtext: "done in 1 to 2 days",
    },
    reviews: {
      label: "Reviews",
      heading: "Denver talks, we listen",
      body: "257 reviews and counting. Here is what your neighbors say.",
      summary: "4.9 out of 5 across Google and Facebook",
    },
    serviceAreaCard: {
      heading: "Proudly local to the Front Range",
      body: "If you can see the Rockies from your roof, we cover you.",
    },
    serviceAreas: {
      label: "Where we work",
      heading: "Roofing across the Denver metro",
      body: "Denver is home base, but we cover the whole Front Range.",
    },
    services: {
      label: "What we do",
      heading: "Roofing done right the first time",
      body: "Replacement, hail restoration, repairs, and honest maintenance.",
    },
    whyChoose: {
      label: "Why Copperline",
      heading: "The roofer your neighbor told you about",
      body: "Owner-led, locally accountable, and genuinely good at the work.",
    },
  },

  process_steps: [
    { n: 1, title: "Free inspection", body: "We climb up, take photos, and give you an honest read on your roof. No charge, no pressure." },
    { n: 2, title: "Clear estimate", body: "One number in plain English, with no surprise line items later. If it is an insurance job, we handle the adjuster." },
    { n: 3, title: "We build it", body: "One crew, start to finish, usually in one to two days. We protect your yard and sweep every nail." },
    { n: 4, title: "Final walk", body: "We walk the finished roof with you, hand over the warranty paperwork, and leave the site spotless." },
  ],

  why_choose_us: [
    "The owner is on every single estimate",
    "We handle the insurance adjuster for you",
    "Lifetime workmanship warranty in writing",
    "We sweep up every nail, every time",
  ],

  special_offers: [
    { label: "Free drone inspection", description: "Full photo inspection this month at no cost and no obligation." },
    { label: "Storm response", description: "Same-day tarping when the weather turns. Call and we move." },
  ],

  faq: [
    { q: "How much does a new roof cost in Denver?", a: "Most Front Range homes land between $11,000 and $22,000 depending on size, pitch, and material. We give you one honest number after we actually look, never a guess from the driveway." },
    { q: "Do you handle hail insurance claims?", a: "Yes, this is most of what we do. We meet your adjuster on the roof, document the damage the right way, and make sure the scope reflects what the storm actually did. Most of our storm jobs are insurance-covered." },
    { q: "How long does a roof replacement take?", a: "Most homes are a one to two day job. We tear off, dry it in, and finish without leaving your roof exposed overnight." },
    { q: "Are you licensed and insured?", a: "Fully. Colorado registration CO-2009-RF-4471, general liability, and workers comp. We hand you the certificates before we start." },
    { q: "What if I do not actually need a new roof?", a: "Then we tell you. Plenty of our inspections end with us saying your roof has good years left. We would rather earn the job later than sell you something you do not need." },
  ],

  blog_posts: [
    {
      slug: "5-signs-your-denver-roof-is-failing",
      cover: "blog-cover-1.webp",
      title: "5 signs your Denver roof is quietly failing",
      date: "2026-05-12",
      category: "Maintenance",
      excerpt: "Most roof failures give you warning signs months before the leak. Here is what to watch for from the ground.",
      readTime: "4 min read",
      body: "Curling shingles, granules in the gutter, daylight in the attic, sagging lines, and water stains on the ceiling are the five most common early warnings. Catch them early and a repair saves you a replacement.",
    },
    {
      slug: "what-to-do-after-a-hail-storm",
      cover: "blog-cover-2.webp",
      title: "What to do in the first 48 hours after a hail storm",
      date: "2026-04-22",
      category: "Storm",
      excerpt: "The steps you take right after a Front Range storm decide whether your insurance claim gets approved. Move fast and document everything.",
      readTime: "5 min read",
      body: "Photograph everything, call a local roofer for a documented inspection before you call the insurer, and never sign with a storm chaser working door to door. Local and accountable beats fast and gone every time.",
    },
  ],
  blog_categories: ["Maintenance", "Storm", "Insurance"],

  location_pages: [],

  pages: {
    about: {
      heroLabel: "About Copperline Roofing",
      heroHeadline: "The roofer Denver keeps recommending.",
      storyLabel: "Our story",
      storyHeading: "Built on roofs, not sales scripts",
      storyClosing: "Sixteen years later, the name on the truck is still the name on every estimate.",
      stats: [
        { value: "16", label: "Years on Colorado roofs" },
        { value: "2,100+", label: "Roofs completed" },
        { value: "4.9", label: "Average review rating" },
        { value: "100%", label: "Owner-inspected jobs" },
      ],
      values: [
        { title: "Honesty first", text: "We tell you the truth about your roof, even when it costs us the job today." },
        { title: "Owner accountable", text: "Marcus is on every estimate. The buck stops with the name on the truck." },
        { title: "Clean job sites", text: "We protect your landscaping and magnet-sweep every nail before we leave." },
      ],
      crewLabel: "The crew",
      crewHeading: "Local people on local roofs",
      crewBody: "No subcontracted storm crews. The people who quote your roof are the people who build it.",
      crewCaption: "The Copperline crew in Denver",
      valuesLabel: "What we stand for",
      valuesHeading: "The standards we will not bend",
      valuesIntro: "Three things every Copperline job lives by.",
      secondaryButton: "See our work",
    },
    serviceAreas: {
      coverageHighlights: [
        { title: "Denver core", body: "Same-day inspections across Denver, Wash Park, and the central neighborhoods." },
        { title: "The suburbs", body: "Aurora, Lakewood, Arvada, and the metro where hail hits hardest." },
        { title: "South metro", body: "Littleton, Centennial, Highlands Ranch, and Parker, six days a week." },
      ],
      mapLabel: "Coverage",
      mapHeading: "Where Copperline works",
      mapBody: "Home base in Denver, covering the greater Front Range region.",
      citiesHeading: "Towns we serve",
      citiesEmpty: "Do not see your town? Call us, we probably cover it.",
      citiesFallback: "Serving the greater Denver metro.",
      readyLabel: "Ready when you are",
      readyHeading: "Need a roofer in your town?",
      readyBody: "Tell us where you are and we will be on your roof this week.",
    },
    locationDetail: {
      eyebrow: "Roofing in",
      nearbyLabel: "Nearby towns we also cover",
    },
    blogPost: {
      sidebarCtaHeading: "Worried about your roof?",
      sidebarCtaBody: "Get a free, no-pressure inspection from the owner himself.",
      sidebarCtaButton: "Book my inspection",
      sidebarCallLabel: "Or call us",
      sidebarCallNote: "We answer the phone, usually on the first ring.",
      moreArticlesLabel: "More from the blog",
      backToListLabel: "Back to all articles",
    },
    blog: {
      label: "Roofing Notes",
      heading: "Straight talk from the roof",
      intro: "Practical, no-nonsense roofing advice for Denver homeowners.",
    },
    contact: {
      heading: "Let's talk about your roof",
      intro: "Call, or send the form. The owner reads every message and we call back within the hour during business hours.",
      formHeading: "Get your free inspection",
      formIntro: "Tell us what is going on up there.",
      contactHeading: "Reach Copperline Roofing",
    },
    services: {
      label: "Our services",
      heading: "Everything your roof needs, from one local crew",
      intro: "Replacement, hail restoration, repairs, and honest maintenance, all owner-led.",
      list: [
        { slug: "roof-replacement", title: "Roof Replacement", subtitle: "Built to take the next hail season", body: "Full tear-off and replacement with impact-rated architectural shingles built for the Front Range. One crew, one to two days, zero overnight exposure.", features: ["Impact-rated shingles", "Full tear-off", "Lifetime workmanship warranty", "Clean job site"], image: "project-1.webp", imgAlt: "New architectural shingle roof" },
        { slug: "storm-hail-restoration", title: "Storm & Hail Restoration", subtitle: "Fast response when the weather turns", body: "We tarp same-day, document the damage for your insurer, and restore your roof to better than it was before the storm.", features: ["Same-day tarping", "Insurance documentation", "Adjuster meetings", "Full restoration"], image: "project-2.webp", imgAlt: "Storm-damaged roof being restored" },
        { slug: "roof-repair", title: "Roof Repair", subtitle: "Find the real cause, fix it right", body: "Leaks, missing shingles, failed flashing. We trace the leak to its real source instead of patching the stain on your ceiling.", features: ["Leak tracing", "Flashing repair", "Shingle replacement", "Honest diagnosis"], image: "project-4.webp", imgAlt: "Roofer repairing flashing" },
        { slug: "inspections-maintenance", title: "Inspections & Maintenance", subtitle: "Add years to the roof you have", body: "Free, photo-documented inspections and annual maintenance that catches small problems before they become big ones.", features: ["Free inspection", "Photo report", "Annual maintenance", "Honest timeline"], image: "project-3.webp", imgAlt: "Roofer inspecting a roof" },
      ],
    },
    financing: {
      label: "Financing",
      heading: "A new roof you can actually budget for",
      intro: "Hail does not wait for payday. We offer simple financing so a sudden roof does not become a crisis.",
      processLabel: "How it works",
      processHeading: "Approved in minutes, not weeks",
      processIntro: "Three steps to a roof you can pay for over time.",
      steps: [
        { num: 1, title: "Quick application", desc: "A short form, soft credit check, no impact on your score to see your options." },
        { num: 2, title: "Pick your plan", desc: "Choose the monthly payment that fits your budget, with options from 12 to 120 months." },
        { num: 3, title: "We get to work", desc: "Once you are approved, we schedule your roof, often the same week." },
      ],
      optionsLabel: "Your options",
      optionsHeading: "Plans built around your budget",
      optionsIntro: "Two popular ways Denver homeowners pay for a roof.",
      options: [
        { name: "0% for 12 months", headline: "No interest, one year", details: "Pay it off within twelve months and pay zero interest. Best for insurance-deductible jobs.", tag: "Most popular", highlight: true },
        { name: "Low monthly", headline: "Spread it to 120 months", details: "Stretch the cost over up to ten years with predictable low monthly payments.", tag: "Lowest payment", highlight: false },
      ],
      calloutTitle: "Insurance claim?",
      calloutBody: "If your roof is hail damage, financing can cover your deductible while your claim is processed.",
      faqLabel: "Financing questions",
      faqHeading: "What homeowners ask about paying for a roof",
      faq: [
        { q: "Does checking my options hurt my credit?", a: "No. The pre-qualification is a soft pull with no impact on your credit score." },
        { q: "Can financing cover my insurance deductible?", a: "Yes, that is one of the most common ways our customers use it on storm jobs." },
        { q: "How fast is approval?", a: "Most homeowners get a decision in just a few minutes." },
      ],
      ctaFootnote: "Financing provided through third-party lenders. Subject to credit approval.",
    },
  },

  credit: { agency: "AI Partner Method", url: null },
};

export default brandDNA;
