import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, FileText, Trash2, Upload, Download } from 'lucide-react';
import { toast } from 'sonner';

interface DocRecord {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  uploaded_at: string;
}

const Documents = () => {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const fetchDocs = async () => {
    if (!user) return;
    const { data } = await supabase.from('documents').select('*').eq('user_id', user.id).order('uploaded_at', { ascending: false });
    setDocs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchDocs(); }, [user]);

  const handleUpload = async () => {
    if (!user || !file) { toast.error('Please select a file'); return; }
    setUploading(true);
    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('vault-documents').upload(filePath, file);
    if (uploadError) { toast.error(uploadError.message); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from('vault-documents').getPublicUrl(filePath);

    const { error } = await supabase.from('documents').insert({
      user_id: user.id,
      file_name: file.name,
      file_url: urlData.publicUrl || filePath,
      file_type: file.type,
    });
    if (error) { toast.error(error.message); setUploading(false); return; }
    toast.success('Document uploaded');
    setDialogOpen(false);
    setFile(null);
    setUploading(false);
    fetchDocs();
  };

  const handleDownload = async (doc: DocRecord) => {
    // Extract the storage path from the public URL
    const bucketUrl = '/storage/v1/object/public/vault-documents/';
    let filePath = doc.file_url;
    if (filePath.includes(bucketUrl)) {
      filePath = filePath.split(bucketUrl).pop() || filePath;
    }
    const { data, error } = await supabase.storage.from('vault-documents').createSignedUrl(filePath, 60);
    if (error || !data?.signedUrl) {
      toast.error('Could not generate download link');
      return;
    }
    window.open(data.signedUrl, '_blank');
  };

  const handleDelete = async (doc: DocRecord) => {
    const { error } = await supabase.from('documents').delete().eq('id', doc.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Document deleted');
    fetchDocs();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Documents</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Upload Document</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">Upload Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Choose File</Label>
                <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
              </div>
              {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}
              <Button onClick={handleUpload} className="w-full" disabled={uploading}>
                <Upload className="h-4 w-4 mr-2" /> {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : docs.length === 0 ? (
        <Card className="shadow-vault"><CardContent className="p-8 text-center text-muted-foreground">No documents uploaded yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {docs.map(doc => (
            <Card key={doc.id} className="shadow-vault">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium text-foreground text-sm">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(doc.uploaded_at).toLocaleDateString()} • {doc.file_type}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(doc)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Documents;
