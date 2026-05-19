import * as React from 'react';

// ── Base props for all tool icons ───────────────────────────────────────────
interface IconProps {
  size?: number;
  className?: string;
}

const Svg: React.FC<{
  size?: number;
  className?: string;
  children: React.ReactNode;
  viewBox?: string;
}> = ({ size = 40, className = '', children, viewBox = '0 0 40 40' }) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {children}
  </svg>
);

// ── PDF Suite Icons ─────────────────────────────────────────────────────────

export const MergePdfIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="6" y="8" width="14" height="18" rx="2" fill="currentColor" opacity="0.15" />
    <rect x="6" y="8" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
    <rect x="20" y="8" width="14" height="18" rx="2" fill="currentColor" opacity="0.15" />
    <rect x="20" y="8" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M18 16h4M20 14v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M10 14h6M10 18h6M10 22h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    <path d="M24 14h6M24 18h6M24 22h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
  </Svg>
);

export const SplitPdfIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="8" y="8" width="24" height="18" rx="2" fill="currentColor" opacity="0.15" />
    <rect x="8" y="8" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
    <line x1="20" y1="8" x2="20" y2="26" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" />
    <path d="M10 14h6M10 18h6M10 22h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    <path d="M24 14h6M24 18h6M24 22h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
  </Svg>
);

export const CompressPdfIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="10" y="6" width="20" height="26" rx="2" fill="currentColor" opacity="0.15" />
    <rect x="10" y="6" width="20" height="26" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M14 14h12M14 18h10M14 22h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <path d="M16 30l4-4 4 4M16 10l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const PdfToWordIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="6" y="5" width="20" height="26" rx="2" fill="currentColor" opacity="0.15" />
    <rect x="6" y="5" width="20" height="26" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M10 12h6M10 16h8M10 20h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    <rect x="20" y="22" width="14" height="12" rx="2" fill="currentColor" />
    <text x="27" y="31" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="sans-serif">W</text>
  </Svg>
);

export const PdfToExcelIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="6" y="5" width="20" height="26" rx="2" fill="currentColor" opacity="0.15" />
    <rect x="6" y="5" width="20" height="26" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M10 12h6M10 16h8M10 20h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    <rect x="20" y="22" width="14" height="12" rx="2" fill="#10b981" />
    <text x="27" y="31" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="sans-serif">X</text>
  </Svg>
);

export const PdfToPptIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="6" y="5" width="20" height="26" rx="2" fill="currentColor" opacity="0.15" />
    <rect x="6" y="5" width="20" height="26" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M10 12h6M10 16h8M10 20h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    <rect x="20" y="22" width="14" height="12" rx="2" fill="#f59e0b" />
    <text x="27" y="31" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="sans-serif">P</text>
  </Svg>
);

export const EditPdfIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="6" y="5" width="22" height="28" rx="2" fill="currentColor" opacity="0.15" />
    <rect x="6" y="5" width="22" height="28" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M10 13h10M10 17h8M10 21h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <path d="M26 10l-8 16-4 2 2-4 8-16a1.5 1.5 0 012.5 1.5l-1 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ProtectPdfIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="8" y="5" width="20" height="26" rx="2" fill="currentColor" opacity="0.15" />
    <rect x="8" y="5" width="20" height="26" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M12 14h6M12 18h8M12 22h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <path d="M28 24c0 3-4 6-4 6s-4-3-4-6a4 4 0 018 0z" fill="currentColor" />
    <circle cx="24" cy="24" r="1.5" fill="white" />
  </Svg>
);

export const UnlockPdfIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="8" y="5" width="20" height="26" rx="2" fill="currentColor" opacity="0.15" />
    <rect x="8" y="5" width="20" height="26" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M12 14h6M12 18h8M12 22h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <path d="M22 26v-4a2 2 0 014 0v4M24 28v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const SignPdfIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="6" y="5" width="22" height="28" rx="2" fill="currentColor" opacity="0.15" />
    <rect x="6" y="5" width="22" height="28" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M10 14h8M10 18h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <path d="M10 26c2-3 4-3 6-1s4 1 6-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <line x1="10" y1="24" x2="24" y2="24" stroke="currentColor" strokeWidth="1" opacity="0.3" />
  </Svg>
);

