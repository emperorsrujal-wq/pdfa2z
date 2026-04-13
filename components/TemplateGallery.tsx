import React, { useState } from 'react';
import { 
  X, Search, Layout, Briefcase, HeartPulse, Scale, 
  GraduationCap, Landmark, ArrowRight, Sparkles 
} from 'lucide-react';
import { INDUSTRY_TEMPLATES, IndustryTemplate } from '../utils/industryTemplates';

interface TemplateGalleryProps {
  onSelect: (template: IndustryTemplate) => void;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: Layout },
  { id: 'real-estate', label: 'Real Estate', icon: Landmark },
  { id: 'finance', label: 'Finance', icon: Landmark },
  { id: 'healthcare', label: 'Healthcare', icon: HeartPulse },
  { id: 'legal', label: 'Legal', icon: Scale },
  { id: 'hr', label: 'HR & Teams', icon: Briefcase },
  { id: 'consulting', label: 'Professional', icon: Sparkles },
];

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredTemplates = INDUSTRY_TEMPLATES.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || t.id.includes(activeCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px', animation: 'jb-fadeIn 0.3s ease-out'
    }}>
      <div style={{
        background: '#0f172a', width: '100%', maxWidth: '1200px',
        maxHeight: '90vh', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{
          padding: '32px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(255,255,255,0.02)'
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#fff', fontSize: '28px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Sparkles className="text-amber-500" /> Template Marketplace
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '15px' }}>
              Jumpstart your conversion with 50+ industry-validated journey templates.
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', 
              width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar */}
          <div style={{ 
            width: '280px', padding: '32px', borderRight: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', flexDirection: 'column', gap: '8px'
          }}>
            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '12px', color: '#475569' }} size={18} />
              <input 
                type="text" 
                placeholder="Search templates..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', padding: '12px 12px 12px 40px', color: '#fff', fontSize: '14px',
                  outline: 'none', transition: 'all 0.2s'
                }}
              />
            </div>

            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                    width: '100%', border: 'none', borderRadius: '12px', cursor: 'pointer',
                    background: active ? 'rgba(245,158,11,0.1)' : 'transparent',
                    color: active ? '#f59e0b' : '#94a3b8',
                    fontWeight: active ? 700 : 500, transition: 'all 0.2s', textAlign: 'left'
                  }}
                >
                  <Icon size={18} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Grid */}
          <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {filteredTemplates.map(t => (
                <div 
                  key={t.id}
                  onClick={() => onSelect(t)}
                  style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '20px', padding: '24px', cursor: 'pointer', transition: 'all 0.3s',
                    display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  }}
                >
                  <div style={{ 
                    width: '56px', height: '56px', borderRadius: '16px', 
                    background: `${t.color}20`, color: t.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '28px'
                  }}>
                    {t.icon}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: 700 }}>{t.name}</h3>
                    <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '13px', lineHeight: 1.5, minHeight: '40px' }}>
                      {t.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '11px', color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>
                      {t.steps.length} Steps · {t.steps.reduce((acc, s) => acc + s.fields.length, 0)} Fields
                    </span>
                    <ArrowRight size={16} className="text-amber-500" />
                  </div>
                </div>
              ))}
            </div>
            {filteredTemplates.length === 0 && (
              <div style={{ padding: '80px 0', textAlign: 'center' }}>
                <p style={{ color: '#475569', fontSize: '16px' }}>No templates found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
