import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Users, Mail, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Contact {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  relationship: string | null;
  access_level: string;
  invitation_sent?: boolean;
  invited_user_id?: string | null;
}

const emptyForm = { full_name: '', email: '', phone: '', relationship: '', access_level: 'view' };

const TrustedContacts = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [inviting, setInviting] = useState<string | null>(null);

  const fetchContacts = async () => {
    if (!user) return;
    const { data } = await supabase.from('trusted_contacts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setContacts((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchContacts(); }, [user]);

  const handleSave = async () => {
    if (!user || !form.full_name.trim()) { toast.error('Name is required'); return; }
    if (!form.email.trim()) { toast.error('Email is required to send an invitation'); return; }

    if (editing) {
      // Find the original contact to check if email changed
      const original = contacts.find(c => c.id === editing);
      const emailChanged = original && original.email !== form.email;
      const updateData: any = { 
        full_name: form.full_name, email: form.email, phone: form.phone, relationship: form.relationship, access_level: 'view' 
      };
      // Reset invitation if email was changed
      if (emailChanged) {
        updateData.invitation_sent = false;
        updateData.invited_user_id = null;
      }
      const { error } = await supabase.from('trusted_contacts').update(updateData).eq('id', editing);
      if (error) { toast.error(error.message); return; }
      toast.success('Contact updated');
    } else {
      const { data: newContact, error } = await supabase.from('trusted_contacts').insert({ 
        full_name: form.full_name, email: form.email, phone: form.phone, relationship: form.relationship, access_level: 'view', user_id: user.id 
      }).select().single();
      if (error) { toast.error(error.message); return; }
      toast.success('Contact added');
      
      // Automatically send invitation
      if (newContact && form.email.trim()) {
        sendInvite((newContact as any).id);
      }
    }
    setDialogOpen(false);
    setForm(emptyForm);
    setEditing(null);
    fetchContacts();
  };

  const sendInvite = async (contactId: string) => {
    setInviting(contactId);
    try {
      const { data, error } = await supabase.functions.invoke('send-contact-invite', {
        body: { contactId },
      });
      if (error) throw error;
      toast.success(data?.message || 'Invitation sent!');
      fetchContacts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send invitation');
    } finally {
      setInviting(null);
    }
  };

  const handleEdit = (c: Contact) => {
    setForm({ full_name: c.full_name, email: c.email || '', phone: c.phone || '', relationship: c.relationship || '', access_level: 'view' });
    setEditing(c.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('trusted_contacts').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Contact removed');
    fetchContacts();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Trusted Contacts</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setForm(emptyForm); setEditing(null); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Contact</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">{editing ? 'Edit Contact' : 'Add Trusted Contact'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(555) 123-4567" />
              </div>
              <div className="space-y-2">
                <Label>Relationship</Label>
                <Input value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} placeholder="e.g., Spouse, Attorney" />
              </div>
              <p className="text-xs text-muted-foreground">Access level: View Only — contacts can only view your vault items.</p>
              <Button onClick={handleSave} className="w-full">{editing ? 'Update Contact' : 'Add & Invite Contact'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : contacts.length === 0 ? (
        <Card className="shadow-vault"><CardContent className="p-8 text-center text-muted-foreground">No trusted contacts yet.</CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map(c => (
            <Card key={c.id} className="shadow-vault">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-vault-blue-light flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="font-heading text-base">{c.full_name}</CardTitle>
                      {c.relationship && <p className="text-xs text-muted-foreground">{c.relationship}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {c.email && <p className="text-sm text-muted-foreground">{c.email}</p>}
                {c.phone && <p className="text-sm text-muted-foreground">{c.phone}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-medium text-primary bg-vault-blue-light px-2 py-0.5 rounded-full">View Only</span>
                  {c.invited_user_id ? (
                    <span className="text-xs font-medium text-vault-green flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Accepted!
                    </span>
                  ) : c.invitation_sent ? (
                    <span className="text-xs font-medium text-vault-gold flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Invite Sent
                    </span>
                  ) : c.email ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs gap-1 text-primary"
                      disabled={inviting === c.id}
                      onClick={() => sendInvite(c.id)}
                    >
                      <Mail className="h-3 w-3" />
                      {inviting === c.id ? 'Sending...' : 'Send Invite'}
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrustedContacts;
