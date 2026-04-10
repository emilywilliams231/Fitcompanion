import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { TradeForm } from "@/components/trading/TradeForm";
import { BacktestToggle } from "@/components/trading/BacktestToggle";
import { RulesDisplay } from "@/components/trading/RulesDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutGrid } from "lucide-react";

const JournalRetail = () => {
  const [isBacktest, setIsBacktest] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 md:pt-20">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Retail Journal</h1>
            <p className="text-slate-400">S/R, Trendlines, and Indicators focus.</p>
          </div>
          <BacktestToggle isBacktest={isBacktest} onToggle={setIsBacktest} />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-slate-900 border-slate-800 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-purple-500" />
                  New Retail Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TradeForm 
                  strategyType="retail" 
                  isBacktest={isBacktest} 
                  onSuccess={() => {}} 
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold">Trading Rules</h2>
            {profile && (
              <RulesDisplay 
                rules={{
                  trading: profile.trading_rules_text,
                  breakeven: profile.breakeven_rules_text,
                  partials: profile.partials_rules_text
                }} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalRetail;