export type Category =
  | "video"
  | "audio"
  | "image"
  | "pdf"
  | "document"
  | "gif"
  | "ebook"
  | "font"
  | "archive";

export type ConversionStatus = "idle" | "loading-ffmpeg" | "converting" | "done" | "error";

export type ConversionMode = "convert" | "compress";

export interface FileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  category: Category;
  extension: string;
  targetFormat: string;
  mode: ConversionMode;
  quality: number;
  status: ConversionStatus;
  progress: number;
  resultUrl?: string;
  resultName?: string;
  error?: string;
}
