import type { BlogPost } from "@/types/blog";

const DETAILED_TRADING_BLOCK = `
  <h2>Market Context Before Execution</h2>
  <p>Always start by identifying whether the market is trending, range-bound, or highly volatile. The same setup behaves differently in each condition. A trending day rewards continuation entries, while a choppy day punishes late breakouts.</p>
  <h2>Step-by-Step Execution Framework</h2>
  <ol>
    <li>Mark critical higher-timeframe levels from daily and hourly charts.</li>
    <li>Create two scenarios: bullish continuation and bearish rejection.</li>
    <li>Decide exact entry trigger, invalidation point, and profit target before execution.</li>
    <li>Size position according to fixed risk, not confidence level.</li>
  </ol>
  <h2>Risk Management Rules</h2>
  <p>Cap risk per trade and cap total daily loss. If your daily stop is hit, stop trading. This single rule protects capital from emotional revenge trading and keeps your strategy statistically valid over a large sample size.</p>
  <h2>Post-Trade Review Checklist</h2>
  <ul>
    <li>Did the trade match your written setup?</li>
    <li>Was your stop-loss respected without adjustment?</li>
    <li>Did you exit according to plan or emotion?</li>
    <li>What one process improvement can you apply tomorrow?</li>
  </ul>
  <p>Use these review notes to improve process quality. Strong process compounds faster than random high-risk wins.</p>
`;

