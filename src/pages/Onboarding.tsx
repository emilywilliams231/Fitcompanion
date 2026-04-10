import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Target, Shield, BookOpen, Settings2 } from "lucide-react";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    traderType: 'intraday',
    timeframeUsed: '15m',
    pairsTraded: '',
    htfTimeframe: 'Daily',
    structureTimeframe: '4h',
    entryTimeframe: '15m',
    confirmationTimeframe: '5m',
    riskPerTrade: 1,
    maxDailyTrades: 3,
    maxRunningTrades: 2,
    maxWeeklyTrades: 15,
    maxWeeklyLossPercent: 5,
    tradingRulesText: '',
    breakevenRulesText: '',
    partialsRulesText: '',
    activeStrategy: 'liquidity'
  });
  const navigate = useNavigate();

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        trader_type: formData.traderType,
        timeframe_used: formData.timeframeUsed,
        pairs_traded: formData.pairsTraded,
        htf_timeframe: formData.htfTimeframe,
        structure_timeframe: formData.structureTimeframe,
        entry_timeframe: formData.entryTimeframe,
        confirmation_timeframe: formData.confirmationTimeframe,
        risk_per_trade: formData.riskPerTrade,
        max_daily_trades: formData.maxDailyTrades,
        max_running_trades: formData.maxRunningTrades,
        max_weekly_trades: formData.maxWeeklyTrades,
        max_weekly_loss_percent: formData.maxWeeklyLossPercent,
        trading_rules_text: formData.tradingRulesText,
        breakeven_rules_text: formData.breakevenRulesText,
        partials_rules_text: formData.partialsRulesText,
        active_strategy: formData.activeStrategy,
        onboarding_completed: true
      })
      .eq('id', user.id);

    if (error) {
      showError("Failed to save settings");
    } else {
      showSuccess("Onboarding complete! Welcome to the journal.");
      navigate("/dashboard");
    }
  };

  const steps = [
    {
      title: "Trader Profile",
      icon: Target,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Trader Type</Label>
            <Select value={formData.traderType} onValueChange={(v) => updateField('traderType', v)}>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="scalper">Scalper</SelectItem>
                <SelectItem value="intraday">Intraday</SelectItem>
                <SelectItem value="swing">Swing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Primary Timeframe</Label>
            <Select value={formData.timeframeUsed} onValueChange={(v) => updateField('timeframeUsed', v)}>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                {['1m', '5m', '15m', '30m', '1h', '4h', 'Daily'].map(tf => (
                  <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Pairs Traded</Label>
            <Textarea 
              placeholder="EURUSD, GBPUSD, XAUUSD..." 
              value={formData.pairsTraded}
              onChange={(e) => updateField('pairsTraded', e.target.value)}
              className="bg-slate-800 border-slate-700"
            />
          </div>
        </div>
      )
    },
    {
      title: "Timeframe Hierarchy",
      icon: Settings2,
      content: (
        <div className="grid grid-cols-2 gap-4">
          {['htfTimeframe', 'structureTimeframe', 'entryTimeframe', 'confirmationTimeframe'].map((field) => (
            <div key={field} className="space-y-2">
              <Label className="capitalize">{field.replace('Timeframe', ' TF')}</Label>
              <Select value={(formData as any)[field]} onValueChange={(v) => updateField(field, v)}>
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {['1m', '5m', '15m', '30m', '1h', '4h', 'Daily', 'Weekly'].map(tf => (
                    <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Risk Management",
      icon: Shield,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Risk Per Trade (%)</Label>
              <Input type="number" step="0.1" value={formData.riskPerTrade} onChange={(e) => updateField('riskPerTrade', parseFloat(e.target.value))} className="bg-slate-800 border-slate-700" />
            </div>
            <div className="space-y-2">
              <Label>Max Weekly Loss (%)</Label>
              <Input type="number" step="0.1" value={formData.maxWeeklyLossPercent} onChange={(e) => updateField('maxWeeklyLossPercent', parseFloat(e.target.value))} className="bg-slate-800 border-slate-700" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Max Daily</Label>
              <Input type="number" value={formData.maxDailyTrades} onChange={(e) => updateField('maxDailyTrades', parseInt(e.target.value))} className="bg-slate-800 border-slate-700" />
            </div>
            <div className="space-y-2">
              <Label>Max Running</Label>
              <Input type="number" value={formData.maxRunningTrades} onChange={(e) => updateField('maxRunningTrades', parseInt(e.target.value))} className="bg-slate-800 border-slate-700" />
            </div>
            <div className="space-y-2">
              <Label>Max Weekly</Label>
              <Input type="number" value={formData.maxWeeklyTrades} onChange={(e) => updateField('maxWeeklyTrades', parseInt(e.target.value))} className="bg-slate-800 border-slate-700" />
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Trading Rules",
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>General Rules</Label>
            <Textarea value={formData.tradingRulesText} onChange={(e) => updateField('tradingRulesText', e.target.value)} className="bg-slate-800 border-slate-700 min-h-[100px]" />
          </div>
          <div className="space-y-2">
            <Label>Breakeven Rules</Label>
            <Textarea value={formData.breakevenRulesText} onChange={(e) => updateField('breakevenRulesText', e.target.value)} className="bg-slate-800 border-slate-700" />
          </div>
          <div className="space-y-2">
            <Label>Partials Rules</Label>
            <Textarea value={formData.partialsRulesText} onChange={(e) => updateField('partialsRulesText', e.target.value)} className="bg-slate-800 border-slate-700" />
          </div>
        </div>
      )
    },
    {
      title: "Strategy Selection",
      icon: Target,
      content: (
        <div className="space-y-6">
          <RadioGroup value={formData.activeStrategy} onValueChange={(v) => updateField('activeStrategy', v)} className="grid grid-cols-1 gap-4">
            <div className="flex items-center space-x-3 space-y-0 rounded-xl border border-slate-800 p-4 bg-slate-800/50">
              <RadioGroupItem value="liquidity" id="liquidity" />
              <Label htmlFor="liquidity" className="flex-1 cursor-pointer">
                <div className="font-bold text-lg">Liquidity Strategy</div>
                <div className="text-sm text-slate-400">Focus on FVG, Order Blocks, and CHoCH.</div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 space-y-0 rounded-xl border border-slate-800 p-4 bg-slate-800/50">
              <RadioGroupItem value="retail" id="retail" />
              <Label htmlFor="retail" className="flex-1 cursor-pointer">
                <div className="font-bold text-lg">Retail Strategy</div>
                <div className="text-sm text-slate-400">Focus on S/R, Trendlines, and Indicators.</div>
              </Label>
            </div>
          </RadioGroup>
        </div>
      )
    }
  ];

  const currentStep = steps[step - 1];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
      
      <Card className="w-full max-w-xl bg-slate-900/50 border-slate-800 backdrop-blur-xl relative z-10">
        <CardHeader className="text-center">
          <div className="mx-auto bg-blue-500/10 p-3 rounded-2xl w-fit mb-4">
            <currentStep.icon className="w-8 h-8 text-blue-500" />
          </div>
          <CardTitle className="text-2xl font-bold">{currentStep.title}</CardTitle>
          <CardDescription>Step {step} of {steps.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep.content}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            <Button 
              variant="ghost" 
              onClick={handleBack} 
              disabled={step === 1}
              className="text-slate-400 hover:text-white"
            >
              <ChevronLeft className="mr-2 w-4 h-4" />
              Back
            </Button>
            {step < steps.length ? (
              <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                Next
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                Complete Setup
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;