export const RotatePdfIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="8" y="6" width="20" height="26" rx="2" fill="currentColor" opacity="0.15" />
    <rect x="8" y="6" width="20" height="26" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M12 15h8M12 19h6M12 23h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <path d="M26 10a8 8 0 010 16M22 12l4-2 2 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

export const DeletePagesIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="6" y="5" width="16" height="22" rx="2" fill="currentColor" opacity="0.15" />
    <rect x="6" y="5" width="16" height="22" rx="2" stroke="currentColor" strokeWidth="2" />
    <rect x="18" y="13" width="16" height="22" rx="2" fill="currentColor" opacity="0.15" />
    <rect x="18" y="13" width="16" height="22" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M10 12h6M10 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <path d="M22 20h6M22 24h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <circle cx="28" cy="10" r="7" fill="#ef4444" />
    <path d="M25 10h6M28 7v6" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const WatermarkPdfIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="8" y="5" width="22" height="28" rx="2" fill="currentColor" opacity="0.15" />
    <rect x="8" y="5" width="22" height="28" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M12 13h8M12 17h6M12 21h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <path d="M12 28c2-2 3-3 5-1s3 1 5-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    <path d="M28 8c-2 2-4 2-6 0s-4-2-6 0v6c2-2 4-2 6 0s4 2 6 0V8z" fill="currentColor" opacity="0.3" />
  </Svg>
);

export const PageNumbersIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="8" y="5" width="20" height="26" rx="2" fill="currentColor" opacity="0.15" />
    <rect x="8" y="5" width="20" height="26" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M12 12h8M12 16h6M12 20h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <rect x="14" y="25" width="8" height="5" rx="1" fill="currentColor" />
    <text x="18" y="29" textAnchor="middle" fill="white" fontSize="4" fontWeight="bold" fontFamily="sans-serif">1</text>
  </Svg>
);

// ── Image Toolkit Icons ─────────────────────────────────────────────────────

export const RemoveBgIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="4" y="4" width="32" height="32" rx="3" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
    <circle cx="20" cy="16" r="6" fill="currentColor" opacity="0.2" />
    <path d="M20 12a4 4 0 00-4 4c0 2 2 3 4 5 2-2 4-3 4-5a4 4 0 00-4-4z" fill="currentColor" />
    <path d="M14 26c2-3 4-4 6-4s4 1 6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const ResizeImageIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="6" y="8" width="20" height="16" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2" />
    <rect x="16" y="14" width="16" height="16" rx="2" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="2" />
    <path d="M14 10h6M14 13h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    <path d="M26 26l4 4M28 26v4M26 28h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const CompressImageIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="6" y="6" width="28" height="24" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2" />
    <circle cx="14" cy="14" r="3" fill="currentColor" opacity="0.3" />
    <path d="M8 26l8-8 6 6 8-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
    <path d="M28 8l4-2M28 8l-2 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M32 12l2 4M32 12l-4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const ConvertImageIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="4" y="8" width="14" height="20" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2" />
    <rect x="22" y="8" width="14" height="20" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2" />
    <path d="M8 14h6M8 18h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <path d="M26 14h6M26 18h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <path d="M18 16l4-2v4l-4-2z" fill="currentColor" />
  </Svg>
);

export const CropImageIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="6" y="6" width="24" height="24" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" />
    <rect x="12" y="12" width="16" height="16" rx="1" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="2" />
    <path d="M12 8v4M8 12h4M28 32v-4M32 28h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const UpscaleImageIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="6" y="10" width="16" height="20" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2" />
    <rect x="20" y="6" width="16" height="20" rx="2" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="2" />
    <path d="M10 18h6M10 22h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <path d="M24 14h6M24 18h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    <path d="M18 16l6-6M20 10h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const FaceBlurIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="4" y="4" width="32" height="32" rx="3" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="20" cy="16" r="6" fill="currentColor" opacity="0.15" />
    <rect x="12" y="10" width="16" height="12" rx="4" fill="currentColor" opacity="0.2" />
    <circle cx="17" cy="15" r="1" fill="currentColor" opacity="0.3" />
    <circle cx="23" cy="15" r="1" fill="currentColor" opacity="0.3" />
    <path d="M17 19c1.5 1 4.5 1 6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
  </Svg>
);

