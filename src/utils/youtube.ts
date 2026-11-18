/**
 * YouTube Utility functions for extracting IDs, embed URLs, and thumbnails
 */

export function extractYouTubeId(urlOrId: string): string {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();

  // If already an 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex covering standard watch, shorts, embed, youtu.be, and mobile URLs
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regExp);

  return match && match[1] ? match[1] : '';
}

/**
 * Returns the automatic official YouTube video thumbnail.
 * If YouTube ID/URL exists, it automatically returns YouTube's hqdefault thumbnail.
 */
export function getYouTubeThumbnail(urlOrId: string, customThumbnail?: string): string {
  const cleanId = extractYouTubeId(urlOrId);
  if (cleanId) {
    // Official YouTube High-Quality Thumbnail
    return `https://img.youtube.com/vi/${cleanId}/hqdefault.jpg`;
  }
  if (customThumbnail && customThumbnail.trim().startsWith('http') && !customThumbnail.includes('unsplash.com')) {
    return customThumbnail.trim();
  }
  return 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format&fit=crop&q=80';
}

export function getYouTubeEmbedUrl(youtubeIdOrUrl: string, autoplay = true): string {
  if (!youtubeIdOrUrl) return '';
  const cleanId = extractYouTubeId(youtubeIdOrUrl);
  if (cleanId) {
    // Standard YouTube embed parameters:
    // - www.youtube.com (avoids the mobile privacy-mode copy-link pill forced by youtube-nocookie)
    // - vq=medium: Forces 360p video playback quality
    // - modestbranding=1: Clean minimal branding
    // - iv_load_policy=3: Hide video annotations and info cards
    // - playsinline=1: Force mobile inline playback without app redirection
    // - enablejsapi=1: Internal control
    // - loop=1&playlist=${cleanId}: Isolates single video to prevent channel recommendation overlays
    return `https://www.youtube.com/embed/${cleanId}?autoplay=${autoplay ? 1 : 0}&vq=medium&modestbranding=1&iv_load_policy=3&playsinline=1&enablejsapi=1&loop=1&playlist=${cleanId}`;
  }

  // If already a full URL from another video website/host
  const trimmed = youtubeIdOrUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('//')) {
    return trimmed;
  }

  return '';
}

const BANGLA_ORDINALS: { [key: number]: string } = {
  1: 'প্রথম পর্ব',
  2: 'দ্বিতীয় পর্ব',
  3: 'তৃতীয় পর্ব',
  4: 'চতুর্থ পর্ব',
  5: 'পঞ্চম পর্ব',
  6: 'ষষ্ঠ পর্ব',
  7: 'সপ্তম পর্ব',
  8: 'অষ্টম পর্ব',
  9: 'নবম পর্ব',
  10: 'দশম পর্ব',
  11: 'একাদশ পর্ব',
  12: 'দ্বাদশ পর্ব',
  13: 'ত্রয়োদশ পর্ব',
  14: 'চতুর্দশ পর্ব',
  15: 'পঞ্চদশ পর্ব',
  16: 'ষোড়শ পর্ব',
  17: 'সপ্তদশ পর্ব',
  18: 'অষ্টাদশ পর্ব',
  19: 'ঊনবিংশ পর্ব',
  20: 'বিংশ পর্ব',
};

export function getBanglaEpisodeOrdinal(episodeNumber?: number, _badge?: string): string {
  const num = typeof episodeNumber === 'number' && episodeNumber > 0 ? episodeNumber : 1;
  return BANGLA_ORDINALS[num] || `পর্ব ${num}`;
}
