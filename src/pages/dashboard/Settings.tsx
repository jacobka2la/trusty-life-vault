import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { validatePassword, PASSWORD_HINT } from '@/lib/passwordValidation';

const SettingsPage = () => {
  const { user, signOut, updatePassword } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('first_name, last_name').eq('user_id', user.id).single().then(({ data }) => {
      if (data) { setFirstName(data.first_name); setLastName(data.last_name); }
    });
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
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setChangingPw(true);
    const { error } = await updatePassword(newPassword);
    setChangingPw(false);
    if (error) toast.error(error.message);
    else { toast.success('Password updated'); setNewPassword(''); }
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
          <CardHeader><CardTitle className="font-heading text-lg">Change Password</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 6 characters" />
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
