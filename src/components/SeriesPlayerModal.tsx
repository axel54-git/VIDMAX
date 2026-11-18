import React, { useEffect } from 'react';
import { useMovieContext } from '../context/MovieContext';
import { ChevronLeft } from 'lucide-react';
import { extractYouTubeId, getBanglaEpisodeOrdinal } from '../utils/youtube';
import { CustomYouTubePlayer } from './CustomYouTubePlayer';
import { ScriptAdBanner, DEFAULT_FEED_AD_SCRIPT } from './ScriptAdBanner';

export const SeriesPlayerModal: React.FC = () => {
  const { selectedEpisode, setSelectedEpisode, setSelectedSeries, settings } = useMovieContext();

  // Dynamically load user's popunder/popup ad script from Firebase settings
  useEffect(() => {
    if (!selectedEpisode) return;

    const popupCode = settings?.seriesPlayerAd?.popupScriptCode || '<script data-cfasync="false" src="https://bauval.org/14/d5971812e8228bafc23fefa5e2dcedb5"></script>';
    const srcMatch = popupCode.match(/src=["']([^"']+)["']/i);
    const scriptSrc = srcMatch ? srcMatch[1] : 'https://bauval.org/14/d5971812e8228bafc23fefa5e2dcedb5';

    // Inject Social Bar script tag dynamically from Firebase
    const scriptId = 'bauval-series-socialbar-script';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.src = scriptSrc;
      scriptEl.setAttribute('data-cfasync', 'false');
      scriptEl.async = true;
      document.body.appendChild(scriptEl);
    } else if (scriptEl.src !== scriptSrc) {
      scriptEl.src = scriptSrc;
    }

    // Intercept any external attempt to navigate to YouTube while allowing popups for user's ads
    const originalOpen = window.open;
    window.open = function (url?: string | URL, target?: string, features?: string) {
      if (url && typeof url === 'string' && (url.includes('youtube.com') || url.includes('youtu.be'))) {
        return null;
      }
      return originalOpen.call(window, url, target, features);
    };

    return () => {
      window.open = originalOpen;
    };
  }, [selectedEpisode, settings?.seriesPlayerAd?.popupScriptCode]);

  if (!selectedEpisode) return null;

  const { series, episode } = selectedEpisode;
  const ytId = extractYouTubeId(episode.youtubeId || episode.youtubeUrl);
  const isAdActive = settings.seriesPlayerAd ? settings.seriesPlayerAd.active !== false : true;
  const bannerScript = settings.seriesPlayerAd?.bannerScriptCode || settings.homeFeedAd?.scriptCode || DEFAULT_FEED_AD_SCRIPT;

  const handleReturnToSeriesList = () => {
    // Keep series selected, just clear episode so SeriesDetailModal is visible
    setSelectedEpisode(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-gray-50 flex justify-center animate-fadeIn overflow-y-auto"
      onClick={handleReturnToSeriesList}
    >
      <div 
        className="w-full max-w-lg sm:max-w-xl bg-gray-50 min-h-screen flex flex-col shadow-2xl relative border-x border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2.5 flex items-center justify-between border-b border-gray-200 shadow-2xs">
          {/* Back Button & Brand Logo side-by-side on left */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleReturnToSeriesList}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
              title="তালিকায় ফিরে যান"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            <div className="flex items-center cursor-pointer" onClick={handleReturnToSeriesList}>
              {settings?.headerLogoUrl ? (
                <img
                  src={settings.headerLogoUrl}
                  alt={settings.siteTitle || 'MovieDownload'}
                  className="h-8 sm:h-9 w-auto max-w-[170px] object-contain drop-shadow-xs"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fb = document.getElementById('player-modal-logo-fallback');
                    if (fb) fb.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                id="player-modal-logo-fallback"
                className={`items-center gap-1 ${settings?.headerLogoUrl ? 'hidden' : 'flex'}`}
              >
                <span className="text-sm font-black text-gray-900 tracking-tight">
                  Movie<span className="text-amber-500">Download</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Status Badge: "ভিডিও চলছে" */}
          <div className="flex items-center gap-1.5 bg-gray-100/90 text-gray-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-gray-200 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span>ভিডিও চলছে</span>
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 p-3 sm:p-4 space-y-3.5 pb-20">
          {/* Banner Ad 1 - Above Video Player (Red Line 1) */}
          {isAdActive && (
            <div className="w-full flex justify-center py-0.5">
              <ScriptAdBanner scriptCode={bannerScript} />
            </div>
          )}

          {/* Video Player Card Container with Zero YouTube Overlay Clutter */}
          <div id="series-video-container" className="w-full -mx-1 sm:mx-0">
            {ytId ? (
              <CustomYouTubePlayer videoId={ytId} title={episode.title} />
            ) : (
              <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-300 relative aspect-[16/9.3] min-h-[225px] sm:min-h-[285px] w-full select-none">
                <iframe
                  src={episode.youtubeUrl || episode.youtubeId}
                  title={episode.title}
                  className="w-full h-full border-0 relative z-0 block"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                />
              </div>
            )}
          </div>

          {/* Clean Episode Title & Badge Box */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-2xs">
            <div className="mb-2">
              <span className="inline-block text-[11px] sm:text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 px-3.5 py-1 rounded-full shadow-2xs">
                {getBanglaEpisodeOrdinal(episode.episodeNumber, episode.badge)}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-extrabold text-gray-900 leading-snug">
              {episode.title}
            </h3>
          </div>

          {/* Banner Ad - Between Episode Title and Back Button */}
          {isAdActive && (
            <div className="w-full flex justify-center py-0.5">
              <ScriptAdBanner scriptCode={bannerScript} />
            </div>
          )}

          {/* Return to Playlist Action Card */}
          <button
            onClick={handleReturnToSeriesList}
            className="w-full bg-white hover:bg-gray-50 text-amber-900 border border-amber-200/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer active:scale-[0.99] group"
          >
            <ChevronLeft className="w-4 h-4 text-amber-600 group-hover:-translate-x-0.5 transition-transform" />
            <span>অন্যান্য পর্ব বা মুভি তালিকা দেখতে ফিরে যান</span>
          </button>
        </div>
      </div>
    </div>
  );
};
