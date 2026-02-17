export type CaseStudy = {
  company: string;
  industry: string;
  problem: string;
  solution: string;
  impact: string;
  source: string;
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    company: "Netflix",
    industry: "Entertainment",
    problem:
      "Users struggled to discover relevant content, increasing churn.",
    solution:
      "Netflix uses ML-based recommendation systems trained on viewing history, preferences, and behavior.",
    impact:
      "Over 80% of content watched is driven by recommendations, reducing churn significantly.",
    source:
      "https://netflixtechblog.com"
  },
  {
    company: "Amazon",
    industry: "E-commerce",
    problem:
      "Low product discovery across millions of SKUs.",
    solution:
      "Collaborative filtering and ranking models personalize product recommendations.",
    impact:
      "Recommendations contribute to ~35% of total revenue.",
    source:
      "https://www.aboutamazon.com"
  },
  {
    company: "Uber",
    industry: "Mobility",
    problem:
      "Demand-supply mismatch causing long wait times.",
    solution:
      "AI models predict rider demand and dynamically adjust pricing and driver allocation.",
    impact:
      "Reduced ETA and improved driver utilization.",
    source:
      "https://eng.uber.com"
  },
  {
    company: "Spotify",
    industry: "Music Streaming",
    problem:
      "Users had difficulty discovering new tracks aligned with their taste.",
    solution:
      "Recommendation models combine listening history, collaborative filtering, and audio feature embeddings.",
    impact:
      "Higher session duration and stronger playlist engagement.",
    source:
      "https://engineering.atspotify.com"
  },
  {
    company: "YouTube",
    industry: "Video Platforms",
    problem:
      "Massive content volume made relevant recommendations difficult.",
    solution:
      "Deep learning ranking systems personalize home feed and suggested videos.",
    impact:
      "Improved watch time and user retention.",
    source:
      "https://research.google"
  },
  {
    company: "Airbnb",
    industry: "Travel",
    problem:
      "Guests struggled to find the best listings based on intent and constraints.",
    solution:
      "Search ranking and personalization models optimize listing relevance and conversion.",
    impact:
      "Better booking conversion and user satisfaction.",
    source:
      "https://airbnb.tech"
  },
  {
    company: "LinkedIn",
    industry: "Professional Networking",
    problem:
      "Members missed relevant jobs and connections in a large network.",
    solution:
      "Graph-based ML and ranking models personalize feed, jobs, and people recommendations.",
    impact:
      "Increased job application and content engagement rates.",
    source:
      "https://engineering.linkedin.com"
  },
  {
    company: "Duolingo",
    industry: "EdTech",
    problem:
      "Learners dropped off due to lessons being too easy or too hard.",
    solution:
      "Adaptive learning models personalize lesson difficulty and review timing.",
    impact:
      "Higher lesson completion and long-term retention.",
    source:
      "https://blog.duolingo.com"
  },
  {
    company: "Pinterest",
    industry: "Social Discovery",
    problem:
      "Users needed more relevant visual inspiration quickly.",
    solution:
      "Computer vision and ranking models personalize pin recommendations.",
    impact:
      "More saves, clicks, and session depth.",
    source:
      "https://medium.com/pinterest-engineering"
  },
  {
    company: "Meta",
    industry: "Social Media",
    problem:
      "Feed ranking needed to prioritize meaningful and relevant content.",
    solution:
      "Multi-objective ranking models evaluate thousands of signals in real time.",
    impact:
      "Improved feed relevance and user engagement quality.",
    source:
      "https://ai.meta.com"
  },
  {
    company: "Google Maps",
    industry: "Navigation",
    problem:
      "Users needed accurate ETAs despite dynamic traffic patterns.",
    solution:
      "ML models predict traffic flow and route travel times from historical and live signals.",
    impact:
      "More accurate ETAs and better route recommendations.",
    source:
      "https://blog.google/products/maps"
  },
  {
    company: "Walmart",
    industry: "Retail",
    problem:
      "Forecasting demand across stores and categories was error-prone.",
    solution:
      "Time-series forecasting models improve inventory and replenishment planning.",
    impact:
      "Lower stockouts and reduced overstock costs.",
    source:
      "https://corporate.walmart.com"
  },
  {
    company: "Target",
    industry: "Retail",
    problem:
      "Dynamic pricing and promotions were hard to optimize at scale.",
    solution:
      "ML models estimate price elasticity and optimize promotional timing.",
    impact:
      "Better margin control and conversion uplift.",
    source:
      "https://tech.target.com"
  },
  {
    company: "PayPal",
    industry: "FinTech",
    problem:
      "High fraud risk in digital payments required real-time detection.",
    solution:
      "Anomaly detection and risk scoring models flag suspicious transactions.",
    impact:
      "Reduced fraud loss while minimizing false positives.",
    source:
      "https://www.paypal.com/stories"
  },
  {
    company: "Stripe",
    industry: "FinTech",
    problem:
      "Merchants lost revenue due to payment fraud and chargebacks.",
    solution:
      "AI risk models analyze transaction behavior to block fraudulent activity.",
    impact:
      "Higher authorization rates and lower fraud exposure.",
    source:
      "https://stripe.com/blog"
  },
  {
    company: "JPMorgan Chase",
    industry: "Banking",
    problem:
      "Large-scale document and contract analysis was slow and expensive.",
    solution:
      "NLP systems extract clauses and classify legal risk from financial documents.",
    impact:
      "Faster review cycles and reduced manual effort.",
    source:
      "https://www.jpmorgan.com/technology"
  },
  {
    company: "Mayo Clinic",
    industry: "Healthcare",
    problem:
      "Clinical teams needed faster support for diagnosis from imaging data.",
    solution:
      "Computer vision models assist radiology workflows by highlighting anomalies.",
    impact:
      "Improved triage speed and decision support quality.",
    source:
      "https://www.mayoclinic.org"
  },
  {
    company: "Pfizer",
    industry: "Pharma",
    problem:
      "Drug discovery pipelines were costly and time-consuming.",
    solution:
      "AI models prioritize candidate molecules and predict trial-relevant properties.",
    impact:
      "Shorter early-stage discovery cycles.",
    source:
      "https://www.pfizer.com/news"
  },
  {
    company: "Tesla",
    industry: "Automotive",
    problem:
      "Autonomous driving required robust perception in diverse road conditions.",
    solution:
      "Vision-based neural networks process camera streams for lane, object, and motion understanding.",
    impact:
      "Continuous performance improvements through fleet learning.",
    source:
      "https://www.tesla.com/AI"
  },
  {
    company: "Siemens",
    industry: "Manufacturing",
    problem:
      "Unplanned downtime increased maintenance costs in industrial equipment.",
    solution:
      "Predictive maintenance models detect anomalies from sensor telemetry.",
    impact:
      "Reduced downtime and improved asset reliability.",
    source:
      "https://www.siemens.com"
  },
  {
    company: "DHL",
    industry: "Logistics",
    problem:
      "Route planning and package sorting at scale required faster decisions.",
    solution:
      "AI optimizes routing, warehouse operations, and demand forecasting.",
    impact:
      "Lower delivery times and better network efficiency.",
    source:
      "https://www.dhl.com/global-en/home/innovation.html"
  },
  {
    company: "Adobe",
    industry: "Creative Software",
    problem:
      "Design workflows involved repetitive editing tasks.",
    solution:
      "Generative AI features automate content-aware edits and creative suggestions.",
    impact:
      "Faster production cycles for creators.",
    source:
      "https://blog.adobe.com"
  },
  {
    company: "Salesforce",
    industry: "Enterprise SaaS",
    problem:
      "Sales teams needed better lead prioritization and forecasting.",
    solution:
      "Predictive CRM models score leads and recommend next best actions.",
    impact:
      "Higher sales productivity and improved forecast accuracy.",
    source:
      "https://www.salesforce.com/news"
  },
  {
    company: "Zoom",
    industry: "Collaboration",
    problem:
      "Meeting content was hard to review and action post-call.",
    solution:
      "AI-generated summaries, transcripts, and action-item extraction streamline follow-up.",
    impact:
      "Reduced meeting overhead and faster decision cycles.",
    source:
      "https://blog.zoom.us"
  },
  {
    company: "Khan Academy",
    industry: "EdTech",
    problem:
      "Students needed individualized tutoring support outside class time.",
    solution:
      "AI tutoring assistants provide guided hints and personalized explanations.",
    impact:
      "Higher learner engagement and practice completion.",
    source:
      "https://blog.khanacademy.org"
  },
  {
    company: "Coursera",
    industry: "EdTech",
    problem:
      "Learners struggled to choose relevant courses and stay on track.",
    solution:
      "Recommendation and skill graph models personalize learning paths.",
    impact:
      "Improved enrollment-to-completion outcomes.",
    source:
      "https://blog.coursera.org"
  }
];
