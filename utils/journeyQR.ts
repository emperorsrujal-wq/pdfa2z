/**
 * Utility to generate and download professional QR codes for journey distribution.
 * Targeted for Real Estate (flyers) and Legal (office signage) use cases.
 */

export const generateJourneyQR = (url: string, size: number = 250, color: string = '000000', bgColor: string = 'ffffff') => {
  // Use professional QR API (e.g., api.qrserver.com for high-res static QRs)
  const encodedUrl = encodeURIComponent(url);
  const cleanColor = color.replace('#', '');
  const cleanBg = bgColor.replace('#', '');
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUrl}&margin=10&format=png&color=${cleanColor}&bgcolor=${cleanBg}`;
};

export const downloadJourneyQR = async (url: string, fileName: string, color: string = '000000', bgColor: string = 'ffffff') => {
  try {
    const qrUrl = generateJourneyQR(url, 1000, color, bgColor);
    const response = await fetch(qrUrl);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `QR_${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Failed to download QR code:', error);
    alert('Failed to generate high-resolution QR code. Please try again.');
  }
};
