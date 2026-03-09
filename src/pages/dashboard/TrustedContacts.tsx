import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Contact {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  relationship: string | null;
  access_level: string;
}

const emptyForm = { full_name: '', email: '', phone: '', relationship: '', access_level: 'view' };

const TrustedContacts = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchContacts = async () => {
    if (!user) return;
    const { data } = await supabase.from('trusted_contacts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setContacts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchContacts(); }, [user]);

  const handleSave = async () => {
    if (!user || !form.full_name.trim()) { toast.error('Name is required'); return; }
    if (editing) {
      const { error } = await supabase.from('trusted_contacts').update({ ...form }).eq('id', editing);
      if (error) { toast.error(error.message); return; }
      toast.success('Contact updated');
    } else {
      const { error } = await supabase.from('trusted_contacts').insert({ ...form, user_id: user.id });
      if (error) { toast.error(error.message); return; }
      toast.success('Contact added');
    }
    setDialogOpen(false);
    setForm(emptyForm);
    setEditing(null);
    fetchContacts();
  };

  const handleEdit = (c: Contact) => {
    setForm({ full_name: c.full_name, email: c.email || '', phone: c.phone || '', relationship: c.relationship || '', access_level: c.access_level });
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
                <Label>Email</Label>
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
              <div className="space-y-2">
                <Label>Access Level</Label>
                <Select value={form.access_level} onValueChange={(v) => setForm({ ...form, access_level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View Only</SelectItem>
                    <SelectItem value="full">Full Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full">{editing ? 'Update Contact' : 'Add Contact'}</Button>
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
                <span className="text-xs font-medium text-primary bg-vault-blue-light px-2 py-0.5 rounded-full mt-2 inline-block">{c.access_level === 'full' ? 'Full Access' : 'View Only'}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrustedContacts;
