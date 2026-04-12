import * as React from 'react';
import { X, Type, CheckSquare, List, Plus, Sparkles, Loader2 } from 'lucide-react';
import { suggestFormValues } from '../services/geminiService';
import { EditElement } from '../utils/pdfHelpers';

interface FormBuilderProps {
  onAddField: (type: 'form-text' | 'form-check' | 'form-select') => void;
  onAutoFill: () => void;
  onClose: () => void;
  isFilling?: boolean;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({ onAddField, onAutoFill, onClose, isFilling }) => {
  return (
    <div className="fixed inset-0 z-[600] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <CheckSquare size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Form Builder</h2>
              <p className="text-xs text-slate-500 font-medium">Create fillable PDF forms with AI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-3">
             <button
              onClick={() => onAddField('form-text')}
              className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all text-left"
            >
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-indigo-600">
                <Type size={20} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 dark:text-white text-sm">Text Input Field</p>
                <p className="text-[10px] text-slate-500">Add a fillable text box</p>
              </div>
              <Plus size={16} className="text-slate-400" />
            </button>

            <button
              onClick={() => onAddField('form-check')}
              className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all text-left"
            >
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-emerald-600">
                <CheckSquare size={20} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 dark:text-white text-sm">Checkbox Field</p>
                <p className="text-[10px] text-slate-500">Add a toggleable checkbox</p>
              </div>
              <Plus size={16} className="text-slate-400" />
            </button>

            <button
              onClick={() => onAddField('form-select')}
              className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all text-left"
            >
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-orange-600">
                <List size={20} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 dark:text-white text-sm">Dropdown Menu</p>
                <p className="text-[10px] text-slate-500">Add a list selection field</p>
              </div>
              <Plus size={16} className="text-slate-400" />
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white dark:bg-slate-900 text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Power Features</span>
            </div>
          </div>

          <button
            onClick={onAutoFill}
            disabled={isFilling}
            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {isFilling ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <Sparkles size={24} className="animate-pulse" />
            )}
            <div>
              <p className="text-sm">Magic AI Auto-Fill</p>
              <p className="text-[10px] opacity-70 font-bold uppercase tracking-wider">Predict field values</p>
            </div>
          </button>
        </div>

        <div className="px-8 py-4 bg-slate-50 dark:bg-slate-950 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Gemini 2.5 Intelligence Layer Enabled
          </p>
        </div>
      </div>
    </div>
  );
};
