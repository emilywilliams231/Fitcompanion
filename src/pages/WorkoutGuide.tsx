import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { showSuccess, showError } from "@/utils/toast";
import { Timer, CheckCircle2, ArrowLeft, Info, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const WorkoutGuide = () => {
  const [workout, setWorkout] = useState<any>(null);
  const [completedSets, setCompletedSets] = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = sessionStorage.getItem('currentWorkout');
    if (saved) {
      const data = JSON.parse(saved);
      setWorkout(data);
      setCompletedSets(new Array(data.sets).fill(false));
    } else {
      navigate("/workout-generator");
    }
  }, [navigate]);

  useEffect(() => {
    let interval: any;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
      if (isTimerActive) {
        new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
      }
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const startRest = () => {
    setTimeLeft(workout.rest);
    setIsTimerActive(true);
  };

  const toggleSet = (index: number) => {
    const newSets = [...completedSets];
    newSets[index] = !newSets[index];
    setCompletedSets(newSets);
    if (newSets[index] && index < workout.sets - 1) {
      startRest();
    }
  };

  const finishWorkout = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('workout_history').insert({
        user_id: user.id,
        exercise_name: workout.name,
        muscle_group: workout.muscleGroup,
        sets_completed: completedSets.filter(Boolean).length,
        date: new Date().toISOString()
      });

      if (error) throw error;

      showSuccess("Workout logged successfully!");
      sessionStorage.removeItem('currentWorkout');
      navigate("/history");
    } catch (err) {
      showError("Failed to save workout history");
    } finally {
      setSaving(false);
    }
  };

  if (!workout) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 md:pt-20">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Generator
        </button>

        <div className="grid gap-6">
          <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden">
            <div className="h-48 bg-slate-800 flex items-center justify-center relative">
              <img 
                src={`https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800&q=80`} 
                alt={workout.name}
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
              <div className="absolute bottom-4 left-6">
                <h1 className="text-3xl font-bold">{workout.name}</h1>
                <p className="text-orange-500 font-medium">{workout.muscleGroup} • {workout.goal}</p>
              </div>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/50 p-3 rounded-xl text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Sets</p>
                  <p className="text-xl font-bold">{workout.sets}</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Reps</p>
                  <p className="text-xl font-bold">{workout.reps}</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Rest</p>
                  <p className="text-xl font-bold">{workout.rest}s</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold flex items-center gap-2">
                  <Info className="w-4 h-4 text-orange-500" />
                  Instructions
                </h3>
                <ul className="space-y-2">
                  {workout.instructions.map((step: string, i: number) => (
                    <li key={i} className="text-slate-300 text-sm flex gap-3">
                      <span className="text-orange-500 font-bold">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  Form Tips
                </h3>
                <ul className="space-y-2">
                  {workout.formTips.map((tip: string, i: number) => (
                    <li key={i} className="text-slate-400 text-sm italic flex gap-2">
                      • {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Track Progress</CardTitle>
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xl",
                isTimerActive ? "bg-orange-500 text-white animate-pulse" : "bg-slate-800 text-slate-400"
              )}>
                <Timer className="w-5 h-5" />
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-3">
                {completedSets.map((completed, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all",
                      completed ? "bg-orange-500/10 border-orange-500/50" : "bg-slate-800/50 border-slate-700"
                    )}
                  >
                    <span className="font-bold">Set {i + 1}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400 text-sm">{workout.reps} reps</span>
                      <Checkbox 
                        checked={completed} 
                        onCheckedChange={() => toggleSet(i)}
                        className="w-6 h-6 border-slate-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Workout Notes</label>
                <Textarea 
                  placeholder="How did it feel? Any weight used?" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
                />
              </div>

              <Button 
                onClick={finishWorkout} 
                disabled={saving || completedSets.filter(Boolean).length === 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6"
              >
                {saving ? <Loader2 className="animate-spin" /> : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Finish & Log Workout
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkoutGuide;