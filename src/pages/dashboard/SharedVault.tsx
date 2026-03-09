import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, FileText, User, Shield, Download } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface SharedVaultData {
  ownerName: string;
  ownerId: string;
  vaultItems: any[];
  documents: any[];
}

const SharedVault = () => {
  const { user } = useAuth();
  const [sharedVaults, setSharedVaults] = useState<SharedVaultData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchShared = async () => {
      // Find all trusted_contacts entries where this user is the invited contact
      const { data: contacts } = await (supabase
        .from('trusted_contacts')
        .select('user_id') as any)
        .eq('invited_user_id', user.id);

      if (!contacts || contacts.length === 0) {
        setLoading(false);
        return;
      }

      const ownerIds = contacts.map((c: any) => c.user_id);

      const vaults: SharedVaultData[] = [];
      for (const ownerId of ownerIds) {
        // Get shared_access entries for this viewer from this owner
        const [{ data: profile }, { data: shares }] = await Promise.all([
          supabase.from('profiles').select('first_name, last_name').eq('user_id', ownerId).single(),
          (supabase.from('shared_access').select('vault_item_id, document_id') as any)
            .eq('owner_user_id', ownerId)
            .eq('viewer_user_id', user.id),
        ]);

        const shareData = (shares || []) as any[];
        const itemIds = shareData.filter((s: any) => s.vault_item_id).map((s: any) => s.vault_item_id);
        const docIds = shareData.filter((s: any) => s.document_id).map((s: any) => s.document_id);

        let items: any[] = [];
        let docs: any[] = [];

        if (itemIds.length > 0) {
          const { data } = await supabase.from('vault_items').select('*').in('id', itemIds).order('updated_at', { ascending: false });
          items = data || [];
        }
        if (docIds.length > 0) {
          const { data } = await supabase.from('documents').select('*').in('id', docIds).order('uploaded_at', { ascending: false });
          docs = data || [];
        }

        if (items.length > 0 || docs.length > 0) {
          vaults.push({
            ownerName: profile ? `${profile.first_name} ${profile.last_name}`.trim() : 'Unknown',
            ownerId,
            vaultItems: items,
            documents: docs,
          });
        }
      }
      setSharedVaults(vaults);
      setLoading(false);
    };
    fetchShared();
  }, [user]);

  if (loading) {
    return <p className="text-muted-foreground">Loading shared vaults...</p>;
  }

  if (sharedVaults.length === 0) {
    return (
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Shared With Me</h1>
        <Card className="shadow-vault">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <p className="text-muted-foreground text-lg font-medium mb-1">No shared content yet</p>
            <p className="text-sm text-muted-foreground">When someone shares their vault items with you, they'll appear here.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Shared With Me</h1>
      <p className="text-muted-foreground text-sm mb-6">Read-only access to items shared by your trusted connections.</p>
      <div className="space-y-8">
        {sharedVaults.map((vault) => (
          <div key={vault.ownerId}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-vault-blue-light flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold text-foreground">{vault.ownerName}'s Vault</h2>
                <p className="text-xs text-muted-foreground">Shared with you · Read only</p>
              </div>
            </div>

            {vault.vaultItems.length > 0 && (
              <>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" /> Vault Items ({vault.vaultItems.length})
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                  {vault.vaultItems.map((item: any) => (
                    <Card key={item.id} className="shadow-vault">
                      <CardHeader className="pb-2">
                        <CardTitle className="font-heading text-base">{item.title}</CardTitle>
                        <span className="text-xs text-muted-foreground">{item.category}</span>
                      </CardHeader>
                      <CardContent>
                        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                        {item.website_or_institution && (
                          <p className="text-xs text-muted-foreground mt-1">{item.website_or_institution}</p>
                        )}
                        {item.notes && (
                          <p className="text-xs text-muted-foreground mt-2 italic">{item.notes}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {vault.documents.length > 0 && (
              <>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Documents ({vault.documents.length})
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {vault.documents.map((doc: any) => (
                    <Card key={doc.id} className="shadow-vault">
                      <CardContent className="p-4">
                        <p className="text-sm font-medium text-foreground">{doc.file_name}</p>
                        <p className="text-xs text-muted-foreground">{doc.file_type}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            <Separator className="mt-6" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SharedVault;
