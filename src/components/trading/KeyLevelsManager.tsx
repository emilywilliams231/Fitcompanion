import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyLevel } from "@/types/trading";
import { Plus, Trash2, MapPin, Loader2 } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

export const KeyLevelsManager = () => {
  const [levels, setLevels] = useState<KeyLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({ pair: "", price: "", notes: "" });

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('key_levels')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setLevels(data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('key_levels').insert({
        user_id: user.id,
        pair: formData.pair.toUpperCase(),
        price: parseFloat(formData.price),
        notes: formData.notes
      });

      if (error) throw error;

      showSuccess("Key level added");
      setFormData({ pair: "", price: "", notes: "" });
      fetchLevels();
    } catch (err) {
      showError("Failed to add level");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from('key_levels').delete().eq('id', id);
    if (error) showError("Failed to delete");
    else {
      setLevels(levels.filter(l => l.id !== id));
      showSuccess("Level removed");
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="space-y-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase text-slate-500">Pair</Label>
            <Input 
              placeholder="XAUUSD" 
              value={formData.pair}
              onChange={e => setFormData({...formData, pair: e.target.value})}
              className="bg-slate-800 border-slate-700 h-9 text-sm"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase text-slate-500">Price</Label>
            <Input 
              type="number" 
              step="0.00001" 
              placeholder="2035.50"
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
              className="bg-slate-800 border-slate-700 h-9 text-sm"
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase text-slate-500">Notes</Label>
          <Input 
            placeholder="Daily Order Block" 
            value={formData.notes}
            onChange={e => setFormData({...formData, notes: e.target.value})}
            className="bg-slate-800 border-slate-700 h-9 text-sm"
          />
        </div>
        <Button type="submit" disabled={adding} className="w-full bg-blue-600 hover:bg-blue-700 h-9">
          {adding ? <Loader2 className="animate-spin" size={16} /> : <><Plus size={16} className="mr-2" /> Add Level</>}
        </Button>
      </form>

      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center py-4"><Loader2 className="animate-spin text-slate-700" /></div>
        ) : levels.length === 0 ? (
          <p className="text-center text-slate-500 text-xs italic py-4">No key levels tracked.</p>
        ) : (
          levels.map(level => (
            <div key={level.id} className="group flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <MapPin size={14} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{level.pair}</span>
                    <span className="text-blue-400 font-mono text-xs">@{level.price}</span>
                  </div>
                  {level.notes && <p className="text-[10px] text-slate-500">{level.notes}</p>}
                </div>
              </div>
              <button 
                onClick={() => handleDelete(level.id)}
                className="p-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};