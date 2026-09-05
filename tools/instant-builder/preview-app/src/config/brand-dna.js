/**
 * brand-dna.js — Ashworth Roofing (fictional Manchester demo client)
 * Authored to the canonical brand-dna.example.js shape. UK-localized.
 */

export const brandDNA = {
  meta: {
    title: "Ashworth Roofing | Roofers in Manchester | Repairs, Re-roofs & Flat Roofs",
    description:
      "Manchester's owner-led roofing team. Free no-obligation surveys, one fixed written price, and a 10-year workmanship guarantee. NFRC approved. Call Ashworth Roofing today.",
  },

  company: {
    name: "Ashworth Roofing",
    shortName: "Ashworth Roofing",
    tagline: "Roofs that hold through a Manchester winter.",
    url: "https://ashworthroofing.co.uk",
    licenseNumber: "Company No. 07234891",
    description:
      "Ashworth Roofing is an owner-led roofing company covering Manchester and the surrounding Greater Manchester area. We handle roof repairs, full re-roofs, flat roofing, chimneys and leadwork for homeowners who want the job done properly, once.",
    serviceRegion: "Manchester and Greater Manchester",
  },

  contact: {
    phone: "0161 496 0142",
    phoneTelLink: "01614960142",
    email: "office@ashworthroofing.co.uk",
    googleMapsUrl: null,
    mapsEmbedUrl: null,
  },

  address: {
    street: "Unit 5, Brookfield Works, Chorlton",
    city: "Manchester",
    state: "Greater Manchester",
    zip: "M21 9PN",
    full: "Unit 5, Brookfield Works, Chorlton, Manchester M21 9PN",
    country: "GB",
    lat: null,
    lng: null,
  },

  hours: {
    weekday: {
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "8:00 AM",
      closes: "6:00 PM",
    },
    saturday: { opens: "9:00 AM", closes: "1:00 PM" },
    display: [
      { label: "Mon to Fri", value: "8:00 AM to 6:00 PM" },
      { label: "Saturday", value: "9:00 AM to 1:00 PM" },
    ],
    emergencyBadge: "24/7 emergency leak call-out",
  },

  businessHours: { tz: "Europe/London", open: "08:00", close: "18:00" },

  social: {
    facebook: "https://facebook.com/ashworthroofingmcr",
    facebookReviews: "https://facebook.com/ashworthroofingmcr/reviews",
    instagram: "https://instagram.com/ashworthroofingmcr",
    linkedin: null,
    youtube: null,
  },

  team: {
    founder: {
      name: "Lee Ashworth",
      displayName: "Lee",
      title: "Founder and Lead Roofer",
      yearsExp: "15",
      expLabel: "years on Manchester roofs",
    },
    founders: [],
  },

  team_group_photo: null,
  team_members: [],

  theme_mode: "light",
  voice_register: "commercial",

  shape_motif: "shingle",

  corner_overlay: { motif: "shingle", color: "#26333F", opacity: 0.08 },

  layout: {
    blueprint: "trust-first",
    hero: "split-form",
    vibe: "structural",
    sections: {},
  },

  palette: {
    primary: "#26333F",
    primary_dark: "#1A242D",
    primary_slate: "#37474F",
    accent: "#C8562B",
    accent_light: "#E0844F",
    accent_dark: "#9E3F1C",
    neutral: "#F4F1EC",
    neutral_dim: "#E5DFD5",
    silver: "#8A939B",
    ink: "#171C21",
  },

  typography: {
    heading: "Barlow Condensed",
    body: "Hanken Grotesk",
    headingFontUrl:
      "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&display=swap",
    bodyFontUrl:
      "https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&display=swap",
  },

  reviews: {
    rating: 4.9,
    googleCount: 128,
    facebookCount: 54,
    totalReviewCount: 182,
    googleLabel: "Google Reviews",
    facebookLabel: "Facebook Recommendations",
    googleStat: "4.9 stars on Google",
    facebookStat: "Recommended by 54 neighbours",
    items: [
      {
        author: "Sophie M.",
        source: "google",
        rating: 5,
        text: "We had three slates come off in the January storms and water coming through the back bedroom. Lee came out the same day, made it safe, then re-slated the whole side properly the week after. Scaffolding up and down in three days, garden left spotless. Cannot fault them.",
      },
      {
        author: "David R.",
        source: "google",
        rating: 5,
        text: "Got four quotes for a full re-roof on our Chorlton terrace. Ashworth were the only ones who actually got up on the roof instead of guessing from the pavement. Fixed written price, stuck to it to the penny, cracking job.",
      },
      {
        author: "Priya K.",
        source: "facebook",
        rating: 5,
        text: "Honest lads. They told me I did not need a full new roof yet, just some repointing and new flashing round the chimney. Saved me thousands. When it is finally time for a re-roof there is no question who I am ringing.",
      },
      {
        author: "Mark T.",
        source: "google",
        rating: 5,
        text: "New flat roof on the extension in grey fibreglass. Turned up when they said, no mess, no fuss, and it has been bone dry through two Manchester winters. Proper tradesmen.",
      },
    ],
  },

  services: [
    {
      slug: "roof-repairs",
      name: "Roof Repairs",
      body: "Slipped or missing slates and tiles, leaks, and failed flashing. We find the real cause and fix it right, not just patch over it.",
    },
    {
      slug: "re-roofing",
      name: "Re-roofing & New Roofs",
      body: "Full strip and re-roof in natural slate or concrete tile, built to hold through a Manchester winter. Own crew, proper scaffolding, one to three days.",
    },
    {
      slug: "flat-roofing",
      name: "Flat Roofing",
      body: "Extensions, dormers and garages in GRP fibreglass or EPDM rubber. Warm, dry and guaranteed, with none of the cracking you get from old felt.",
    },
    {
      slug: "chimneys-leadwork",
      name: "Chimneys, Leadwork & Guttering",
      body: "Repointing, new lead flashing, chimney repairs, plus guttering, fascias and soffits. The details that stop the leaks before they start.",
    },
  ],

  serviceAreas: [
    "Manchester",
    "Chorlton",
    "Didsbury",
    "Withington",
    "Sale",
    "Altrincham",
    "Salford",
    "Prestwich",
    "Stockport",
    "Urmston",
    "Stretford",
    "Whalley Range",
  ],

  trust_badges: [],
  press_logos: [],

  previous_projects: [
    { filename: "project-1.webp", alt: "New grey slate roof on a Manchester red-brick semi-detached house", category: "Re-roof" },
    { filename: "project-2.webp", alt: "Terraced roof mid re-slate with scaffolding and new battens", category: "Re-roof" },
    { filename: "project-3.webp", alt: "New grey fibreglass flat roof on a rear house extension", category: "Flat Roof" },
    { filename: "project-4.webp", alt: "Fresh lead flashing and repointing around a brick chimney stack", category: "Chimney & Leadwork" },
  ],

  copy: {
    hero: {
      eyebrow: "Manchester & Greater Manchester",
      headline: "A roof that holds through a Manchester winter.",
      subheadline:
        "Owner-led roofers, one fixed written price, and a tidy site. Book a free no-obligation survey from a roofer who actually gets up there.",
      imageAlt: "Ashworth Roofing team finishing a new slate roof on a Manchester terrace",
    },

    heroTrustChips: ["NFRC approved", "Free no-obligation quotes", "4.9 stars, 182 reviews"],
    trustClaims: [
      "Owner on every job",
      "Fully insured to 5 million pounds",
      "10-year workmanship guarantee",
      "Site left spotless",
    ],

    formHeader: "Book your free roof survey",
    formSubtext: "Tell us what is going on up there. We will ring you back within the hour.",
    buttonText: "Book my free survey",
    submitButton: "Send it to Ashworth",
    privacyLine: "No spam, no pressure. We only use your details to ring you back about your roof.",
    mobileCallLabel: "Call Ashworth",
    availableNow: "We are open now",
    footerCta: "Ready for a roof you can stop worrying about?",
    copyright: "Ashworth Roofing",

    topBar: { cta: "Free Survey" },
    blog: {
      label: "Roofing Notes",
      heading: "Straight talk from the roof",
      body: "No jargon. Just what Manchester homeowners actually need to know about their roofs.",
      featuredLabel: "Featured",
    },
    cta: {
      label: "Let's talk",
      heading: "Get a roof you can stop thinking about.",
      body: "Book a free survey today. We will give you the honest truth about your roof, even if the truth is that you do not need us yet.",
    },
    faq: { label: "Questions", heading: "The things people ask us most" },
    founder: {
      label: "Who you're hiring",
      heading: "Meet Lee, the owner who gets on the roof himself.",
      para1:
        "Lee Ashworth started Ashworth Roofing after fifteen years of watching Manchester homeowners get let down by cowboys who quote from the pavement, rush the job, and are never seen again. He built Ashworth to be the opposite: local, accountable, and on the roof himself for every survey.",
      para2:
        "That means when you ring Ashworth, you are talking to the person whose name is on the van. No call centre, no hard sell, no surprise extras halfway through. Just an honest read on your roof and a crew that treats your home like their own.",
      visionLabel: "What we're after",
      vision: "To be the roofer Manchester recommends without a second thought.",
      missionLabel: "How we get there",
      mission: "One honest job at a time, with the owner on every roof.",
    },
    gallery: {
      label: "Our Work",
      heading: "Roofs we are proud to put our name on",
      body: "A few recent jobs around Manchester and Greater Manchester.",
    },
    offers: {
      label: "This month",
      heading: "Free roof survey with photo report",
      body: "Book this month and we will include a full survey with photos of exactly what is going on up there, no charge and no obligation.",
      detail: "Offer good through the end of the month for Greater Manchester homeowners.",
    },
    process: {
      label: "How it works",
      heading: "Simple, honest, no surprises",
      body: "Four steps from first call to a finished roof you can forget about.",
      badgeText: "Most re-roofs",
      badgeSubtext: "done in 1 to 3 days",
    },
    reviews: {
      label: "Reviews",
      heading: "Manchester talks, we listen",
      body: "182 reviews and counting. Here is what your neighbours say.",
      summary: "4.9 out of 5 across Google and Facebook",
    },
    serviceAreaCard: {
      heading: "Proudly local to Manchester",
      body: "From Chorlton to Stockport, if it is a Greater Manchester roof, we cover it.",
    },
    serviceAreas: {
      label: "Where we work",
      heading: "Roofing across Greater Manchester",
      body: "Manchester is home base, but we cover the whole of Greater Manchester.",
    },
    services: {
      label: "What we do",
      heading: "Roofing done right the first time",
      body: "Repairs, full re-roofs, flat roofing, chimneys and leadwork.",
    },
    whyChoose: {
      label: "Why Ashworth",
      heading: "The roofer your neighbour told you about",
      body: "Owner-led, locally accountable, and genuinely good at the work.",
    },
  },

  process_steps: [
    { n: 1, title: "Free roof survey", body: "We get up on the roof, take photos, and give you an honest read on its condition. No charge, no obligation." },
    { n: 2, title: "Fixed written quote", body: "One clear price, in plain English, with no surprise extras appearing halfway through." },
    { n: 3, title: "We do the work", body: "Our own crew, proper scaffolding, usually one to three days. We keep it dry and protect your garden." },
    { n: 4, title: "Sign off & guarantee", body: "We walk the job with you, hand over your 10-year workmanship guarantee in writing, and leave the site spotless." },
  ],

  why_choose_us: [
    "The owner surveys every single job himself",
    "One fixed written price, no surprise extras",
    "Our own roofers, never subcontracted",
    "Proper scaffolding and a tidy, safe site",
    "10-year workmanship guarantee in writing",
    "We turn up when we say we will",
  ],

  special_offers: [
    { label: "Free roof survey", description: "Full survey with a photo report this month at no cost and no obligation." },
    { label: "Emergency call-out", description: "Same-day make-safe when the weather turns. Ring us and we come out." },
  ],

  faq: [
    { q: "How much does a new roof cost in Manchester?", a: "Most full re-roofs on a Manchester terrace or semi land between 5,500 and 9,000 pounds, depending on size, pitch, and whether you go for concrete tile or natural slate. We give you one honest fixed price after we actually get up and look, never a guess from the pavement." },
    { q: "Do you do insurance work?", a: "Yes. If your roof was damaged in a storm we can survey it, document everything for your insurer, and deal with the claim directly so you are not chasing it yourself." },
    { q: "Is the scaffolding included in the price?", a: "Always. Our quotes include the scaffold, the skip, and the clean-up. The fixed price we write down is the price you pay." },
    { q: "How long does a re-roof take?", a: "Most homes are a one to three day job. We strip, felt and batten, and never leave your roof open to the weather overnight." },
    { q: "Are you insured and guaranteed?", a: "Fully. We carry 5 million pounds of public liability insurance, we are NFRC approved, and every job comes with a 10-year workmanship guarantee in writing." },
    { q: "What if I only need a small repair?", a: "That is most of our work. Slipped tiles, a leak, flashing round the chimney. We are happy to come out for a single repair, and if a patch will do we will tell you rather than sell you a new roof." },
  ],

  blog_posts: [
    {
      slug: "signs-your-manchester-roof-needs-attention",
      cover: "/sections/blog-cover-1.webp",
      title: "Six signs your Manchester roof needs attention before winter",
      date: "2026-05-12",
      category: "Maintenance",
      excerpt: "Most roof problems give you warning signs months before the leak. Here is what to watch for from the ground.",
      readTime: "4 min read",
      body: "Slipped or missing slates, damp patches on upstairs ceilings, moss holding water in the tiles, cracked flashing round the chimney, sagging lines along the ridge, and blocked or overflowing gutters are the six most common early warnings. Catch them before the autumn storms and a small repair saves you a full re-roof.",
    },
    {
      slug: "flat-roof-options-grp-epdm-felt",
      cover: "/sections/blog-cover-2.webp",
      title: "Flat roof options: GRP, EPDM or felt, which is right for your extension?",
      date: "2026-04-22",
      category: "Flat Roofing",
      excerpt: "Old felt cracks and lets go within a decade. Here is how GRP fibreglass and EPDM rubber compare for a Manchester extension.",
      readTime: "5 min read",
      body: "Traditional felt is the cheapest up front but the first to fail, often within ten years. GRP fibreglass gives a hard, seamless finish that lasts 25 years or more and looks smart on a visible roof. EPDM rubber is a single sheet with almost no joins, ideal for larger or awkward roofs. For most Manchester extensions we fit GRP, and every flat roof we lay is guaranteed.",
    },
  ],
  blog_categories: ["Maintenance", "Flat Roofing", "Storm Damage"],

  location_pages: [],

  pages: {
    about: {
      heroLabel: "About Ashworth Roofing",
      heroHeadline: "The roofers Manchester keeps recommending.",
      storyLabel: "Our story",
      storyHeading: "Built on roofs, not sales patter",
      storyClosing: "Fifteen years on, the name on the van is still the name on every survey.",
      stats: [
        { value: "15", label: "Years on Manchester roofs" },
        { value: "1,200+", label: "Roofs completed" },
        { value: "4.9", label: "Average review rating" },
        { value: "100%", label: "Owner-surveyed jobs" },
      ],
      values: [
        { title: "Honest advice", text: "We tell you the truth about your roof, even when it costs us the job today." },
        { title: "Owner accountable", text: "Lee is on every survey. The buck stops with the name on the van." },
        { title: "Tidy and safe", text: "Proper scaffolding, protected gardens, and every job left spotless." },
      ],
      crewLabel: "The crew",
      crewHeading: "Local roofers on local roofs",
      crewBody: "No subcontracted storm crews. The people who quote your roof are the people who build it.",
      crewCaption: "The Ashworth Roofing team in Manchester",
      valuesLabel: "What we stand for",
      valuesHeading: "The standards we will not bend",
      valuesIntro: "Three things every Ashworth job lives by.",
      secondaryButton: "See our work",
    },
    serviceAreas: {
      coverageHighlights: [
        { title: "South Manchester", body: "Same-week surveys across Chorlton, Didsbury, Withington and Sale." },
        { title: "City and Salford", body: "City centre terraces, Salford and Prestwich, six days a week." },
        { title: "Trafford and Stockport", body: "Altrincham, Urmston, Stretford and Stockport all covered." },
      ],
      mapLabel: "Coverage",
      mapHeading: "Where Ashworth Roofing works",
      mapBody: "Home base in Chorlton, covering the whole of Greater Manchester.",
      citiesHeading: "Areas we serve",
      citiesEmpty: "Do not see your area? Give us a ring, we probably cover it.",
      citiesFallback: "Serving the greater Manchester area.",
      readyLabel: "Ready when you are",
      readyHeading: "Need a roofer in your area?",
      readyBody: "Tell us where you are and we will be on your roof this week.",
    },
    locationDetail: {
      eyebrow: "Roofing in",
      nearbyLabel: "Nearby areas we also cover",
    },
    blogPost: {
      sidebarCtaHeading: "Worried about your roof?",
      sidebarCtaBody: "Get a free, no-pressure survey from the owner himself.",
      sidebarCtaButton: "Book my survey",
      sidebarCallLabel: "Or call us",
      sidebarCallNote: "We answer the phone, usually on the first ring.",
      moreArticlesLabel: "More from the blog",
      backToListLabel: "Back to all articles",
    },
    blog: {
      label: "Roofing Notes",
      heading: "Straight talk from the roof",
      intro: "Practical, no-nonsense roofing advice for Manchester homeowners.",
    },
    contact: {
      heading: "Let's talk about your roof",
      intro: "Call, or send the form. The owner reads every message and we ring back within the hour during working hours.",
      formHeading: "Book your free survey",
      formIntro: "Tell us what is going on up there.",
      contactHeading: "Reach Ashworth Roofing",
    },
    services: {
      label: "Our services",
      heading: "Everything your roof needs, from one local crew",
      intro: "Repairs, re-roofs, flat roofing, chimneys and leadwork, all owner-led.",
      list: [
        { slug: "roof-repairs", title: "Roof Repairs", subtitle: "Fixed properly, not patched over", body: "Slipped or missing slates, leaks, and failed flashing. We trace the leak to its real source and fix the cause, so you are not calling us back next month.", features: ["Slipped and missing tiles", "Leak tracing", "Flashing repairs", "Same-week call-outs"], image: "project-2.webp", imgAlt: "Roofer repairing slipped slates on a Manchester roof" },
        { slug: "re-roofing", title: "Re-roofing & New Roofs", subtitle: "Built to hold through a Manchester winter", body: "Full strip and re-roof in natural slate or concrete tile, with new felt, battens and ridge. One crew, proper scaffolding, and never left open overnight.", features: ["Natural slate or tile", "Full strip and felt", "10-year guarantee", "Tidy, protected site"], image: "project-1.webp", imgAlt: "New slate roof on a Manchester semi-detached house" },
        { slug: "flat-roofing", title: "Flat Roofing", subtitle: "Warm, dry and guaranteed", body: "Extensions, dormers and garages in GRP fibreglass or EPDM rubber. A hard, seamless finish that outlasts old felt by decades.", features: ["GRP fibreglass", "EPDM rubber", "Seamless finish", "Guaranteed dry"], image: "project-3.webp", imgAlt: "New grey fibreglass flat roof on an extension" },
        { slug: "chimneys-leadwork", title: "Chimneys, Leadwork & Guttering", subtitle: "The details that stop the leaks", body: "Repointing, new lead flashing, chimney repairs, plus guttering, fascias and soffits done properly so the water goes where it should.", features: ["Chimney repointing", "New lead flashing", "Gutters and fascias", "Moss removal"], image: "project-4.webp", imgAlt: "Fresh leadwork and repointing around a brick chimney" },
      ],
    },
    financing: {
      label: "Finance",
      heading: "A new roof you can spread the cost of",
      intro: "A roof rarely waits for payday. We offer simple finance so a sudden re-roof does not have to be a crisis, and we handle insurance work too.",
      processLabel: "How it works",
      processHeading: "Approved in minutes, not weeks",
      processIntro: "Three steps to a roof you can pay for over time.",
      steps: [
        { num: 1, title: "Quick application", desc: "A short form and a soft search that leaves no mark on your credit file to see your options." },
        { num: 2, title: "Pick your plan", desc: "Choose the monthly payment that suits your budget, with terms from 12 to 120 months." },
        { num: 3, title: "We get to work", desc: "Once you are approved we book your roof in, often the same week." },
      ],
      optionsLabel: "Your options",
      optionsHeading: "Plans built around your budget",
      optionsIntro: "Two popular ways Manchester homeowners pay for a roof.",
      options: [
        { name: "0% over 12 months", headline: "Interest-free for a year", details: "Clear it within twelve months and pay no interest at all. Ideal if a claim or savings are on the way.", tag: "Most popular", highlight: true },
        { name: "Low monthly", headline: "Spread it to 120 months", details: "Stretch the cost over up to ten years with predictable low monthly payments.", tag: "Lowest payment", highlight: false },
      ],
      calloutTitle: "Insurance job?",
      calloutBody: "If your roof was storm damaged, we can deal with your insurer directly and manage the claim while the work gets done.",
      faqLabel: "Finance questions",
      faqHeading: "What homeowners ask about paying for a roof",
      faq: [
        { q: "Does checking my options affect my credit?", a: "No. The pre-qualification is a soft search with no mark on your credit file." },
        { q: "Can I use finance alongside an insurance claim?", a: "Yes. Finance can cover the work now while your claim is processed, and we can manage the claim for you." },
        { q: "How fast is approval?", a: "Most homeowners get a decision in just a few minutes." },
      ],
      ctaFootnote: "Finance provided through authorised third-party lenders. Subject to status.",
    },
  },

  credit: { agency: "{{YOUR_BUSINESS}}", url: "https://yourdomain.com" },
};

export default brandDNA;
