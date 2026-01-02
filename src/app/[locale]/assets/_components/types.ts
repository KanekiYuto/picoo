export interface AssetInfo {
  id: string;
  filename: string;
  originalFilename: string;
  url: string;
  type: "image" | "video";
  mimeType: string;
  size: number;
  tags: string[] | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export type FilterType = "all" | "image" | "video";
