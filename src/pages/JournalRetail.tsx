import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { TradeForm } from "@/components/trading/TradeForm";
import { BacktestToggle } from "@/components/trading/BacktestToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutGrid } from "lucide-react";

const JournalRetail = () => {
  const [isBacktest, setIsBacktest] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 md:pt-20">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Retail Journal</h1>
            <p className="text-slate-400">S/R, Trendlines, and Indicators focus.</p>
          </div>
          <BacktestToggle isBacktest={isBacktest} onToggle={setIsBacktest} />
        </header>

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
    </div>
  );
};

export default JournalRetail;