import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LayoutDashboard, FolderOpen, FileText, Users, Bell, Settings, LogOut, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PlanSelection from '@/components/PlanSelection';
import Logo from '@/components/Logo';

const ownerNavItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Vault Items', href: '/dashboard/vault', icon: FolderOpen },
  { label: 'Documents', href: '/dashboard/documents', icon: FileText },
  { label: 'Contacts', href: '/dashboard/contacts', icon: Users },
  { label: 'Reminders', href: '/dashboard/reminders', icon: Bell },
  { label: 'Shared With Me', href: '/dashboard/shared', icon: Eye },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const viewerOnlyNavItems = [
  { label: 'Shared With Me', href: '/dashboard/shared', icon: Eye },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export const DashboardLayout = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [checkingPlan, setCheckingPlan] = useState(true);
  const [isViewOnlyContact, setIsViewOnlyContact] = useState(false);

  useEffect(() => {
    if (!user) return;
    const check = async () => {
      const [{ data: profileData }, { data: contactLinks }] = await Promise.all([
        supabase.from('profiles').select('selected_plan').eq('user_id', user.id).single(),
        (supabase.from('trusted_contacts').select('id') as any).eq('invited_user_id', user.id).limit(1),
      ]);
      const plan = (profileData as any)?.selected_plan || null;
      setSelectedPlan(plan);
      setIsViewOnlyContact(!!(contactLinks && contactLinks.length > 0));
      setCheckingPlan(false);
    };
    check();
  }, [user]);

  const needsPlan = !selectedPlan;

  const handlePlanSelect = async (plan: string) => {
    setSelectedPlan(plan);
    localStorage.setItem('docuvault_selected_plan', plan);
    if (user) {
      await supabase.from('profiles').update({ selected_plan: plan } as any).eq('user_id', user.id);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const isOwnerPlan = selectedPlan && selectedPlan !== 'trusted_contact_only';
  const navItems = isOwnerPlan ? ownerNavItems : viewerOnlyNavItems;

  return (
    <AnimatePresence mode="wait">
      {!checkingPlan && needsPlan ? (
        <motion.div
          key="plan-gate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen flex items-center justify-center bg-background p-4"
        >
          <PlanSelection
            onSelect={handlePlanSelect}
            isInvitedViewer={isViewOnlyContact}
          />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="min-h-screen flex flex-col bg-background"
        >
          <header className="sticky top-0 z-30 bg-card border-b border-border">
            <div className="flex items-center h-14 px-4 gap-4">
              <Link to={isOwnerPlan ? "/dashboard" : "/dashboard/shared"} className="flex items-center gap-2 flex-shrink-0">
                <Logo className="h-9 w-9" />
                <span className="font-heading text-lg font-bold text-foreground hidden sm:inline">DocuVault</span>
              </Link>

              <nav className="flex-1 overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-1 min-w-max">
                  {navItems.map((item) => {
                    const active = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                          active
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </nav>

              <Button variant="ghost" size="icon" onClick={handleLogout} className="flex-shrink-0 text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
