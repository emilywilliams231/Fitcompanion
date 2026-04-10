import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";
import { Settings as SettingsIcon, Save, Loader2 } from "lucide-react";

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) setFormData(data);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('profiles').update(formData).eq('id', user?.id);
      if (error) throw error;
      showSuccess("Settings updated");
    } catch (err) {
      showError("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 md:pt-20">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-slate-400">Manage your trading profile and risk parameters.</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? <Loader2 className="animate-spin" /> : <><Save className="mr-2 w-4 h-4" /> Save Changes</>}
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader><CardTitle>Risk Management</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Risk Per Trade (%)</Label>
                <Input type="number" value={formData.risk_per_trade} onChange={e => setFormData({...formData, risk_per_trade: parseFloat(e.target.value)})} className="bg-slate-800 border-slate-700" />
              </div>
              <div className="space-y-2">
                <Label>Max Weekly Loss (%)</Label>
                <Input type="number" value={formData.max_weekly_loss_percent} onChange={e => setFormData({...formData, max_weekly_loss_percent: parseFloat(e.target.value)})} className="bg-slate-800 border-slate-700" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader><CardTitle>Trading Rules</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>General Rules</Label>
                <Textarea value={formData.trading_rules_text} onChange={e => setFormData({...formData, trading_rules_text: e.target.value})} className="bg-slate-800 border-slate-700" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;