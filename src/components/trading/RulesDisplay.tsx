import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ShieldCheck, Split } from "lucide-react";

interface RulesDisplayProps {
  rules: {
    trading: string;
    breakeven: string;
    partials: string;
  };
}

export const RulesDisplay = ({ rules }: RulesDisplayProps) => {
  return (
    <div className="space-y-4">
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-400">
            <BookOpen className="w-4 h-4" />
            General Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">
            {rules.trading || "No rules defined yet."}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-orange-400">
              <ShieldCheck className="w-4 h-4" />
              Breakeven
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">
              {rules.breakeven || "No BE rules defined."}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-purple-400">
              <Split className="w-4 h-4" />
              Partials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">
              {rules.partials || "No partials rules defined."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};