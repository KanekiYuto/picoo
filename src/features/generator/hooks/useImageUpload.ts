import { useState, useRef, useEffect } from 'react';

export interface UseImageUploadReturn {
  uploadImages: string[];
  handleImageSelect: (file: File) => Promise<void>;
  handleImageReplace: (file: File, index: number) => Promise<void>;
  handleRemoveImage: (index: number) => void;
  handleRecentAssetSelect: (url: string) => void;
  handleRecentAssetReplace: (url: string, index: number) => void;
  clearUploadImages: () => void;
}

export function useImageUpload(): UseImageUploadReturn {
  const [uploadImages, setUploadImages] = useState<string[]>([]);
  const blobUrlsRef = useRef<Set<string>>(new Set());

  // 清理所有 blob URLs
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      blobUrlsRef.current.clear();
    };
  }, []);

  const handleImageSelect = async (file: File) => {
    const localUrl = URL.createObjectURL(file);
    blobUrlsRef.current.add(localUrl);
    setUploadImages((prev) => [...prev, localUrl]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/asset/upload', {
        method: 'POST',
        body: formData,
      });

      const result = (await response.json()) as
        | { success: true; data: { url?: string; results?: Array<{ url: string }> } }
        | { success: false; error?: string };

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // 获取上传的 URL 列表：优先使用 results 数组，其次使用单个 url
      const uploadedUrls = result.data.results?.map(r => r.url) || (result.data.url ? [result.data.url] : []);

      if (uploadedUrls.length === 0) {
        throw new Error('No URLs returned from upload');
      }

      // 替换最后一张 blob URL 为第一个真实 URL，然后添加其余的 URL
      setUploadImages((prev) => {
        const newImages = [...prev];
        const oldUrl = newImages[newImages.length - 1];

        // 撤销 blob URL
        if (blobUrlsRef.current.has(oldUrl)) {
          URL.revokeObjectURL(oldUrl);
          blobUrlsRef.current.delete(oldUrl);
        }

        // 替换第一个 URL，添加其余 URL
        newImages[newImages.length - 1] = uploadedUrls[0];
        if (uploadedUrls.length > 1) {
          newImages.push(...uploadedUrls.slice(1));
        }

        return newImages;
      });
    } catch (error) {
      console.error('Upload image failed:', error);
      // 移除失败的图片并清理 blob URL
      setUploadImages((prev) => {
        const oldUrl = prev[prev.length - 1];
        if (blobUrlsRef.current.has(oldUrl)) {
          URL.revokeObjectURL(oldUrl);
          blobUrlsRef.current.delete(oldUrl);
        }
        return prev.slice(0, -1);
      });
    }
  };

  const handleImageReplace = async (file: File, index: number) => {
    const localUrl = URL.createObjectURL(file);
    blobUrlsRef.current.add(localUrl);

    setUploadImages((prev) => {
      const newImages = [...prev];
      newImages[index] = localUrl;
      return newImages;
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/asset/upload', {
        method: 'POST',
        body: formData,
      });

      const result = (await response.json()) as
        | { success: true; data: { url?: string; results?: Array<{ url: string }> } }
        | { success: false; error?: string };

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // 获取上传的 URL：优先使用 results 数组的第一个，其次使用单个 url
      const uploadedUrl = result.data.results?.[0]?.url || result.data.url;

      if (!uploadedUrl) {
        throw new Error('No URL returned from upload');
      }

      setUploadImages((prev) => {
        const newImages = [...prev];
        const oldUrl = newImages[index];
        // 撤销 blob URL
        if (blobUrlsRef.current.has(oldUrl)) {
          URL.revokeObjectURL(oldUrl);
          blobUrlsRef.current.delete(oldUrl);
        }
        newImages[index] = uploadedUrl;
        return newImages;
      });
    } catch (error) {
      console.error('Replace image failed:', error);
      // 恢复为原始图片
      setUploadImages((prev) => {
        const newImages = [...prev];
        const failedUrl = newImages[index];
        if (blobUrlsRef.current.has(failedUrl)) {
          URL.revokeObjectURL(failedUrl);
          blobUrlsRef.current.delete(failedUrl);
        }
        return prev;
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadImages((prev) => {
      const url = prev[index];
      // 清理 blob URL
      if (blobUrlsRef.current.has(url)) {
        URL.revokeObjectURL(url);
        blobUrlsRef.current.delete(url);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleRecentAssetSelect = (url: string) => {
    setUploadImages((prev) => [...prev, url]);
  };

  const handleRecentAssetReplace = (url: string, index: number) => {
    setUploadImages((prev) => {
      const newImages = [...prev];
      const oldUrl = newImages[index];
      // 清理 blob URL
      if (blobUrlsRef.current.has(oldUrl)) {
        URL.revokeObjectURL(oldUrl);
        blobUrlsRef.current.delete(oldUrl);
      }
      newImages[index] = url;
      return newImages;
    });
  };

  const clearUploadImages = () => {
    setUploadImages((prev) => {
      prev.forEach((url) => {
        if (blobUrlsRef.current.has(url)) {
          URL.revokeObjectURL(url);
          blobUrlsRef.current.delete(url);
        }
      });
      return [];
    });
  };

  return {
    uploadImages,
    handleImageSelect,
    handleImageReplace,
    handleRemoveImage,
    handleRecentAssetSelect,
    handleRecentAssetReplace,
    clearUploadImages,
  };
}
