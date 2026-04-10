export type TraderType = 'swing' | 'intraday' | 'scalper';
export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | 'Daily' | 'Weekly';
export type Direction = 'long' | 'short';
export type TradeResult = 'win' | 'loss' | 'pending';
export type StrategyName = 'liquidity' | 'retail';

export interface UserSettings {
  traderType: TraderType;
  timeframeUsed: Timeframe;
  pairsTraded: string;
  htfTimeframe: Timeframe;
  structureTimeframe: Timeframe;
  entryTimeframe: Timeframe;
  confirmationTimeframe: Timeframe;
  riskPerTrade: number;
  maxDailyTrades: number;
  maxRunningTrades: number;
  maxWeeklyTrades: number;
  maxWeeklyLossPercent: number;
  tradingRulesText: string;
  breakevenRulesText: string;
  partialsRulesText: string;
  activeStrategy: StrategyName;
  onboardingCompleted: boolean;
  lockedUntil: string | null;
  weeklyLossLockUntil: string | null;
}

export interface Trade {
  id: number;
  pair: string;
  direction: Direction;
  entry: number;
  exit: number | null;
  riskPercent: number;
  result: TradeResult;
  notes: string;
  isBacktest: boolean;
  strategyName: StrategyName;
  confirmedChecklist: Record<string, boolean>;
  createdAt: string;
}

export interface KeyLevel {
  id: number;
  pair: string;
  price: number;
  notes: string;
  createdAt: string;
}

export const LIQUIDITY_CHECKLIST: string[] = [
  "Identified buy/sell side liquidity",
  "Confirmed displacement",
  "Order block or FVG identified",
  "Mitigation occurred",
  "CHoCH confirmed on entry timeframe"
];

export const RETAIL_CHECKLIST: string[] = [
  "Trend direction confirmed (higher highs/lower lows)",
  "Support/resistance level identified",
  "Candle pattern confirmation",
  "RSI not overbought/oversold (if applicable)",
  "News check (no high impact 30 min before/after)"
];