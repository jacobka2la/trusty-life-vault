import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { addMonths, addDays, format } from 'date-fns';

const frequencyToDays: Record<string, number> = {
  monthly: 30,
  quarterly: 90,
  biannually: 182,
  annually: 365,
};

const frequencyLabels: Record<string, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly (every 3 months)',
  biannually: 'Every 6 Months',
  annually: 'Annually',
};

const computeNextDate = (frequency: string): string => {
  const days = frequencyToDays[frequency] || 90;
  const next = addDays(new Date(), days);
  return format(next, 'yyyy-MM-dd');
};

const Reminders = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ frequency: 'quarterly', enabled: true });
  const [nextDate, setNextDate] = useState<string | null>(null);
  const [exists, setExists] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase.from('reminders').select('*').eq('user_id', user.id).single();
      if (data) {
        setForm({ frequency: data.reminder_frequency, enabled: data.reminder_enabled });
        setNextDate(data.next_reminder_date);
        setExists(true);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const calculatedDate = computeNextDate(form.frequency);
    const payload = {
      user_id: user.id,
      reminder_frequency: form.frequency,
      reminder_enabled: form.enabled,
      next_reminder_date: calculatedDate,
    };
    if (exists) {
      const { error } = await supabase.from('reminders').update(payload).eq('user_id', user.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from('reminders').insert(payload);
      if (error) { toast.error(error.message); setSaving(false); return; }
      setExists(true);
    }
    setNextDate(calculatedDate);
    toast.success('Reminder settings saved');
    setSaving(false);
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Reminders</h1>
      <Card className="shadow-vault max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="font-heading text-lg">Update Reminders</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label>Enable Reminders</Label>
            <Switch checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} />
          </div>
          <div className="space-y-2">
            <Label>How often should we remind you?</Label>
            <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly (every 3 months)</SelectItem>
                <SelectItem value="biannually">Every 6 Months</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Next reminder will be set to {format(addDays(new Date(), frequencyToDays[form.frequency] || 90), 'MMMM d, yyyy')}
            </p>
          </div>
          {nextDate && (
            <div className="rounded-lg bg-muted/50 border border-border p-3">
              <p className="text-sm text-muted-foreground">Current next reminder:</p>
              <p className="text-lg font-semibold text-foreground">{format(new Date(nextDate + 'T00:00:00'), 'MMMM d, yyyy')}</p>
            </div>
          )}
          <Button onClick={handleSave} className="w-full" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reminders;