// ── AI Icons ────────────────────────────────────────────────────────────────

export const AiImageGeneratorIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="6" y="6" width="28" height="24" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2" />
    <circle cx="14" cy="14" r="3" fill="currentColor" opacity="0.3" />
    <path d="M8 26l8-8 6 6 8-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
    <path d="M28 6l3-3M28 6l3 3M28 6l-3-3M28 6l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const AiWriterIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="8" y="4" width="20" height="28" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2" />
    <path d="M12 12h10M12 16h8M12 20h10M12 24h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <path d="M28 8l3-3M28 8l3 3M28 8l-3-3M28 8l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const MagicAiEditorIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="6" y="6" width="22" height="26" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2" />
    <path d="M10 14h8M10 18h6M10 22h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <path d="M26 6l4-4M26 6l4 4M26 6l-4-4M26 6l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M30 18l2-2M30 18l2 2M30 18l-2-2M30 18l-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
  </Svg>
);

// ── Other Icons ─────────────────────────────────────────────────────────────

export const NotarizeIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="8" y="5" width="20" height="26" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2" />
    <path d="M12 13h8M12 17h6M12 21h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <circle cx="26" cy="24" r="7" fill="currentColor" />
    <path d="M23 24l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const JourneyBuilderIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="4" y="10" width="10" height="10" rx="2" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
    <rect x="16" y="10" width="10" height="10" rx="2" fill="currentColor" opacity="0.35" stroke="currentColor" strokeWidth="1.5" />
    <rect x="28" y="10" width="8" height="10" rx="2" fill="currentColor" opacity="0.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M14 15h2M26 15h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="9" cy="26" r="2" fill="currentColor" opacity="0.3" />
    <circle cx="21" cy="26" r="2" fill="currentColor" opacity="0.5" />
    <circle cx="32" cy="26" r="2" fill="currentColor" />
  </Svg>
);

export const VideoDownloaderIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="6" y="6" width="28" height="20" rx="3" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2" />
    <polygon points="18,14 18,22 26,18" fill="currentColor" opacity="0.4" />
    <path d="M14 30l6 4 6-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const PdfChatIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className}>
    <rect x="6" y="5" width="22" height="26" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2" />
    <path d="M10 13h8M10 17h6M10 21h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <rect x="20" y="22" width="14" height="10" rx="2" fill="currentColor" />
    <path d="M24 26h6M24 28h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

// ── Editor-specific Icons ───────────────────────────────────────────────────

export const HighlightIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className} viewBox="0 0 24 24">
    <path d="M4 10h16v4H4z" fill="currentColor" opacity="0.3" />
    <path d="M6 8h12M6 12h12M6 16h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

export const WhiteoutIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className} viewBox="0 0 24 24">
    <rect x="3" y="6" width="18" height="12" rx="1" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6 10h8M6 13h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    <rect x="10" y="9" width="10" height="8" rx="1" fill="white" stroke="currentColor" strokeWidth="1.5" />
  </Svg>
);

export const SmartWhiteoutIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className} viewBox="0 0 24 24">
    <rect x="3" y="6" width="18" height="12" rx="1" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6 10h8M6 13h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    <rect x="10" y="9" width="10" height="8" rx="1" fill="white" stroke="currentColor" strokeWidth="1.5" />
    <path d="M20 4l2-2M20 4l2 2M20 4l-2-2M20 4l-2 2" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

export const ShapeRectIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className} viewBox="0 0 24 24">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" />
  </Svg>
);

export const ShapeCircleIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="8" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" />
  </Svg>
);

