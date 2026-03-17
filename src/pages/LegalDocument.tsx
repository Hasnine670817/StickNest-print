import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Mock data for legal documents
const documentsData: Record<string, any> = {
  'terms': {
    title: 'General terms of service',
    lastUpdated: 'January 14, 2026',
    sections: [
      { id: 'general', title: 'Sticker Mule general terms and conditions' },
      { id: 'privacy', title: 'Privacy' },
      { id: 'accessibility', title: 'Accessibility' },
      { id: 'eligibility', title: 'Eligibility' },
      { id: 'license', title: 'License to use the website, social media and services' },
      { id: 'rules', title: 'Rules of conduct' },
      { id: 'account', title: 'Your user account' },
      { id: 'sale', title: 'Terms and conditions of sale' },
      { id: 'ip', title: 'Intellectual Property Rights' },
      { id: 'third-party', title: 'Third-party content and activities' },
      { id: 'interactions', title: 'User interactions' },
      { id: 'contractor', title: 'Independent contractor status' },
      { id: 'warranty', title: 'Warranty disclaimer' },
      { id: 'termination', title: 'Termination' },
      { id: 'indemnification', title: 'Indemnification/limitation of liability' },
      { id: 'enforcement', title: 'Enforcement of our terms' },
    ],
    content: `
      <p class="font-bold mb-5">Please read these terms and conditions ("Terms") carefully before using the website, social media, and services.</p>
      
      <p class="mb-5">You are reading these Terms because you are using Sticker Mule, LLC's (including its affiliates, which we may collectively refer to as "Sticker Mule," "we," "us," or "our") Website, www.stickermule.com (the "Website"), are interacting with Sticker Mule's social media platforms, including Sticker Mule's accounts on Stimulus, Facebook/Meta, LinkedIn, X (formerly, Twitter), Pinterest, Instagram, and YouTube (collectively, "Social Media"), and/or are using Sticker Mule's manufacturing, printing, and design services, including related tools (the "Services", and which includes any additional paid services (including offers and subscriptions) we offer subsequent to the date of these Terms).</p>
      
      <p class="mb-5">As used in these Terms, the words "you" and "your" refers to any user accessing the Website or Social Media or using the Services, including without limitation users who are visitors, browsers, vendors, customers, merchants, and/or contributors of content (each a "User" and collectively "Users").</p>
      
      <p class="mb-6">Certain offline or online services, promotions, events, and/or features may have additional terms and conditions specific to them, and those additional terms and conditions are incorporated herein by reference. If there is a conflict between these Terms and the terms set forth on a specific portion of the Website or Social Media for any product or service offered on or through the Website, the terms listed on the specific portion of the Website or Social Media shall control with respect to your use of that portion of the Website or Social Media.</p>

      <h2 id="general" class="text-xl font-bold text-[#333333] mb-3 mt-10">Sticker Mule general terms and conditions</h2>
      <p class="mb-5">Sticker Mule operates the Website and Social Media and provides the Services, and is responsible for processing any requests made through our Website, Social Media, and the Services. You may access the Website, Social Media, and Services through a computer, mobile phone, tablet, console, or other technology, which we refer to here as a "Device." Your carrier's normal rates and fees apply to your Device.</p>
      
      <p class="mb-5">Sticker Mule offers the Website, Social Media, and Services, including all products, information, tools, and resources available therein, conditioned upon your acceptance of all terms, conditions, policies and notices stated here. By visiting the Website, interacting with our Social Media, and/or using the Services, you agree to be legally bound by these Terms, including those additional terms and conditions and policies referenced herein and/or available by hyperlink. <strong class="font-bold">If you do not agree to the Terms, then you may not access the Website or Social Media, or use any of the Services, including those offered via the Website or our Social Media.</strong> If these Terms are considered an offer, acceptance is expressly limited to these Terms. Any new features or tools which are added to the current version of the Website, Social Media, or Services shall also be subject to these Terms.</p>

      <h2 id="privacy" class="text-xl font-bold text-[#333333] mb-3 mt-10">Privacy</h2>
      <p class="mb-5">Our Privacy Policy describes the collection and use of personal information on the Website and Social Media and in connection with the Services. Please review our Privacy Policy before using the Website, Social Media, or Services.</p>

      <h2 id="accessibility" class="text-xl font-bold text-[#333333] mb-3 mt-10">Accessibility</h2>
      <p class="mb-5">We are committed to making our Website accessible to everyone. If you have difficulty accessing any part of our Website, please contact us for assistance.</p>
      
      <h2 id="eligibility" class="text-xl font-bold text-[#333333] mb-3 mt-10">Eligibility</h2>
      <p class="mb-5">You must be at least the age of majority in your state or province of residence to use our Website and Services. By agreeing to these Terms, you represent that you are at least the age of majority in your state or province of residence.</p>
    `
  },
  'privacy': {
    title: 'Privacy policy',
    lastUpdated: 'February 1, 2026',
    sections: [
      { id: 'info-we-collect', title: 'Information we collect' },
      { id: 'how-we-use', title: 'How we use your information' },
      { id: 'sharing', title: 'Sharing your information' },
      { id: 'security', title: 'Data security' },
      { id: 'your-rights', title: 'Your rights and choices' },
    ],
    content: `
      <p class="font-bold mb-5">This Privacy Policy describes how we collect, use, and share your personal information.</p>
      <p class="mb-6">When you visit our website, use our services, or interact with us, we collect certain information about you. We are committed to protecting your privacy and ensuring your data is handled securely.</p>
      
      <h2 id="info-we-collect" class="text-xl font-bold text-[#333333] mb-3 mt-10">Information we collect</h2>
      <p class="mb-5">We collect information you provide directly to us, such as when you create an account, place an order, or contact customer support. This may include your name, email address, shipping address, and payment information.</p>
      
      <h2 id="how-we-use" class="text-xl font-bold text-[#333333] mb-3 mt-10">How we use your information</h2>
      <p class="mb-5">We use the information we collect to fulfill your orders, provide customer support, improve our services, and communicate with you about promotions or updates.</p>
    `
  }
};

