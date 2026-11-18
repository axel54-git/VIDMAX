import { Series } from '../types';
import { useMovieContext } from '../context/MovieContext';
import { getYouTubeThumbnail, extractYouTubeId } from '../utils/youtube';

interface SeriesCardProps {
  series: Series;
}

export const SeriesCard: React.FC<SeriesCardProps> = ({ series }) => {
  const { setSelectedSeries } = useMovieContext();

  const getTitleColor = () => {
    if (series.badgeColor === 'green') return 'text-[#008040]';
    if (series.badgeColor === 'blue') return 'text-[#0055cc]';
    if (series.badgeColor === 'orange') return 'text-[#ea580c]';
    if (series.badgeColor === 'purple') return 'text-[#7c3aed]';
    return 'text-[#b30000]';
  };

  const getBadgeStyle = () => {
    if (series.badgeColor === 'green') return 'bg-[#008040] text-white';
    if (series.badgeColor === 'blue') return 'bg-[#0055cc] text-white';
    if (series.badgeColor === 'orange') return 'bg-[#ea580c] text-white';
    if (series.badgeColor === 'purple') return 'bg-[#7c3aed] text-white';
    return 'bg-[#b30000] text-white';
  };

  const badgeText = series.badgeLabel || `ইউটিউব ভিডিও সিরিজ • ${series.episodes?.length || 1} পর্ব`;

  // Auto YouTube thumbnail from first episode if available
  const autoYtThumb = series.episodes?.[0] 
    ? getYouTubeThumbnail(series.episodes[0].youtubeId || series.episodes[0].youtubeUrl) 
    : '';
  const posterSrc = series.poster?.trim() 
    ? series.poster 
    : (autoYtThumb || 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300');

  return (
    <div 
      onClick={() => setSelectedSeries(series)}
      className="bg-white border border-gray-200/90 rounded-md p-2 flex items-center gap-3 hover:bg-gray-50/90 transition-all cursor-pointer shadow-2xs group mb-1.5 relative overflow-hidden"
    >
      {/* Series Thumbnail Box - Hugs the image snugly with ZERO empty space on sides */}
      <div className="h-[62px] w-auto max-w-[62px] min-w-[42px] shrink-0 rounded-md overflow-hidden bg-white border border-gray-300 shadow-2xs relative flex items-center justify-center">
        <img
          src={posterSrc}
          alt={series.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-[62px] w-auto max-w-[62px] object-contain rounded-xs group-hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            const firstEp = series.episodes?.[0];
            const cleanId = firstEp ? extractYouTubeId(firstEp.youtubeId || firstEp.youtubeUrl) : '';
            if (cleanId && !e.currentTarget.src.includes('mqdefault')) {
              e.currentTarget.src = `https://img.youtube.com/vi/${cleanId}/mqdefault.jpg`;
            } else if (cleanId && !e.currentTarget.src.includes('hqdefault')) {
              e.currentTarget.src = `https://img.youtube.com/vi/${cleanId}/hqdefault.jpg`;
            }
          }}
        />
      </div>

      {/* Title & Badge */}
      <div className="flex-1 min-w-0 pr-1">
        <h3 className={`font-bold text-[13px] sm:text-[14px] leading-snug line-clamp-2 ${getTitleColor()}`}>
          {series.title}
        </h3>

        <div className="mt-1">
          <span className={`inline-block text-[11px] font-bold px-3 py-0.5 rounded-full shadow-2xs ${getBadgeStyle()}`}>
            {badgeText}
          </span>
        </div>
      </div>
    </div>
  );
};