export const ShapeEllipseIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className} viewBox="0 0 24 24">
    <ellipse cx="12" cy="12" rx="10" ry="7" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" />
  </Svg>
);

export const ShapeLineIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className} viewBox="0 0 24 24">
    <line x1="4" y1="20" x2="20" y2="4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

export const ShapeArrowIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className} viewBox="0 0 24 24">
    <line x1="4" y1="20" x2="16" y2="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M10 6l6 2-2 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

export const StampIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className} viewBox="0 0 24 24">
    <circle cx="12" cy="10" r="6" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 16h8v4H8z" fill="currentColor" opacity="0.3" />
    <rect x="6" y="20" width="12" height="3" rx="1" fill="currentColor" opacity="0.5" />
  </Svg>
);

export const MeasureIcon: React.FC<IconProps> = ({ size, className }) => (
  <Svg size={size} className={className} viewBox="0 0 24 24">
    <rect x="3" y="8" width="18" height="8" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" transform="rotate(-15 12 12)" />
    <line x1="6" y1="12" x2="6" y2="14" stroke="currentColor" strokeWidth="1" transform="rotate(-15 12 12)" />
    <line x1="10" y1="11" x2="10" y2="14" stroke="currentColor" strokeWidth="1" transform="rotate(-15 12 12)" />
    <line x1="14" y1="10" x2="14" y2="14" stroke="currentColor" strokeWidth="1" transform="rotate(-15 12 12)" />
    <line x1="18" y1="9" x2="18" y2="14" stroke="currentColor" strokeWidth="1" transform="rotate(-15 12 12)" />
  </Svg>
);

// ── Icon Map Helper ─────────────────────────────────────────────────────────

export const getToolIcon = (slug: string, size?: number): React.ReactNode => {
  const icons: Record<string, React.FC<IconProps>> = {
    'merge-pdf': MergePdfIcon,
    'split-pdf': SplitPdfIcon,
    'compress-pdf': CompressPdfIcon,
    'pdf-to-word': PdfToWordIcon,
    'pdf-to-excel': PdfToExcelIcon,
    'pdf-to-ppt': PdfToPptIcon,
    'pdf-to-text': PdfToWordIcon,
    'pdf-chat': PdfChatIcon,
    'protect-pdf': ProtectPdfIcon,
    'unlock-pdf': UnlockPdfIcon,
    'sign-pdf': SignPdfIcon,
    'edit-pdf': EditPdfIcon,
    'rotate-pdf': RotatePdfIcon,
    'delete-pages': DeletePagesIcon,
    'page-numbers': PageNumbersIcon,
    'watermark-pdf': WatermarkPdfIcon,
    'remove-bg': RemoveBgIcon,
    'resize-image': ResizeImageIcon,
    'compress-image': CompressImageIcon,
    'convert-image': ConvertImageIcon,
    'crop-image': CropImageIcon,
    'upscale-image': UpscaleImageIcon,
    'face-blur': FaceBlurIcon,
    'ai-image-generator': AiImageGeneratorIcon,
    'ai-writer': AiWriterIcon,
    'magic-ai-editor': MagicAiEditorIcon,
    'notarize': NotarizeIcon,
    'journey-builder': JourneyBuilderIcon,
    'video-downloader': VideoDownloaderIcon,
  };

  const Icon = icons[slug];
  if (Icon) return <Icon size={size} />;
  return null;
};

export const getEditorToolIcon = (mode: string, size?: number): React.ReactNode => {
  const icons: Record<string, React.FC<IconProps>> = {
    'highlight': HighlightIcon,
    'erase': WhiteoutIcon,
    'smart-erase': SmartWhiteoutIcon,
    'rect': ShapeRectIcon,
    'circle': ShapeCircleIcon,
    'ellipse': ShapeEllipseIcon,
    'line': ShapeLineIcon,
    'arrow': ShapeArrowIcon,
    'stamp': StampIcon,
    'measure': MeasureIcon,
  };
  const Icon = icons[mode];
  if (Icon) return <Icon size={size} />;
  return null;
};
