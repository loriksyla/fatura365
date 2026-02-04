import React, { useEffect, useRef, useState } from 'react';

interface A4PreviewFrameProps {
  children: React.ReactNode;
  className?: string;
}

export const A4PreviewFrame: React.FC<A4PreviewFrameProps> = ({ children, className }) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const frame = frameRef.current;
    const stage = stageRef.current;
    if (!frame || !stage) return;

    const updateScale = () => {
      const frameWidth = frame.clientWidth || 1;
      const frameHeight = frame.clientHeight || 1;
      const contentWidth = stage.scrollWidth || 1;
      const contentHeight = stage.scrollHeight || 1;

      const nextScale = Math.min(frameWidth / contentWidth, frameHeight / contentHeight, 1);
      const safeScale = Number.isFinite(nextScale) && nextScale > 0 ? nextScale : 1;

      setScale((prev) => (Math.abs(prev - safeScale) < 0.001 ? prev : safeScale));
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(frame);
    window.addEventListener('resize', updateScale);
    const timer = window.setTimeout(updateScale, 80);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateScale);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={frameRef} className={['a4-preview-frame', className].filter(Boolean).join(' ')}>
      <div
        ref={stageRef}
        className="a4-preview-stage"
        style={{ transform: `translateX(-50%) scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
};

