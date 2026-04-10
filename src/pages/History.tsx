import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { TradeCard } from "@/components/trading/TradeCard";
import { LossReflectionModal } from "@/components/trading/LossReflectionModal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trade } from "@/types/trading";
import { Search, Filter, BookOpen, Loader2 } from "lucide-react";

const History = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [reflectionTradeId, setReflectionTradeId] = useState<number | null>(null);

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
      .order('created_at', { ascending: false });

    if (data) setTrades(data);
    setLoading(false);
  };

  const filteredTrades = trades.filter(t => {
    const matchesSearch = t.pair.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || t.result === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 md:pt-20">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-500/10 p-2 rounded-xl">
              <BookOpen className="w-6 h-6 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold">Trade History</h1>
          </div>
          <p className="text-slate-400">Review your past performance and reflections.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input 
              placeholder="Search pairs..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-800"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[140px] bg-slate-900 border-slate-800">
                <Filter className="w-4 h-4 mr-2 text-slate-500" />
                <SelectValue placeholder="Result" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="win">Wins</SelectItem>
                <SelectItem value="loss">Losses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
        ) : filteredTrades.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
            <p className="text-slate-500">No trades found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTrades.map(trade => (
              <TradeCard 
                key={trade.id} 
                trade={trade} 
                onUpdate={fetchTrades}
                onLoss={(id) => setReflectionTradeId(id)}
              />
            ))}
          </div>
        )}
      </div>

      <LossReflectionModal 
        tradeId={reflectionTradeId}
        isOpen={!!reflectionTradeId}
        onClose={() => setReflectionTradeId(null)}
        onSuccess={fetchTrades}
      />
    </div>
  );
};

export default History;