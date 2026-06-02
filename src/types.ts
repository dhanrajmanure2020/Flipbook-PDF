export interface PDFFileState {
  file: File | null;
  name: string;
  size: string;
  url: string; // Object URL for pdf.js loading
}

export interface BookletMetadata {
  title: string;
  author: string;
  totalPages: number;
  isExample: boolean;
  aspectRatio: number; // width / height
}

export interface BookTheme {
  primaryColor: string;
  accentColor: string;
  spineColor: string;
}
