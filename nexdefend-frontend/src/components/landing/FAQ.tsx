import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './FAQ.css';

type FaqItem = {
  q: string;
  a: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'What is NexDefend?',
    a: 'NexDefend is a real-time system monitoring and threat detection platform designed to give teams faster visibility into security and operational events.',
  },
  {
    q: 'How quickly does NexDefend detect threats?',
    a: 'Detection speed depends on your configuration and data sources, but NexDefend is optimized to surface critical alerts within seconds to minutes after detection.',
  },
  {
    q: 'Can I integrate NexDefend with my existing tooling?',
    a: 'Yes — NexDefend supports integrations via webhooks, APIs, and common alerting/incident tools. See our docs for integration guides.',
  },
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Frequently asked questions</h2>
      <p className="mt-2 text-slate-600 dark:text-slate-300">Common questions about onboarding, configuration, and integrations.</p>

      <div className="mt-6 space-y-3">
        {FAQ_ITEMS.map((item, idx) => {
          const open = idx === openIndex;
          return (
            <div key={idx} className="bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenIndex(open ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left"
                aria-expanded={open}
                aria-controls={`faq-panel-${idx}`}
              >
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">{item.q}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 hidden sm:block">Tap to expand for more details</div>
                </div>
                <div className="flex items-center">
                  {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>

              {open && (
                <div id={`faq-panel-${idx}`} className="p-4 border-t border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FAQ;
