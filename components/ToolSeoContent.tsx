import React from 'react';
import { ToolSEO } from '../utils/seoData.ts';
import { CheckCircle, HelpCircle } from 'lucide-react';
import { RelatedTools } from './RelatedTools.tsx';

interface ToolSeoContentProps {
  tool: ToolSEO;
}

export const ToolSeoContent: React.FC<ToolSeoContentProps> = ({ tool }) => {
  return (
    <section className="max-w-4xl mx-auto py-16 border-t border-slate-100 mt-20 animate-fade-in">
      <header className="mb-12">
        <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight leading-tight">{tool.h1}</h2>
        <p className="text-xl text-slate-600 leading-relaxed font-medium">{tool.intro}</p>
      </header>

      {tool.steps && tool.steps.length > 0 && (
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
            <CheckCircle className="text-indigo-600" size={28} />
            How to use this tool
          </h3>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-8 list-none p-0">
            {tool.steps.map((step, idx) => (
              <li key={idx} className="relative bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg">
                  {idx + 1}
                </div>
                <p className="text-slate-700 font-bold leading-snug">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {tool.faqs && tool.faqs.length > 0 && (
        <div className="space-y-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
            <HelpCircle className="text-indigo-600" size={28} />
            Frequently Asked Questions
          </h3>
          <div className="grid gap-4">
            {tool.faqs.map((faq, idx) => (
              <details key={idx} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <summary className="list-none flex items-center justify-between p-6 cursor-pointer font-bold text-slate-900 group-open:text-indigo-600 transition-colors">
                  <span className="pr-4">{faq.q}</span>
                  <span className="group-open:rotate-180 transition-transform text-slate-400 group-open:text-indigo-600">▼</span>
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed font-medium pt-2 border-t border-slate-50">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}


      <RelatedTools currentTool={tool} />

      {tool.features && tool.features.length > 0 && (
        <section className="mt-16 mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tool.features.map((feature, i) => (
              <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600 font-bold">
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{feature}</h3>
                <p className="text-slate-600">Professional quality processing directly in your browser.</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {tool.faqs && tool.faqs.length > 0 && (
        <section className="mt-16 mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {tool.faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-3">
                  <HelpCircle className="text-blue-500" size={20} />
                  {faq.q}
                </h3>
                <p className="text-slate-600 ml-8">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </section>
  );
};