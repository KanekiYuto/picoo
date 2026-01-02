// 历史记录结果类型
export interface HistoryResult {
  id: string;
  url: string;
  mimeType: string;
  type: string;
}

// 历史记录类型
export interface HistoryItem {
  id: string;
  prompt: string;
  results: HistoryResult[];
  createdAt: string;
  updatedAt: string;
}
