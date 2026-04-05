import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { getGeminiModel } from "@/lib/gemini";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";
import { Dumbbell, Sparkles, Loader2, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const WorkoutGenerator = () => {
  const [muscleGroup, setMuscleGroup] = useState("");
  const [goal, setGoal] = useState("");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('equipment_list')
      .eq('id', user.id)
      .single();

    if (data?.equipment_list) setEquipment(data.equipment_list);
  };

  const generateWorkout = async () => {
    if (!muscleGroup || !goal) {
      showError("Please select a muscle group and goal");
      return;
    }

    setLoading(true);
    try {
      const model = getGeminiModel();
      const prompt = `
        Act as a world-class fitness coach. 
        Available Equipment: ${equipment.join(', ') || 'Bodyweight only'}
        Target Muscle Group: ${muscleGroup}
        Goal: ${goal}

        Generate ONE perfect exercise. Return ONLY a JSON object with this structure:
        {
          "name": "Exercise Name",
          "instructions": ["step 1", "step 2", ...],
          "sets": number,
          "reps": "number or range",
          "rest": number (in seconds),
          "formTips": ["tip 1", "tip 2"],
          "imageSearchTerm": "search term for exercise image"
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const workoutData = JSON.parse(response.text().replace(/```json|```/g, ''));
      
      // Store in session storage to pass to the guide page
      sessionStorage.setItem('currentWorkout', JSON.stringify({
        ...workoutData,
        muscleGroup,
        goal
      }));
      
      navigate("/workout-guide");
    } catch (err) {
      showError("Failed to generate workout. Check your API key.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 md:pt-20">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Forge Your Workout</h1>
          <p className="text-slate-400">AI-powered training tailored to your gear and goals.</p>
        </header>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Target Muscle Group</label>
              <Select onValueChange={setMuscleGroup}>
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Select muscle group" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="Chest">Chest</SelectItem>
                  <SelectItem value="Back">Back</SelectItem>
                  <SelectItem value="Legs">Legs</SelectItem>
                  <SelectItem value="Shoulders">Shoulders</SelectItem>
                  <SelectItem value="Arms">Arms</SelectItem>
                  <SelectItem value="Abs">Abs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Training Goal</label>
              <Select onValueChange={setGoal}>
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Select your goal" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="Strength">Strength (Heavy, Low Reps)</SelectItem>
                  <SelectItem value="Hypertrophy">Hypertrophy (Muscle Growth)</SelectItem>
                  <SelectItem value="Endurance">Endurance (High Reps)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              <Button 
                onClick={generateWorkout} 
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Biomechanics...
                  </>
                ) : (
                  <>
                    Generate Godlike Workout
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <p className="text-sm text-orange-200 flex items-start gap-2">
            <Dumbbell className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Using {equipment.length} pieces of equipment from your arsenal.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkoutGenerator;