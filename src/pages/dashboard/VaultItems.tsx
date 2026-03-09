import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Search, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';


const categories = ['Legal', 'Financial', 'Insurance', 'Property', 'Digital Accounts', 'Personal Wishes', 'Medical', 'IDs'];

interface VaultItem {
  id: string;
  title: string;
  category: string;
  description: string | null;
  notes: string | null;
  account_number_or_identifier: string | null;
  website_or_institution: string | null;
  attachment_url: string | null;
  visibility: string;
  created_at: string;
}

const emptyForm = { title: '', category: 'Personal Wishes', description: '', notes: '', account_number_or_identifier: '', website_or_institution: '' };

const VaultItems = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchItems = async () => {
    if (!user) return;
    const { data } = await supabase.from('vault_items').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [user]);


  const handleSave = async () => {
    if (!user || !form.title.trim()) { toast.error('Title is required'); return; }
    setUploading(true);

    let attachmentUrl: string | null = null;

    // Upload file if one is selected
    if (file) {
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('vault-documents').upload(filePath, file);
      if (uploadError) { toast.error(uploadError.message); setUploading(false); return; }
      const { data: urlData } = supabase.storage.from('vault-documents').getPublicUrl(filePath);
      attachmentUrl = urlData.publicUrl || filePath;

      // Also save to documents table
      await supabase.from('documents').insert({
        user_id: user.id,
        file_name: file.name,
        file_url: attachmentUrl,
        file_type: file.type,
      });
    }

    const payload = {
      ...form,
      ...(attachmentUrl ? { attachment_url: attachmentUrl } : {}),
    };

    if (editing) {
      const { error } = await supabase.from('vault_items').update(payload).eq('id', editing);
      if (error) { toast.error(error.message); setUploading(false); return; }
      toast.success('Item updated');
    } else {
      const { error } = await supabase.from('vault_items').insert({ ...payload, user_id: user.id });
      if (error) { toast.error(error.message); setUploading(false); return; }
      toast.success('Item added');
    }
    setDialogOpen(false);
    setForm(emptyForm);
    setFile(null);
    setEditing(null);
    setUploading(false);
    fetchItems();
  };

  const handleEdit = (item: VaultItem) => {
    setForm({
      title: item.title,
      category: item.category,
      description: item.description || '',
      notes: item.notes || '',
      account_number_or_identifier: item.account_number_or_identifier || '',
      website_or_institution: item.website_or_institution || '',
    });
    setEditing(item.id);
    setFile(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('vault_items').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Item deleted');
    fetchItems();
  };

  const filtered = items.filter(i =>
    (filter === 'all' || i.category === filter) &&
    (search === '' || i.title.toLowerCase().includes(search.toLowerCase()))
  );


  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Vault Items</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setForm(emptyForm); setEditing(null); setFile(null); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Item</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">{editing ? 'Edit Vault Item' : 'Add Vault Item'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Chase Savings Account" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Institution / Website</Label>
                <Input value={form.website_or_institution} onChange={(e) => setForm({ ...form, website_or_institution: e.target.value })} placeholder="e.g., Chase Bank" />
              </div>
              <div className="space-y-2">
                <Label>Account # / Identifier</Label>
                <Input value={form.account_number_or_identifier} onChange={(e) => setForm({ ...form, account_number_or_identifier: e.target.value })} placeholder="e.g., ****1234" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes" rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Attach File (PDF, image, doc)</Label>
                <Input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                {file && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    {file.name}
                  </div>
                )}
              </div>
              <Button onClick={handleSave} className="w-full" disabled={uploading}>
                {uploading ? (
                  <><Upload className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  editing ? 'Update Item' : 'Add Item'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : filtered.length === 0 ? (
        <Card className="shadow-vault"><CardContent className="p-8 text-center text-muted-foreground">No vault items yet. Add your first item to get started!</CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(item => (
            <Card key={item.id} className="shadow-vault hover:shadow-vault-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{item.category}</span>
                    <CardTitle className="font-heading text-base mt-2">{item.title}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {item.website_or_institution && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground/70">Institution:</span> {item.website_or_institution}
                  </p>
                )}
                {item.account_number_or_identifier && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground/70">Account/ID:</span> {item.account_number_or_identifier}
                  </p>
                )}
                {item.description && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground/70">Description:</span> {item.description}
                  </p>
                )}
                {item.notes && (
                  <p className="text-sm text-muted-foreground italic border-l-2 border-muted pl-2 mt-2">
                    {item.notes}
                  </p>
                )}
                {item.attachment_url && (
                  <a href={item.attachment_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2">
                    <FileText className="h-3.5 w-3.5" /> View attachment
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VaultItems;
