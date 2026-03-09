import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'What is DocuVault?', a: 'DocuVault is a secure online vault for storing important personal, legal, financial, and digital information. It helps you organize what matters and share selected information with trusted loved ones.' },
  { q: 'What can I store in DocuVault?', a: 'You can store details about bank accounts, insurance policies, legal documents, digital accounts, property information, medical directives, personal wishes, IDs, and more. You can also upload files like PDFs and images.' },
  { q: 'Is my data secure?', a: 'Yes. DocuVault uses industry-standard encryption for all data at rest and in transit. We follow privacy-first design principles and never sell or share your information.' },
  { q: 'Can I share information with family?', a: 'Absolutely. You can add trusted contacts and control exactly what information they can access. Permissions can be updated or revoked at any time.' },
  { q: 'What happens if I need to update something?', a: 'You can update your vault items anytime. DocuVault also includes optional reminders to prompt you to review and update your information periodically.' },
  { q: 'Can I upload documents?', a: 'Yes. You can upload PDFs, images, and other files and attach them to specific vault items for easy organization.' },
  { q: 'How do trusted contacts work?', a: 'Trusted contacts are people you designate — like family members, attorneys, or financial advisors. You choose their access level and what information they can see.' },
  { q: 'Is there a free plan?', a: 'Yes! The Starter plan is completely free and includes up to 10 vault items, 5 document uploads, and 1 trusted contact.' },
];

const FAQ = () => (
  <div className="py-20">
    <div className="container max-w-3xl">
      <div className="text-center mb-16">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-muted-foreground">Find answers to common questions about DocuVault.</p>
      </div>
      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border rounded-lg px-4 shadow-vault">
            <AccordionTrigger className="font-heading font-semibold text-foreground text-left hover:no-underline">{faq.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </div>
);

export default FAQ;
