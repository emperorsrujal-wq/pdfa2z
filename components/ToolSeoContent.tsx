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
    <section className="max-w-4xl mx-auto py-16 border-t border-slate-100 mt-16 animate-fade-in seo-content-ready">
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight leading-tight">{tool.h1}</h2>
        <p className="text-lg text-slate-600 leading-relaxed">{tool.intro}</p>
      </header>

      {tool.steps && tool.steps.length > 0 && (
        <div className="mb-16">
          <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle className="text-blue-600" size={22} />
            How to use this tool
          </h3>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 list-none p-0">
            {tool.steps.map((step, idx) => (
              <li key={idx} className="relative bg-white p-6 rounded-xl border border-slate-100 hover:border-blue-100 transition-colors">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-sm">
                  {idx + 1}
                </div>
                <p className="text-slate-700 font-medium leading-snug text-sm">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {tool.faqs && tool.faqs.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <HelpCircle className="text-blue-600" size={22} />
            Frequently Asked Questions
          </h3>
          <div className="grid gap-3">
            {tool.faqs.map((faq, idx) => (
              <details key={idx} className="group bg-white rounded-xl border border-slate-100 overflow-hidden">
                <summary className="list-none flex items-center justify-between p-5 cursor-pointer font-semibold text-slate-800 group-open:text-blue-600 transition-colors text-sm">
                  <span className="pr-4">{faq.q}</span>
                  <span className="group-open:rotate-180 transition-transform text-slate-400 group-open:text-blue-600 text-xs">▼</span>
                </summary>
                <div className="px-5 pb-5 text-slate-600 leading-relaxed text-sm pt-1 border-t border-slate-50">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {tool.tips && tool.tips.length > 0 && (
        <div className="mt-12 p-6 bg-blue-50/50 rounded-xl border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <CheckCircle className="text-blue-600" size={20} />
            Pro Tips
          </h3>
          <ul className="space-y-2">
            {tool.tips.map((tip, i) => (
              <li key={i} className="text-blue-800 text-sm flex items-start gap-2">
                <span className="text-blue-400 mt-1.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {tool.tradeoffs && tool.tradeoffs.length > 0 && (
        <div className="mt-6 p-6 bg-amber-50/50 rounded-xl border border-amber-100">
          <h3 className="text-lg font-semibold text-amber-900 mb-3 flex items-center gap-2">
            <HelpCircle className="text-amber-600" size={20} />
            Important Considerations
          </h3>
          <ul className="space-y-2">
            {tool.tradeoffs.map((t, i) => (
              <li key={i} className="text-amber-800 text-sm flex items-start gap-2">
                <span className="text-amber-400 mt-1.5">•</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {tool.relatedGuides && tool.relatedGuides.length > 0 && (
        <div className="mt-12 pt-10 border-t border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Book className="text-blue-600" size={22} />
            Expert Guides & Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tool.relatedGuides.map(slug => {
              const guide = BLOG_POSTS.find(p => p.slug === slug);
              if (!guide) return null;
              return (
                <a
                  key={slug}
                  href={`/blog/${slug}`}
                  className="group p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-sm transition-all"
                >
                  <h4 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 mb-1 truncate">{guide.title}</h4>
                  <p className="text-sm text-slate-500 line-clamp-2">{guide.excerpt}</p>
                  <div className="mt-3 flex items-center text-xs font-medium text-blue-600">
                    Read Guide <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
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
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tool.features.map((feature, i) => (
              <div key={i} className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3 text-blue-600 font-bold text-sm">
                  {i + 1}
                </div>
                <h3 className="text-base font-semibold text-slate-800 mb-1">{feature}</h3>
                <p className="text-slate-500 text-sm">Professional quality processing directly in your browser.</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </section>
  );
};
