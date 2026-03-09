import { Card, CardContent } from '@/components/ui/card';
import { Shield, FileText, Users, Download, Bell, Lock, LayoutDashboard, FolderOpen } from 'lucide-react';

const features = [
  { icon: Shield, title: 'Digital Asset Storage', desc: 'Store bank accounts, investments, insurance policies, crypto wallets, and more in one secure place.' },
  { icon: FileText, title: 'Important Document Uploads', desc: 'Upload wills, trusts, deeds, contracts, and other critical documents as PDFs or images.' },
  { icon: Users, title: 'Trusted Contacts', desc: 'Designate family members, attorneys, or advisors who can access your information.' },
  { icon: Download, title: 'Family Packet Export', desc: 'Generate a printable summary of key information for your trusted contacts.' },
  { icon: Lock, title: 'Emergency Planning', desc: 'Prepare your family with organized access to accounts and documents in case of emergency.' },
  { icon: Bell, title: 'Update Reminders', desc: 'Set periodic reminders to review and update your vault — quarterly, yearly, or custom.' },
  { icon: LayoutDashboard, title: 'Secure Dashboard', desc: 'A clean, intuitive dashboard to manage all your vault items, documents, and contacts.' },
  { icon: FolderOpen, title: 'Organized Categories', desc: 'Sort your items into categories like Legal, Financial, Insurance, Medical, IDs, and more.' },
];

const Features = () => (
  <div className="py-20">
    <div className="container max-w-5xl">
      <div className="text-center mb-16">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">Features</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Everything you need to organize, protect, and share life's most important information.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <Card key={i} className="shadow-vault hover:shadow-vault-lg transition-shadow h-full">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-vault-blue-light flex items-center justify-center mx-auto mb-4">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

export default Features;
