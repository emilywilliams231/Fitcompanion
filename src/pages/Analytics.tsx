import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trade } from "@/types/trading";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from "recharts";
import { TrendingUp, Target, BarChart3, PieChart as PieIcon, Loader2 } from "lucide-react";

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

const Analytics = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_backtest', false)
      .order('created_at', { ascending: true });

    if (data) setTrades(data);
    setLoading(false);
  };

  // Process data for charts
  const completedTrades = trades.filter(t => t.result !== 'pending');
  
  // 1. Win/Loss Distribution
  const winLossData = [
    { name: 'Wins', value: completedTrades.filter(t => t.result === 'win').length },
    { name: 'Losses', value: completedTrades.filter(t => t.result === 'loss').length },
  ];

  // 2. Performance by Pair
  const pairStats = completedTrades.reduce((acc: any, trade) => {
    if (!acc[trade.pair]) acc[trade.pair] = { pair: trade.pair, wins: 0, total: 0 };
    acc[trade.pair].total += 1;
    if (trade.result === 'win') acc[trade.pair].wins += 1;
    return acc;
  }, {});

  const pairData = Object.values(pairStats).map((p: any) => ({
    pair: p.pair,
    winRate: Math.round((p.wins / p.total) * 100),
    total: p.total
  })).sort((a, b) => b.total - a.total);

  // 3. Equity Curve (Simplified: cumulative R-multiple)
  let cumulativeR = 0;
  const equityData = completedTrades.map((t, i) => {
    // Assuming 1:2 RR for wins for visualization if not specified, 
    // but here we just use riskPercent as a proxy for 1R
    const outcome = t.result === 'win' ? 2 : -1; // Simplified 1:2 RR
    cumulativeR += outcome;
    return {
      trade: i + 1,
      r: cumulativeR,
      date: new Date(t.createdAt).toLocaleDateString()
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 md:pt-20">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-500/10 p-2 rounded-xl">
              <BarChart3 className="w-6 h-6 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          </div>
          <p className="text-slate-400">Deep dive into your trading edge and consistency.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Equity Curve */}
          <Card className="bg-slate-900 border-slate-800 text-white lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Cumulative R-Multiple
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={equityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="trade" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Line type="monotone" dataKey="r" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Win Rate by Pair */}
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-blue-500" />
                Win Rate by Pair (%)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pairData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="pair" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                  />
                  <Bar dataKey="winRate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Win/Loss Distribution */}
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PieIcon className="w-5 h-5 text-purple-500" />
                Outcome Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={winLossData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {winLossData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;