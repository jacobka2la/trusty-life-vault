import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { UserPlus, FolderPlus, Upload, Users, Eye, Bell, ArrowRight } from 'lucide-react';

const steps = [
  { icon: UserPlus, title: 'Create Your Secure Account', desc: 'Sign up in seconds with just your name, email, and a password.' },
  { icon: FolderPlus, title: 'Add Your First Important Item', desc: 'Store details about bank accounts, insurance policies, legal documents, and more.' },
  { icon: Upload, title: 'Upload Files & Organize', desc: 'Attach PDFs, images, and documents to keep everything in one place.' },
  { icon: Users, title: 'Add Trusted Contacts', desc: 'Designate family members or advisors who can access selected information.' },
  { icon: Eye, title: 'Preview What Loved Ones See', desc: 'Review exactly what your trusted contacts would access when needed.' },
  { icon: Bell, title: 'Keep Everything Updated', desc: 'Set reminders to review and update your vault periodically.' },
];

const HowItWorks = () => (
  <div className="py-20">
    <div className="container max-w-4xl">
      <div className="text-center mb-16">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">How DocuVault Works</h1>
        <p className="text-lg text-muted-foreground">Six simple steps to organize and protect your most important information.</p>
      </div>
      <div className="space-y-8">
        {steps.map((step, i) => (
          <Card key={i} className="shadow-vault">
            <CardContent className="p-6 flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl bg-vault-blue-light flex items-center justify-center flex-shrink-0">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-bold text-primary bg-vault-blue-light px-2 py-0.5 rounded-full">Step {i + 1}</span>
                  <h3 className="font-heading font-semibold text-foreground">{step.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="text-center mt-12">
        <Button size="lg" asChild>
          <Link to="/signup">Get Started Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  </div>
);

export default HowItWorks;
