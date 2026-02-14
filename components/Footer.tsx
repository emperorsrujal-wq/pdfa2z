import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Twitter, Github, Linkedin } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="border-t border-slate-200 bg-white py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">

                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                                <FileText className="h-5 w-5" />
                            </div>
                            <span>PDF A2Z</span>
                        </Link>
                        <p className="text-sm text-slate-500">
                            Free online PDF, Image, Video, and AI tools. No sign-up required. 100% Free suitable for students, professionals and everyone.
                        </p>
                    </div>

                    {/* Tools */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-slate-900">Popular Tools</h3>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li><Link to="/merge-pdf" className="hover:text-blue-600">Merge PDF</Link></li>
                            <li><Link to="/compress-pdf" className="hover:text-blue-600">Compress PDF</Link></li>
                            <li><Link to="/jpg-to-pdf" className="hover:text-blue-600">JPG to PDF</Link></li>
                            <li><Link to="/extract-images" className="hover:text-blue-600">Extract Images</Link></li>
                            <li><Link to="/reverse-pdf" className="hover:text-blue-600">Reverse PDF</Link></li>
                            <li><Link to="/flip-image" className="hover:text-blue-600">Flip Image</Link></li>
                            <li><Link to="/pixelate-image" className="hover:text-blue-600">Pixelate Image</Link></li>
                            <li><Link to="/invert-image" className="hover:text-blue-600">Invert Colors</Link></li>
                            <li><Link to="/ai-writer" className="hover:text-blue-600">AI Writer</Link></li>
                            <li><Link to="/edit-pdf" className="hover:text-blue-600">Edit PDF</Link></li>
                            <li><Link to="/crop-pdf" className="hover:text-blue-600">Crop PDF</Link></li>
                            <li><Link to="/pdf-to-csv" className="hover:text-blue-600">PDF to CSV</Link></li>
                            <li><Link to="/url-to-pdf" className="hover:text-blue-600">URL to PDF</Link></li>
                            <li><Link to="/pdf-to-ppt" className="hover:text-blue-600">PDF to PPT</Link></li>
                            <li><Link to="/ppt-to-pdf" className="hover:text-blue-600">PPT to PDF</Link></li>
                            <li><Link to="/epub-to-pdf" className="hover:text-blue-600">EPUB to PDF</Link></li>
                            <li><Link to="/mobi-to-pdf" className="hover:text-blue-600">MOBI to PDF</Link></li>
                            <li><Link to="/outlook-to-pdf" className="hover:text-blue-600">Outlook to PDF</Link></li>
                            <li><Link to="/pdf-to-text" className="hover:text-blue-600">PDF to Text</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-slate-900">Company</h3>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li><Link to="/about" className="hover:text-blue-600">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-blue-600">Contact</Link></li>
                            <li><Link to="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-slate-900">Connect</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="text-slate-400 hover:text-blue-600">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-blue-600">
                                <Github className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-blue-600">
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t border-slate-100 pt-8 text-center text-sm text-slate-500">
                    &copy; {new Date().getFullYear()} PDF A2Z. All rights reserved. <span className="text-xs text-slate-300 ml-2">v1.4 - API REMOVED</span>
                </div>
            </div>
        </footer>
    );
};
