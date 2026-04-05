import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getGeminiModel, fileToGenerativePart } from "@/lib/gemini";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { showSuccess, showError } from "@/utils/toast";
import { Camera, Plus, Trash2, Upload, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const Equipment = () => {
  const [equipment, setEquipment] = useState<string[]>([]);
  const [newEquipment, setNewEquipment] = useState("");
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('equipment_list')
      .eq('id', user.id)
      .single();

    if (data?.equipment_list) {
      setEquipment(data.equipment_list);
    }
  };

  const saveEquipment = async (newList: string[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, equipment_list: newList, email: user.email });

    if (error) showError("Failed to save equipment");
    else setEquipment(newList);
  };

  const handleAddManual = () => {
    if (!newEquipment.trim()) return;
    const newList = [...equipment, newEquipment.trim()];
    saveEquipment(newList);
    setNewEquipment("");
  };

  const handleRemove = (index: number) => {
    const newList = equipment.filter((_, i) => i !== index);
    saveEquipment(newList);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDetecting(true);
    try {
      const model = getGeminiModel();
      const imagePart = await fileToGenerativePart(file);
      const prompt = "Identify all gym equipment in this photo. Return only a comma-separated list of equipment names. If none found, return 'None'.";
      
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      if (text.toLowerCase() !== "none") {
        const detected = text.split(',').map(item => item.trim());
        const newList = Array.from(new Set([...equipment, ...detected]));
        saveEquipment(newList);
        showSuccess(`Detected: ${text}`);
      } else {
        showError("No equipment detected");
      }
    } catch (err) {
      showError("AI detection failed. Make sure you added your Gemini API Key.");
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 md:pt-20">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Arsenal</h1>
          <p className="text-slate-400">Tell us what you're working with, and we'll build the perfect workout.</p>
        </header>

        <div className="grid gap-6">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="w-5 h-5 text-orange-500" />
                AI Equipment Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={detecting}
                />
                <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center group-hover:border-orange-500/50 transition-colors bg-slate-800/50">
                  {detecting ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                      <p className="text-slate-300">Analyzing your gear...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-slate-500 group-hover:text-orange-500 transition-colors" />
                      <p className="text-slate-300">Upload a photo of your gym space</p>
                      <p className="text-xs text-slate-500">Drag & drop or click to browse</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle className="text-lg">Manual Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Dumbbells, Pull-up bar"
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddManual()}
                />
                <Button onClick={handleAddManual} className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-4">
                {equipment.length === 0 ? (
                  <p className="text-slate-500 text-sm italic">No equipment added yet.</p>
                ) : (
                  equipment.map((item, index) => (
                    <Badge key={index} variant="secondary" className="bg-slate-800 text-slate-200 py-1.5 px-3 flex items-center gap-2 border-slate-700">
                      {item}
                      <button onClick={() => handleRemove(index)} className="hover:text-red-400 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Equipment;