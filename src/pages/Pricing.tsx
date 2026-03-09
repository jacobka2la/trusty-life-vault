import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Monthly',
    price: '$6',
    period: '/month',
    desc: 'Billed monthly',
    features: ['Unlimited vault items', 'Document uploads', 'Trusted contacts', 'Update reminders', 'Priority support'],
    cta: 'Get Started',
    featured: false,
  },
  {
    name: 'Annual',
    price: '$59',
    period: '/year',
    desc: 'Save ~18%',
    features: ['Unlimited vault items', 'Document uploads', 'Trusted contacts', 'Update reminders', 'Priority support', 'Best value'],
    cta: 'Get Annual Plan',
    featured: true,
  },
];

const Pricing = () => (
  <div className="py-20">
    <div className="container max-w-4xl">
      <div className="text-center mb-16">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h1>
        <p className="text-lg text-muted-foreground">Choose the plan that works for you.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {plans.map((plan, i) => (
          <Card key={i} className={`h-full flex flex-col ${plan.featured ? 'border-primary shadow-vault-lg ring-2 ring-primary/20' : 'shadow-vault'}`}>
            <CardHeader className="text-center pb-2">
              {plan.featured && <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mx-auto mb-2 inline-block">Best Value</span>}
              <CardTitle className="font-heading text-xl">{plan.name}</CardTitle>
              <p className="text-muted-foreground text-sm">{plan.desc}</p>
              <div className="mt-3">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
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
              <Button className="w-full" variant={plan.featured ? 'default' : 'outline'} asChild>
                <Link to="/signup">{plan.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

export default Pricing;
