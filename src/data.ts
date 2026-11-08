import { AppState } from "./types";

export const initialAppState: AppState = {
  user: {
    name: "Emeka Okonkwo",
    initials: "EO",
    location: "Akwa Ibom",
    farmType: "Cassava & Yam",
    farmSize: "2 acres",
    phone: "+234 801 234 5678",
    language: "English"
  },
  climate: {
    riskScore: 88,
    riskLevel: "High Risk",
    lastUpdated: "Today 6:00 AM"
  },
  vault: {
    totalSaved: 75000,
    climateReserves: 38000,
    activeGoals: 5,
    fundedPercent: 52,
    totalTarget: 145000,
    goals: [
      { id: 1, name: "Flood Recovery Fund", icon: "🩸", saved: 30000, target: 30000, category: "Emergency", climate: true, complete: true },
      { id: 2, name: "Drought Protection Fund", icon: "🛡️", saved: 0, target: 25000, category: "Emergency", climate: true, complete: false },
      { id: 3, name: "Farm Inputs", icon: "🌿", saved: 22000, target: 50000, category: "Farm", climate: false, complete: false },
      { id: 4, name: "Livestock Protection", icon: "🐾", saved: 8000, target: 25000, category: "Livestock", climate: true, complete: false },
      { id: 5, name: "Emergency Savings", icon: "🔴", saved: 15000, target: 15000, category: "Emergency", climate: false, complete: true }
    ]
  },
  connectivity: { 
    online: true, 
    pendingTransfer: true, 
    pendingAmount: 30000, 
    pendingFund: "Flood Recovery Fund" 
  },
  alerts: [
    { 
      id: 1, 
      type: "Flood", 
      severity: "WARNING", 
      color: "red", 
      title: "Flood Alert — 3 Days", 
      location: "Akwa Ibom", 
      description: "Heavy rainfall expected in Akwa Ibom. River levels rising. High flood risk for low-lying farmland.", 
      recommendation: "Allocate ₦30,000 to Flood Recovery Fund immediately", 
      deadline: "Act by Thursday, Jun 18", 
      communityReports: 7, 
      amount: 30000, 
      fund: "Flood Recovery Fund" 
    },
    { 
      id: 2, 
      type: "Drought", 
      severity: "WATCH", 
      color: "orange", 
      title: "Drought Watch — Next Month", 
      location: "Kano State", 
      description: "Below-average rainfall predicted for July. Drought conditions likely in northern zones.", 
      recommendation: "Begin Drought Protection Fund. Save ₦15,000", 
      deadline: "Act by July 10", 
      communityReports: 3, 
      amount: 15000, 
      fund: "Drought Protection Fund" 
    }
  ],
  communityReports: [
    { id: 1, type: "Flooding", icon: "🩸", location: "Uyo, Akwa Ibom", description: "Flooding near Eket road. Roads partially blocked.", reporter: "Abiodun F.", time: "2h ago", verified: 5, status: "WARNING" },
    { id: 2, type: "Crop Disease", icon: "🦠", location: "Ibadan, Oyo", description: "Cassava mosaic disease spreading in Moniya area", reporter: "Chidi O.", time: "5h ago", verified: 2, status: "WATCH" }
  ],
  advisor: { messages: [] },
  currentAlert: null,
  currentGoal: null
};

export interface LearningArticle {
  id: string;
  title: string;
  emoji: string;
  category: string;
  readTime: string;
  paragraphs: string[];
  tips: string[];
  hasRelatedAlert: boolean;
  relatedAlertText?: string;
  prefilledQuestion: string;
}

