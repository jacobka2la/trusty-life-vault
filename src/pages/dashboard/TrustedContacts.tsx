import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  invitation_sent_at?: string | null;
}

interface VaultItem {
  id: string;
  title: string;
  category: string;
}

interface Document {
  id: string;
  file_name: string;
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
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [sharingDialogOpen, setSharingDialogOpen] = useState(false);
  const [sharingContact, setSharingContact] = useState<Contact | null>(null);
  const [existingShares, setExistingShares] = useState<any[]>([]);

  const fetchContacts = async () => {
    if (!user) return;
    const { data } = await supabase.from('trusted_contacts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setContacts((data as any[]) || []);
    setLoading(false);
  };

  const fetchVaultAndDocs = async () => {
    if (!user) return;
    const [{ data: items }, { data: docs }] = await Promise.all([
      supabase.from('vault_items').select('id, title, category').eq('user_id', user.id).order('title'),
      supabase.from('documents').select('id, file_name').eq('user_id', user.id).order('file_name'),
    ]);
    setVaultItems((items as VaultItem[]) || []);
    setDocuments((docs as Document[]) || []);
  };

  useEffect(() => { fetchContacts(); fetchVaultAndDocs(); }, [user]);

  const handleSave = async () => {
    if (!user || !form.full_name.trim()) { toast.error('Name is required'); return; }
    if (!form.email.trim()) { toast.error('Email is required to send an invitation'); return; }

    if (editing) {
      const original = contacts.find(c => c.id === editing);
      const emailChanged = original && original.email !== form.email;
      const updateData: any = { 
        full_name: form.full_name, email: form.email, phone: form.phone, relationship: form.relationship, access_level: 'view' 
      };
      if (emailChanged) {
        updateData.invitation_sent = false;
        updateData.invited_user_id = null;
        updateData.invitation_sent_at = null;
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
      
      // If there's an invite link, copy it to clipboard
      if (data?.inviteLink) {
        await navigator.clipboard.writeText(data.inviteLink);
        toast.success('Invite link copied to clipboard! Share it with your contact.');
      } else {
        toast.success(data?.message || 'Contact linked!');
      }
      fetchContacts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate invitation');
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

  const openSharingDialog = async (c: Contact) => {
    setSharingContact(c);
    // Load existing shares for this contact
    if (c.invited_user_id) {
      const { data } = await (supabase.from('shared_access').select('*') as any)
        .eq('owner_user_id', user!.id)
        .eq('viewer_user_id', c.invited_user_id);
      const shares = (data || []) as any[];
      setExistingShares(shares);
      setSelectedItemIds(shares.filter((s: any) => s.vault_item_id).map((s: any) => s.vault_item_id));
      setSelectedDocIds(shares.filter((s: any) => s.document_id).map((s: any) => s.document_id));
    } else {
      setExistingShares([]);
      setSelectedItemIds([]);
      setSelectedDocIds([]);
    }
    setSharingDialogOpen(true);
  };

  const handleSaveSharing = async () => {
    if (!user || !sharingContact?.invited_user_id) {
      toast.error('Contact must accept their invitation before you can share items.');
      return;
    }
    const viewerId = sharingContact.invited_user_id;

    // Delete all existing shares for this viewer from this owner
    await (supabase.from('shared_access').delete() as any)
      .eq('owner_user_id', user.id)
      .eq('viewer_user_id', viewerId);

    // Insert new shares
    const rows: any[] = [];
    for (const itemId of selectedItemIds) {
      rows.push({ owner_user_id: user.id, viewer_user_id: viewerId, vault_item_id: itemId, permission_level: 'read_only' });
    }
    for (const docId of selectedDocIds) {
      rows.push({ owner_user_id: user.id, viewer_user_id: viewerId, document_id: docId, permission_level: 'read_only' });
    }
    if (rows.length > 0) {
      const { error } = await (supabase.from('shared_access').insert(rows) as any);
      if (error) { toast.error(error.message); return; }
    }
    toast.success('Sharing updated');
    setSharingDialogOpen(false);
  };

  const toggleItem = (id: string) => {
    setSelectedItemIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleDoc = (id: string) => {
    setSelectedDocIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
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
              <p className="text-xs text-muted-foreground">Access level: View Only — contacts can only view items you share with them.</p>
              <Button onClick={handleSave} className="w-full">{editing ? 'Update Contact' : 'Add & Invite Contact'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sharing Dialog */}
      <Dialog open={sharingDialogOpen} onOpenChange={setSharingDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Manage Sharing — {sharingContact?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {!sharingContact?.invited_user_id && (
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                This contact hasn't accepted their invitation yet. You can configure sharing now, and it will apply once they accept.
              </p>
            )}

            {vaultItems.length > 0 && (
              <div>
                <Label className="text-sm font-semibold">Vault Items</Label>
                <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                  {vaultItems.map(item => (
                    <label key={item.id} className="flex items-center gap-2 cursor-pointer text-sm">
                      <Checkbox
                        checked={selectedItemIds.includes(item.id)}
                        onCheckedChange={() => toggleItem(item.id)}
                      />
                      <span className="text-foreground">{item.title}</span>
                      <span className="text-xs text-muted-foreground">({item.category})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {documents.length > 0 && (
              <div>
                <Label className="text-sm font-semibold">Documents</Label>
                <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                  {documents.map(doc => (
                    <label key={doc.id} className="flex items-center gap-2 cursor-pointer text-sm">
                      <Checkbox
                        checked={selectedDocIds.includes(doc.id)}
                        onCheckedChange={() => toggleDoc(doc.id)}
                      />
                      <span className="text-foreground">{doc.file_name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {vaultItems.length === 0 && documents.length === 0 && (
              <p className="text-sm text-muted-foreground">No vault items or documents to share yet. Add some first.</p>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSaveSharing} className="flex-1" disabled={!sharingContact?.invited_user_id}>
                Save Sharing
              </Button>
              <Button variant="outline" onClick={() => setSharingDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-xs font-medium text-primary bg-vault-blue-light px-2 py-0.5 rounded-full">View Only</span>
                  {c.invited_user_id ? (
                    <span className="text-xs font-medium text-vault-green flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Accepted!
                    </span>
                  ) : c.invitation_sent ? (() => {
                    const sentAt = c.invitation_sent_at ? new Date(c.invitation_sent_at).getTime() : 0;
                    const threeHoursMs = 3 * 60 * 60 * 1000;
                    const canResend = Date.now() - sentAt > threeHoursMs;
                    return canResend ? (
                      <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 text-primary" disabled={inviting === c.id} onClick={() => sendInvite(c.id)}>
                        <Mail className="h-3 w-3" />
                        {inviting === c.id ? 'Generating...' : 'Copy New Link'}
                      </Button>
                    ) : (
                      <span className="text-xs font-medium text-vault-gold flex items-center gap-1">
                        <Mail className="h-3 w-3" /> Link Generated
                      </span>
                    );
                  })() : c.email ? (
                    <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 text-primary" disabled={inviting === c.id} onClick={() => sendInvite(c.id)}>
                      <Mail className="h-3 w-3" />
                      {inviting === c.id ? 'Generating...' : 'Get Invite Link'}
                    </Button>
                  ) : null}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full text-xs"
                  onClick={() => openSharingDialog(c)}
                >
                  Manage Shared Items
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrustedContacts;
