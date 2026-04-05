import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Calendar, Dumbbell, ChevronRight } from "lucide-react";
import { format } from "date-fns";

const History = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('workout_history')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (data) setHistory(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 md:pt-20">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Training Log</h1>
          <p className="text-slate-400">Your journey to a godlike physique.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
            <Dumbbell className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">No workouts logged yet. Time to hit the gym!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <Card key={item.id} className="bg-slate-900 border-slate-800 text-white hover:border-orange-500/30 transition-colors">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-500/10 p-3 rounded-2xl">
                      <Dumbbell className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{item.exercise_name}</h3>
                      <div className="flex items-center gap-3 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(item.date), 'MMM d, yyyy')}
                        </span>
                        <span>•</span>
                        <span className="text-orange-400 font-medium">{item.muscle_group}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">{item.sets_completed}</p>
                    <p className="text-xs text-slate-500 uppercase">Sets</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;