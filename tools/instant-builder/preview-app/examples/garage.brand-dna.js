/**
 * brand-dna.js, Grayson Auto Works (reference demo build)
 * Authored to the canonical brand-dna.example.js shape (mirrors the validated
 * Copperline shape). Cold industrial dark steel + signal red, Newcastle upon
 * Tyne, MOT + servicing + diagnostics positioning, honest no-nonsense voice.
 */

export const brandDNA = {
  meta: {
    title: "Grayson Auto Works | MOT, Servicing & Car Repairs in Newcastle",
    description:
      "Newcastle's honest independent garage. DVSA approved MOT centre, full servicing, diagnostics and repairs from manufacturer-trained technicians. No surprises, honest quotes, the job done right.",
  },

  company: {
    name: "Grayson Auto Works",
    shortName: "Grayson",
    tagline: "Honest, expert car care in Newcastle.",
    url: "https://graysonautoworks.co.uk",
    licenseNumber: "DVSA-MOT-NE1-7741",
    description:
      "Grayson Auto Works is an owner-led independent garage serving Newcastle and Tyneside. We handle MOT testing, full servicing, diagnostics and repairs, tyres and brakes for drivers who want straight answers and the job done right the first time.",
    serviceRegion: "Newcastle and Tyneside",
  },

  contact: {
    phone: "0191 040 220",
    phoneTelLink: "0191040220",
    email: "bookings@graysonautoworks.co.uk",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Grayson+Auto+Works+Newcastle",
    mapsEmbedUrl: null,
  },

  address: {
    street: "14 Forge Lane",
    city: "Newcastle upon Tyne",
    state: "Tyne and Wear",
    zip: "NE1 4QT",
    full: "14 Forge Lane, Newcastle upon Tyne, Tyne and Wear, NE1 4QT",
    lat: null,
    lng: null,
  },

  hours: {
    weekday: {
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "8:00 AM",
      closes: "6:00 PM",
    },
    saturday: { opens: "8:30 AM", closes: "1:00 PM" },
    display: [
      { label: "Mon to Fri", value: "8:00 AM to 6:00 PM" },
      { label: "Saturday", value: "8:30 AM to 1:00 PM" },
    ],
    emergencyBadge: "Same-day MOT slots most days",
  },

  businessHours: { tz: "Europe/London", open: "08:00", close: "18:00" },

  social: {
    facebook: "https://facebook.com/graysonautoworks",
    facebookReviews: "https://facebook.com/graysonautoworks/reviews",
    instagram: "https://instagram.com/graysonautoworks",
    linkedin: null,
    youtube: null,
  },

  team: {
    founder: {
      name: "Lee Grayson",
      displayName: "Lee",
      title: "Owner and Master Technician",
      yearsExp: "20",
      expLabel: "years under the bonnet",
    },
    founders: [],
  },

  team_group_photo: null,
  team_members: [],

  theme_mode: "dark",
  layout: {
    blueprint: "showcase-first",
    hero: "full-bleed",
    vibe: "structural",
    sections: {},
  },
  voice_register: "premium",
  jsonLdType: "AutoRepair",

  shape_motif: "chevron",

  corner_overlay: { motif: "chevron", color: "#E23B2E", opacity: 0.08 },

  palette: {
    primary: "#15181C",
    primary_dark: "#0C0E11",
    primary_slate: "#202429",
    accent: "#E23B2E",
    accent_light: "#EE6356",
    accent_dark: "#AE2A20",
    neutral: "#9AA3AD",
    neutral_dim: "#697079",
    silver: "#C2C8CF",
    ink: "#0C0E11",
  },

  typography: {
    heading: "Saira",
    body: "Mulish",
    headingFontUrl:
      "https://fonts.googleapis.com/css2?family=Saira:wght@600;700;800;900&display=swap",
    bodyFontUrl:
      "https://fonts.googleapis.com/css2?family=Mulish:wght@400;500;600;700&display=swap",
  },

  reviews: {
    rating: 4.9,
    googleCount: 213,
    facebookCount: 68,
    totalReviewCount: 281,
    googleLabel: "Google Reviews",
    facebookLabel: "Facebook Recommendations",
    googleStat: "4.9 stars on Google",
    facebookStat: "Recommended by 68 local drivers",
    items: [
      {
        author: "Gary T.",
        source: "google",
        rating: 5,
        text: "Booked the car in for an MOT and a noise I was worried about. Lee rang me before doing anything, told me the noise was just a worn pad, and quoted me there and then. No upselling, no scare tactics. Passed the MOT same day.",
      },
      {
        author: "Sophie R.",
        source: "google",
        rating: 5,
        text: "Three other garages quoted me for a full clutch. Grayson found it was a sensor, fixed it for a fraction of the price, and showed me the old part. Honest people who actually explain what they are doing.",
      },
      {
        author: "Dan W.",
        source: "facebook",
        rating: 5,
        text: "Full service and MOT done in a morning, courtesy car sorted so I never missed work. Got a clear breakdown of what was done and what to keep an eye on next year. This is my garage now.",
      },
      {
        author: "Priya K.",
        source: "google",
        rating: 5,
        text: "First garage that did not talk down to me. Lee walked me through the diagnostics, gave me an honest quote, and the bill matched it to the penny. Quick turnaround and a proper warranty on the work.",
      },
    ],
  },

  services: [
    {
      slug: "mot-testing",
      name: "MOT Testing",
      body: "DVSA approved MOT centre. Honest pass or fail, photos of any faults, and a clear quote for anything that needs doing. No invented work.",
    },
    {
      slug: "servicing",
      name: "Servicing",
      body: "Interim and full servicing to manufacturer schedules, stamped service book, genuine and OE-quality parts. Your warranty stays intact.",
    },
    {
      slug: "diagnostics-repairs",
      name: "Diagnostics & Repairs",
      body: "Dealer-level diagnostics that trace the real fault, not a guess at the warning light. We fix the cause and quote before we touch anything.",
    },
    {
      slug: "tyres-brakes",
      name: "Tyres & Brakes",
      body: "Tyres, brake pads, discs and fluid done right, with a free brake and tyre safety check on every visit. Kerb to kerb, road safe.",
    },
  ],

  serviceAreas: [
    "Newcastle upon Tyne",
    "Gateshead",
    "Jesmond",
    "Gosforth",
    "Heaton",
    "Byker",
    "Wallsend",
    "North Shields",
  ],

  trust_badges: [],
  press_logos: [
    { label: "DVSA Approved MOT Centre" },
    { label: "Good Garage Scheme" },
    { label: "RAC Approved" },
    { label: "Manufacturer-Trained Technicians" },
    { label: "12-Month Warranty" },
  ],

  previous_projects: [
    { filename: "project-1.webp", alt: "Car raised on a diagnostic ramp in the Grayson Auto Works workshop", category: "Diagnostics" },
    { filename: "project-2.webp", alt: "Technician carrying out engine bay work on a serviced car", category: "Servicing" },
    { filename: "project-3.webp", alt: "Brake disc and tyre work on a car in the Newcastle garage", category: "Tyres & Brakes" },
    { filename: "project-4.webp", alt: "Car in a clean MOT testing bay at Grayson Auto Works", category: "MOT" },
  ],

  copy: {
    hero: {
      eyebrow: "Newcastle & Tyneside",
      headline: "Honest car care, done right the first time.",
      subheadline:
        "MOT, servicing, diagnostics and repairs from manufacturer-trained technicians. Clear quotes before we start, the job done properly, and no surprises on the bill.",
      imageAlt: "A car on a ramp under workshop lighting at Grayson Auto Works in Newcastle",
    },

    heroTrustChips: ["DVSA approved MOT centre", "12-month warranty on work", "4.9 stars, 281 reviews"],
    trustClaims: [
      "Honest quote before we start",
      "No upselling, ever",
      "Manufacturer-trained technicians",
      "12-month warranty in writing",
    ],

    formHeader: "Book your car in",
    formSubtext: "Tell us what the car needs. We call back the same day during opening hours.",
    buttonText: "Book my car in",
    submitButton: "Send it to Grayson",
    privacyLine: "No spam, no pressure. We only use your details to call you back about your car.",
    mobileCallLabel: "Call Grayson",
    availableNow: "We are open now",
    footerCta: "Ready for a garage you can actually trust?",
    copyright: "Grayson Auto Works",

    topBar: { cta: "Book MOT" },
    blog: {
      label: "Workshop Notes",
      heading: "Straight talk from the workshop",
      body: "No jargon. Just what Newcastle drivers actually need to know to keep their car road safe and running right.",
      featuredLabel: "Featured",
    },
    cta: {
      label: "Let's talk",
      heading: "Get your car sorted without the runaround.",
      body: "Book it in today. We will tell you straight what your car needs, what it does not, and exactly what it costs.",
    },
    faq: { label: "Questions", heading: "The things Newcastle drivers ask us most" },
    founder: {
      label: "Who you're trusting",
      heading: "Meet Lee, the master technician who runs the spanners himself.",
      para1:
        "Lee Grayson opened Grayson Auto Works after twenty years on the tools, tired of watching drivers get stung by garages that invent work and pad the bill. He built Grayson to be the opposite: independent, straight-talking, and on the ramp himself for the jobs that matter.",
      para2:
        "That means when you call Grayson, you are talking to the person whose name is over the door. No call centre, no commission-chasing upsells, no surprise line items. Just a proper diagnosis, an honest quote, and a car you can trust back on the road.",
      visionLabel: "What we're after",
      vision: "To be the garage Newcastle recommends without thinking twice.",
      missionLabel: "How we get there",
      mission: "One honest job at a time, with a master technician on every ramp.",
    },
    gallery: {
      label: "Our Work",
      heading: "Cars we are proud to put our name on",
      body: "A look inside the workshop and a few recent jobs around Newcastle.",
    },
    offers: {
      label: "This month",
      heading: "Free brake and tyre safety check",
      body: "Book any service or MOT this month and we include a full brake and tyre safety check, no charge and no obligation.",
      detail: "Offer good through the end of the month for Newcastle and Tyneside drivers.",
    },
    process: {
      label: "How it works",
      heading: "Simple, honest, no surprises",
      body: "Four steps from first call to a car you can trust back on the road.",
      badgeText: "Most jobs",
      badgeSubtext: "done the same day",
    },
    reviews: {
      label: "Reviews",
      heading: "Newcastle talks, we listen",
      body: "281 reviews and counting. Here is what local drivers say.",
      summary: "4.9 out of 5 across Google and Facebook",
    },
    serviceAreaCard: {
      heading: "Proudly local to Tyneside",
      body: "If you drive it around Newcastle, we look after it.",
    },
    serviceAreas: {
      label: "Where we work",
      heading: "Looking after cars across Tyneside",
      body: "Newcastle is home base, but we cover the whole of Tyneside.",
    },
    services: {
      label: "What we do",
      heading: "Everything your car needs, done right",
      body: "MOT, servicing, diagnostics and repairs, tyres and brakes.",
    },
    whyChoose: {
      label: "Why Grayson",
      heading: "The garage your mate told you about",
      body: "Owner-led, locally trusted, and genuinely good at the work.",
    },
  },

  process_steps: [
    { n: 1, title: "Tell us what it needs", body: "Call or book online. Tell us the symptoms or the service due and we will get you a slot, often the same week." },
    { n: 2, title: "Honest diagnosis", body: "We check the car properly and call you with what we find. You get a clear quote in plain English before we touch anything." },
    { n: 3, title: "We do the work", body: "Manufacturer-trained technicians, genuine and OE-quality parts, and most jobs turned around the same day." },
    { n: 4, title: "Keys back, no surprises", body: "We walk you through what was done, hand over the paperwork and warranty, and the bill matches the quote." },
  ],

  why_choose_us: [
    "A master technician is on every job",
    "We quote before we touch the car",
    "12-month warranty on parts and labour in writing",
    "We never invent work to pad the bill",
  ],

  special_offers: [
    { label: "Free brake and tyre check", description: "Full brake and tyre safety check with any service or MOT this month, no cost and no obligation." },
    { label: "Courtesy car", description: "Free courtesy car on bigger jobs so you are never stranded. Just ask when you book." },
  ],

  faq: [
    { q: "How much is an MOT in Newcastle?", a: "Our MOT is GBP 54.85, the standard maximum DVSA fee. We never charge more than that for the test, and if anything fails we show you the fault and quote the repair before doing a thing." },
    { q: "How long does a car service take?", a: "An interim service is usually a couple of hours and a full service most of a day. Most cars booked in the morning are ready by the afternoon, and we can sort a courtesy car if you need one." },
    { q: "Do you offer a courtesy car?", a: "Yes, we have courtesy cars available for bigger jobs and longer repairs so you are never left without transport. Let us know when you book and we will reserve one." },
    { q: "Is there a warranty on the work?", a: "Every repair comes with a 12-month warranty on parts and labour, in writing. We use genuine or OE-quality parts so your manufacturer warranty stays intact too." },
    { q: "What does a diagnostic check involve?", a: "We plug in dealer-level diagnostic equipment to read the fault properly, then trace it to the real cause rather than guessing at the warning light. You get an honest quote before any repair work begins." },
  ],

  blog_posts: [
    {
      slug: "5-signs-your-car-needs-a-service",
      cover: "blog-cover-1.webp",
      title: "5 signs your car is overdue a service",
      date: "2026-05-12",
      category: "Servicing",
      excerpt: "Most cars tell you they need attention long before they break down. Here is what to watch and listen for around town.",
      readTime: "4 min read",
      body: "Sluggish starts, a grinding or squealing under braking, a warning light that will not clear, rougher idling, and worse fuel economy are the five most common signs a service is overdue. Catch them early and a service saves you a far bigger repair bill later.",
    },
    {
      slug: "what-to-do-before-your-mot",
      cover: "blog-cover-2.webp",
      title: "What to check before your MOT to avoid a fail",
      date: "2026-04-22",
      category: "MOT",
      excerpt: "A surprising number of MOT fails are simple things you can check on the driveway in ten minutes. Here is the list.",
      readTime: "5 min read",
      body: "Check every bulb works, top up the screen wash, look at tyre tread and pressures, make sure the wipers clear properly, and listen for anything new under braking. Sorting these before the test saves you a retest and the hassle of a second trip.",
    },
  ],
  blog_categories: ["Servicing", "MOT", "Diagnostics"],

  location_pages: [],

  pages: {
    about: {
      heroLabel: "About Grayson Auto Works",
      heroHeadline: "The garage Newcastle keeps recommending.",
      storyLabel: "Our story",
      storyHeading: "Built on honest work, not padded bills",
      storyClosing: "Twenty years on the tools later, the name over the door is still the name on every job.",
      stats: [
        { value: "20", label: "Years under the bonnet" },
        { value: "18,000+", label: "Cars serviced and tested" },
        { value: "4.9", label: "Average review rating" },
        { value: "100%", label: "Quotes given before work starts" },
      ],
      values: [
        { title: "Honesty first", text: "We tell you straight what your car needs and what it does not, even when it costs us the bigger job." },
        { title: "Owner accountable", text: "Lee is a master technician on the ramp, not behind a desk. The buck stops with the name over the door." },
        { title: "Proper work", text: "Manufacturer-trained technicians, genuine and OE-quality parts, and a warranty in writing on everything we do." },
      ],
      crewLabel: "The team",
      crewHeading: "Local technicians who know their trade",
      crewBody: "No commission-chasing salespeople. The people who diagnose your car are the people who fix it.",
      crewCaption: "The Grayson Auto Works team in Newcastle",
      valuesLabel: "What we stand for",
      valuesHeading: "The standards we will not bend",
      valuesIntro: "Three things every job at Grayson lives by.",
      secondaryButton: "See our work",
    },
    serviceAreas: {
      coverageHighlights: [
        { title: "Newcastle core", body: "Quick turnaround across the city centre, Jesmond, Heaton and the central neighbourhoods." },
        { title: "Across the river", body: "Gateshead and the south of the Tyne, with collection on bigger jobs." },
        { title: "Coast and north", body: "Gosforth, Wallsend, North Shields and out toward the coast, six days a week." },
      ],
      mapLabel: "Coverage",
      mapHeading: "Where Grayson works",
      mapBody: "Home base in Newcastle, looking after cars across the whole of Tyneside.",
      citiesHeading: "Areas we cover",
      citiesEmpty: "Do not see your area? Give us a ring, we probably cover it.",
      citiesFallback: "Serving the greater Newcastle and Tyneside area.",
      readyLabel: "Ready when you are",
      readyHeading: "Need a trustworthy garage near you?",
      readyBody: "Tell us where you are and we will get your car booked in this week.",
    },
    locationDetail: {
      eyebrow: "Car servicing in",
      nearbyLabel: "Nearby areas we also cover",
    },
    blogPost: {
      sidebarCtaHeading: "Something not right with the car?",
      sidebarCtaBody: "Get an honest diagnosis and a clear quote from a master technician.",
      sidebarCtaButton: "Book it in",
      sidebarCallLabel: "Or call us",
      sidebarCallNote: "We answer the phone, usually on the first ring.",
      moreArticlesLabel: "More from the workshop",
      backToListLabel: "Back to all articles",
    },
    blog: {
      label: "Workshop Notes",
      heading: "Straight talk from the workshop",
      intro: "Practical, no-nonsense car advice for Newcastle drivers.",
    },
    contact: {
      heading: "Let's get your car booked in",
      intro: "Call, or send the form. Lee reads every message and we call back the same day during opening hours.",
      formHeading: "Book your car in",
      formIntro: "Tell us what the car needs.",
      contactHeading: "Reach Grayson Auto Works",
    },
    services: {
      label: "Our services",
      heading: "Everything your car needs, from one local garage",
      intro: "MOT, servicing, diagnostics and repairs, tyres and brakes, all owner-led.",
      list: [
        { slug: "mot-testing", title: "MOT Testing", subtitle: "Honest pass or fail, every time", body: "DVSA approved MOT testing with photos of any faults and a clear quote for anything that needs doing. We never invent work to pad the bill, and same-day slots are available most days.", features: ["DVSA approved centre", "Photo evidence of faults", "Honest pass or fail", "Repairs quoted before work"], image: "project-4.webp", imgAlt: "Car in the MOT bay" },
        { slug: "servicing", title: "Servicing", subtitle: "Keep it running right, keep the warranty", body: "Interim and full servicing to manufacturer schedules with a stamped service book and genuine or OE-quality parts, so your manufacturer warranty stays intact.", features: ["Manufacturer schedules", "Stamped service book", "Genuine or OE parts", "Courtesy car available"], image: "project-2.webp", imgAlt: "Technician servicing an engine bay" },
        { slug: "diagnostics-repairs", title: "Diagnostics & Repairs", subtitle: "Find the real fault, fix it right", body: "Dealer-level diagnostics that trace the actual cause instead of guessing at the warning light. We quote the repair in plain English before we touch the car.", features: ["Dealer-level equipment", "Real fault tracing", "Honest plain-English quote", "12-month warranty"], image: "project-1.webp", imgAlt: "Car on a diagnostic ramp" },
        { slug: "tyres-brakes", title: "Tyres & Brakes", subtitle: "Road safe, kerb to kerb", body: "Tyres, brake pads, discs and fluid done properly, with a free brake and tyre safety check on every visit so small problems never become big ones.", features: ["Free safety check", "Quality tyres fitted", "Pads and discs", "Brake fluid service"], image: "project-3.webp", imgAlt: "Brake and tyre work on a car" },
      ],
    },
    financing: {
      label: "Spread the cost",
      heading: "Spread the cost of bigger repairs",
      intro: "A sudden repair should not mean a sudden bill you cannot manage. We offer simple finance so a bigger job can be paid off over time.",
      processLabel: "How it works",
      processHeading: "Approved in minutes, not weeks",
      processIntro: "Three steps to a repair you can pay for over time.",
      steps: [
        { num: 1, title: "Quick application", desc: "A short form and a soft credit check, with no impact on your score, to see your options." },
        { num: 2, title: "Pick your plan", desc: "Choose the monthly payment that fits your budget, with terms to suit the size of the job." },
        { num: 3, title: "We get to work", desc: "Once you are approved, we book the car in, often the same week." },
      ],
      optionsLabel: "Your options",
      optionsHeading: "Plans built around your budget",
      optionsIntro: "Two popular ways Newcastle drivers spread the cost of a repair.",
      options: [
        { name: "0% over 6 months", headline: "No interest, paid in six", details: "Spread a repair over six months and pay zero interest. Best for mid-sized jobs you would rather not pay in one go.", tag: "Most popular", highlight: true },
        { name: "Low monthly", headline: "Spread it further", details: "Stretch a larger repair over a longer term with predictable low monthly payments.", tag: "Lowest payment", highlight: false },
      ],
      calloutTitle: "Unexpected repair?",
      calloutBody: "If a fault has come out of nowhere, finance can spread the cost so your car gets fixed now and paid for over time.",
      faqLabel: "Finance questions",
      faqHeading: "What drivers ask about spreading the cost",
      faq: [
        { q: "Does checking my options hurt my credit?", a: "No. The pre-qualification is a soft search with no impact on your credit score." },
        { q: "What size of repair can I spread?", a: "Finance is best suited to larger jobs such as clutches, cambelts and major repairs. Ask us when we give you the quote." },
        { q: "How fast is approval?", a: "Most drivers get a decision in just a few minutes." },
      ],
      ctaFootnote: "Finance provided through authorised third-party lenders. Subject to status and credit approval. Grayson Auto Works acts as a credit broker, not a lender.",
    },
  },

  credit: { agency: "AI Partner Method", url: null },
};

export default brandDNA;
