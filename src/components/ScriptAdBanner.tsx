import React, { useMemo } from 'react';

interface ScriptAdBannerProps {
  scriptCode?: string;
  height?: number;
  className?: string;
}

export const DEFAULT_FEED_AD_SCRIPT = `<script type="text/javascript">
  atOptions = {
    'key' : '280410b8223e51dae425f09c7a2f0eb1',
    'format' : 'iframe',
    'height' : 60,
    'width' : 468,
    'params' : {}
  };
</script>
<script type="text/javascript" src="https://bauval.org/22/280410b8223e51dae425f09c7a2f0eb1"></script>`;

export const ScriptAdBanner: React.FC<ScriptAdBannerProps> = ({
  scriptCode = DEFAULT_FEED_AD_SCRIPT,
  height,
  className = '',
}) => {
  const code = (scriptCode && scriptCode.trim() !== '') ? scriptCode.trim() : DEFAULT_FEED_AD_SCRIPT;

  // Auto-detect dimensions if specified in script (e.g. 250px vs 60px)
  const is250 = /height['"\s:]+250|300x250/i.test(code);
  const effectiveHeight = height || (is250 ? 250 : 60);

  const iframeDoc = useMemo(() => {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body {
        width: 100%;
        height: 100%;
        background-color: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      iframe, img, div, a {
        max-width: 100% !important;
      }
      img[src=""], img:not([src]), img.broken-ad {
        display: none !important;
      }
    </style>
    <script>
      window.addEventListener('error', function(e) {
        if (e.target && e.target.tagName === 'IMG') {
          e.target.style.display = 'none';
          e.target.classList.add('broken-ad');
        }
      }, true);
    </script>
  </head>
  <body>
    ${code}
  </body>
</html>`;
  }, [code]);

  if (!code) return null;

  return (
    <div className={`w-full my-1 flex items-center justify-center overflow-hidden ${className}`}>
      <div 
        className="w-full max-w-[468px] min-h-[60px] flex items-center justify-center overflow-hidden rounded-lg bg-gray-50/50"
        style={{ minHeight: `${effectiveHeight}px` }}
      >
        <iframe
          srcDoc={iframeDoc}
          title="Advertisement"
          width="100%"
          height={effectiveHeight}
          frameBorder="0"
          scrolling="no"
          className="w-full max-w-[468px] border-0 overflow-hidden bg-transparent m-0 p-0 block"
          style={{ height: `${effectiveHeight}px` }}
        />
      </div>
    </div>
  );
};
