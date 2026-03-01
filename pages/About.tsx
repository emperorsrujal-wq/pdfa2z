import * as React from 'react';
import { Shield, Zap, Heart, Globe } from 'lucide-react';
import { SEO } from '../components/SEO';

export const About: React.FC = () => {
    return (
        <>
            <SEO
                title="About Us - PDF A2Z"
                description="Learn about PDF A2Z mission to provide free, secure, and easy-to-use PDF and image tools for everyone."
                canonical="/about"
            />
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-black text-slate-900 mb-4">About PDF A2Z</h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        We are on a mission to make document management accessible, free, and secure for everyone, everywhere.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 mb-16">
                    <div>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Globe className="text-blue-600" />
                            Our Mission
                        </h2>
                        <p className="text-slate-600 leading-relaxed mb-6">
                            In a digital world, working with documents shouldn't be complicated or expensive. PDF A2Z was built with a simple goal: to provide high-quality, professional-grade PDF and image tools completely for free.
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                            Whether you are a student submitting an assignment, a professional managing contracts, or a creative working with images, we have the tools to streamline your workflow without the need for expensive software subscriptions.
                        </p>
                    </div>
                    <div className="bg-blue-50 p-8 rounded-3xl">
                        <h3 className="text-xl font-bold mb-6 text-blue-900">Why Choose Us?</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Privacy First</h4>
                                    <p className="text-sm text-slate-600">Many of our tools run entirely in your browser. Your files often never leave your device.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Lightning Fast</h4>
                                    <p className="text-sm text-slate-600">Optimized for speed. Get your work done in seconds, not minutes.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <Heart size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">100% Free</h4>
                                    <p className="text-sm text-slate-600">No hidden costs, no premium tiers. Just great tools for free.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-12 text-center">
                    <h2 className="text-2xl font-bold mb-6">Our Tech Stack</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto mb-8">
                        We utilize cutting-edge web technologies like React, WebAssembly, and AI integration to deliver desktop-class performance right in your browser.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {['React 19', 'Vite', 'Tailwind', 'Google Gemini AI', 'PDF.js', 'FFmpeg.wasm'].map(tech => (
                            <span key={tech} className="px-4 py-2 bg-slate-100 rounded-full text-slate-600 text-sm font-medium">
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};
