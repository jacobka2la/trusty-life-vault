import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LayoutDashboard, FolderOpen, FileText, Users, Bell, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PlanSelection from '@/components/PlanSelection';
import Logo from '@/components/Logo';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Vault Items', href: '/dashboard/vault', icon: FolderOpen },
  { label: 'Documents', href: '/dashboard/documents', icon: FileText },
  { label: 'Contacts', href: '/dashboard/contacts', icon: Users },
  { label: 'Reminders', href: '/dashboard/reminders', icon: Bell },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export const DashboardLayout = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(localStorage.getItem('docuvault_selected_plan'));
  const [hasAssets, setHasAssets] = useState(false);
  const [checkingAssets, setCheckingAssets] = useState(true);

  useEffect(() => {
    if (!user) return;
    const check = async () => {
      const [{ count: vaultCount }, { count: docCount }] = await Promise.all([
        supabase.from('vault_items').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('documents').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);
      setHasAssets((vaultCount ?? 0) > 0 || (docCount ?? 0) > 0);
      setCheckingAssets(false);
    };
    check();
  }, [user, location.pathname]);

  const needsPlan = hasAssets && !selectedPlan;

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
    localStorage.setItem('docuvault_selected_plan', plan);
  };

  const handleLogout = async () => {
    await signOut();
  };

  // Plan gate with smooth transition
  return (
    <AnimatePresence mode="wait">
      {!checkingAssets && needsPlan ? (
        <motion.div
          key="plan-gate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen flex items-center justify-center bg-background p-4"
        >
          <PlanSelection onSelect={handlePlanSelect} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="min-h-screen flex flex-col bg-background"
        >
          {/* Top nav bar with logo + horizontal nav */}
          <header className="sticky top-0 z-30 bg-card border-b border-border">
            <div className="flex items-center h-14 px-4 gap-4">
              <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
                <Logo className="h-9 w-9" />
                <span className="font-heading text-lg font-bold text-foreground hidden sm:inline">DocuVault</span>
              </Link>

              {/* Scrollable nav links */}
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

          {/* Main content */}
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
