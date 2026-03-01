import * as React from 'react';
import { Link } from 'react-router-dom';
import { BLOG_POSTS } from '../utils/blogData';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import { SEO } from '../components/SEO';

export const Blog: React.FC = () => {
    return (
        <div className="animate-fade-in pb-20">
            <SEO
                title="PDF Guides & Tutorials - PDFA2Z Blog"
                description="Learn how to optimize, merge, and edit PDFs like a pro. Expert tips and tutorials for document management."
                canonical="/blog"
            />

            <div className="bg-gradient-to-b from-indigo-50/50 to-white pt-24 pb-16 px-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-600 rounded-full text-sm font-bold mb-6">
                    <BookOpen size={16} />
                    <span>PDFA2Z KNOWLEDGE HUB</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                    Master Your <span className="text-indigo-600">Documents</span>
                </h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
                    Expert guides, industry news, and productivity tips to help you work smarter with PDFs.
                </p>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <div className="grid gap-12">
                    {BLOG_POSTS.map((post) => (
                        <article key={post.slug} className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-indigo-900/5 hover:-translate-y-1 transition-all duration-300">
                            <div className="md:flex">
                                <div className="md:w-2/3 p-8 md:p-12">
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">
                                        <span className="bg-slate-100 px-3 py-1 rounded-full text-slate-600">{post.category}</span>
                                        <span className="flex items-center gap-1"><Calendar size={14} /> {post.date}</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">
                                        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                                    </h2>
                                    <p className="text-lg text-slate-600 leading-relaxed mb-8 line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                {post.author.charAt(0)}
                                            </div>
                                            <span className="text-sm font-bold text-slate-900">{post.author}</span>
                                        </div>
                                        <Link
                                            to={`/blog/${post.slug}`}
                                            className="inline-flex items-center gap-2 font-black text-indigo-600 group-hover:gap-4 transition-all"
                                        >
                                            READ GUIDE <ArrowRight size={18} />
                                        </Link>
                                    </div>
                                </div>
                                <div className="md:w-1/3 bg-slate-100 flex items-center justify-center p-8 grayscale group-hover:grayscale-0 transition-all">
                                    <BookOpen size={64} className="text-indigo-200" />
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
};
