import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trade } from "@/types/trading";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrades();
  }, [currentDate]);

  const fetchTrades = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const monthStart = startOfMonth(currentDate).toISOString();
    const monthEnd = endOfMonth(currentDate).toISOString();

    const { data } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_backtest', false)
      .gte('created_at', monthStart)
      .lte('created_at', monthEnd);

    if (data) setTrades(data);
    setLoading(false);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const getDayStats = (day: Date) => {
    const dayTrades = trades.filter(t => isSameDay(new Date(t.createdAt), day));
    const wins = dayTrades.filter(t => t.result === 'win').length;
    const losses = dayTrades.filter(t => t.result === 'loss').length;
    const netR = dayTrades.reduce((acc, t) => {
      if (t.result === 'win') return acc + 2; // Simplified 1:2 RR
      if (t.result === 'loss') return acc - 1;
      return acc;
    }, 0);

    return { trades: dayTrades.length, wins, losses, netR };
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  const prevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 md:pt-20">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-2 rounded-xl">
              <CalendarIcon className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Trading Calendar</h1>
              <p className="text-slate-400">Visualizing your daily consistency.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-900 p-2 rounded-2xl border border-slate-800">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="hover:bg-slate-800">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-lg font-bold min-w-[140px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="hover:bg-slate-800">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-center text-xs font-bold uppercase tracking-widest text-slate-500 py-2">
                {day}
              </div>
            ))}
            
            {days.map((day, i) => {
              const stats = getDayStats(day);
              const isCurrentMonth = format(day, 'M') === format(currentDate, 'M');
              
              return (
                <div 
                  key={i}
                  className={cn(
                    "min-h-[100px] p-2 rounded-2xl border transition-all flex flex-col justify-between",
                    !isCurrentMonth ? "opacity-20 bg-transparent border-transparent" : 
                    stats.trades > 0 ? "bg-slate-900/50 border-slate-800" : "bg-slate-900/20 border-slate-900",
                    stats.netR > 0 ? "ring-1 ring-green-500/20" : stats.netR < 0 ? "ring-1 ring-red-500/20" : ""
                  )}
                >
                  <div className="flex justify-between items-start">
                    <span className={cn(
                      "text-xs font-bold",
                      isSameDay(day, new Date()) ? "bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center" : "text-slate-500"
                    )}>
                      {format(day, 'd')}
                    </span>
                    {stats.trades > 0 && (
                      <span className={cn(
                        "text-[10px] font-black px-1.5 rounded",
                        stats.netR > 0 ? "text-green-500 bg-green-500/10" : 
                        stats.netR < 0 ? "text-red-500 bg-red-500/10" : "text-slate-500 bg-slate-500/10"
                      )}>
                        {stats.netR > 0 ? '+' : ''}{stats.netR}R
                      </span>
                    )}
                  </div>

                  {stats.trades > 0 && (
                    <div className="space-y-1">
                      <div className="flex gap-0.5">
                        {Array.from({ length: stats.wins }).map((_, i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        ))}
                        {Array.from({ length: stats.losses }).map((_, i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        ))}
                      </div>
                      <p className="text-[8px] text-slate-500 uppercase font-bold">
                        {stats.trades} {stats.trades === 1 ? 'Trade' : 'Trades'}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-slate-400">Winning Day (Positive R)</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-slate-400">Losing Day (Negative R)</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-slate-700" />
              <span className="text-sm text-slate-400">No Trades Logged</span>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Calendar;