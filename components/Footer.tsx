import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Twitter, Github, Linkedin } from 'lucide-react';

interface FooterProps {
    currentLang?: string;
}

export const Footer: React.FC<FooterProps> = ({ currentLang = 'en' }) => {
    // Helper to generate localized paths
    const getLocalizedPath = (path: string) => {
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        if (currentLang === 'en') return `/${cleanPath}`;
        return `/${currentLang}/${cleanPath}`;
    };

    return (
        <footer className="border-t border-slate-200 bg-white py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">

                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to={getLocalizedPath('/')} className="flex items-center gap-2 text-xl font-bold text-blue-600">
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
                            <li><Link to={getLocalizedPath("/merge-pdf")} className="hover:text-blue-600">Merge PDF</Link></li>
                            <li><Link to={getLocalizedPath("/compress-pdf")} className="hover:text-blue-600">Compress PDF</Link></li>
                            <li><Link to={getLocalizedPath("/jpg-to-pdf")} className="hover:text-blue-600">JPG to PDF</Link></li>
                            <li><Link to={getLocalizedPath("/extract-images")} className="hover:text-blue-600">Extract Images</Link></li>
                            <li><Link to={getLocalizedPath("/reverse-pdf")} className="hover:text-blue-600">Reverse PDF</Link></li>
                            <li><Link to={getLocalizedPath("/flip-image")} className="hover:text-blue-600">Flip Image</Link></li>
                            <li><Link to={getLocalizedPath("/pixelate-image")} className="hover:text-blue-600">Pixelate Image</Link></li>
                            <li><Link to={getLocalizedPath("/invert-image")} className="hover:text-blue-600">Invert Colors</Link></li>
                            <li><Link to={getLocalizedPath("/ai-writer")} className="hover:text-blue-600">AI Writer</Link></li>
                            <li><Link to={getLocalizedPath("/edit-pdf")} className="hover:text-blue-600">Edit PDF</Link></li>
                            <li><Link to={getLocalizedPath("/crop-pdf")} className="hover:text-blue-600">Crop PDF</Link></li>
                            <li><Link to={getLocalizedPath("/pdf-to-csv")} className="hover:text-blue-600">PDF to CSV</Link></li>
                            <li><Link to={getLocalizedPath("/url-to-pdf")} className="hover:text-blue-600">URL to PDF</Link></li>
                            <li><Link to={getLocalizedPath("/pdf-to-ppt")} className="hover:text-blue-600">PDF to PPT</Link></li>
                            <li><Link to={getLocalizedPath("/ppt-to-pdf")} className="hover:text-blue-600">PPT to PDF</Link></li>
                            <li><Link to={getLocalizedPath("/epub-to-pdf")} className="hover:text-blue-600">EPUB to PDF</Link></li>
                            <li><Link to={getLocalizedPath("/mobi-to-pdf")} className="hover:text-blue-600">MOBI to PDF</Link></li>
                            <li><Link to={getLocalizedPath("/outlook-to-pdf")} className="hover:text-blue-600">Outlook to PDF</Link></li>
                            <li><Link to={getLocalizedPath("/pdf-to-text")} className="hover:text-blue-600">PDF to Text</Link></li>
                            <li><Link to={getLocalizedPath("/image-tools/profile-picture-maker")} className="hover:text-blue-600">Profile Maker</Link></li>
                            <li><Link to={getLocalizedPath("/image-tools/sharpen-image")} className="hover:text-blue-600">Sharpen Image</Link></li>
                            <li><Link to={getLocalizedPath("/image-tools/black-and-white-filter")} className="hover:text-blue-600">Black & White</Link></li>
                            <li><Link to={getLocalizedPath("/image-tools/blur-image")} className="hover:text-blue-600">Blur Image</Link></li>
                            <li><Link to={getLocalizedPath("/image-tools/split-image")} className="hover:text-blue-600">Split Image</Link></li>
                            <li><Link to={getLocalizedPath("/image-tools/add-text-to-image")} className="hover:text-blue-600">Add Text</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-slate-900">Company</h3>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li><Link to={getLocalizedPath("/about")} className="hover:text-blue-600">About Us</Link></li>
                            <li><Link to={getLocalizedPath("/contact")} className="hover:text-blue-600">Contact</Link></li>
                            <li><Link to={getLocalizedPath("/privacy")} className="hover:text-blue-600">Privacy Policy</Link></li>
                            <li><Link to={getLocalizedPath("/terms")} className="hover:text-blue-600">Terms of Service</Link></li>
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
