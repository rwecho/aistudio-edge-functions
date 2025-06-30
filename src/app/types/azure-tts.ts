export interface TTSRequest {
  text: string;
  voiceName: string;
  style?: string;
  rate?: string;
  pitch?: string;
  volume?: string;
  uploadToCloud?: boolean;
}

export interface TTSResponse {
  success: boolean;
  url?: string;
  fileName?: string;
  size?: number;
  voiceName?: string;
  style?: string;
  error?: string;
}

export interface VoiceInfo {
  name: string;
  language: string;
  gender: "Male" | "Female";
  styles: string[];
}

export interface VoiceListResponse {
  success: boolean;
  voices: VoiceInfo[];
  totalCount: number;
}

export interface TTSPreviewRequest {
  text?: string;
  voiceName: string;
  style?: string;
  rate?: string;
  pitch?: string;
  volume?: string;
}
