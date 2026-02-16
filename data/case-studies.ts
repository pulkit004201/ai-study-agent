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
  }
];
