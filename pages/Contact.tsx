import * as React from 'react';
import {  useState  } from 'react';
import { Mail, MessageCircle, MapPin } from 'lucide-react';
import { SEO } from '../components/SEO';

export const Contact: React.FC = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate submission
        setTimeout(() => setSubmitted(true), 500);
    };

    return (
        <>
            <SEO
                title="Contact Us - PDF A2Z Support"
                description="Get in touch with the PDF A2Z team for support, feedback, or inquiries."
                canonical="/contact"
            />
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-black text-slate-900 mb-4">Get in Touch</h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Have a question, feedback, or just want to say hello? We'd love to hear from you.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">Email Support</h3>
                                <p className="text-slate-600 mb-2">Our team is here to help.</p>
                                <a href="mailto:support@pdfa2z.com" className="text-blue-600 font-bold hover:underline">support@pdfa2z.com</a>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                                <MessageCircle size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">General Inquiries</h3>
                                <p className="text-slate-600 mb-2">For partnerships and media.</p>
                                <a href="mailto:hello@pdfa2z.com" className="text-indigo-600 font-bold hover:underline">hello@pdfa2z.com</a>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">Location</h3>
                                <p className="text-slate-600">
                                    Digital First Team<br />
                                    Global Remote
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        {submitted ? (
                            <div className="text-center py-12">
                                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                                <p className="text-slate-600">Thanks for reaching out. We'll get back to you shortly.</p>
                                <button onClick={() => setSubmitted(false)} className="mt-6 text-blue-600 font-bold hover:underline">Send another message</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="you@company.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Message</label>
                                    <textarea
                                        required
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full p-3 border border-slate-200 rounded-xl h-32 resize-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="How can we help?"
                                    />
                                </div>
                                <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                                    Send Message
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
