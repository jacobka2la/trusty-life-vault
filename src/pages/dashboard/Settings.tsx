import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { validatePassword, PASSWORD_HINT } from '@/lib/passwordValidation';
import { Badge } from '@/components/ui/badge';

const planLabels: Record<string, string> = {
  monthly: 'Monthly ($6/mo)',
  annual: 'Annual ($59/yr)',
};

const SettingsPage = () => {
  const { user, signOut, updatePassword } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [changingPw, setChangingPw] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [changingPlan, setChangingPlan] = useState(false);
  const [isViewerOnly, setIsViewerOnly] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: profile } = await supabase.from('profiles').select('first_name, last_name, selected_plan').eq('user_id', user.id).single();
      if (profile) {
        setFirstName(profile.first_name);
        setLastName(profile.last_name);
        setSelectedPlan(profile.selected_plan || localStorage.getItem('docuvault_selected_plan'));
      }
      setIsViewerOnly(profile?.selected_plan === 'trusted_contact_only');
    };
    load();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ first_name: firstName, last_name: lastName }).eq('user_id', user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success('Profile updated');
  };

  const handleChangePassword = async () => {
    const pwError = validatePassword(newPassword);
    if (pwError) { toast.error(pwError); return; }
    setChangingPw(true);
    const { error } = await updatePassword(newPassword);
    setChangingPw(false);
    if (error) toast.error(error.message);
    else { toast.success('Password updated'); setNewPassword(''); }
  };

  const handleChangePlan = async (plan: string) => {
    if (!user) return;
    setChangingPlan(true);
    const { error } = await supabase.from('profiles').update({ selected_plan: plan } as any).eq('user_id', user.id);
    setChangingPlan(false);
    if (error) { toast.error(error.message); return; }
    setSelectedPlan(plan);
    localStorage.setItem('docuvault_selected_plan', plan);
    toast.success(`Plan changed to ${planLabels[plan] || plan}`);
  };

  const handleCancelPlan = async () => {
    if (!user) return;
    setChangingPlan(true);
    const { error } = await supabase.from('profiles').update({ selected_plan: null } as any).eq('user_id', user.id);
    setChangingPlan(false);
    if (error) { toast.error(error.message); return; }
    setSelectedPlan(null);
    localStorage.removeItem('docuvault_selected_plan');
    toast.success('Plan cancelled');
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Settings</h1>
      <div className="space-y-6 max-w-lg">
        <Card className="shadow-vault">
          <CardHeader><CardTitle className="font-heading text-lg">Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Email: {user?.email}</p>
            <Button onClick={handleSaveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </CardContent>
        </Card>

        <Card className="shadow-vault">
          <CardHeader><CardTitle className="font-heading text-lg">Subscription Plan</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {isViewerOnly ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-foreground">Current status:</span>
                  <Badge variant="secondary" className="text-sm">Trusted Contact Only</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  You currently have view-only access to shared items. Want your own vault?
                </p>
                <Button onClick={() => handleChangePlan('monthly')}>
                  Start Your Own Vault (Monthly $6/mo)
                </Button>
              </>
            ) : selectedPlan ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-foreground">Current plan:</span>
                  <Badge variant="secondary" className="text-sm">{planLabels[selectedPlan] || selectedPlan}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['monthly', 'annual'].filter(p => p !== selectedPlan).map(plan => (
                    <Button key={plan} variant="outline" size="sm" disabled={changingPlan} onClick={() => handleChangePlan(plan)}>
                      Switch to {planLabels[plan]}
                    </Button>
                  ))}
                </div>
                <Button variant="destructive" size="sm" disabled={changingPlan} onClick={handleCancelPlan}>
                  Cancel Plan
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No active plan. Add vault items to get started with a plan.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-vault">
          <CardHeader><CardTitle className="font-heading text-lg">Change Password</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={PASSWORD_HINT} />
            </div>
            <Button onClick={handleChangePassword} disabled={changingPw}>{changingPw ? 'Updating...' : 'Update Password'}</Button>
          </CardContent>
        </Card>

        <Card className="shadow-vault">
          <CardContent className="p-4">
            <Button variant="destructive" onClick={signOut} className="w-full">Log Out</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
