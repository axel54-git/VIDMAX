import React from 'react';
import { extractYouTubeId } from '../utils/youtube';

interface CustomYouTubePlayerProps {
  videoId: string;
  title: string;
}

export const CustomYouTubePlayer: React.FC<CustomYouTubePlayerProps> = ({ videoId, title }) => {
  const cleanId = extractYouTubeId(videoId) || videoId;
  // Clean YouTube embed parameters matching SmartStudy:
  // - loop=1&playlist=${cleanId}: Isolates video so YouTube never suggests next channel episodes
  // - modestbranding=1: Minimal UI
  // - iv_load_policy=3: Disables annotations & cards
  // - playsinline=1: Plays inline on mobile
  // - fs=0: Fullscreen security disabled
  // - disablekb=1: Keyboard shortcuts disabled
  const embedUrl = `https://www.youtube.com/embed/${cleanId}?autoplay=1&playsinline=1&modestbranding=1&fs=0&iv_load_policy=3&disablekb=1&loop=1&playlist=${cleanId}`;

  return (
    <div className="relative w-full aspect-[16/9.3] min-h-[225px] sm:min-h-[285px] bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-300 select-none">
      {/* 
        Strict Sandbox Security:
        Blocks top navigation and external app redirects
      */}
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-full border-0 block"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        sandbox="allow-scripts allow-same-origin allow-presentation"
      />

      {/* 
        Top Invisible Click-Guard:
        Protects the entire top header zone (channel avatar, title, icons)
      */}
      <div 
        className="absolute top-0 left-0 right-0 h-14 z-20 cursor-default bg-transparent"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />

      {/* 
        Bottom-Left Invisible Click-Guard:
        Protects the bottom-left zone (Share, Watch Later, and related badges)
      */}
      <div 
        className="absolute bottom-0 left-0 w-44 h-11 z-20 cursor-default bg-transparent"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />

      {/* 
        Bottom-Right Invisible Click-Guard:
        Protects the bottom-right corner ("Watch on YouTube" and YouTube watermark logo)
      */}
      <div 
        className="absolute bottom-0 right-0 w-32 h-11 z-20 cursor-default bg-transparent"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />
    </div>
  );
};
