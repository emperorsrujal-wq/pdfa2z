import * as React from 'react';
import { Check, X, Trash2, Calendar, Type, Stamp, Building2, User, CheckSquare } from 'lucide-react';
import { EditElement } from '../utils/pdfHelpers';

interface PdfSignCanvasProps {
  image: string;
  pageIndex: number;
  initialElements: EditElement[];
  savedSignatures: string[];
  onSave: (elements: EditElement[]) => void;
  onCancel: () => void;
  onRequestNewSignature: () => void;
}

export const PdfSignCanvas: React.FC<PdfSignCanvasProps> = ({
  image,
  pageIndex,
  initialElements,
  savedSignatures,
  onSave,
  onCancel,
  onRequestNewSignature
}) => {
  const [elements, setElements] = React.useState<EditElement[]>(initialElements);
  const [activeElementId, setActiveElementId] = React.useState<string | null>(null);
  
  // Left Sidebar popups
  const [showSigDropdown, setShowSigDropdown] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);

  const addText = (textStr: string, isCheckbox: boolean = false) => {
    const newEl: EditElement = {
      id: Date.now().toString(),
      type: 'text',
      pageIndex,
      x: 200,
      y: 200,
      color: '#000000',
      text: textStr,
      size: isCheckbox ? 24 : 16
    };
    setElements([...elements, newEl]);
    setActiveElementId(newEl.id);
  };

  const addSignature = (base64Str: string) => {
    const newEl: EditElement = {
      id: Date.now().toString(),
      type: 'image',
      pageIndex,
      x: 200,
      y: 200,
      width: 250,
      height: 60, // Approximate starting size
      imageUrl: base64Str
    };
    setElements([...elements, newEl]);
    setActiveElementId(newEl.id);
    setShowSigDropdown(false);
  };

  const handleSignatureClick = () => {
      if (savedSignatures.length === 0) {
          onRequestNewSignature();
      } else {
          setShowSigDropdown(!showSigDropdown);
      }
  };

  const updateElement = (id: string, updates: Partial<EditElement>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    setActiveElementId(null);
  };

  // Draggable Field Component
  const FieldButton = ({ icon: Icon, label, onClick, active = false }: any) => (
      <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 font-bold text-sm transition-all text-left ${active ? 'border-yellow-400 bg-yellow-50 text-slate-800 shadow-md' : 'border-transparent hover:border-slate-300 bg-white hover:shadow-sm text-slate-700'}`}
      >
          <Icon size={18} className="text-slate-400" />
          {label}
      </button>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-slate-100 flex flex-col md:flex-row animate-fade-in touch-none overflow-hidden">
      
      {/* LEFT SIDEBAR (DocuSign Style) */}
      <div className="w-full md:w-72 bg-slate-50 border-r border-slate-200 flex flex-col h-full shadow-2xl z-10">
          <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Stamp className="text-indigo-600" />
                  Sign PDF
              </h2>
              <button onClick={onCancel} className="md:hidden p-2 rounded-full hover:bg-slate-100"><X size={20}/></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-8">
              <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Standard Fields</h3>
                  <div className="space-y-2 relative">
                      <FieldButton icon={Stamp} label="Signature" active={showSigDropdown} onClick={handleSignatureClick} />
                      
                      {/* Signature Dropdown Popout */}
                      {showSigDropdown && savedSignatures.length > 0 && (
                          <div className="absolute top-12 left-0 w-full bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50 animate-fade-in">
                              <p className="text-xs font-bold text-slate-400 mb-2">Select Signature</p>
                              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                  {savedSignatures.map((sig, idx) => (
                                      <div key={idx} onClick={() => addSignature(sig)} className="p-2 border-2 border-slate-100 rounded-lg hover:border-indigo-500 cursor-pointer transition-colors bg-white flex items-center justify-center">
                                          <img src={sig} className="max-h-12 object-contain mix-blend-multiply" alt="Signature" />
                                      </div>
                                  ))}
                              </div>
                              <button onClick={() => { onRequestNewSignature(); setShowSigDropdown(false); }} className="w-full mt-2 py-2 bg-indigo-50 text-indigo-700 font-bold text-sm rounded-lg hover:bg-indigo-100">
                                  + Add New
                              </button>
                          </div>
                      )}

                      <FieldButton icon={User} label="Initials" onClick={() => addText('Initials')} />
                      <FieldButton icon={Calendar} label="Date Signed" onClick={() => addText(new Date().toLocaleDateString())} />
                      <FieldButton icon={User} label="Name" onClick={() => addText('Full Name')} />
                      <FieldButton icon={Building2} label="Company" onClick={() => addText('Company')} />
                  </div>
              </div>

              <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Markup</h3>
                  <div className="space-y-2">
                      <FieldButton icon={Type} label="Text" onClick={() => addText('Text Field')} />
                      <FieldButton icon={CheckSquare} label="Checkbox" onClick={() => addText('X', true)} />
                  </div>
              </div>
          </div>

          <div className="p-6 bg-white border-t border-slate-200 space-y-3">
              <button 
                onClick={() => onSave(elements)} 
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
              >
                  <Check size={20} /> Finish Page
              </button>
              <button 
                onClick={onCancel} 
                className="w-full py-3 bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl font-bold transition-all"
              >
                  Cancel
              </button>
          </div>
      </div>

      {/* CANVAS AREA */}
      <div 
        className="flex-1 bg-slate-200/50 flex flex-col p-4 md:p-8 overflow-hidden items-center justify-center" 
        onClick={() => {
            setActiveElementId(null);
            setShowSigDropdown(false);
        }}
      >
        <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 font-bold text-slate-500 text-sm mb-4">
            Page {pageIndex + 1}
        </div>
        
        <div className="relative flex-1 w-full max-w-4xl min-h-0 flex justify-center">
            <div
                ref={containerRef}
                className="relative bg-white shadow-2xl rounded max-h-full aspect-[1/1.414] overflow-hidden border border-slate-300"
            >
                {/* Guidelines mockup for premium feel */}
                <div className="absolute inset-x-0 inset-y-10 border-t border-b border-transparent pointer-events-none" />
                
                <img src={image} className="w-full h-full object-contain pointer-events-none select-none" alt="PDF Page" />

                {/* Render Elements */}
                {elements.map(el => {
                    const isActive = activeElementId === el.id;
                    const isImage = el.type === 'image';
                    const isSig = isImage; // Assumption for styling

                    return (
                        <div
                            key={el.id}
                            className={`absolute border-2 ${isActive ? (isSig ? 'border-yellow-400 bg-yellow-400/10 shadow-xl z-20' : 'border-slate-400 bg-slate-400/10 shadow-xl z-20') : 'border-transparent hover:border-slate-300 z-10'} group transition-shadow`}
                            style={{
                                left: `${el.x / 10}%`,
                                top: `${el.y / 10}%`,
                                width: isImage ? (el.width ? `${el.width/10}%` : 'auto') : 'auto',
                                cursor: 'grab',
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveElementId(el.id);
                                setShowSigDropdown(false);
                            }}
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                setActiveElementId(el.id);
                                setShowSigDropdown(false);
                                
                                const startX = e.clientX;
                                const startY = e.clientY;
                                const startElX = el.x;
                                const startElY = el.y;

                                const container = containerRef.current;
                                if(container) container.style.cursor = 'grabbing';

                                const onMove = (moveEvent: PointerEvent) => {
                                    if (!containerRef.current) return;
                                    const rect = containerRef.current.getBoundingClientRect();
                                    const dx = ((moveEvent.clientX - startX) / rect.width) * 1000;
                                    const dy = ((moveEvent.clientY - startY) / rect.height) * 1000;
                                    
                                    // Implementation of simple snapping (optional visual, here just logic)
                                    let newX = Math.max(0, Math.min(1000 - (el.width || 0), startElX + dx));
                                    let newY = Math.max(0, Math.min(1000 - (el.height || 0), startElY + dy));

                                    updateElement(el.id, { x: newX, y: newY });
                                };
                                
                                const onUp = () => {
                                    if(container) container.style.cursor = '';
                                    window.removeEventListener('pointermove', onMove);
                                    window.removeEventListener('pointerup', onUp);
                                };
                                
                                window.addEventListener('pointermove', onMove);
                                window.addEventListener('pointerup', onUp);
                            }}
                        >
                            {/* "Sign Here" indicator Tab for active sig block */}
                            {isSig && isActive && (
                                <div className="absolute -top-6 left-0 bg-yellow-400 text-slate-800 text-[10px] font-black px-2 py-1 uppercase rounded-t-lg tracking-widest flex items-center gap-1">
                                    <Stamp size={10} /> Signature
                                </div>
                            )}
                            
                            {!isSig && isActive && (
                                <div className="absolute -top-6 left-0 bg-slate-700 text-white text-[10px] font-black px-2 py-1 uppercase rounded-t-lg tracking-widest flex items-center gap-1">
                                    <Type size={10} /> Text Field
                                </div>
                            )}

                            {el.type === 'text' ? (
                                isActive ? (
                                    <input 
                                        autoFocus
                                        type="text"
                                        value={el.text || ''}
                                        onChange={(e) => updateElement(el.id, { text: e.target.value })}
                                        className="bg-transparent border-none outline-none font-inherit text-inherit min-w-[100px] font-medium"
                                        style={{ fontSize: `${(el.size || 16)/10}vw`, color: el.color }}
                                    />
                                ) : (
                                    <span className="pointer-events-none select-none whitespace-nowrap font-medium" style={{ fontSize: `${(el.size || 16)/10}vw`, color: el.color }}>
                                    {el.text}
                                    </span>
                                )
                            ) : el.type === 'image' ? (
                                <div className="w-full h-full relative">
                                    <img src={el.imageUrl} draggable={false} className="w-full h-full object-contain pointer-events-none mix-blend-multiply" />
                                </div>
                            ) : null}

                            {/* Controls */}
                            {isActive && (
                                <>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                                        className="absolute -top-3 -right-3 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors pointer-events-auto z-30"
                                    >
                                        <Trash2 size={14} />
                                    </button>

                                    {el.type === 'image' && (
                                        <div 
                                            className={`absolute -bottom-2 -right-2 w-5 h-5 ${isSig ? 'bg-yellow-400' : 'bg-slate-700'} border-2 border-white rounded-full cursor-nwse-resize shadow-lg z-30`}
                                            onPointerDown={(e) => {
                                                e.stopPropagation();
                                                const startX = e.clientX;
                                                const startWidth = el.width || 250;
                                                const onMoveResize = (moveEvent: PointerEvent) => {
                                                    if (!containerRef.current) return;
                                                    const rect = containerRef.current.getBoundingClientRect();
                                                    const dx = ((moveEvent.clientX - startX) / rect.width) * 1000;
                                                    const newW = Math.max(80, Math.min(1000 - el.x, startWidth + dx));
                                                    updateElement(el.id, { width: newW, height: newW / 3 });
                                                };
                                                const onUpResize = () => {
                                                    window.removeEventListener('pointermove', onMoveResize);
                                                    window.removeEventListener('pointerup', onUpResize);
                                                };
                                                window.addEventListener('pointermove', onMoveResize);
                                                window.addEventListener('pointerup', onUpResize);
                                            }}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
      </div>

    </div>
  );
};
