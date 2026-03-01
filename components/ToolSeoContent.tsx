import * as React from 'react';
import { ToolSEO, TOOLS_REGISTRY } from '../utils/seoData.ts';
import { BLOG_POSTS } from '../utils/blogData.ts';
import { HelpCircle, CheckCircle, Book, ArrowRight } from 'lucide-react';
import { RelatedTools } from './RelatedTools.tsx';
import { TrustSignals } from './TrustSignals.tsx';

interface ToolSeoContentProps {
  tool: ToolSEO;
}

export const ToolSeoContent: React.FC<ToolSeoContentProps> = ({ tool }) => {
  return (
    <section className="max-w-4xl mx-auto py-16 border-t border-slate-100 mt-20 animate-fade-in seo-content-ready">
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

      {tool.tips && tool.tips.length > 0 && (
        <div className="mt-16 p-8 bg-blue-50/50 rounded-3xl border border-blue-100">
          <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            <CheckCircle className="text-blue-600" size={24} />
            Pro Tips
          </h3>
          <ul className="space-y-3">
            {tool.tips.map((tip, i) => (
              <li key={i} className="text-blue-800 flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {tool.tradeoffs && tool.tradeoffs.length > 0 && (
        <div className="mt-8 p-8 bg-amber-50/50 rounded-3xl border border-amber-100">
          <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
            <HelpCircle className="text-amber-600" size={24} />
            Important Considerations
          </h3>
          <ul className="space-y-3">
            {tool.tradeoffs.map((t, i) => (
              <li key={i} className="text-amber-800 flex items-start gap-2">
                <span className="text-amber-400 mt-1">•</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {tool.relatedGuides && tool.relatedGuides.length > 0 && (
        <div className="mt-16 pt-12 border-t border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
            <Book className="text-indigo-600" size={28} />
            Expert Guides & Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tool.relatedGuides.map(slug => {
              const guide = BLOG_POSTS.find(p => p.slug === slug);
              if (!guide) return null;
              return (
                <a
                  key={slug}
                  href={`/blog/${slug}`}
                  className="group p-6 bg-slate-50 rounded-3xl border border-slate-200 hover:border-indigo-600 hover:bg-white hover:shadow-xl transition-all"
                >
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 mb-2 truncate">{guide.title}</h4>
                  <p className="text-sm text-slate-600 line-clamp-2">{guide.excerpt}</p>
                  <div className="mt-4 flex items-center text-xs font-black text-indigo-600 tracking-widest uppercase">
                    Read Guide <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      <RelatedTools currentSlug={tool.slug} />

      <TrustSignals />

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
    </section>
  );
};