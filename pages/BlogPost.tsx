import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { BLOG_POSTS } from '../utils/blogData';
import { Calendar, User, ArrowLeft, Share2, BookOpen } from 'lucide-react';
import { SEO } from '../components/SEO';

export const BlogPost: React.FC = () => {
    const { postSlug } = useParams<{ postSlug: string }>();
    const post = BLOG_POSTS.find(p => p.slug === postSlug);

    if (!post) return <Navigate to="/blog" replace />;

    return (
        <div className="animate-fade-in pb-20">
            <SEO
                title={`${post.title} - PDFA2Z Blog`}
                description={post.excerpt}
                canonical={`/blog/${post.slug}`}
            />

            <div className="max-w-3xl mx-auto px-4 pt-24">
                <Link
                    to="/blog"
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 mb-12 transition-colors"
                >
                    <ArrowLeft size={16} /> BACK TO BLOG
                </Link>

                <header className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black mb-6 uppercase tracking-widest">
                        {post.category}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 tracking-tight leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-between py-6 border-y border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-200">
                                {post.author.charAt(0)}
                            </div>
                            <div>
                                <div className="font-black text-slate-900 leading-none mb-1">{post.author}</div>
                                <div className="text-sm font-bold text-slate-400">Content Strategist</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-slate-400">
                            <span className="flex items-center gap-1 text-sm font-bold uppercase tracking-widest leading-none bg-slate-50 px-3 py-2 rounded-lg">
                                <Calendar size={14} /> {post.date}
                            </span>
                            <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                <Share2 size={20} />
                            </button>
                        </div>
                    </div>
                </header>

                <article className="prose prose-slate prose-lg max-w-none 
          prose-headings:text-slate-900 prose-headings:font-black prose-headings:tracking-tight 
          prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-8
          prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-8
          prose-h3:text-xl prose-h3:mt-12 prose-h3:mb-6
          prose-strong:text-slate-900 prose-strong:font-black"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <div className="mt-20 p-12 bg-slate-900 rounded-[3rem] text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <BookOpen size={120} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4 relative z-10">
                        Need to Compress a PDF?
                    </h2>
                    <p className="text-slate-400 text-lg mb-8 relative z-10">
                        Processing files locally is 100% secure and faster than uploading to servers.
                    </p>
                    <Link
                        to="/compress-pdf"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition-all transform hover:-translate-y-1 relative z-10"
                    >
                        USE COMPRESSOR <ArrowLeft size={20} className="rotate-180" />
                    </Link>
                </div>
            </div>
        </div>
    );
};
