import * as React from 'react';
import {
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Minus,
  Plus,
  ChevronDown,
  X,
  RotateCw,
  Trash2,
  Copy,
  Move,
} from 'lucide-react';
import type { EditorMode } from './types';

interface PropertiesPanelProps {
  activeMode: EditorMode;
  activeColor: string;
  onColorChange: (color: string) => void;
  lineWidth: number;
  onLineWidthChange: (w: number) => void;
  fontSize: number;
  onFontSizeChange: (s: number) => void;
  fontName: string;
  onFontNameChange: (f: string) => void;
  isBold: boolean;
  onBoldChange: (b: boolean) => void;
  isItalic: boolean;
  onItalicChange: (i: boolean) => void;
  isUnderline: boolean;
  onUnderlineChange: (u: boolean) => void;
  isStrikethrough: boolean;
  onStrikethroughChange: (s: boolean) => void;
  textAlign: 'left' | 'center' | 'right';
  onTextAlignChange: (a: 'left' | 'center' | 'right') => void;
  opacity: number;
  onOpacityChange: (o: number) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  hasSelection?: boolean;
}

const COLORS = [
  '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4',
  '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#78350F',
];

const WIDTHS = [1, 2, 3, 5, 8, 12];
const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];
const FONTS = ['Helvetica', 'Times-Roman', 'Courier', 'Symbol', 'ZapfDingbats'];

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-5">
    <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2.5">{title}</h4>
    {children}
  </div>
);

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  activeMode,
  activeColor,
  onColorChange,
  lineWidth,
  onLineWidthChange,
  fontSize,
  onFontSizeChange,
  fontName,
  onFontNameChange,
  isBold,
  onBoldChange,
  isItalic,
  onItalicChange,
  isUnderline,
  onUnderlineChange,
  isStrikethrough,
  onStrikethroughChange,
  textAlign,
  onTextAlignChange,
  opacity,
  onOpacityChange,
  onDelete,
  onDuplicate,
  hasSelection,
}) => {
  const isTextTool = ['text', 'magic-edit', 'form-text', 'form-text-multiline'].includes(activeMode);
  const isDrawTool = ['draw', 'highlight', 'strikeout', 'underline', 'erase', 'smart-erase', 'line', 'arrow', 'rect', 'circle', 'ellipse'].includes(activeMode);
  const isShapeTool = ['rect', 'circle', 'ellipse', 'line', 'arrow'].includes(activeMode);

  return (
    <div className="w-64 bg-white border-l border-slate-200 flex flex-col overflow-hidden shrink-0">
      <div className="px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">Properties</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
        {/* Selection Actions */}
        {hasSelection && (
          <Section title="Actions">
            <div className="flex gap-2">
              <button onClick={onDuplicate} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                <Copy size={13} /> Duplicate
              </button>
              <button onClick={onDelete} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs font-medium text-red-600 hover:bg-red-100 transition-colors">
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </Section>
        )}

        {/* Color */}
        {(isTextTool || isDrawTool || isShapeTool) && (
          <Section title="Color">
            <div className="grid grid-cols-6 gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => onColorChange(c)}
                  className={`w-7 h-7 rounded-md border transition-all ${
                    activeColor === c ? 'ring-2 ring-blue-500 ring-offset-1 border-transparent' : 'border-slate-200 hover:border-slate-300'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="color"
                value={activeColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-7 h-7 rounded border border-slate-200 p-0 overflow-hidden cursor-pointer"
              />
              <span className="text-xs text-slate-500 font-mono uppercase">{activeColor}</span>
            </div>
          </Section>
        )}

        {/* Line Width */}
        {(activeMode === 'draw' || isShapeTool || activeMode === 'highlight') && (
          <Section title="Stroke Width">
            <div className="flex gap-1.5">
              {WIDTHS.map((w) => (
                <button
                  key={w}
                  onClick={() => onLineWidthChange(w)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    lineWidth === w ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                  title={`${w}px`}
                >
                  <div className="w-4 rounded-full" style={{ height: w, backgroundColor: lineWidth === w ? 'white' : 'currentColor' }} />
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* Text Properties */}
        {isTextTool && (
          <>
            <Section title="Font">
              <select
                value={fontName}
                onChange={(e) => onFontNameChange(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-400"
              >
                {FONTS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </Section>

            <Section title="Size">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onFontSizeChange(Math.max(8, fontSize - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100"
                >
                  <Minus size={14} />
                </button>
                <select
                  value={fontSize}
                  onChange={(e) => onFontSizeChange(Number(e.target.value))}
                  className="flex-1 px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none text-center"
                >
                  {FONT_SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button
                  onClick={() => onFontSizeChange(Math.min(72, fontSize + 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100"
                >
                  <Plus size={14} />
                </button>
              </div>
            </Section>

            <Section title="Style">
              <div className="flex gap-1.5">
                {[
                  { icon: <Bold size={14} />, active: isBold, onClick: () => onBoldChange(!isBold) },
                  { icon: <Italic size={14} />, active: isItalic, onClick: () => onItalicChange(!isItalic) },
                  { icon: <Underline size={14} />, active: isUnderline, onClick: () => onUnderlineChange(!isUnderline) },
                  { icon: <Strikethrough size={14} />, active: isStrikethrough, onClick: () => onStrikethroughChange(!isStrikethrough) },
                ].map((btn, i) => (
                  <button
                    key={i}
                    onClick={btn.onClick}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      btn.active ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {btn.icon}
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Alignment">
              <div className="flex gap-1.5">
                {[
                  { icon: <AlignLeft size={14} />, value: 'left' as const },
                  { icon: <AlignCenter size={14} />, value: 'center' as const },
                  { icon: <AlignRight size={14} />, value: 'right' as const },
                ].map((btn) => (
                  <button
                    key={btn.value}
                    onClick={() => onTextAlignChange(btn.value)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      textAlign === btn.value ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {btn.icon}
                  </button>
                ))}
              </div>
            </Section>
          </>
        )}

        {/* Opacity */}
        {(isTextTool || isDrawTool || isShapeTool) && (
          <Section title="Opacity">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={10}
                max={100}
                value={opacity}
                onChange={(e) => onOpacityChange(Number(e.target.value))}
                className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-xs text-slate-500 font-mono w-8 text-right">{opacity}%</span>
            </div>
          </Section>
        )}

        {/* Tool Help */}
        <div className="mt-6 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-xs text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-700">Tip:</span>{' '}
            {getToolTip(activeMode)}
          </p>
        </div>
      </div>
    </div>
  );
};

function getToolTip(mode: EditorMode): string {
  const tips: Record<string, string> = {
    select: 'Click to select, drag to move. Use handles to resize or rotate.',
    text: 'Click anywhere to add a new text box.',
    'magic-edit': 'Click existing text to edit it directly.',
    draw: 'Click and drag to draw freehand.',
    highlight: 'Click and drag to highlight text areas.',
    erase: 'Click and drag to cover content with white.',
    'smart-erase': 'Automatically matches background color.',
    rect: 'Click and drag to draw rectangles.',
    circle: 'Click and drag to draw circles.',
    line: 'Click and drag to draw straight lines.',
    arrow: 'Click and drag to draw arrows.',
    image: 'Click to place an image, then upload your file.',
    link: 'Draw a rectangle to create a clickable link area.',
    sign: 'Place a signature box, then draw or upload your signature.',
    'sticky-note': 'Click to add a comment note.',
    'form-text': 'Click to place a fillable text field.',
  };
  return tips[mode] || 'Select a tool to start editing.';
}
