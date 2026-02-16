import React from 'react';
import { SEO } from '../components/SEO';

export const Terms: React.FC = () => {
    return (
        <>
            <SEO
                title="Terms of Service - PDF A2Z"
                description="Terms and conditions for using PDF A2Z services."
                canonical="/terms"
            />
            <div className="max-w-3xl mx-auto px-6 py-12">
                <h1 className="text-4xl font-black text-slate-900 mb-8 border-b pb-4">Terms of Service</h1>

                <div className="prose prose-slate prose-lg max-w-none">
                    <p className="text-slate-600 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using PDF A2Z ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Use of Service</h2>
                    <p>
                        We grant you a limited, non-exclusive, non-transferable license to use our tools for personal and commercial purposes. You agree not to misuse the services or help anyone else do so.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Liability</h2>
                    <p>
                        The Service is provided "as is". We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties. In no event shall PDF A2Z be liable for any damages (including, without limitation, damages for loss of data or profit) arising out of the use or inability to use the materials on our website.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Content</h2>
                    <p>
                        You retain all rights to any files you upload or process using our Service. We do not claim ownership of your content.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Changes</h2>
                    <p>
                        We reserve the right to modify these terms at any time. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
                    </p>
                </div>
            </div>
        </>
    );
};
