import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Info } from "lucide-react";

export const RiskCalculator = () => {
  const [balance, setBalance] = useState("10000");
  const [riskPercent, setRiskPercent] = useState("1");
  const [stopLossPips, setStopLossPips] = useState("20");
  const [pipValue, setPipValue] = useState("10"); // Standard lot pip value for most pairs
  const [lotSize, setLotSize] = useState(0);
  const [riskAmount, setRiskAmount] = useState(0);

  useEffect(() => {
    const b = parseFloat(balance) || 0;
    const r = parseFloat(riskPercent) || 0;
    const sl = parseFloat(stopLossPips) || 0;
    const pv = parseFloat(pipValue) || 10;

    if (b > 0 && r > 0 && sl > 0) {
      const amount = (b * (r / 100));
      const lots = amount / (sl * pv);
      setRiskAmount(amount);
      setLotSize(Math.round(lots * 100) / 100);
    } else {
      setRiskAmount(0);
      setLotSize(0);
    }
  }, [balance, riskPercent, stopLossPips, pipValue]);

  return (
    <Card className="bg-slate-900 border-slate-800 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-400">
          <Calculator className="w-4 h-4" />
          Position Sizer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase text-slate-500">Account Balance</Label>
            <Input 
              type="number" 
              value={balance} 
              onChange={e => setBalance(e.target.value)}
              className="bg-slate-800 border-slate-700 h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase text-slate-500">Risk %</Label>
            <Input 
              type="number" 
              value={riskPercent} 
              onChange={e => setRiskPercent(e.target.value)}
              className="bg-slate-800 border-slate-700 h-9 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase text-slate-500">Stop Loss (Pips)</Label>
            <Input 
              type="number" 
              value={stopLossPips} 
              onChange={e => setStopLossPips(e.target.value)}
              className="bg-slate-800 border-slate-700 h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase text-slate-500">Pip Value ($)</Label>
            <Input 
              type="number" 
              value={pipValue} 
              onChange={e => setPipValue(e.target.value)}
              className="bg-slate-800 border-slate-700 h-9 text-sm"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] uppercase text-slate-500 mb-1">Recommended Lot Size</p>
              <p className="text-2xl font-black text-blue-500">{lotSize} <span className="text-xs font-normal text-slate-400">Lots</span></p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase text-slate-500 mb-1">Risk Amount</p>
              <p className="text-lg font-bold text-slate-300">${riskAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
          <Info className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-[9px] text-slate-400 leading-tight">
            Standard lot pip value is typically $10 for USD-based pairs. Adjust if trading cross-pairs or indices.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};