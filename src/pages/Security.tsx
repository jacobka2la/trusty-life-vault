import { Shield, Lock, Eye, UserCheck, KeyRound } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const securityItems = [
  { icon: Lock, title: 'Encrypted Storage', desc: 'All data is encrypted at rest and in transit using industry-standard AES-256 encryption. Your information is protected at every step.' },
  { icon: Eye, title: 'User-Controlled Access', desc: 'You decide who sees what. Set granular permissions for each trusted contact, and revoke access anytime.' },
  { icon: Shield, title: 'Privacy-First Design', desc: 'We never sell or share your data. DocuVault is designed from the ground up with your privacy as the top priority.' },
  { icon: KeyRound, title: 'Secure Authentication', desc: 'Protected by secure email/password authentication with password hashing, session management, and password reset capabilities.' },
  { icon: UserCheck, title: 'Trusted Contact Permissions', desc: 'Each trusted contact gets only the access level you choose. Full control stays with you at all times.' },
];

const Security = () => (
  <div className="py-20">
    <div className="container max-w-4xl">
      <div className="text-center mb-16">
        <Shield className="h-14 w-14 text-primary mx-auto mb-4" />
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">Your Security Comes First</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          We understand you're trusting us with your most sensitive information. That's why security isn't just a feature — it's the foundation of everything we build.
        </p>
      </div>
      <div className="space-y-6">
        {securityItems.map((item, i) => (
          <Card key={i} className="shadow-vault">
            <CardContent className="p-6 flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl bg-vault-blue-light flex items-center justify-center flex-shrink-0">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="mt-12 bg-vault-blue-light border-primary/20 shadow-vault-lg">
        <CardContent className="p-8 text-center">
          <h3 className="font-heading text-xl font-bold text-foreground mb-3">Our Security Promise</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your data belongs to you. We will never access, sell, or share your personal information. DocuVault exists to serve you and your family — nothing else.
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default Security;
