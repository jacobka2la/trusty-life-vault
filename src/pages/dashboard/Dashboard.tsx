import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, FileText, Users, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ vaultItems: 0, documents: 0, contacts: 0, nextReminder: 'Not set' });
  const [firstName, setFirstName] = useState('');
  const [isViewerOnly, setIsViewerOnly] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [{ count: vaultCount }, { count: docCount }, { count: contactCount }, { data: profile }, { data: reminder }, { data: contactLinks }] = await Promise.all([
        supabase.from('vault_items').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('documents').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('trusted_contacts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('profiles').select('first_name, selected_plan').eq('user_id', user.id).single(),
        supabase.from('reminders').select('next_reminder_date').eq('user_id', user.id).single(),
        (supabase.from('trusted_contacts').select('id') as any).eq('invited_user_id', user.id).limit(1),
      ]);

      const hasPlan = !!profile?.selected_plan;
      const isViewer = !!(contactLinks && contactLinks.length > 0);
      setIsViewerOnly(!hasPlan && isViewer);

      setStats({
        vaultItems: vaultCount || 0,
        documents: docCount || 0,
        contacts: contactCount || 0,
        nextReminder: reminder?.next_reminder_date || 'Not set',
      });
      setFirstName(profile?.first_name || '');
    };
    fetchData();
  }, [user]);

  // Redirect viewer-only users to the shared vault
  if (isViewerOnly === true) {
    return <Navigate to="/dashboard/shared" replace />;
  }

  if (isViewerOnly === null) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  const cards = [
    { label: 'Vault Items', value: stats.vaultItems, icon: FolderOpen, color: 'text-primary', desc: 'Accounts, policies, and important records stored securely in your vault.' },
    { label: 'Documents', value: stats.documents, icon: FileText, color: 'text-vault-green', desc: 'Uploaded files like wills, deeds, and identification documents.' },
    { label: 'Trusted Contacts', value: stats.contacts, icon: Users, color: 'text-vault-gold', desc: 'People you\'ve designated to access your vault when needed.' },
    { label: 'Next Reminder', value: stats.nextReminder, icon: Bell, color: 'text-primary', desc: 'Your upcoming reminder to review and update your vault.' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
          Welcome{firstName ? `, ${firstName}` : ''}!
        </h1>
        <p className="text-muted-foreground text-lg mt-2">Here's an overview of your secure vault.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card, i) => (
          <Card key={i} className="shadow-vault">
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-lg font-semibold text-foreground">{card.label}</CardTitle>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-foreground mb-2">{card.value}</p>
              <p className="text-sm text-muted-foreground">{card.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
