import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: '/month',
    desc: 'Perfect for getting started',
    features: ['Up to 10 vault items', '5 document uploads', '1 trusted contact', 'Basic categories', 'Email support'],
    cta: 'Start Free',
    featured: false,
  },
  {
    name: 'Family',
    price: '$9',
    period: '/month',
    desc: 'For individuals and families',
    features: ['Unlimited vault items', '50 document uploads', '5 trusted contacts', 'All categories', 'Update reminders', 'Priority support'],
    cta: 'Get Family Plan',
    featured: true,
  },
  {
    name: 'Premium',
    price: '$19',
    period: '/month',
    desc: 'Full protection and legacy planning',
    features: ['Everything in Family', 'Unlimited documents', 'Unlimited contacts', 'Family packet export', 'Emergency access', 'Dedicated support', 'Advanced permissions'],
    cta: 'Go Premium',
    featured: false,
  },
];

const Pricing = () => (
  <div className="py-20">
    <div className="container max-w-5xl">
      <div className="text-center mb-16">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h1>
        <p className="text-lg text-muted-foreground">Start free. Upgrade when you need more.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan, i) => (
          <Card key={i} className={`h-full flex flex-col ${plan.featured ? 'border-primary shadow-vault-lg ring-2 ring-primary/20' : 'shadow-vault'}`}>
            <CardHeader className="text-center pb-2">
              {plan.featured && <span className="text-xs font-bold text-primary bg-vault-blue-light px-3 py-1 rounded-full mx-auto mb-2 inline-block">Most Popular</span>}
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
                    <Check className="h-4 w-4 text-vault-green flex-shrink-0" />
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
