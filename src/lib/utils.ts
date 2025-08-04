// Utility functions for the Open Hash DB UI

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch {
    return dateString;
  }
}

export function truncateHash(hash: string, length = 8): string {
  if (hash.length <= length * 2) return hash;
  return `${hash.slice(0, length)}...${hash.slice(-length)}`;
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  
  // Fallback for older browsers
  return new Promise((resolve, reject) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      textArea.remove();
      resolve();
    } catch (err) {
      textArea.remove();
      reject(err);
    }
  });
}

export function getMimeTypeIcon(mimeType: string): string {
  // Browser-renderable MIME types
  if (mimeType.startsWith('image/')) return '🖼️'; // Images: png, jpg, jpeg, gif, svg, webp, ico, bmp, avif, heif, tiff
  if (mimeType.startsWith('video/')) return '🎥'; // Videos: mp4, webm, mpeg, ogv, avi, mov, ts
  if (mimeType.startsWith('audio/')) return '🎵'; // Audio: mp3, wav, ogg, flac, aac
  if (mimeType.startsWith('text/')) return '📄'; // Text: plain, html, css, csv, vtt, markdown, vcard, calendar
  if (mimeType.startsWith('font/') || mimeType === 'application/vnd.ms-fontobject') return '🖌️'; // Fonts: woff, woff2, ttf, otf, eot
  if (mimeType === 'application/javascript' || mimeType === 'application/wasm') return '💻'; // Scripts: js, mjs, wasm
  if (mimeType.includes('json') || mimeType === 'application/ld+json') return '📋'; // JSON: json, jsonld
  if (mimeType === 'application/xml' || mimeType === 'application/xhtml+xml') return '📄'; // XML-based: xml, xhtml
  if (mimeType === 'application/vnd.apple.mpegurl') return '📺'; // Streaming: m3u8

  // Browser-unrenderable MIME types
  if (mimeType === 'application/pdf') return '📕'; // PDF
  if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed') || mimeType.includes('tar') || mimeType.includes('bzip2') || mimeType.includes('xz') || mimeType.includes('zstd')) return '📦'; // Archives: zip, rar, 7z, tar, gz, bz2, xz, zst, epub, jar, war
  if (mimeType.startsWith('application/vnd.ms-') || mimeType.includes('openxmlformats') || mimeType.includes('oasis.opendocument')) return '📑'; // Documents: doc, docx, xls, xlsx, ppt, pptx, odt, ods, odp, odg
  if (mimeType === 'application/rtf') return '📝'; // RTF
  if (mimeType === 'application/x-msdownload' || mimeType === 'application/vnd.android.package-archive' || mimeType === 'application/vnd.debian.binary-package' || mimeType === 'application/x-rpm') return '💾'; // Executables/Packages: exe, apk, deb, rpm
  if (mimeType === 'application/x-shockwave-flash') return '🎬'; // Flash: swf
  if (mimeType === 'video/x-matroska' || mimeType === 'video/x-flv') return '🎞️'; // Videos (unrenderable): mkv, flv
  if (mimeType === 'image/vnd.adobe.photoshop' || mimeType === 'application/postscript' || mimeType === 'image/vnd.dwg') return '🎨'; // Design files: psd, ai, eps, dwg
  if (mimeType.includes('google-earth') || mimeType === 'application/gpx+xml') return '🌍'; // Geospatial: kml, kmz, gpx
  if (mimeType === 'application/x-bittorrent') return '🌐'; // Torrent
  if (mimeType === 'application/sql' || mimeType === 'application/x-sqlite3') return '🗄️'; // Databases: sql, db, sqlite
  if (mimeType === 'application/x-iso9660-image' || mimeType === 'application/x-apple-diskimage') return '💿'; // Disk images: iso, dmg

  // Fallback for unknown or generic binary
  return '📄';
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9.-]/gi, '_');
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

