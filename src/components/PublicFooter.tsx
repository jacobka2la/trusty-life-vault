import Logo from '@/components/Logo';
import { Link } from 'react-router-dom';

export const PublicFooter = () => (
  <footer className="border-t border-border bg-muted/30 py-12">
    <div className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-3">
            <SLogo className="h-6 w-6 />
            <span className="font-heading text-lg font-bold text-foreground">DocuVault</span>
          </Link>
          <p className="text-sm text-muted-foreground">Your secure digital vault for life's important information.</p>
        </div>
        <div>
          <h4 className="font-heading font-semibold text-foreground mb-3">Product</h4>
          <div className="space-y-2">
            <Link to="/features" className="block text-sm text-muted-foreground hover:text-foreground">Features</Link>
            <Link to="/pricing" className="block text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
            <Link to="/security" className="block text-sm text-muted-foreground hover:text-foreground">Security</Link>
          </div>
        </div>
        <div>
          <h4 className="font-heading font-semibold text-foreground mb-3">Company</h4>
          <div className="space-y-2">
            <Link to="/how-it-works" className="block text-sm text-muted-foreground hover:text-foreground">How It Works</Link>
            <Link to="/contact" className="block text-sm text-muted-foreground hover:text-foreground">Contact</Link>
            <Link to="/faq" className="block text-sm text-muted-foreground hover:text-foreground">FAQ</Link>
          </div>
        </div>
        <div>
          <h4 className="font-heading font-semibold text-foreground mb-3">Legal</h4>
          <div className="space-y-2">
            <span className="block text-sm text-muted-foreground">Privacy Policy</span>
            <span className="block text-sm text-muted-foreground">Terms of Service</span>
          </div>
        </div>
      </div>
      <div className="mt-10 pt-6 border-t border-border text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} DocuVault. All rights reserved.
      </div>
    </div>
  </footer>
);
