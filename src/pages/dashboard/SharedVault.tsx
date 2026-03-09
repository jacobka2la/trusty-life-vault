import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, FileText, User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface SharedVault {
  ownerName: string;
  ownerId: string;
  vaultItems: any[];
  documents: any[];
}

const SharedVault = () => {
  const { user } = useAuth();
  const [sharedVaults, setSharedVaults] = useState<SharedVault[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchShared = async () => {
      // Find all trusted_contacts entries where this user is the invited contact
      const { data: contacts } = await supabase
        .from('trusted_contacts')
        .select('user_id')
        .eq('invited_user_id' as any, user.id);

      if (!contacts || contacts.length === 0) {
        setLoading(false);
        return;
      }

      const ownerIds = contacts.map((c: any) => c.user_id);

      // Fetch vault items and documents for each owner (RLS allows this)
      const vaults: SharedVault[] = [];
      for (const ownerId of ownerIds) {
        const [{ data: profile }, { data: items }, { data: docs }] = await Promise.all([
          supabase.from('profiles').select('first_name, last_name').eq('user_id', ownerId).single(),
          supabase.from('vault_items').select('*').eq('user_id', ownerId).order('updated_at', { ascending: false }),
          supabase.from('documents').select('*').eq('user_id', ownerId).order('uploaded_at', { ascending: false }),
        ]);
        vaults.push({
          ownerName: profile ? `${profile.first_name} ${profile.last_name}`.trim() : 'Unknown',
          ownerId,
          vaultItems: items || [],
          documents: docs || [],
        });
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
        <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Shared Vaults</h1>
        <Card className="shadow-vault">
          <CardContent className="p-8 text-center text-muted-foreground">
            No one has shared their vault with you yet.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Shared Vaults</h1>
      <div className="space-y-8">
        {sharedVaults.map((vault) => (
          <div key={vault.ownerId}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-vault-blue-light flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-heading text-xl font-semibold text-foreground">{vault.ownerName}'s Vault</h2>
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

            {vault.vaultItems.length === 0 && vault.documents.length === 0 && (
              <p className="text-sm text-muted-foreground">This vault is empty.</p>
            )}

            <Separator className="mt-6" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SharedVault;
