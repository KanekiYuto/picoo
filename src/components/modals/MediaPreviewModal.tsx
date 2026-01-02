'use client';

import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { downloadImage } from '@/lib/image-utils';
import type { MediaItem } from '@/store/useModalStore';

interface MediaPreviewModalProps {
  isOpen: boolean;
  items: MediaItem[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onGoTo: (index: number) => void;
}

export default function MediaPreviewModal({
  isOpen,
  items,
  currentIndex,
  onClose,
  onNext,
  onPrev,
  onGoTo,
}: MediaPreviewModalProps) {
  const t = useTranslations('common.mediaPreviewModal');

  // 键盘事件处理
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onPrev();
          break;
        case 'ArrowRight':
          onNext();
          break;
      }
    },
    [isOpen, onClose, onPrev, onNext]
  );

  // 注册键盘事件
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 禁止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 点击遮罩层关闭
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 下载当前媒体
  const handleDownload = async () => {
    if (items[currentIndex]) {
      const item = items[currentIndex];
      await downloadImage(item.url, {
        success: t("download.success") || "Downloaded successfully",
        error: t("download.error") || "Failed to download image",
      });
    }
  };

  if (!isOpen || items.length === 0) return null;

  const currentItem = items[currentIndex];
  const hasMultiple = items.length > 1;

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      {/* 顶部工具栏 */}
      <div
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 计数 */}
        <div className="text-white/80 text-sm font-medium">
          {hasMultiple && (
            <span>
              {currentIndex + 1} / {items.length}
            </span>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDownload();
            }}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title={t("buttons.download")}
          >
            <Download className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title={t("buttons.closeEsc")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 媒体展示区域 */}
      <div
        className="relative w-full h-full flex items-center justify-center p-16 pt-20 pb-24"
      >
        {/* 图片 */}
        {currentItem.type === 'image' && (
          <img
            src={currentItem.url}
            alt={`Image ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain select-none animate-in zoom-in-95 duration-200"
            draggable={false}
            onClick={() => onClose()}
          />
        )}

        {/* 视频 */}
        {currentItem.type === 'video' && (
          <video
            src={currentItem.url}
            className="max-w-full max-h-full object-contain select-none animate-in zoom-in-95 duration-200"
            controls
            autoPlay
            onClick={() => onClose()}
          />
        )}

        {/* 左箭头 */}
        {hasMultiple && currentIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors cursor-pointer"
            title={t("buttons.previous")}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* 右箭头 */}
        {hasMultiple && currentIndex < items.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors cursor-pointer"
            title={t("buttons.next")}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* 底部缩略图导航 */}
      {hasMultiple && (
        <div
          className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center p-4 bg-gradient-to-t from-black/60 to-transparent"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 overflow-x-auto max-w-full px-4 py-2 custom-scrollbar">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  onGoTo(index);
                }}
                className={`flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                  index === currentIndex
                    ? 'border-white opacity-100'
                    : 'border-transparent opacity-50 hover:opacity-75'
                }`}
              >
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
