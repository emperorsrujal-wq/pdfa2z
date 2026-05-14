export type EditorMode =
  | 'select'
  | 'text'
  | 'draw'
  | 'erase'
  | 'smart-erase'
  | 'rect'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'image'
  | 'picker'
  | 'magic-edit'
  | 'highlight'
  | 'strikeout'
  | 'underline'
  | 'link'
  | 'ellipse'
  | 'forms'
  | 'sign'
  | 'sticky-note'
  | 'find-replace'
  | 'ocr'
  | 'convert'
  | 'page-tools'
  | 'form-builder'
  | 'watermark'
  | 'form-text'
  | 'form-text-multiline'
  | 'form-check'
  | 'form-radio'
  | 'form-select'
  | 'form-signature'
  | 'symbol-cross'
  | 'symbol-check'
  | 'symbol-dot'
  | 'comment'
  | 'font-picker'
  | 'watermark';

export interface ToolGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  mode: EditorMode;
  shortcut?: string;
  tooltip: string;
}
