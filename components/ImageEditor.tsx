import * as React from 'react';
import {  useState, useRef  } from 'react';
import { Edit3, Upload, Image as ImageIcon, Download, RefreshCw } from 'lucide-react';
import { Button } from './Button.tsx';
import { fileToBase64 } from '../utils.ts';
import { editImage } from '../services/geminiService.ts';

export const ImageEditor: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSourceFile(file);
      try {
        const base64 = await fileToBase64(file);
        setSourceImage(`data:${file.type};base64,${base64}`);
        setEditedImage(null);
        setError(null);
      } catch (err) {
        setError("Failed to load image");
      }
    }
  };

  const handleEdit = async () => {
    if (!sourceFile || !prompt.trim()) return;

    setIsProcessing(true);
    setError(null);
    try {
      const base64 = await fileToBase64(sourceFile);
      const result = await editImage(base64, prompt, sourceFile.type);
      setEditedImage(result);
    } catch (err: any) {
      setError(err.message || "Failed to edit image");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3">
          <Edit3 className="w-8 h-8 text-pink-500" />
          Magic Editor
        </h2>
        <p className="text-slate-500">Upload an image and tell AI how to change it.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Side */}
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl h-[400px] flex flex-col items-center justify-center cursor-pointer transition-colors ${sourceImage ? 'border-slate-300 bg-white' : 'border-slate-300 bg-slate-50 hover:border-pink-500 hover:bg-pink-50/20'}`}
          >
            {sourceImage ? (
              <img src={sourceImage} alt="Source" className="max-h-full max-w-full object-contain p-4" />
            ) : (
              <div className="text-center p-6 text-slate-500">
                <Upload className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium text-slate-700">Click to upload an image</p>
                <p className="text-sm mt-2">JPG, PNG supported</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3 shadow-sm">
            <label className="block text-sm font-medium text-slate-700">Edit Instruction</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., 'Add a pair of sunglasses to the cat'"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
              />
              <Button
                onClick={handleEdit}
                disabled={!sourceImage || !prompt.trim()}
                isLoading={isProcessing}
                className="bg-pink-600 hover:bg-pink-700 shadow-lg shadow-pink-200"
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Edit
              </Button>
            </div>
          </div>
        </div>

        {/* Output Side */}
        <div className="h-[400px] bg-white rounded-2xl border border-slate-200 flex items-center justify-center relative overflow-hidden shadow-sm">
          {editedImage ? (
            <div className="relative w-full h-full flex items-center justify-center group">
              <img src={editedImage} alt="Edited" className="max-h-full max-w-full object-contain p-4" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <a
                  href={editedImage}
                  download={(function () {
                    let ext = '.png';
                    if (editedImage.startsWith('data:image/jpeg')) ext = '.jpg';
                    else if (editedImage.startsWith('data:image/webp')) ext = '.webp';
                    return `lumina-edit-${Date.now()}${ext}`;
                  })()}
                  className="p-3 bg-white rounded-full text-slate-900 hover:bg-slate-100 transition-colors shadow-lg"
                >
                  <Download className="w-6 h-6" />
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400">
              {isProcessing ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin" />
                  <p>applying magic...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="w-12 h-12 opacity-20" />
                  <p>Edited result will appear here</p>
                </div>
              )}
            </div>
          )}
          {error && (
            <div className="absolute bottom-4 left-4 right-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center shadow-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};