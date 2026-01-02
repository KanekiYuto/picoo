"use client";

import { LoginModal, MediaPreviewModal } from "@/components/modals";
import { useModalStore } from "@/store/useModalStore";

export function ModalProvider() {
  const {
    isLoginModalOpen,
    closeLoginModal,
    isMediaPreviewOpen,
    mediaPreviewItems,
    mediaPreviewCurrentIndex,
    closeMediaPreview,
    nextMediaPreview,
    prevMediaPreview,
    goToMediaPreview,
  } = useModalStore();

  return (
    <>
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      <MediaPreviewModal
        isOpen={isMediaPreviewOpen}
        items={mediaPreviewItems}
        currentIndex={mediaPreviewCurrentIndex}
        onClose={closeMediaPreview}
        onNext={nextMediaPreview}
        onPrev={prevMediaPreview}
        onGoTo={goToMediaPreview}
      />
    </>
  );
}
