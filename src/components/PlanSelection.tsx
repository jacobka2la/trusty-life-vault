import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, ArrowLeft } from 'lucide-react';

interface PlanSelectionProps {
  onSelect: (plan: string) => void;
}

const plans = [
  {
    id: 'trial',
    name: 'Free Trial',
    price: 'Start Your 14-Day Free Trial',
    subtext: 'then $6/mo',
    features: ['Full vault access for 14 days', 'Unlimited vault items', 'Document uploads', 'Trusted contacts', 'Cancel anytime'],
    cta: 'Start Free Trial',
    featured: false,
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$6',
    period: '/month',
    subtext: 'Billed monthly',
    features: ['Unlimited vault items', 'Document uploads', 'Trusted contacts', 'Update reminders', 'Priority support'],
    cta: 'Choose Monthly',
    featured: true,
  },
  {
    id: 'annual',
    name: 'Annual',
    price: '$59',
    period: '/year',
    subtext: 'Save ~18%',
    features: ['Everything in Monthly', 'Best value', 'Family packet export', 'Emergency access', 'Dedicated support'],
    cta: 'Choose Annual',
    featured: false,
  },
];

const PlanSelection = ({ onSelect }: PlanSelectionProps) => {
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
      <h2 className="font-heading text-3xl font-bold text-foreground mb-2">Choose Your Plan</h2>
      <p className="text-muted-foreground text-lg">Select a plan to start organizing your important information.</p>
    </div>
    <div className="grid md:grid-cols-3 gap-6">
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

export default PlanSelection;
