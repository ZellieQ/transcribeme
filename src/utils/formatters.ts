/**
 * Format seconds to MM:SS format
 */
export const formatTime = (seconds?: number): string => {
  if (seconds === undefined || isNaN(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format file size to human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format SRT subtitles from transcription
 */
export const formatSRT = (text: string, duration: number = 300): string => {
  if (!text) return '';
  
  // Split text into sentences or chunks
  const sentences = text
    .replace(/([.!?])\s+/g, '$1\n')
    .split('\n')
    .filter(s => s.trim().length > 0);
  
  // Estimate time per sentence based on total duration
  const avgTimePerChar = duration / text.length;
  
  let srt = '';
  let startTime = 0;
  
  sentences.forEach((sentence, index) => {
    const sentenceDuration = sentence.length * avgTimePerChar;
    const endTime = startTime + sentenceDuration;
    
    // Format times as HH:MM:SS,mmm
    const formatSRTTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      const ms = Math.floor((seconds % 1) * 1000);
      
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
    };
    
    srt += `${index + 1}\n`;
    srt += `${formatSRTTime(startTime)} --> ${formatSRTTime(endTime)}\n`;
    srt += `${sentence}\n\n`;
    
    startTime = endTime;
  });
  
  return srt;
};
