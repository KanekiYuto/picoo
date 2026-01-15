"use client";

import { LoginModal, MediaPreviewModal, LanguageModal } from "@/components/modals";
import { PricingModal } from "@/components/modals/PricingModal";
import { GlobalGeneratorModal } from "@/features/generator";
import { useModalStore } from "@/store/useModalStore";

export function ModalProvider() {
  const {
    isLoginModalOpen,
    closeLoginModal,
    isPricingModalOpen,
    closePricingModal,
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
      <PricingModal isOpen={isPricingModalOpen} onClose={closePricingModal} />
      <MediaPreviewModal
        isOpen={isMediaPreviewOpen}
        items={mediaPreviewItems}
        currentIndex={mediaPreviewCurrentIndex}
        onClose={closeMediaPreview}
        onNext={nextMediaPreview}
        onPrev={prevMediaPreview}
        onGoTo={goToMediaPreview}
      />
      <LanguageModal />
      <GlobalGeneratorModal />
    </>
  );
}
