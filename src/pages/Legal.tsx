import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Fingerprint, Gift, DollarSign, Store, ShieldCheck, Copyright } from 'lucide-react';

const legalDocs = [
  {
    id: 'terms',
    title: 'General terms of service',
    description: "A binding agreement governing your use of Sticker Mule's website, social media, and services, detailing conditions for sales, user content, and specific tools like Ship.",
    icon: FileText,
    color: 'text-[#f37021]',
    bg: 'bg-orange-50'
  },
  {
    id: 'privacy',
    title: 'Privacy policy',
    description: 'Describes how Sticker Mule collects, uses, shares, and protects your personal information when you use their services, and outlines your privacy rights.',
    icon: Fingerprint,
    color: 'text-[#f37021]',
    bg: 'bg-orange-50'
  },
  {
    id: 'give-terms',
    title: 'Give terms of service',
    description: 'Defines the rules for Sticker Mule store owners to create and for users to participate in t-shirt giveaways using the Give Tool, including eligibility and how prizes are awarded.',
    icon: Gift,
    color: 'text-[#f37021]',
    bg: 'bg-orange-50'
  },
  {
    id: 'commissions',
    title: 'Commissions terms of service',
    description: 'Outlines the rules and conditions for you to earn commission payments by referring new customers to Sticker Mule through unique links or your store.',
    icon: DollarSign,
    color: 'text-[#f37021]',
    bg: 'bg-orange-50'
  },
  {
    id: 'stores-terms',
    title: 'Stores terms of service',
    description: 'Defines the terms for Sellers to create online stores, list products fulfilled by Sticker Mule, set markups, and earn profit payments from sales.',
    icon: Store,
    color: 'text-[#f37021]',
    bg: 'bg-orange-50'
  },
  {
    id: 'pro-terms',
    title: 'Pro terms of service',
    description: "Defines the terms for subscribing to Sticker Mule Pro, a paid membership offering a 'PRO' badge and early access to new product testing.",
    icon: ShieldCheck,
    color: 'text-[#f37021]',
    bg: 'bg-orange-50'
  },
  {
    id: 'ip-policy',
    title: 'IP rights policy',
    description: 'Outlines policies on copyrights and trademarks. It confirms that you retain ownership of uploaded designs and details how infringement claims are handled.',
    icon: Copyright,
    color: 'text-[#f37021]',
    bg: 'bg-orange-50'
  }
];

export default function Legal() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#f37021] py-10 md:py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-white">Legal</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-12">
        <p className="text-gray-700 text-base mb-8 text-center md:text-left">
          These documents explain your rights and responsibilities as a user, partner, or visitor of Sticker Mule.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {legalDocs.map((doc) => {
            const Icon = doc.icon;
            return (
              <Link 
                key={doc.id} 
                to={`/legal/${doc.id}`}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white group flex flex-col h-full"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${doc.bg}`}>
                  <Icon className={`w-5 h-5 ${doc.color}`} />
                </div>
                <h2 className="text-lg font-bold text-[#333333] mb-2 group-hover:text-[#f37021] transition-colors">
                  {doc.title}
                </h2>
                <p className="text-gray-600 text-[13px] leading-relaxed flex-grow">
                  {doc.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
