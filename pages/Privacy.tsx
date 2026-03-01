import * as React from 'react';
import { SEO } from '../components/SEO';

export const Privacy: React.FC = () => {
    return (
        <>
            <SEO
                title="Privacy Policy - PDF A2Z"
                description="Read our privacy policy to understand how we handle your data and ensure your security."
                canonical="/privacy"
            />
            <div className="max-w-3xl mx-auto px-6 py-12">
                <h1 className="text-4xl font-black text-slate-900 mb-8 border-b pb-4">Privacy Policy</h1>

                <div className="prose prose-slate prose-lg max-w-none">
                    <p className="text-slate-600 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Information We Collect</h2>
                    <p>
                        At PDF A2Z, we prioritize user privacy. <strong>We do not store your files.</strong> Most of our tools process files directly in your browser using WebAssembly technology, meaning the data never leaves your device.
                    </p>
                    <p>
                        For tools that require server-side processing, files are uploaded to secure temporary servers, processed, and <strong>automatically deleted permanently</strong> within 1 hour of processing.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Cookies</h2>
                    <p>
                        We use cookies solely to improve your experience on our website, such as remembering your language preference or analyzing site traffic via Google Analytics to improve performance.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Third-Party Services</h2>
                    <p>
                        We may use third-party services like Google Analytics for traffic analysis. These services may collect anonymous data about your visit.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Data Security</h2>
                    <p>
                        We implement industry-standard security measures, including SSL encryption, to protect your data during transmission.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@pdfa2z.com" className="text-blue-600 hover:underline">privacy@pdfa2z.com</a>.
                    </p>
                </div>
            </div>
        </>
    );
};
