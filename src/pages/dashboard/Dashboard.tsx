import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, FileText, Users, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ vaultItems: 0, documents: 0, contacts: 0, nextReminder: 'Not set' });
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [{ count: vaultCount }, { count: docCount }, { count: contactCount }, { data: profile }, { data: reminder }] = await Promise.all([
        supabase.from('vault_items').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('documents').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('trusted_contacts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('profiles').select('first_name').eq('user_id', user.id).single(),
        supabase.from('reminders').select('next_reminder_date').eq('user_id', user.id).single(),
      ]);
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

  const cards = [
    { label: 'Vault Items', value: stats.vaultItems, icon: FolderOpen, color: 'text-primary' },
    { label: 'Documents', value: stats.documents, icon: FileText, color: 'text-vault-green' },
    { label: 'Trusted Contacts', value: stats.contacts, icon: Users, color: 'text-vault-gold' },
    { label: 'Next Reminder', value: stats.nextReminder, icon: Bell, color: 'text-primary' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          Welcome{firstName ? `, ${firstName}` : ''}!
        </h1>
        <p className="text-muted-foreground mt-1">Here's an overview of your secure vault.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <Card key={i} className="shadow-vault">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
