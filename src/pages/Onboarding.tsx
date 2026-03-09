import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Heart, FolderPlus, Upload, Users, Bell, CheckCircle, ArrowRight, ArrowLeft, FileText, X } from 'lucide-react';
import Logo from '@/components/Logo';
import { toast } from 'sonner';

const totalSteps = 7;

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Vault item form
  const [vaultTitle, setVaultTitle] = useState('');
  const [vaultCategory, setVaultCategory] = useState('Financial');
  const [vaultInstitution, setVaultInstitution] = useState('');

  // Contact form
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactRelationship, setContactRelationship] = useState('');

  // Reminder
  const [reminderFreq, setReminderFreq] = useState('quarterly');

  // Document upload
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const progress = ((step + 1) / totalSteps) * 100;

  const handleAddVaultItem = async () => {
    if (!user || !vaultTitle.trim()) { toast.error('Please add a title'); return; }
    const { error } = await supabase.from('vault_items').insert({
      user_id: user.id, title: vaultTitle, category: vaultCategory, website_or_institution: vaultInstitution,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('Vault item added!');
    setStep(3);
  };

  const handleAddContact = async () => {
    if (!user || !contactName.trim()) { toast.error('Please add a name'); return; }
    const { error } = await supabase.from('trusted_contacts').insert({
      user_id: user.id, full_name: contactName, email: contactEmail, relationship: contactRelationship,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('Contact added!');
    setStep(5);
  };

  const handleSetReminder = async () => {
    if (!user) return;
    const { error } = await supabase.from('reminders').insert({
      user_id: user.id, reminder_frequency: reminderFreq, reminder_enabled: true,
    });
    if (error && !error.message.includes('duplicate')) { toast.error(error.message); return; }
    toast.success('Reminder set!');
    setStep(6);
  };

  const handleFinish = async () => {
    if (!user) return;
    await supabase.from('profiles').update({ onboarding_completed: true }).eq('user_id', user.id);
    navigate('/dashboard');
  };

  const steps = [
    // 0: Welcome
    <div key={0} className="text-center space-y-4">
      <Logo className="h-16 w-16 mx-auto" />
      <h2 className="font-heading text-2xl font-bold text-foreground">Welcome to DocuVault!</h2>
      <p className="text-muted-foreground max-w-md mx-auto">Your secure vault is ready. Let's walk through a few quick steps to help you get organized.</p>
      <Button onClick={() => setStep(1)} className="mt-4">Let's Get Started <ArrowRight className="ml-2 h-4 w-4" /></Button>
    </div>,

    // 1: Why this matters
    <div key={1} className="text-center space-y-4">
      <Heart className="h-16 w-16 text-vault-green mx-auto" />
      <h2 className="font-heading text-2xl font-bold text-foreground">Why This Matters</h2>
      <p className="text-muted-foreground max-w-md mx-auto">Organizing your important information protects your family and gives everyone peace of mind. DocuVault makes it simple and secure.</p>
      <div className="flex gap-3 justify-center mt-4">
        <Button variant="outline" onClick={() => setStep(0)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <Button onClick={() => setStep(2)}>Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
      </div>
    </div>,

    // 2: Add first vault item
    <div key={2} className="space-y-4">
      <div className="text-center">
        <FolderPlus className="h-12 w-12 text-primary mx-auto mb-2" />
        <h2 className="font-heading text-xl font-bold text-foreground">Add Your First Vault Item</h2>
        <p className="text-sm text-muted-foreground">Store details about an account, document, or important record.</p>
      </div>
      <div className="space-y-3">
        <div className="space-y-1">
          <Label>Title</Label>
          <Input value={vaultTitle} onChange={(e) => setVaultTitle(e.target.value)} placeholder="e.g., Bank of America Checking" />
        </div>
        <div className="space-y-1">
          <Label>Category</Label>
          <Select value={vaultCategory} onValueChange={setVaultCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {['Legal','Financial','Insurance','Property','Digital Accounts','Personal Wishes','Medical','IDs'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Institution</Label>
          <Input value={vaultInstitution} onChange={(e) => setVaultInstitution(e.target.value)} placeholder="e.g., Bank of America" />
        </div>
      </div>
      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <Button onClick={handleAddVaultItem}>Add Item <ArrowRight className="ml-2 h-4 w-4" /></Button>
      </div>
      <button onClick={() => setStep(3)} className="block mx-auto text-sm text-muted-foreground hover:text-foreground">Skip for now</button>
    </div>,

    // 3: Upload document
    <div key={3} className="space-y-4">
      <div className="text-center">
        <Upload className="h-12 w-12 text-primary mx-auto mb-2" />
        <h2 className="font-heading text-xl font-bold text-foreground">Upload Your First Document</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">Upload a PDF, image, or document to keep it safe in your vault.</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
      />

      {!uploadFile ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="mx-auto flex flex-col items-center justify-center w-48 h-48 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 transition-colors cursor-pointer"
        >
          <FileText className="h-10 w-10 text-primary mb-3" />
          <span className="text-sm font-medium text-foreground">Click to upload</span>
          <span className="text-xs text-muted-foreground mt-1">PDF, DOC, JPG, PNG</span>
        </button>
      ) : (
        <div className="mx-auto flex items-center gap-3 w-48 p-3 rounded-xl border border-border bg-muted/50">
          <FileText className="h-6 w-6 text-primary flex-shrink-0" />
          <span className="text-sm text-foreground truncate flex-1">{uploadFile.name}</span>
          <button onClick={() => setUploadFile(null)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <Button
          disabled={uploading}
          onClick={async () => {
            if (!uploadFile || !user) { setStep(4); return; }
            setUploading(true);
            const filePath = `${user.id}/${Date.now()}_${uploadFile.name}`;
            const { error: upErr } = await supabase.storage.from('vault-documents').upload(filePath, uploadFile);
            if (upErr) { toast.error(upErr.message); setUploading(false); return; }
            const { data: urlData } = supabase.storage.from('vault-documents').getPublicUrl(filePath);
            await supabase.from('documents').insert({
              user_id: user.id, file_name: uploadFile.name, file_type: uploadFile.type, file_url: urlData.publicUrl,
            });
            toast.success('Document uploaded!');
            setUploading(false);
            setStep(4);
          }}
        >
          {uploading ? 'Uploading...' : uploadFile ? 'Upload & Continue' : 'Continue'} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <button onClick={() => setStep(4)} className="block mx-auto text-sm text-muted-foreground hover:text-foreground">Skip for now</button>
    </div>,

    // 4: Add trusted contact
    <div key={4} className="space-y-4">
      <div className="text-center">
        <Users className="h-12 w-12 text-primary mx-auto mb-2" />
        <h2 className="font-heading text-xl font-bold text-foreground">Add a Trusted Contact</h2>
        <p className="text-sm text-muted-foreground">Designate someone who can access your information.</p>
      </div>
      <div className="space-y-3">
        <div className="space-y-1"><Label>Full Name</Label><Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Jane Doe" /></div>
        <div className="space-y-1"><Label>Email</Label><Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="jane@example.com" /></div>
        <div className="space-y-1"><Label>Relationship</Label><Input value={contactRelationship} onChange={(e) => setContactRelationship(e.target.value)} placeholder="e.g., Spouse" /></div>
      </div>
      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={() => setStep(3)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <Button onClick={handleAddContact}>Add Contact <ArrowRight className="ml-2 h-4 w-4" /></Button>
      </div>
      <button onClick={() => setStep(5)} className="block mx-auto text-sm text-muted-foreground hover:text-foreground">Skip for now</button>
    </div>,

    // 5: Set reminder
    <div key={5} className="text-center space-y-4">
      <Bell className="h-12 w-12 text-primary mx-auto" />
      <h2 className="font-heading text-xl font-bold text-foreground">Set an Update Reminder</h2>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">We'll remind you to review and update your vault periodically.</p>
      <Select value={reminderFreq} onValueChange={setReminderFreq}>
        <SelectTrigger className="max-w-xs mx-auto"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="quarterly">Quarterly</SelectItem>
          <SelectItem value="biannually">Every 6 Months</SelectItem>
          <SelectItem value="annually">Annually</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={() => setStep(4)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <Button onClick={handleSetReminder}>Set Reminder <ArrowRight className="ml-2 h-4 w-4" /></Button>
      </div>
      <button onClick={() => setStep(6)} className="block mx-auto text-sm text-muted-foreground hover:text-foreground">Skip for now</button>
    </div>,

    // 6: Finish
    <div key={6} className="text-center space-y-4">
      <CheckCircle className="h-16 w-16 text-vault-green mx-auto" />
      <h2 className="font-heading text-2xl font-bold text-foreground">You're All Set!</h2>
      <p className="text-muted-foreground max-w-md mx-auto">Your vault is ready. You can always add more items, documents, and contacts from your dashboard.</p>
      <Button onClick={handleFinish} size="lg">Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Button>
    </div>,
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-lg shadow-vault-lg">
        <CardContent className="p-6 md:p-8">
          <div className="mb-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Step {step + 1} of {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          {steps[step]}
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
