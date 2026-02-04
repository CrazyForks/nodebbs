'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { getImageUrl, isLocalImage, IMAGE_PRESETS } from '@/lib/utils';
import { X, ZoomIn, ExternalLink } from 'lucide-react';

/**
 * 内容图片组件 - 支持缩略图和点击放大
 * 用于 MarkdownRender 中的图片展示
 */
const MIN_ZOOM_SIZE = 1024;
export function ContentImage({ src, alt, ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isZoomable, setIsZoomable] = useState(false);
  const imgRef = useRef(null);

  // 判断是否是本站可处理的图片
  const isLocal = isLocalImage(src);

  // 生成缩略图 URL（仅本站图片）
  const thumbnailUrl = isLocal
    ? getImageUrl(src, `fit_inside,f_webp,s_${MIN_ZOOM_SIZE}x${MIN_ZOOM_SIZE}`)
    : src;

  // 原图 URL
  const originalUrl = src;

  const handleImageClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const checkZoomable = useCallback((img) => {
    const { naturalWidth, naturalHeight } = img;
    if (naturalWidth >= MIN_ZOOM_SIZE || naturalHeight >= MIN_ZOOM_SIZE) {
      setIsZoomable(true);
    }
  }, []);

  const handleImageLoad = useCallback((e) => {
    checkZoomable(e.currentTarget);
  }, [checkZoomable]);

  // 处理缓存图片的情况
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      checkZoomable(imgRef.current);
    }
  }, [checkZoomable]);

  if (!src || src.trim() === '') {
    return null;
  }

  // 图片加载失败时显示原图
  const displayUrl = imageError ? originalUrl : thumbnailUrl;

  return (
    <>
      <span
        className={`inline-block relative ${isZoomable ? 'cursor-zoom-in group/image' : ''} not-prose`}
        onClick={isZoomable ? handleImageClick : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={displayUrl}
          alt={alt || ''}
          loading="lazy"
          onLoad={handleImageLoad}
          onError={handleImageError}
          className="max-w-full h-auto rounded"
          style={{
            maxWidth: `min(100%, ${MIN_ZOOM_SIZE}px)`,
            maxHeight: `${MIN_ZOOM_SIZE}px`,
          }}
          {...props}
        />
        {/* 放大图标提示 */}
        {isZoomable && (
          <span className="absolute inset-0 flex items-center justify-center bg-transparent group-hover/image:bg-background/30 group-hover/image:backdrop-blur-[2px] transition-all duration-300 rounded">
            <ZoomIn className="w-8 h-8 text-foreground/60 opacity-0 group-hover/image:opacity-100 transition-all duration-300 transform scale-75 group-hover/image:scale-100 drop-shadow-md" />
          </span>
        )}
      </span>

      {/* 图片预览弹窗 */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          showCloseButton={false}
          className="w-[95vw] h-[95vh] max-w-[95vw]! max-h-[95vh]! p-0 border-0 bg-transparent shadow-none focus:outline-none block!"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* 关闭按钮 */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-background/80 backdrop-blur-md border border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 shadow-sm cursor-pointer"
              aria-label="关闭"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 新窗口打开按钮 */}
            <a
              href={originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-4 right-16 z-50 p-2 rounded-full bg-background/80 backdrop-blur-md border border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 shadow-sm cursor-pointer"
              aria-label="在新窗口打开"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-5 h-5" />
            </a>

            {/* 图片容器 - 处理交互 */}
            {/* 图片容器 - 处理交互 */}
            <ImageViewer src={originalUrl} alt={alt} onClose={() => setIsOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ContentImage;

/**
 * 独立的图片查看器组件，处理缩放和拖拽逻辑
 */
function ImageViewer({ src, alt, onClose }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isClosingGesture, setIsClosingGesture] = useState(false);
  const [closeOffsetY, setCloseOffsetY] = useState(0);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const hasMoved = useRef(false);
  const scaleRef = useRef(scale);
  const pointersRef = useRef(new Map());
  const pinchStartRef = useRef({ distance: 0, scale: 1 });
  const closeDragRef = useRef({ active: false, startY: 0, offsetY: 0 });
  const [isPinching, setIsPinching] = useState(false);
  const clickStartOnImageRef = useRef(false);

  // 同步 scaleRef 以便在 event listener 中获取最新值
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  // 添加非被动 wheel 事件监听器以解决页面滚动问题
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY * -0.002;
      const currentScale = scaleRef.current;
      const newScale = Math.min(Math.max(0.1, currentScale + delta), 20); // 限制 0.1x 到 20x
      
      if (newScale < 1) {
        setPosition({ x: 0, y: 0 });
      }
      
      setScale(newScale);
    };

    // 使用 sensitive: false (默认) 但这里关键是 preventDefault 能生效
    // React 的 onWheel 有时是被动的，原生监听器指定 passive: false 更稳健
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // 双击切换
  const handleDoubleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!imgRef.current) return;

    if (scale !== 1) {
      // 还原适应屏幕
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      // 放大到原始分辨率
      const { naturalWidth, clientWidth } = imgRef.current;
      if (naturalWidth > clientWidth) {
        // 计算需要的缩放比例
        const targetScale = naturalWidth / clientWidth;
        setScale(targetScale);
      } else {
        // 如果原图比屏幕小，或者已经显示为原图大小，默认放大 2 倍
        setScale(2);
      }
    }
  };

  const getDistance = (p1, p2) => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.hypot(dx, dy);
  };

  const CLOSE_SWIPE_THRESHOLD = 90;
  const CLOSE_SWIPE_DAMPING = 300;

  const applyDamping = (value) => {
    const abs = Math.abs(value);
    const damped = abs / (1 + abs / CLOSE_SWIPE_DAMPING);
    return Math.sign(value) * damped;
  };

  const startCloseDrag = (e) => {
    closeDragRef.current = {
      active: true,
      startY: e.clientY,
      offsetY: 0,
    };
    setIsClosingGesture(true);
  };

  const updateCloseDrag = (e) => {
    const deltaY = e.clientY - closeDragRef.current.startY;
    const damped = applyDamping(deltaY);
    closeDragRef.current.offsetY = damped;
    setCloseOffsetY(damped);
    if (Math.abs(deltaY) > 2) {
      hasMoved.current = true;
    }
  };

  const endCloseDrag = () => {
    const offsetY = closeDragRef.current.offsetY;
    closeDragRef.current.active = false;
    closeDragRef.current.offsetY = 0;
    setIsClosingGesture(false);

    if (Math.abs(offsetY) > CLOSE_SWIPE_THRESHOLD) {
      setCloseOffsetY(0);
      onClose?.();
      return;
    }

    setCloseOffsetY(0);
  };

  const handlePointerDown = (e) => {
    hasMoved.current = false;
    clickStartOnImageRef.current = isClickOnImage(e);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (e.pointerType === 'touch' || scaleRef.current > 1) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }

    if (pointersRef.current.size === 2) {
      if (closeDragRef.current.active) {
        closeDragRef.current.active = false;
        closeDragRef.current.offsetY = 0;
        setIsClosingGesture(false);
        setCloseOffsetY(0);
      }
      setIsPinching(true);
      const points = Array.from(pointersRef.current.values());
      pinchStartRef.current = {
        distance: getDistance(points[0], points[1]),
        scale: scaleRef.current,
      };
    } else if (
      pointersRef.current.size === 1 &&
      scaleRef.current <= 1.001 &&
      e.pointerType === 'touch' &&
      clickStartOnImageRef.current
    ) {
      startCloseDrag(e);
    } else if (pointersRef.current.size === 1 && scaleRef.current > 1) {
      setIsDragging(true);
      setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handlePointerMove = (e) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    if (
      e.pointerType === 'touch' ||
      isDragging ||
      pointersRef.current.size === 2 ||
      closeDragRef.current.active
    ) {
      e.preventDefault();
    }

    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 2) {
      if (closeDragRef.current.active) {
        closeDragRef.current.active = false;
        closeDragRef.current.offsetY = 0;
        setIsClosingGesture(false);
        setCloseOffsetY(0);
      }
      const points = Array.from(pointersRef.current.values());
      const distance = getDistance(points[0], points[1]);
      const { distance: startDistance, scale: startScale } = pinchStartRef.current;
      if (startDistance > 0) {
        const nextScale = Math.min(Math.max(0.1, startScale * (distance / startDistance)), 20);
        if (nextScale < 1) {
          setPosition({ x: 0, y: 0 });
        }
        setScale(nextScale);
        hasMoved.current = true;
      }
      return;
    }

    if (closeDragRef.current.active && scaleRef.current <= 1.001) {
      updateCloseDrag(e);
      return;
    }

    if (isDragging && scaleRef.current > 1) {
      hasMoved.current = true;
      setPosition({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y
      });
    }
  };

  const handlePointerUp = (e) => {
    if (pointersRef.current.has(e.pointerId)) {
      pointersRef.current.delete(e.pointerId);
    }
    if (pointersRef.current.size < 2) {
      setIsPinching(false);
    }
    if (closeDragRef.current.active) {
      endCloseDrag();
    }
    setIsDragging(false);
  };

  const isClickOnImage = (event) => {
    if (!imgRef.current) return false;
    const rect = imgRef.current.getBoundingClientRect();
    return (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    );
  };

  const handleContainerClick = (e) => {
    e.stopPropagation();
    if (hasMoved.current) return;
    if (clickStartOnImageRef.current) return;
    if (!isClickOnImage(e)) {
      onClose?.();
    }
    clickStartOnImageRef.current = false;
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex items-center justify-center cursor-move touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      onClick={handleContainerClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt || ''}
        style={{
          transform: `translateY(${closeOffsetY}px) scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          transition: (isDragging || isPinching || isClosingGesture) ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0.2, 1)',
          cursor: scale > 1 ? 'grab' : 'zoom-in',
          willChange: isDragging || isPinching || isClosingGesture ? 'transform' : undefined,
        }}
        // 使用 max-w/h-full 确保默认状态下适应屏幕
        className="max-w-full max-h-full object-contain select-none"
        draggable={false}
      />
    </div>
  );
}
