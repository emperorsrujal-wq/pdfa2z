import * as React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="animate-fade-in pb-20">
      <SEO
        title="Page Not Found - PDFA2Z"
        description="The page you are looking for does not exist. Browse our free PDF and image tools."
        canonical="/404"
      />
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-8xl font-black text-indigo-100 mb-4">404</div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-slate-500 max-w-md mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors"
          >
            <Home size={18} /> Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
          >
            <ArrowLeft size={18} /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
