export interface PassportStandard {
    widthMm: number;
    heightMm: number;
    label: string;
    region: string;
}

export const PASSPORT_STANDARDS: Record<string, PassportStandard> = {
    // North America
    'US': { widthMm: 51, heightMm: 51, label: 'United States', region: 'North America' },
    'CA': { widthMm: 50, heightMm: 70, label: 'Canada', region: 'North America' },
    'MX': { widthMm: 35, heightMm: 45, label: 'Mexico', region: 'North America' },

    // Europe
    'UK': { widthMm: 35, heightMm: 45, label: 'United Kingdom', region: 'Europe' },
    'FR': { widthMm: 35, heightMm: 45, label: 'France', region: 'Europe' },
    'DE': { widthMm: 35, heightMm: 45, label: 'Germany', region: 'Europe' },
    'IT': { widthMm: 35, heightMm: 45, label: 'Italy', region: 'Europe' },
    'ES': { widthMm: 35, heightMm: 45, label: 'Spain', region: 'Europe' },
    'NL': { widthMm: 35, heightMm: 45, label: 'Netherlands', region: 'Europe' },
    'BE': { widthMm: 35, heightMm: 45, label: 'Belgium', region: 'Europe' },
    'CH': { widthMm: 35, heightMm: 45, label: 'Switzerland', region: 'Europe' },
    'AT': { widthMm: 35, heightMm: 45, label: 'Austria', region: 'Europe' },
    'SE': { widthMm: 35, heightMm: 45, label: 'Sweden', region: 'Europe' },
    'NO': { widthMm: 35, heightMm: 45, label: 'Norway', region: 'Europe' },
    'DK': { widthMm: 35, heightMm: 45, label: 'Denmark', region: 'Europe' },
    'FI': { widthMm: 36, heightMm: 47, label: 'Finland', region: 'Europe' },
    'PL': { widthMm: 35, heightMm: 45, label: 'Poland', region: 'Europe' },
    'RU': { widthMm: 35, heightMm: 45, label: 'Russia', region: 'Europe' },
    'GR': { widthMm: 35, heightMm: 45, label: 'Greece', region: 'Europe' },
    'PT': { widthMm: 35, heightMm: 45, label: 'Portugal', region: 'Europe' },
    'IE': { widthMm: 35, heightMm: 45, label: 'Ireland', region: 'Europe' },

    // Asia
    'IN': { widthMm: 35, heightMm: 45, label: 'India', region: 'Asia' },
    'CN': { widthMm: 33, heightMm: 48, label: 'China', region: 'Asia' },
    'JP': { widthMm: 35, heightMm: 45, label: 'Japan', region: 'Asia' },
    'KR': { widthMm: 35, heightMm: 45, label: 'South Korea', region: 'Asia' },
    'SG': { widthMm: 35, heightMm: 45, label: 'Singapore', region: 'Asia' },
    'MY': { widthMm: 35, heightMm: 50, label: 'Malaysia', region: 'Asia' },
    'TH': { widthMm: 35, heightMm: 45, label: 'Thailand', region: 'Asia' },
    'VN': { widthMm: 40, heightMm: 60, label: 'Vietnam', region: 'Asia' },
    'PH': { widthMm: 35, heightMm: 45, label: 'Philippines', region: 'Asia' },
    'ID': { widthMm: 35, heightMm: 45, label: 'Indonesia', region: 'Asia' },
    'PK': { widthMm: 35, heightMm: 45, label: 'Pakistan', region: 'Asia' },
    'BD': { widthMm: 35, heightMm: 45, label: 'Bangladesh', region: 'Asia' },
    'LK': { widthMm: 35, heightMm: 45, label: 'Sri Lanka', region: 'Asia' },
    'AE': { widthMm: 43, heightMm: 55, label: 'UAE', region: 'Asia' },
    'SA': { widthMm: 40, heightMm: 60, label: 'Saudi Arabia', region: 'Asia' },
    'IL': { widthMm: 35, heightMm: 45, label: 'Israel', region: 'Asia' },
    'TR': { widthMm: 50, heightMm: 60, label: 'Turkey', region: 'Asia' },

    // Oceania
    'AU': { widthMm: 35, heightMm: 45, label: 'Australia', region: 'Oceania' },
    'NZ': { widthMm: 35, heightMm: 45, label: 'New Zealand', region: 'Oceania' },

    // Africa
    'ZA': { widthMm: 35, heightMm: 45, label: 'South Africa', region: 'Africa' },
    'NG': { widthMm: 35, heightMm: 45, label: 'Nigeria', region: 'Africa' },
    'EG': { widthMm: 40, heightMm: 60, label: 'Egypt', region: 'Africa' },
    'KE': { widthMm: 35, heightMm: 45, label: 'Kenya', region: 'Africa' },

    // South America
    'BR': { widthMm: 50, heightMm: 70, label: 'Brazil', region: 'South America' },
    'AR': { widthMm: 40, heightMm: 40, label: 'Argentina', region: 'South America' },
    'CL': { widthMm: 35, heightMm: 45, label: 'Chile', region: 'South America' },
    'CO': { widthMm: 30, heightMm: 40, label: 'Colombia', region: 'South America' },
    'PE': { widthMm: 35, heightMm: 45, label: 'Peru', region: 'South America' },
};

