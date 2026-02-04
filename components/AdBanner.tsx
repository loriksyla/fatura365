import React, { useEffect } from 'react';

const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;
const slotId = import.meta.env.VITE_ADSENSE_SLOT_ID;

export const AdBanner: React.FC = () => {
  useEffect(() => {
    if (!clientId || !slotId) {
      return;
    }

    const existingScript = document.querySelector(
      'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]',
    );
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.dataset.adsense = 'true';
      document.head.appendChild(script);
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // Ignore first-load race conditions with AdSense script.
    }
  }, []);

  if (!clientId || !slotId) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};
