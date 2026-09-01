/**
 * brand-dna.js - Marlow Plumbing & Heating (flagship demo client)
 * Authored to the canonical brand-dna.example.js shape. Light theme, deep navy
 * + bright utility blue, Doncaster and South Yorkshire, Gas Safe heating and
 * plumbing positioning, dependable local-trade voice. UK spelling throughout.
 */

export const brandDNA = {
  meta: {
    title: "Marlow Plumbing & Heating | Boiler, Plumbing & Heating in Doncaster",
    description:
      "Doncaster's Gas Safe registered plumbing and heating team. Boiler installs and repairs, emergency plumbing, bathrooms, and central heating. Fixed-price quotes and a 24/7 callout. Call Marlow.",
  },

  company: {
    name: "Marlow Plumbing & Heating",
    shortName: "Marlow",
    tagline: "Heating and plumbing Doncaster trusts.",
    url: "https://marlowplumbing.co.uk",
    licenseNumber: "Gas Safe 612904",
    description:
      "Marlow Plumbing & Heating is an owner-led plumbing and heating company serving Doncaster and South Yorkshire. We fit and repair boilers, install bathrooms, sort emergency leaks, and look after central heating for households who want it done properly, with a tidy site and a fixed price agreed up front.",
    serviceRegion: "Doncaster and South Yorkshire",
  },

  contact: {
    phone: "01302 030 140",
    phoneTelLink: "01302030140",
    email: "office@marlowplumbing.co.uk",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Marlow+Plumbing+Heating+Doncaster",
    mapsEmbedUrl: null,
  },

  address: {
    street: "14 Nether Hall Road",
    city: "Doncaster",
    state: "South Yorkshire",
    zip: "DN1 2PH",
    full: "14 Nether Hall Road, Doncaster, South Yorkshire DN1 2PH",
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
    emergencyBadge: "24/7 emergency callout",
  },

  businessHours: { tz: "Europe/London", open: "08:00", close: "18:00" },

  social: {
    facebook: "https://facebook.com/marlowplumbing",
    facebookReviews: "https://facebook.com/marlowplumbing/reviews",
    instagram: "https://instagram.com/marlowplumbing",
    linkedin: null,
    youtube: null,
  },

  team: {
    founder: {
      name: "Craig Marlow",
      displayName: "Craig",
      title: "Owner and Lead Engineer",
      yearsExp: "18",
      expLabel: "years on the tools in Doncaster",
    },
    founders: [],
  },

  team_group_photo: null,
  team_members: [],

  theme_mode: "light",
  layout: {
    blueprint: "trust-first",
    hero: "editorial-split",
    vibe: "structural",
    sections: {},
  },
  voice_register: "dependable",
  jsonLdType: "Plumber",

  shape_motif: "wave",

  corner_overlay: { motif: "wave", color: "#1E78D8", opacity: 0.08 },

  palette: {
    primary: "#123A66",
    primary_dark: "#0E2D4F",
    primary_slate: "#1B4E86",
    accent: "#1E78D8",
    accent_light: "#4F9BEC",
    accent_dark: "#15568F",
    neutral: "#7C8A9C",
    neutral_dim: "#5A6B80",
    silver: "#C3CCD8",
    ink: "#0E1C2C",
  },

  typography: {
    heading: "Bricolage Grotesque",
    body: "Figtree",
    headingFontUrl:
      "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&display=swap",
    bodyFontUrl:
      "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap",
  },

  reviews: {
    rating: 4.9,
    googleCount: 167,
    facebookCount: 58,
    totalReviewCount: 225,
    googleLabel: "Google Reviews",
    facebookLabel: "Facebook Recommendations",
    googleStat: "4.9 stars on Google",
    facebookStat: "Recommended by 58 neighbours",
    items: [
      {
        author: "Lisa H.",
        source: "google",
        rating: 5,
        text: "Our boiler packed in on the coldest week of the year. Craig came out the same morning, found the fault, and had us back in hot water by lunchtime. Clean, polite, and the price he quoted was the price we paid.",
      },
      {
        author: "Mark T.",
        source: "google",
        rating: 5,
        text: "Got three quotes for a new boiler. Marlow was not the cheapest but the lad actually explained what we needed and why, no upselling. Fitted in a day, left the airing cupboard tidier than they found it.",
      },
      {
        author: "Sarah W.",
        source: "facebook",
        rating: 5,
        text: "Burst pipe under the kitchen sink at 9pm and water everywhere. Phoned Marlow, they talked me through the stopcock, then turned up within the hour. Calm, sorted it, no silly call-out charge. Honestly a relief.",
      },
      {
        author: "David P.",
        source: "google",
        rating: 5,
        text: "Full bathroom refit. Craig and his team turned up when they said they would every single day, kept the dust down, and the finish is spot on. Recommended them to my mum already.",
      },
    ],
  },

  services: [
    {
      slug: "boiler-installation-repair",
      name: "Boiler Installation & Repair",
      body: "New boilers fitted by Gas Safe engineers, plus fast repairs when yours breaks down. Fixed-price quotes and trusted brands with proper warranties.",
    },
    {
      slug: "emergency-plumbing",
      name: "Emergency Plumbing",
      body: "Burst pipes, leaks, and no hot water sorted fast. A 24/7 callout across Doncaster with no silly out-of-hours surprises on the bill.",
    },
    {
      slug: "bathroom-installation",
      name: "Bathroom Installation",
      body: "Full bathroom fits from first idea to final seal. One team, a tidy site every day, and a finish you will be glad you paid for.",
    },
    {
      slug: "central-heating-power-flushing",
      name: "Central Heating & Power Flushing",
      body: "Cold radiators and noisy systems put right. We fit, balance, and power flush central heating so your whole house warms up evenly again.",
    },
  ],

  serviceAreas: [
    "Doncaster",
    "Bessacarr",
    "Bentley",
    "Armthorpe",
    "Rossington",
    "Tickhill",
    "Mexborough",
    "Thorne",
  ],

  trust_badges: [],
  press_logos: [
    { label: "Gas Safe Registered" },
    { label: "WaterSafe Approved" },
    { label: "CIPHE Member" },
    { label: "Checkatrade Verified" },
    { label: "Which? Trusted Trader" },
  ],

  previous_projects: [
    { filename: "project-1.webp", alt: "New wall-mounted combi boiler neatly installed in a Doncaster home", category: "Boilers" },
    { filename: "project-2.webp", alt: "Modern fitted bathroom with walk-in shower and tiled walls", category: "Bathrooms" },
    { filename: "project-3.webp", alt: "New radiator and pipework fitted during a central heating upgrade", category: "Heating" },
    { filename: "project-4.webp", alt: "Engineer repairing a leak under a kitchen sink", category: "Plumbing" },
  ],

  copy: {
    hero: {
      eyebrow: "Doncaster & South Yorkshire",
      headline: "Heating and plumbing done properly.",
      subheadline:
        "Gas Safe engineers, fixed-price quotes, and a tidy job every time. New boilers, emergency leaks, and bathrooms, from a local team that turns up when it says it will.",
      imageAlt: "Marlow Plumbing & Heating engineer finishing a clean boiler installation in a Doncaster home",
    },

    heroTrustChips: ["Gas Safe registered", "Fixed-price quotes", "4.9 stars, 225 reviews"],
    trustClaims: [
      "We turn up when we say we will",
      "Fixed price agreed up front",
      "Boots off, dust sheets down",
      "24/7 emergency callout",
    ],

    formHeader: "Get your free fixed-price quote",
    formSubtext: "Tell us what is going on and we will call you back within the hour.",
    buttonText: "Get my free quote",
    submitButton: "Send it to Marlow",
    privacyLine: "No spam, no pressure. We only use your details to call you back about the job.",
    mobileCallLabel: "Call Marlow",
    availableNow: "We are open now",
    footerCta: "Ready for heating you can stop worrying about?",
    copyright: "Marlow Plumbing & Heating",

    topBar: { cta: "Free Quote" },
    blog: {
      label: "Plumbing & Heating Notes",
      heading: "Honest advice from the tools",
      body: "No jargon. Just what Doncaster homeowners actually need to know before the next breakdown.",
      featuredLabel: "Featured",
    },
    cta: {
      label: "Let's talk",
      heading: "Get heating you can stop thinking about.",
      body: "Book a free quote today. We will tell you straight what your system needs, even if the answer is that it can wait.",
    },
    faq: { label: "Questions", heading: "The things Doncaster homeowners ask us most" },
    founder: {
      label: "Who you're hiring",
      heading: "Meet Craig, the engineer who does the work himself.",
      para1:
        "Craig Marlow started Marlow Plumbing & Heating after eighteen years on the tools, tired of seeing people in Doncaster mucked about by firms that never turn up, never call back, and load the bill with surprises. He built Marlow to be the opposite: local, reliable, and on the job himself.",
      para2:
        "That means when you call Marlow, you are talking to the person whose name is on the van. No call centre, no pushy sales patter, no hidden extras. Just a straight read on your boiler or your pipes and a team that treats your home like their own.",
      visionLabel: "What we're after",
      vision: "To be the heating engineer Doncaster recommends without thinking twice.",
      missionLabel: "How we get there",
      mission: "One honest job at a time, with the owner on the tools.",
    },
    gallery: {
      label: "Our Work",
      heading: "Work we are proud to put our name on",
      body: "A few recent boilers, bathrooms, and heating jobs around Doncaster.",
    },
    offers: {
      label: "This month",
      heading: "Free boiler health check",
      body: "Book any job this month and we include a free boiler health check, no charge and no obligation.",
      detail: "Offer good through the end of the month for Doncaster and South Yorkshire homeowners.",
    },
    process: {
      label: "How it works",
      heading: "Simple, honest, no surprises",
      body: "Four steps from first call to a job done and a price you agreed up front.",
      badgeText: "Most boilers",
      badgeSubtext: "fitted in a single day",
    },
    reviews: {
      label: "Reviews",
      heading: "Doncaster talks, we listen",
      body: "225 reviews and counting. Here is what your neighbours say.",
      summary: "4.9 out of 5 across Google and Facebook",
    },
    serviceAreaCard: {
      heading: "Proudly local to Doncaster",
      body: "If you are in Doncaster or South Yorkshire, we cover you.",
    },
    serviceAreas: {
      label: "Where we work",
      heading: "Plumbing and heating across South Yorkshire",
      body: "Doncaster is home base, but we cover the towns and villages all around it.",
    },
    services: {
      label: "What we do",
      heading: "Heating and plumbing done right the first time",
      body: "Boilers, emergency plumbing, bathrooms, and central heating.",
    },
    whyChoose: {
      label: "Why Marlow",
      heading: "The engineer your neighbour told you about",
      body: "Owner-led, locally accountable, and genuinely good at the work.",
    },
  },

  process_steps: [
    { n: 1, title: "Free quote", body: "We come out, take a proper look, and give you an honest fixed price in plain English. No charge, no pressure." },
    { n: 2, title: "Agreed up front", body: "One number, agreed before we start, with no surprise extras at the end. We book a day that suits you." },
    { n: 3, title: "We do the work", body: "One team, on time, usually in a single day for a boiler. Dust sheets down, boots off, everything tidy." },
    { n: 4, title: "Tested and tidy", body: "We test everything with you, hand over your paperwork and warranty, and leave the place spotless." },
  ],

  why_choose_us: [
    "The owner is on the tools, not just the phone",
    "Fixed price agreed before we start",
    "Gas Safe registered, fully insured",
    "We tidy up properly, every time",
  ],

  special_offers: [
    { label: "Free boiler health check", description: "A full boiler health check this month at no cost and no obligation." },
    { label: "Emergency callout", description: "A 24/7 callout when things go wrong. Phone us and we move." },
  ],

  faq: [
    { q: "How much does a new boiler cost in Doncaster?", a: "Most new boilers come in between 1,800 and 3,200 pounds fitted, depending on the boiler, the size of your home, and the work involved. We give you one honest fixed price after we have actually looked, never a guess over the phone." },
    { q: "Do you offer emergency callouts?", a: "Yes. We run a 24/7 emergency callout across Doncaster for burst pipes, leaks, and no heat or hot water. We will tell you the callout cost up front so there is no nasty surprise on the bill." },
    { q: "Are you Gas Safe registered?", a: "Fully. Every gas job we do is carried out by a Gas Safe registered engineer, and we are happy to show you our registration before any work starts." },
    { q: "Do new boilers come with a warranty?", a: "Yes. We fit trusted brands that come with manufacturer warranties, often up to ten years, and we register it for you so you are covered from day one." },
    { q: "Can I spread the cost of a new boiler?", a: "You can. We offer boiler finance so a sudden breakdown does not become a crisis. A quick application, a soft credit check, and you can pay over a term that suits your budget." },
  ],

  blog_posts: [
    {
      slug: "5-signs-your-boiler-is-on-its-way-out",
      cover: "blog-cover-1.webp",
      title: "5 signs your boiler is on its way out",
      date: "2026-05-12",
      category: "Boilers",
      excerpt: "Most boilers warn you long before they finally give up. Here is what to listen and look for before you are left with no heat.",
      readTime: "4 min read",
      body: "Banging or gurgling noises, a yellow rather than blue flame, rising energy bills, water pressure that keeps dropping, and radiators that take an age to warm up are the five most common warnings. Catch them early and a repair often saves you a full replacement.",
    },
    {
      slug: "what-to-do-when-a-pipe-bursts",
      cover: "blog-cover-2.webp",
      title: "What to do in the first 10 minutes when a pipe bursts",
      date: "2026-04-22",
      category: "Plumbing",
      excerpt: "A burst pipe can do a lot of damage fast. The steps you take in the first few minutes decide how bad it gets.",
      readTime: "5 min read",
      body: "Turn the water off at the stopcock, switch off the heating, open the cold taps to drain the system, and move anything valuable out of the way. Then phone a local plumber. Knowing where your stopcock is before it happens saves you the worst of it.",
    },
  ],
  blog_categories: ["Boilers", "Plumbing", "Heating"],

  location_pages: [],

  pages: {
    about: {
      heroLabel: "About Marlow Plumbing & Heating",
      heroHeadline: "The heating engineer Doncaster keeps recommending.",
      storyLabel: "Our story",
      storyHeading: "Built on good work, not sales patter",
      storyClosing: "Eighteen years on, the name on the van is still the name on every job.",
      stats: [
        { value: "18", label: "Years on the tools" },
        { value: "3,400+", label: "Jobs completed" },
        { value: "4.9", label: "Average review rating" },
        { value: "100%", label: "Gas Safe registered work" },
      ],
      values: [
        { title: "Honesty first", text: "We tell you straight what your system needs, even when it means a smaller job today." },
        { title: "Owner accountable", text: "Craig is on the tools. The buck stops with the name on the van." },
        { title: "Tidy job sites", text: "Dust sheets down, boots off, and everything cleaned up before we leave." },
      ],
      crewLabel: "The team",
      crewHeading: "Local people on local jobs",
      crewBody: "No faceless subcontractors. The people who quote your job are the people who carry it out.",
      crewCaption: "The Marlow team in Doncaster",
      valuesLabel: "What we stand for",
      valuesHeading: "The standards we will not bend",
      valuesIntro: "Three things every Marlow job lives by.",
      secondaryButton: "See our work",
    },
    serviceAreas: {
      coverageHighlights: [
        { title: "Doncaster core", body: "Same-day callouts across Doncaster town, Bessacarr, and the central areas." },
        { title: "The villages", body: "Armthorpe, Rossington, Tickhill, and the villages where we are out every week." },
        { title: "Wider South Yorkshire", body: "Mexborough, Thorne, Bentley, and the surrounding area, six days a week." },
      ],
      mapLabel: "Coverage",
      mapHeading: "Where Marlow works",
      mapBody: "Home base in Doncaster, covering the wider South Yorkshire area.",
      citiesHeading: "Towns we serve",
      citiesEmpty: "Do not see your area? Give us a ring, we probably cover it.",
      citiesFallback: "Serving Doncaster and the wider South Yorkshire area.",
      readyLabel: "Ready when you are",
      readyHeading: "Need a plumber or heating engineer near you?",
      readyBody: "Tell us where you are and we will be out to you this week.",
    },
    locationDetail: {
      eyebrow: "Plumbing and heating in",
      nearbyLabel: "Nearby towns we also cover",
    },
    blogPost: {
      sidebarCtaHeading: "Boiler or plumbing trouble?",
      sidebarCtaBody: "Get a free, no-pressure quote from the owner himself.",
      sidebarCtaButton: "Book my quote",
      sidebarCallLabel: "Or call us",
      sidebarCallNote: "We answer the phone, usually on the first ring.",
      moreArticlesLabel: "More from the blog",
      backToListLabel: "Back to all articles",
    },
    blog: {
      label: "Plumbing & Heating Notes",
      heading: "Honest advice from the tools",
      intro: "Practical, no-nonsense plumbing and heating advice for Doncaster homeowners.",
    },
    contact: {
      heading: "Let's sort your plumbing or heating",
      intro: "Call, or send the form. The owner reads every message and we call back within the hour during working hours.",
      formHeading: "Get your free quote",
      formIntro: "Tell us what is going on.",
      contactHeading: "Reach Marlow Plumbing & Heating",
    },
    services: {
      label: "Our services",
      heading: "Everything your home needs, from one local team",
      intro: "Boilers, emergency plumbing, bathrooms, and central heating, all owner-led.",
      list: [
        { slug: "boiler-installation-repair", title: "Boiler Installation & Repair", subtitle: "Fitted right, fixed fast", body: "New boilers fitted by Gas Safe engineers and quick repairs when yours breaks down. Trusted brands, proper warranties, and a fixed price agreed before we start.", features: ["Gas Safe engineers", "Trusted boiler brands", "Up to 10 year warranties", "Fixed-price quotes"], image: "project-1.webp", imgAlt: "New combi boiler neatly installed" },
        { slug: "emergency-plumbing", title: "Emergency Plumbing", subtitle: "Fast when it really matters", body: "Burst pipes, leaks, and no hot water sorted fast, day or night. We tell you the callout cost up front, so there is never a nasty surprise on the bill.", features: ["24/7 callout", "Burst pipes and leaks", "No hot water", "Clear pricing up front"], image: "project-4.webp", imgAlt: "Engineer repairing a leak under a sink" },
        { slug: "bathroom-installation", title: "Bathroom Installation", subtitle: "From first idea to final seal", body: "Full bathroom fits handled by one team, start to finish. A tidy site every day and a finish you will be glad you paid for.", features: ["Full design and fit", "One team throughout", "Tidy site daily", "Quality finish"], image: "project-2.webp", imgAlt: "Modern fitted bathroom with walk-in shower" },
        { slug: "central-heating-power-flushing", title: "Central Heating & Power Flushing", subtitle: "Warm again, all the way round", body: "Cold radiators and noisy systems put right. We fit, balance, and power flush central heating so your whole house warms up evenly.", features: ["Radiator installs", "System balancing", "Power flushing", "Even, quiet heat"], image: "project-3.webp", imgAlt: "New radiator fitted during a heating upgrade" },
      ],
    },
    financing: {
      label: "Boiler finance",
      heading: "A new boiler you can actually budget for",
      intro: "A breakdown never waits for payday. We offer simple boiler finance so a sudden new boiler does not become a crisis.",
      processLabel: "How it works",
      processHeading: "Approved in minutes, not weeks",
      processIntro: "Three steps to a boiler you can pay for over time.",
      steps: [
        { num: 1, title: "Quick application", desc: "A short form and a soft credit check, with no impact on your score, to see your options." },
        { num: 2, title: "Pick your plan", desc: "Choose the monthly payment that fits your budget, with terms from 12 to 120 months." },
        { num: 3, title: "We get to work", desc: "Once you are approved, we book your boiler in, often the same week." },
      ],
      optionsLabel: "Your options",
      optionsHeading: "Plans built around your budget",
      optionsIntro: "Two popular ways Doncaster homeowners pay for a new boiler.",
      options: [
        { name: "0% for 12 months", headline: "No interest, one year", details: "Pay it off within twelve months and pay zero interest. Best when you can clear it sooner.", tag: "Most popular", highlight: true },
        { name: "Low monthly", headline: "Spread it to 120 months", details: "Stretch the cost over up to ten years with predictable, low monthly payments.", tag: "Lowest payment", highlight: false },
      ],
      calloutTitle: "Boiler broken down?",
      calloutBody: "If you have been left without heat, finance can spread the cost of a new boiler so you are warm again now and pay over time.",
      faqLabel: "Finance questions",
      faqHeading: "What homeowners ask about paying for a boiler",
      faq: [
        { q: "Does checking my options affect my credit?", a: "No. The pre-qualification is a soft search with no impact on your credit score." },
        { q: "How much can I borrow for a boiler?", a: "Enough to cover a full boiler and installation for most homes. We will show you the figures before you commit." },
        { q: "How fast is approval?", a: "Most homeowners get a decision in just a few minutes." },
      ],
      ctaFootnote: "Finance is provided through third-party lenders and is subject to status and credit approval. Marlow Plumbing & Heating acts as a credit broker, not a lender.",
    },
  },

  credit: { agency: "AI Partner Method", url: null },
};

export default brandDNA;