export default function LegalDocument() {
  const { docId } = useParams<{ docId: string }>();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<string>('');

  // Fallback to terms if document not found
  const doc = docId && documentsData[docId] ? documentsData[docId] : documentsData['terms'];

  useEffect(() => {
    // Handle hash scrolling on load
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
          setActiveSection(id);
        }, 100);
      }
    } else if (doc.sections.length > 0) {
      setActiveSection(doc.sections[0].id);
    }
  }, [location.hash, doc]);

  useEffect(() => {
    // Intersection Observer to update active section based on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -80% 0px' }
    );

    doc.sections.forEach((section: any) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [doc]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Offset for sticky header if any
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
      // Update URL hash without jumping
      window.history.pushState(null, '', `#${id}`);
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center text-[13px]">
          <Link to="/legal" className="text-[#0066cc] hover:underline font-medium">Legal</Link>
          <ChevronRight className="w-3 h-3 text-gray-400 mx-2" />
          <span className="text-gray-600">{doc.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-10">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 lg:w-72 shrink-0">
          <div className="sticky top-24">
            <nav className="flex flex-col space-y-1 border-l-2 border-gray-100">
              {doc.sections.map((section: any) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(e) => scrollToSection(e, section.id)}
                  className={`py-2 pl-4 pr-2 text-[13px] transition-colors border-l-2 -ml-[2px] ${
                    activeSection === section.id
                      ? 'border-[#f37021] text-[#333333] font-bold'
                      : 'border-transparent text-gray-600 hover:text-[#333333] hover:border-gray-300'
                  }`}
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-[#333333] mb-3">{doc.title}</h1>
          <p className="text-gray-500 text-[13px] mb-10">Last updated: {doc.lastUpdated}</p>
          
          <div 
            className="prose prose-sm max-w-none text-gray-700 prose-headings:text-[#333333] prose-a:text-[#0066cc] prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: doc.content }}
          />
        </div>
      </div>
    </div>
  );
}