export const learningArticles: LearningArticle[] = [
  {
    id: "flood-preparedness",
    title: "Flood Preparedness",
    emoji: "🌊",
    category: "Emergency Planning",
    readTime: "5 min read",
    paragraphs: [
      "Flooding is one of the most critical weather hazards for farmers in rural Nigeria, particularly in southern states like Akwa Ibom. Heavy seasonal downpours can swell rivers and submerge farmland within hours, risking entire harvests of cassava, yam, and other root crops.",
      "Early preparation is key to safeguarding your farm's economic value. Clearing drainage channels, reinforcing embankments around low-lying soil patches, and creating flood runoff channels can significantly prevent water stagnation. Waterlogged soil cuts off oxygen to roots, leading to rot within 48 to 72 hours.",
      "Financial resilience is your second shield. If a flood warning is issued, quickly harvesting mature tubers can salvage key assets. Having immediate financial liquidity through your ClimaVault Flood Recovery Fund allows you to hire local help to speed up emergency harvesting and quickly purchase elevated store silos."
    ],
    tips: [
      "Dig 30cm deep run-off channels around your root crop beds to guide excess water away.",
      "Pre-arrange emergency labor using a dedicated contingency savings channel.",
      "Store harvested crops on elevated platforms at least 1.5 meters above maximum historically recorded flood levels."
    ],
    hasRelatedAlert: true,
    relatedAlertText: "⚠️ Flood warning active in Akwa Ibom. Protect your Cassava and Yam farm now.",
    prefilledQuestion: "What are the key emergency harvesting steps for cassava when a flood is 3 days away?"
  },
  {
    id: "drought-management",
    title: "Drought Management",
    emoji: "☀️",
    category: "Resilience",
    readTime: "6 min read",
    paragraphs: [
      "Droughts present a slow-onset but high-impact challenge, especially in Northern Nigeria. When rain stops for extended periods, crop water stress accumulates, halting photosynthesis and drastically shrinking yields.",
      "To counter drought risk, practicing conservation tillage and heavy surface mulching is highly beneficial. Laying organic waste (such as cassava peels or maize husks) over root systems blocks sunlight from raising ground temperature and traps residual moisture in the soil.",
      "A dedicated Drought Protection savings fund helps you acquire drip hoses, organic soil conditioners, or resilient drought-tolerant seed varieties for subsequent seasons when local weather stations predict extended dry spells."
    ],
    tips: [
      "Apply thick mulches of organic stubble around the base of major crops to cut evaporation by 40%.",
      "Adopt minimum tillage practices to preserve underground water retention networks.",
      "Build dynamic savings goals to acquire automated micro-irrigation kits before dry season peaks."
    ],
    hasRelatedAlert: false,
    prefilledQuestion: "How can I set up organic mulching for my farm to survive dry conditions?"
  },
  {
    id: "climate-smart-agriculture",
    title: "Climate-Smart Agriculture",
    emoji: "🌿",
    category: "Sustainable Farming",
    readTime: "7 min read",
    paragraphs: [
      "Climate-Smart Agriculture (CSA) combines ecological crop management with local weather intelligence to boost productivity, adapt to changing weather, and reduce environmental footprints.",
      "Key CSA practices include agroforestry (planting beneficial trees alongside field crops to cast shade and capture nitrogen), crop rotation, and precise organic fertilization. By shifting crop arrangements yearly, soil pests are disrupted naturally and nutrient depletion is minimized.",
      "Syncing planting times with seasonal NiMet weather predictions using ClimaVault alerts prevents dry planting failures and heavy seed washouts from unexpected heavy rainfall."
    ],
    tips: [
      "Intercrop nitrogen-fixing leguminous plants like cowpeas or soybeans to fertilize soils naturally.",
      "Use composted manure targeted around individual plant roots rather than broadcasting over wide sheets.",
      "Form clean savings targets to transition key acreage into high-yield, climate-smart certified seed variations."
    ],
    hasRelatedAlert: false,
    prefilledQuestion: "Tell me how to start an intercropping scheme with cassava and cowpeas."
  },
  {
    id: "livestock-management",
    title: "Livestock Management",
    emoji: "🐄",
    category: "General Protection",
    readTime: "4 min read",
    paragraphs: [
      "Extreme heat and wet cycles endanger livestock through heat stroke, waterborne infections, and parasite surges. Small ruminants like goats and sheep are especially vulnerable during intensive wet spells.",
      "Creating raised, well-ventilated housing protects herds from foot rot, a common condition when livestock stand in mud. Ensure sheds are dry and disinfect structural surfaces regularly.",
      "A livestock emergency fund ensures you have immediate funds available via OPay for essential vaccines, feed supplements, and emergency veterinary services when localized alerts warn of disease outbreaks."
    ],
    tips: [
      "Elevate localized pen floors using bamboo or wood planks to isolate animals from floor water.",
      "Maintain a 30-day stockpiled dry fodder reserve to feed animals when flooded fields block pasture access.",
      "Keep standard vaccination schedules up-to-date, especially before the onset of heavy rainy seasons."
    ],
    hasRelatedAlert: false,
    prefilledQuestion: "What veterinary medicines should I stock up on before a major rainy season?"
  },
  {
    id: "disaster-recovery",
    title: "Disaster Recovery",
    emoji: "🏗️",
    category: "Emergency Planning",
    readTime: "5 min read",
    paragraphs: [
      "When extreme weather hits, the speed of recovery dictates a household's long-term vulnerability. Delaying farm rehabilitation can cause permanent crop rot and secondary feed rot, pushing families into debt.",
      "The recovery lifecycle starts with immediate structural audit: drain fields, salvage root crops, and clear mud from access roads. High-priority repair includes barns, seed banks, and storage silos.",
      "With ClimaVault and OPay, your pre-funded emergency accounts ensure immediate cash availability to re-purchase materials, seed stock, and labor, avoiding high-interest localized lending traps."
    ],
    tips: [
      "Take time to document crop and structure damage through photos to request certified insurance claims.",
      "Focus field clearance on surviving plants first, cutting away dead rot to stop mold outbreaks.",
      "Keep emergency savings fully synchronized on ClimaVault to trigger self-sufficient recovery instantly."
    ],
    hasRelatedAlert: false,
    prefilledQuestion: "How do I make an insurance claim using my photographs of flood damage?"
  },
  {
    id: "crop-selection-guide",
    title: "Crop Selection Guide",
    emoji: "🌾",
    category: "Sustainable Farming",
    readTime: "6 min read",
    paragraphs: [
      "Choosing what to grow is the most vital decision a farmer makes. Cultivating ancient cultivars alongside newly certified hybrid varieties provides a strong natural hedge against climate shifts.",
      "Certified cassava stems, like those developed by IITA, offer exceptional resistance to mosaic viruses and high starch yields, even in low-nutrient soil. Likewise, early-maturing white yams require less water than traditional late-stage varieties.",
      "Match your farm's crop selections to seasonal rain length. When projections indicate short seasons, prioritize fast-maturing crops over high-input configurations."
    ],
    tips: [
      "Prioritise certified disease-resistant species sourced through reputable aggregators.",
      "Keep a balanced crop portfolio with both long-term tubers and short-term vegetables for steady income.",
      "Consult ClimaVault's AI advisor on seed options matched to your exact location."
    ],
    hasRelatedAlert: false,
    prefilledQuestion: "Which certified cassava varieties should I buy for high rainfall regions like Akwa Ibom?"
  }
];