export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: "mock-001",
    slug: "market-open-checklist-for-busy-traders",
    title: "Market Open Checklist for Busy Traders",
    keywords: ["Market", "Featured"],
    excerpt:
      "A practical morning checklist to scan trend, volume, and risk before placing your first trade.",
    content: `
      <p>The first 20 minutes of market open are noisy. A repeatable checklist helps you avoid impulsive entries.</p>
      <h2>Step 1: Track Index Direction</h2>
      <p>Start with NIFTY and BANKNIFTY direction on the 5-minute chart. Mark overnight high and low.</p>
      <h2>Step 2: Watch Relative Strength</h2>
      <p>Create a small watchlist and compare stocks against index movement. Strong stocks during weak index phases often become momentum leaders.</p>
      <h2>Step 3: Define Risk First</h2>
      <ul>
        <li>Set stop-loss before entry</li>
        <li>Risk only a fixed amount per trade</li>
        <li>Avoid averaging losing positions</li>
      </ul>
      <p>Discipline at open usually decides the quality of your full trading day.</p>
      ${DETAILED_TRADING_BLOCK}
    `,
    featuredImage: "/admin.jpg",
    publishedAt: "2026-02-27T05:30:00.000Z",
    updatedAt: null,
    seoTitle: "Market Open Checklist for Traders",
    seoDescription:
      "Use this simple market-open checklist to make disciplined and lower-risk trading decisions.",
    seoImage: "/admin.jpg",
  },
  {
    id: "mock-002",
    slug: "how-to-read-candles-with-context",
    title: "How to Read Candles With Context",
    keywords: ["Best stocks", "Advisory"],
    excerpt:
      "Candles are useful only when combined with trend and structure. Learn the context-first approach.",
    content: `
      <p>A single candle pattern is not enough to take a trade. Always combine pattern, location, and trend context.</p>
      <h2>Trend + Level + Trigger</h2>
      <p>Use this three-part framework. Trend decides bias, level decides area, and candle trigger decides timing.</p>
      <h2>Common Mistake</h2>
      <p>Traders often buy a bullish candle directly into resistance. Context prevents this avoidable error.</p>
      <p>Keep charts clean and decisions rule-based.</p>
      ${DETAILED_TRADING_BLOCK}
    `,
    featuredImage: "/journey.jpg",
    publishedAt: "2026-02-26T05:30:00.000Z",
    updatedAt: null,
    seoTitle: "Candlestick Reading With Context",
    seoDescription:
      "A context-first method to use candlestick patterns effectively for intraday and swing trades.",
    seoImage: "/journey.jpg",
  },
  {
    id: "mock-003",
    slug: "position-sizing-made-simple",
    title: "Position Sizing Made Simple",
    keywords: ["Advisory", "Market"],
    excerpt:
      "Most losses come from oversizing. Use a fixed-risk model to survive and grow in volatile markets.",
    content: `
      <p>Good entries still fail if size is wrong. Position sizing is your first line of protection.</p>
      <h2>Formula</h2>
      <p>Position Size = Max Risk Per Trade / (Entry Price - Stop Loss).</p>
      <h2>Why It Matters</h2>
      <p>Small controlled losses are part of a healthy trading process. Large losses usually come from emotional sizing.</p>
      <p>Consistency in sizing helps maintain capital and confidence.</p>
      ${DETAILED_TRADING_BLOCK}
    `,
    featuredImage: "/equity1.jpg",
    publishedAt: "2026-02-25T05:30:00.000Z",
    updatedAt: null,
    seoTitle: "Position Sizing Strategy for Retail Traders",
    seoDescription:
      "Learn a straightforward position sizing method to reduce drawdowns and improve consistency.",
    seoImage: "/equity1.jpg",
  },
  {
    id: "mock-004",
    slug: "swing-trading-setup-for-working-professionals",
    title: "Swing Trading Setup for Working Professionals",
    keywords: ["Best stocks", "Featured"],
    excerpt:
      "A low-maintenance setup for traders who cannot watch charts all day.",
    content: `
      <p>Swing trading fits traders who have limited screen time.</p>
      <h2>Timeframes</h2>
      <p>Use daily chart for trend and 1-hour chart for execution.</p>
      <h2>Selection Rules</h2>
      <ul>
        <li>Price above 20 EMA and 50 EMA</li>
        <li>Volume expansion on breakout candle</li>
        <li>Risk-reward at least 1:2</li>
      </ul>
      <p>This setup helps you trade with structure instead of constant monitoring.</p>
      ${DETAILED_TRADING_BLOCK}
    `,
    featuredImage: "/service1.jpg",
    publishedAt: "2026-02-24T05:30:00.000Z",
    updatedAt: null,
    seoTitle: "Simple Swing Trading Setup",
    seoDescription:
      "A practical swing trading framework designed for full-time working professionals.",
    seoImage: "/service1.jpg",
  },
  {
    id: "mock-005",
    slug: "building-a-weekly-trading-routine",
    title: "Building a Weekly Trading Routine",
    keywords: ["Advisory", "Business"],
    excerpt:
      "Use this Sunday-to-Friday routine to improve preparation, execution, and review quality.",
    content: `
      <p>Routines reduce stress and increase consistency.</p>
      <h2>Weekend Prep</h2>
      <p>Review higher timeframe charts, build watchlist, and define key levels.</p>
      <h2>Daily Process</h2>
      <p>Before market open: plan trades. After market close: update journal and mistakes.</p>
      <p>Weekly review highlights what to stop, start, and continue.</p>
      ${DETAILED_TRADING_BLOCK}
    `,
    featuredImage: "/service12.jpg",
    publishedAt: "2026-02-23T05:30:00.000Z",
    updatedAt: null,
    seoTitle: "Weekly Trading Routine for Better Discipline",
    seoDescription:
      "A weekly process to improve your decision quality and reduce emotional trading.",
    seoImage: "/service12.jpg",
  },
  {
    id: "mock-006",
    slug: "risk-reward-explained-with-real-examples",
    title: "Risk-Reward Explained With Real Examples",
    keywords: ["Advisory", "Market"],
    excerpt:
      "Why a strong risk-reward ratio matters more than a high win rate over the long run.",
    content: `
      <p>Many profitable traders have average win rates. The difference is risk-reward discipline.</p>
      <h2>Example</h2>
      <p>With 45% win rate and 1:2 risk-reward, your expectancy can still stay positive.</p>
      <h2>Execution Tip</h2>
      <p>Predefine targets before entry instead of deciding targets emotionally after price moves.</p>
      ${DETAILED_TRADING_BLOCK}
    `,
    featuredImage: "/service14.jpg",
    publishedAt: "2026-02-22T05:30:00.000Z",
    updatedAt: null,
    seoTitle: "Risk Reward Ratio in Trading",
    seoDescription:
      "Understand expectancy and risk-reward with simple real-world trading examples.",
    seoImage: "/service14.jpg",
  },
  {
    id: "mock-007",
    slug: "top-mistakes-new-option-buyers-make",
    title: "Top Mistakes New Option Buyers Make",
    keywords: ["Ipo", "Market"],
    excerpt:
      "Avoid common beginner errors in options, from chasing premium to ignoring volatility.",
    content: `
      <p>Options can move fast, but poor structure can drain capital equally fast.</p>
      <h2>Three Common Errors</h2>
      <ul>
        <li>Buying far OTM options without a setup</li>
        <li>Ignoring time decay near expiry</li>
        <li>No stop-loss after entry</li>
      </ul>
      <p>Trade options with clear thesis, defined invalidation, and position size control.</p>
      ${DETAILED_TRADING_BLOCK}
    `,
    featuredImage: "/service15.jpg",
    publishedAt: "2026-02-21T05:30:00.000Z",
    updatedAt: null,
    seoTitle: "Option Buying Mistakes to Avoid",
    seoDescription:
      "A checklist of common option buying mistakes and how retail traders can avoid them.",
    seoImage: "/service15.jpg",
  },
  {
    id: "mock-008",
    slug: "intraday-journal-template-you-can-use",
    title: "Intraday Journal Template You Can Use",
    keywords: ["Advisory", "News"],
    excerpt:
      "Track entries, exits, and psychology using a compact journal format that improves every week.",
    content: `
      <p>Journaling is not optional if you want repeatable performance.</p>
      <h2>What to Record</h2>
      <ul>
        <li>Setup type and market condition</li>
        <li>Entry reason and stop-loss location</li>
        <li>Emotion before and after trade</li>
      </ul>
      <p>Reviewing journal notes weekly often reveals fixable process mistakes.</p>
      ${DETAILED_TRADING_BLOCK}
    `,
    featuredImage: "/contact1.jpg",
    publishedAt: "2026-02-20T05:30:00.000Z",
    updatedAt: null,
    seoTitle: "Intraday Trading Journal Template",
    seoDescription:
      "A simple journal format to track trades, emotions, and improvements for intraday traders.",
    seoImage: "/contact1.jpg",
  },
  {
    id: "mock-009",
    slug: "support-and-resistance-that-actually-works",
    title: "Support and Resistance That Actually Works",
    keywords: ["Best stocks", "Price action"],
    excerpt:
      "Draw fewer levels, focus on reaction zones, and avoid cluttered charts.",
    content: `
      <p>Too many lines create confusion. Use zones based on clear price reaction and volume.</p>
      <h2>How to Mark Zones</h2>
      <p>Start from higher timeframe, then refine on lower timeframe only when needed.</p>
      <h2>Practical Rule</h2>
      <p>If price touches a zone too many times, expect weaker reactions and potential breakout.</p>
      ${DETAILED_TRADING_BLOCK}
    `,
    featuredImage: "/nifty.png",
    publishedAt: "2026-02-19T05:30:00.000Z",
    updatedAt: null,
    seoTitle: "Support Resistance Strategy",
    seoDescription:
      "A practical support-resistance method for cleaner charts and better timing.",
    seoImage: "/nifty.png",
  },
  {
    id: "mock-010",
    slug: "discipline-habits-that-separate-profitable-traders",
    title: "Discipline Habits That Separate Profitable Traders",
    keywords: ["Advisory", "Featured"],
    excerpt:
      "Process, not prediction, is what keeps profitable traders consistent in uncertain markets.",
    content: `
      <p>Profitability is mostly process quality under pressure.</p>
      <h2>Core Habits</h2>
      <ul>
        <li>Trade only predefined setups</li>
        <li>Pause after two consecutive losses</li>
        <li>Review all mistakes before next session</li>
      </ul>
      <p>Build habits first. Performance follows.</p>
      ${DETAILED_TRADING_BLOCK}
    `,
    featuredImage: "/vision11.jpg",
    publishedAt: "2026-02-18T05:30:00.000Z",
    updatedAt: null,
    seoTitle: "Trading Discipline Habits",
    seoDescription:
      "Practical trading discipline habits that reduce emotional decisions and improve consistency.",
    seoImage: "/vision11.jpg",
  },
];
