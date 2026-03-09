import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, ArrowLeft, Users, Eye } from 'lucide-react';

interface PlanSelectionProps {
  onSelect: (plan: string) => void;
  isInvitedViewer?: boolean;
  onSkipAsViewer?: () => void;
}

const sharedFeatures = ['Unlimited vault items', 'Document uploads', 'Trusted contacts', 'Update reminders', 'Priority support'];

const plans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$6',
    period: '/month',
    subtext: 'Billed monthly',
    features: sharedFeatures,
    cta: 'Choose Monthly',
    featured: false,
  },
  {
    id: 'annual',
    name: 'Annual',
    price: '$59',
    period: '/year',
    subtext: 'Save ~18%',
    features: [...sharedFeatures, 'Best value'],
    cta: 'Choose Annual',
    featured: true,
  },
];

const PlanSelection = ({ onSelect, isInvitedViewer }: PlanSelectionProps) => {
  const navigate = useNavigate();
  return (
  <div className="max-w-4xl mx-auto py-8">
    <div className="mb-6">
      <Button variant="ghost" onClick={() => navigate('/')} className="gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Button>
    </div>

    <div className="text-center mb-10">
      <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
      <h2 className="font-heading text-3xl font-bold text-foreground mb-2">
        {isInvitedViewer ? 'Welcome to DocuVault' : 'Choose Your Plan'}
      </h2>
      <p className="text-muted-foreground text-lg">
        {isInvitedViewer 
          ? "You've been invited as a Trusted Contact. View shared items for free, or start your own vault."
          : 'Select a plan to start organizing your important information.'}
      </p>
    </div>

    {/* Trusted Contact Free Option */}
    {isInvitedViewer && (
      <Card className="mb-8 border-primary/30 bg-primary/5 shadow-vault">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Eye className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-heading font-semibold text-foreground mb-1">Trusted Contact Only — Free</h3>
            <p className="text-sm text-muted-foreground">
              View items shared with you at no cost. You can always upgrade to your own vault later.
            </p>
          </div>
          <Button onClick={() => onSelect('trusted_contact_only')} variant="default" className="flex-shrink-0 whitespace-nowrap">
            Continue as Trusted Contact
          </Button>
        </CardContent>
      </Card>
    )}

    {isInvitedViewer && (
      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Or start your own vault</p>
      </div>
    )}

    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={`h-full flex flex-col ${plan.featured ? 'border-primary shadow-vault-lg ring-2 ring-primary/20' : 'shadow-vault'}`}
        >
          <CardHeader className="text-center pb-2">
            {plan.featured && (
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mx-auto mb-2 inline-block">
                Most Popular
              </span>
            )}
            <CardTitle className="font-heading text-xl">{plan.name}</CardTitle>
            <div className="mt-3">
              <span className="text-3xl font-bold text-foreground">{plan.price}</span>
              {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{plan.subtext}</p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <ul className="space-y-3 flex-1 mb-6">
              {plan.features.map((f, j) => (
                <li key={j} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 text-accent flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              variant={plan.featured ? 'default' : 'outline'}
              onClick={() => onSelect(plan.id)}
            >
              {plan.cta}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);
};

export default PlanSelection;
