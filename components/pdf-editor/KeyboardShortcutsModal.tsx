import * as React from 'react';
import { X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { key: 'V', description: 'Select tool' },
  { key: 'T', description: 'Text tool' },
  { key: 'I', description: 'Insert image' },
  { key: 'D', description: 'Draw tool' },
  { key: 'H', description: 'Highlight tool' },
  { key: 'E', description: 'Whiteout tool' },
  { key: 'S', description: 'Shapes tool' },
  { key: 'L', description: 'Link tool' },
  { key: 'N', description: 'Sign tool' },
  { key: 'F', description: 'Form tool' },
  { key: 'C', description: 'Comment tool' },
  { key: 'Ctrl + F', description: 'Find & Replace' },
  { key: 'Ctrl + Z', description: 'Undo' },
  { key: 'Ctrl + Y', description: 'Redo' },
  { key: 'Ctrl + Shift + Z', description: 'Redo (alternate)' },
  { key: 'Delete', description: 'Delete selected element' },
  { key: 'Arrow Keys', description: 'Nudge selected element' },
  { key: 'Shift + Arrow', description: 'Nudge 10px' },
  { key: 'Escape', description: 'Deselect / Cancel' },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">Keyboard Shortcuts</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="grid gap-2.5">
            {shortcuts.map((s) => (
              <div key={s.key} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{s.description}</span>
                <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs font-mono font-medium text-slate-700 whitespace-nowrap">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-center">
          <button onClick={onClose} className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
