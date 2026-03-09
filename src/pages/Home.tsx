import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, Users, FileText, Bell, Download, CheckCircle, ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const Home = () => (
  <div>
    {/* Hero */}
    <section className="bg-gradient-hero py-20 lg:py-32">
      <div className="container text-center max-w-4xl">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6 }}>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            Protect & Organize <br className="hidden md:block" />
            <span className="text-gradient-primary">Life's Important Information</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            A secure digital vault for your documents, accounts, and wishes — so you and your loved ones always have access to what matters most.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild className="text-base px-8">
              <Link to="/signup">Start My Vault <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8">
              <Link to="/how-it-works">How It Works</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>

    {/* What DocuVault Stores */}
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">Everything in One Secure Place</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">From legal documents to digital accounts, DocuVault keeps your most important information organized and accessible.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: FileText, title: 'Legal Documents', desc: 'Wills, trusts, power of attorney' },
            { icon: Shield, title: 'Financial Accounts', desc: 'Bank accounts, investments, insurance' },
            { icon: Lock, title: 'Digital Accounts', desc: 'Logins, subscriptions, crypto' },
            { icon: Users, title: 'Personal Wishes', desc: 'Medical directives, final wishes' },
          ].map((item, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}>
              <Card className="h-full shadow-vault hover:shadow-vault-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-vault-blue-light flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Why It Matters */}
    <section className="py-20 bg-muted/30">
      <div className="container max-w-4xl text-center">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">Why It Matters</h2>
        <p className="text-muted-foreground text-lg mb-10">Life is unpredictable. Having your important information organized isn't just smart — it's a gift to the people you care about.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Peace of Mind', desc: 'Know that your important information is safely stored and always accessible.' },
            { title: 'Family Protection', desc: 'Ensure your loved ones can find what they need during difficult times.' },
            { title: 'Stay Organized', desc: 'Keep track of accounts, documents, and details that matter most.' },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <CheckCircle className="h-8 w-8 text-vault-green mx-auto mb-3" />
              <h3 className="font-heading font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Trusted Contacts */}
    <section className="py-20">
      <div className="container max-w-4xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-heading text-3xl font-bold text-foreground mb-4">Share With People You Trust</h2>
            <p className="text-muted-foreground mb-6">Add trusted contacts who can access selected information when needed. You control exactly who sees what.</p>
            <ul className="space-y-3">
              {['Choose who has access', 'Set permission levels', 'Update anytime', 'Keep family prepared'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-foreground">
                  <CheckCircle className="h-5 w-5 text-vault-green flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <Card className="shadow-vault-lg">
            <CardContent className="p-8 text-center">
              <Users className="h-16 w-16 text-primary mx-auto mb-4 opacity-60" />
              <p className="text-muted-foreground">Your trusted circle, always connected.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    {/* Security */}
    <section className="py-20 bg-muted/30">
      <div className="container text-center max-w-3xl">
        <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">Your Security Is Our Priority</h2>
        <p className="text-muted-foreground text-lg mb-6">DocuVault uses industry-standard encryption and privacy-first design to keep your data safe.</p>
        <Button variant="outline" asChild>
          <Link to="/security">Learn About Our Security</Link>
        </Button>
      </div>
    </section>

    {/* Testimonials */}
    <section className="py-20">
      <div className="container">
        <h2 className="font-heading text-3xl font-bold text-foreground text-center mb-12">What Our Users Say</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Sarah M.', text: 'DocuVault gave me peace of mind knowing my family has access to everything they need.' },
            { name: 'James K.', text: 'Finally, one place for all my important documents. The interface is so simple to use.' },
            { name: 'Linda R.', text: 'I love the trusted contacts feature. It makes me feel prepared for anything.' },
          ].map((t, i) => (
            <Card key={i} className="shadow-vault">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-vault-gold text-vault-gold" />)}
                </div>
                <p className="text-muted-foreground mb-4 text-sm italic">"{t.text}"</p>
                <p className="font-medium text-foreground text-sm">{t.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* Pricing Preview */}
    <section className="py-20 bg-muted/30">
      <div className="container text-center">
        <h2 className="font-heading text-3xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h2>
        <p className="text-muted-foreground mb-8">Start free and upgrade as your vault grows.</p>
        <Button asChild>
          <Link to="/pricing">View Pricing Plans</Link>
        </Button>
      </div>
    </section>

    {/* Final CTA */}
    <section className="py-20">
      <div className="container text-center max-w-2xl">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Protect What Matters?</h2>
        <p className="text-muted-foreground text-lg mb-8">Create your secure vault in minutes. No credit card required.</p>
        <Button size="lg" asChild className="text-base px-8">
          <Link to="/signup">Start My Vault — It's Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    </section>
  </div>
);

export default Home;
