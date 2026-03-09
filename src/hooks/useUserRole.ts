import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'owner' | 'viewer' | 'both';

interface UserRoleInfo {
  role: UserRole;
  isOwner: boolean;
  isViewer: boolean;
  hasPlan: boolean;
  loading: boolean;
}

export const useUserRole = (): UserRoleInfo => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>('viewer');
  const [hasPlan, setHasPlan] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const check = async () => {
      const [{ data: profile }, { data: contactLinks }] = await Promise.all([
        supabase.from('profiles').select('selected_plan').eq('user_id', user.id).single(),
        (supabase.from('trusted_contacts').select('id') as any).eq('invited_user_id', user.id).limit(1),
      ]);

      const plan = profile?.selected_plan || localStorage.getItem('docuvault_selected_plan') || null;
      const isViewer = !!(contactLinks && contactLinks.length > 0);
      const isOwner = !!plan;

      setHasPlan(isOwner);

      if (isOwner && isViewer) setRole('both');
      else if (isOwner) setRole('owner');
      else setRole('viewer');

      setLoading(false);
    };
    check();
  }, [user]);

  return {
    role,
    isOwner: role === 'owner' || role === 'both',
    isViewer: role === 'viewer' || role === 'both',
    hasPlan,
    loading,
  };
};