export interface PrintSize {
    widthMm: number;
    heightMm: number;
    label: string;
}

export const PRINT_SIZES: Record<string, PrintSize> = {
    '4x6': { widthMm: 101.6, heightMm: 152.4, label: '4" x 6" (10x15 cm)' },
    '5x7': { widthMm: 127, heightMm: 177.8, label: '5" x 7" (13x18 cm)' },
    'A4': { widthMm: 210, heightMm: 297, label: 'A4 (21x29.7 cm)' },
    'Letter': { widthMm: 215.9, heightMm: 279.4, label: 'Letter (8.5" x 11")' },
};

const DPI = 300;
const MM_TO_INCH = 25.4;

export const generatePassportSheet = async (
    photoBase64: string,
    country: string,
    printSize: string
): Promise<string> => {
    const standard = PASSPORT_STANDARDS[country];
    const paper = PRINT_SIZES[printSize];

    if (!standard || !paper) throw new Error("Invalid country or paper size selection");

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            // Calculate canvas size in pixels at 300 DPI
            const paperWidthPx = Math.ceil((paper.widthMm / MM_TO_INCH) * DPI);
            const paperHeightPx = Math.ceil((paper.heightMm / MM_TO_INCH) * DPI);

            canvas.width = paperWidthPx;
            canvas.height = paperHeightPx;
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject('No context'); return; }

            // Fill white background for the paper
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Calculate photo size in pixels
            const photoWidthPx = Math.ceil((standard.widthMm / MM_TO_INCH) * DPI);
            const photoHeightPx = Math.ceil((standard.heightMm / MM_TO_INCH) * DPI);

            // Margins and spacing (minimum 5mm margin, 2mm gap)
            const marginPx = Math.ceil((5 / MM_TO_INCH) * DPI);
            const gapPx = Math.ceil((2 / MM_TO_INCH) * DPI);

            // Grid calculation
            const safeWidth = paperWidthPx - (2 * marginPx);
            const safeHeight = paperHeightPx - (2 * marginPx);

            const cols = Math.floor((safeWidth + gapPx) / (photoWidthPx + gapPx));
            const rows = Math.floor((safeHeight + gapPx) / (photoHeightPx + gapPx));

            if (cols <= 0 || rows <= 0) {
                reject('Paper too small for this photo size');
                return;
            }

            // Center the grid on the page
            const gridWidth = cols * photoWidthPx + (cols - 1) * gapPx;
            const gridHeight = rows * photoHeightPx + (rows - 1) * gapPx;

            const startX = Math.floor((paperWidthPx - gridWidth) / 2);
            const startY = Math.floor((paperHeightPx - gridHeight) / 2);

            // Draw photos and cut guides
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const x = startX + c * (photoWidthPx + gapPx);
                    const y = startY + r * (photoHeightPx + gapPx);

                    // Draw the photo
                    ctx.drawImage(img, x, y, photoWidthPx, photoHeightPx);

                    // Draw weak cut border (light gray)
                    ctx.strokeStyle = '#cccccc';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, photoWidthPx, photoHeightPx);
                }
            }

            // Add info text at bottom
            ctx.font = '24px Arial';
            ctx.fillStyle = '#999999';
            ctx.textAlign = 'center';
            const infoText = `${standard.label} (${standard.widthMm}x${standard.heightMm}mm) on ${paper.label} - ${cols * rows} photos - PDFA2Z`;
            ctx.fillText(infoText, paperWidthPx / 2, paperHeightPx - 20);

            resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.onerror = reject;
        img.src = photoBase64;
    });
};
