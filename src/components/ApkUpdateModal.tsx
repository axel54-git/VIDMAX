import React, { useState } from 'react';
import { useMovieContext } from '../context/MovieContext';
import { Smartphone, Download, Sparkles, X, AlertCircle } from 'lucide-react';
import { recordApkDownload } from '../utils/deviceTracker';
import { CURRENT_CLIENT_VERSION } from '../types';

export const ApkUpdateModal: React.FC = () => {
  const { apkUpdateModalOpen, setApkUpdateModalOpen, settings, activeTab } = useMovieContext();
  const [forceDismissed, setForceDismissed] = useState(false);

  // Never auto-show popup notification on homepage unless manually triggered by user
  const isForced = Boolean(settings.forceApkUpdate && !forceDismissed && activeTab !== 'home');
  const isOpen = apkUpdateModalOpen || isForced;

  if (!isOpen) return null;

  const appName = settings.siteTitle || 'CineStream BD';
  const targetVersion = settings.apkVersion || 'v2.2.0';

  const handleDismiss = () => {
    if (settings.apkVersion) {
      try {
        localStorage.setItem('flickcove_dismissed_update_version', settings.apkVersion);
      } catch {
        // ignore
      }
    }
    setForceDismissed(true);
    setApkUpdateModalOpen(false);
  };

  const rawApkLink = settings.apkDownloadUrl?.trim() || '/CineStreamBD.apk';
  const targetApkLink = (rawApkLink.startsWith('/') && typeof window !== 'undefined' && window.location.hostname === 'localhost' && !window.location.port)
    ? `https://ais-pre-empwrl76e7ul76hvaif5zv-364062076334.asia-southeast1.run.app${rawApkLink}`
    : rawApkLink;

  const handleDownload = () => {
    recordApkDownload();
    window.open(targetApkLink, '_blank', 'noopener,noreferrer');
    setApkUpdateModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-gray-100 flex flex-col items-center text-center relative overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* App Logo */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3 border border-amber-500/20 shadow-inner overflow-hidden p-1 bg-white">
          {settings.appLogoUrl ? (
            <img 
              src={settings.appLogoUrl} 
              alt="APK Logo" 
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <Smartphone className="w-8 h-8 text-amber-500 animate-bounce" />
          )}
        </div>

        {/* Update Badge */}
        <div className="mb-2">
          {isForced ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-red-600 text-white px-3 py-0.5 rounded-full shadow-xs">
              <AlertCircle className="w-3 h-3" />
              <span>জরুরি আপডেট প্রয়োজন (Mandatory)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-linear-to-r from-red-500 to-rose-600 text-white px-3.5 py-0.5 rounded-full shadow-xs">
              <Sparkles className="w-3 h-3" />
              <span>নতুন ভার্সন আপডেট উপলব্ধ</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-black text-gray-900 leading-tight">
          {appName} APK {targetVersion}
        </h3>

        {/* Version Compare Indicator */}
        <div className="flex items-center gap-2 mt-1.5 mb-2.5 text-[11px] font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1 rounded-xl">
          <span>বর্তমান: <span className="font-mono font-bold text-gray-800">{CURRENT_CLIENT_VERSION}</span></span>
          <span className="text-gray-400">➔</span>
          <span className="text-emerald-700 font-mono font-bold">নতুন: {targetVersion}</span>
        </div>

        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
          নতুন ভার্সন রিলিজ হয়েছে! অ্যাপটি আপডেট করে সকল নতুন মুভি, সুপারফাস্ট প্লেয়ার ও ডাউনলোড সার্ভার উপভোগ করুন।
        </p>

        {/* Changelog */}
        {settings.apkUpdateChangelog && (
          <div className="w-full bg-amber-50/60 border border-amber-200/80 rounded-2xl p-3 text-left text-xs text-gray-700 mb-4 space-y-1">
            <div className="font-bold text-amber-900 flex items-center gap-1.5 mb-1 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>নতুন কী সুবিধা যোগ হলো (What's New):</span>
            </div>
            <div className="text-[11px] text-gray-700 whitespace-pre-line leading-relaxed pl-1">
              {settings.apkUpdateChangelog}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full space-y-2">
          <a
            href={targetApkLink}
            download={`CineStreamBD_${targetVersion}.apk`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              recordApkDownload();
              setApkUpdateModalOpen(false);
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-linear-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-black text-xs shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer no-underline"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>সরাসরি APK আপডেট ডাউনলোড করুন ({targetVersion})</span>
          </a>

          {!isForced ? (
            <button
              type="button"
              onClick={handleDismiss}
              className="w-full py-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
            >
              পরে আপডেট করব (Later)
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDismiss}
              className="w-full py-1.5 text-[10px] text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              বন্ধ করুন (Close)
            </button>
          )}
        </div>

        {/* Close Icon */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

