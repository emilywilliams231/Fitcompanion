import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trade } from "@/types/trading";
import { format } from "date-fns";
import { 
  TrendingUp, TrendingDown, Clock, Globe, BrainCircuit, 
  CheckCircle2, ChevronLeft, MessageSquare, Target, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

const TradeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrade();
  }, [id]);

  const fetchTrade = async () => {
    const { data } = await supabase
      .from('trades')
      .select('*')
      .eq('id', id)
      .single();

    if (data) setTrade(data);
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Clock className="animate-spin text-blue-500" /></div>;
  if (!trade) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Trade not found.</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 md:pt-20">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6 text-slate-400 hover:text-white"
        >
          <ChevronLeft className="mr-2 w-4 h-4" />
          Back to History
        </Button>

        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-4 rounded-2xl",
              trade.direction === 'long' ? "bg-blue-500/10 text-blue-500" : "bg-red-500/10 text-red-500"
            )}>
              {trade.direction === 'long' ? <TrendingUp size={32} /> : <TrendingDown size={32} />}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-4xl font-black tracking-tight">{trade.pair}</h1>
                <Badge className={cn(
                  "capitalize text-sm px-3 py-1",
                  trade.result === 'win' ? "bg-green-500/20 text-green-500 border-green-500/20" :
                  trade.result === 'loss' ? "bg-red-500/20 text-red-500 border-red-500/20" :
                  "bg-slate-800 text-slate-400 border-slate-700"
                )}>
                  {trade.result}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-slate-400 text-sm">
                <span className="flex items-center gap-1"><Clock size={14} /> {format(new Date(trade.createdAt), 'PPP p')}</span>
                <span className="flex items-center gap-1 capitalize"><Globe size={14} /> {trade.session.replace('_', ' ')} Session</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Risk Exposure</p>
            <p className="text-3xl font-black text-blue-500">{trade.riskPercent}%</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardContent className="p-4">
              <p className="text-[10px] uppercase text-slate-500 font-bold mb-2">Entry Price</p>
              <p className="text-xl font-mono font-bold">{trade.entry}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardContent className="p-4">
              <p className="text-[10px] uppercase text-slate-500 font-bold mb-2">Exit Price</p>
              <p className="text-xl font-mono font-bold">{trade.exit || '---'}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardContent className="p-4">
              <p className="text-[10px] uppercase text-slate-500 font-bold mb-2">Strategy</p>
              <p className="text-xl font-bold capitalize">{trade.strategyName}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                Confirmation Checklist
              </h2>
              <div className="space-y-2 bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                {Object.entries(trade.confirmedChecklist).map(([item, checked]) => (
                  <div key={item} className="flex items-center gap-3 py-2 border-b border-slate-800/50 last:border-0">
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center",
                      checked ? "bg-green-500/20 text-green-500" : "bg-slate-800 text-slate-600"
                    )}>
                      <CheckCircle2 size={14} />
                    </div>
                    <span className={cn("text-sm", checked ? "text-slate-200" : "text-slate-500 line-through")}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-purple-500" />
                Psychology & Mood
              </h2>
              <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 flex items-center gap-4">
                <div className="bg-purple-500/10 p-4 rounded-2xl">
                  <BrainCircuit className="w-8 h-8 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500 font-bold mb-1">Mindset during entry</p>
                  <p className="text-2xl font-black capitalize text-purple-400">{trade.mood}</p>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                Trade Notes
              </h2>
              <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 min-h-[200px]">
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap italic">
                  {trade.notes || "No notes provided for this trade."}
                </p>
              </div>
            </section>

            {trade.screenshotUrl && (
              <section className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Setup Screenshot
                </h2>
                <div className="rounded-3xl overflow-hidden border border-slate-800">
                  <img src={trade.screenshotUrl} alt="Trade Setup" className="w-full h-auto" />
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeDetails;