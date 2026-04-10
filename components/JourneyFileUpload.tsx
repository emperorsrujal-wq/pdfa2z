/**
 * File Upload Component for PDF Journey Builder
 * Supports drag-and-drop, validation, and progress tracking
 */

import * as React from 'react';
import { useState, useRef } from 'react';

export interface FileData {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  data: ArrayBuffer; // File contents
  preview?: string;  // Base64 preview for images
}

interface JourneyFileUploadProps {
  fieldId: string;
  label: string;
  acceptedTypes: string[]; // e.g., ['.pdf', '.jpg', '.png']
  maxSize: number; // in bytes
  maxFiles?: number;
  required?: boolean;
  helpText?: string;
  value?: FileData[];
  onChange: (files: FileData[]) => void;
  error?: string | null;
}

const FRIENDLY_TYPE_NAMES: Record<string, string> = {
  'application/pdf': 'PDF Document',
  'image/jpeg': 'JPEG Image',
  'image/png': 'PNG Image',
  'image/webp': 'WebP Image',
  'application/msword': 'Word Document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
  'application/vnd.ms-excel': 'Excel Spreadsheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
  'application/zip': 'ZIP Archive',
};

const getFileTypeName = (mimeType: string): string => {
  return FRIENDLY_TYPE_NAMES[mimeType] || mimeType || 'File';
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const validateFile = (
  file: File,
  acceptedTypes: string[],
  maxSize: number
): { valid: boolean; error?: string } => {
  // Check file type
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  const mimeType = file.type;

  const typeMatches =
    acceptedTypes.length === 0 ||
    acceptedTypes.some((type) => type.toLowerCase() === fileExtension.toLowerCase() || type === mimeType);

  if (!typeMatches) {
    return {
      valid: false,
      error: `File type not allowed. Accepted: ${acceptedTypes.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Max size: ${formatFileSize(maxSize)}`,
    };
  }

  return { valid: true };
};

const generatePreview = async (file: File): Promise<string | undefined> => {
  if (!file.type.startsWith('image/')) {
    return undefined;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => {
      resolve(undefined);
    };
    reader.readAsDataURL(file);
  });
};

export const JourneyFileUpload: React.FC<JourneyFileUploadProps> = ({
  fieldId,
  label,
  acceptedTypes,
  maxSize,
  maxFiles = 5,
  required = false,
  helpText,
  value = [],
  onChange,
  error,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    setIsLoading(true);

    const newFiles: FileData[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check max files limit
      if (value.length + newFiles.length >= maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        break;
      }

      // Validate file
      const validation = validateFile(file, acceptedTypes, maxSize);
      if (!validation.valid) {
        alert(`${file.name}: ${validation.error}`);
        continue;
      }

      // Read file
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result as ArrayBuffer;
        const preview = await generatePreview(file);

        const fileData: FileData = {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          data,
          preview,
        };

        newFiles.push(fileData);

        // If all files loaded, update parent
        if (newFiles.length === files.length || newFiles.length === maxFiles) {
          onChange([...value, ...newFiles.slice(0, maxFiles - value.length)]);
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        alert(`Failed to read ${file.name}`);
      };

      reader.readAsArrayBuffer(file);
    }

    if (newFiles.length === 0) {
      setIsLoading(false);
    }
  };

  const removeFile = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Drag and drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
          }
        }}
        style={{
          border: error ? '2px dashed #f87171' : '2px dashed rgba(245,158,11,0.35)',
          borderRadius: 12,
          padding: 32,
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragging ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.02)',
          transition: 'all 0.2s',
          opacity: isLoading ? 0.7 : 1,
        }}
        onClick={() => !isLoading && fileInputRef.current?.click()}
      >
        <div style={{ fontSize: 32, marginBottom: 12, lineHeight: 1 }}>📎</div>
        <p
          style={{
            margin: '0 0 8px 0',
            fontSize: 15,
            fontWeight: 600,
            color: '#e2e8f0',
          }}
        >
          {isLoading ? 'Uploading files...' : 'Drag files here or click to browse'}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: '#64748b',
          }}
        >
          Max {formatFileSize(maxSize)} per file · {maxFiles} files max
        </p>
        {acceptedTypes.length > 0 && (
          <p
            style={{
              margin: '8px 0 0 0',
              fontSize: 12,
              color: '#475569',
            }}
          >
            Accepted: {acceptedTypes.join(', ')}
          </p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />

      {helpText && (
        <p
          style={{
            fontSize: 12,
            color: '#64748b',
            marginTop: 8,
            margin: '8px 0 0 0',
          }}
        >
          {helpText}
        </p>
      )}

      {error && (
        <p
          style={{
            fontSize: 12,
            color: '#f87171',
            marginTop: 8,
            margin: '8px 0 0 0',
          }}
        >
          ⚠ {error}
        </p>
      )}

      {required && value.length === 0 && (
        <p
          style={{
            fontSize: 12,
            color: '#f87171',
            marginTop: 8,
            margin: '8px 0 0 0',
          }}
        >
          ⚠ This field is required
        </p>
      )}

      {/* File list */}
      {value.length > 0 && (
        <div
          style={{
            marginTop: 16,
            borderTop: '1px solid rgba(71,85,105,0.2)',
            paddingTop: 12,
          }}
        >
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#94a3b8',
              margin: '0 0 12px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {value.length} File{value.length === 1 ? '' : 's'} Attached
          </p>

          {value.map((file, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                background: 'rgba(245,158,11,0.05)',
                borderRadius: 10,
                marginBottom: 8,
                border: '1px solid rgba(245,158,11,0.1)',
              }}
            >
              {/* Preview or Icon */}
              {file.preview ? (
                <img
                  src={file.preview}
                  alt={file.name}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: 'rgba(99,102,241,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                  }}
                >
                  {file.type.startsWith('image/') ? '🖼️' : '📄'}
                </div>
              )}

              {/* File info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#e2e8f0',
                    wordBreak: 'break-all',
                  }}
                >
                  {file.name}
                </p>
                <p
                  style={{
                    margin: '4px 0 0 0',
                    fontSize: 12,
                    color: '#64748b',
                  }}
                >
                  {getFileTypeName(file.type)} · {formatFileSize(file.size)}
                </p>
              </div>

              {/* Remove button */}
              <button
                onClick={() => removeFile(index)}
                style={{
                  background: 'rgba(248,113,113,0.1)',
                  border: '1px solid rgba(248,113,113,0.2)',
                  color: '#f87171',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'rgba(248,113,113,0.2)';
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'rgba(248,113,113,0.1)';
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
