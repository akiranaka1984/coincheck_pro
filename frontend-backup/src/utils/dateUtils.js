/**
 * 日付のフォーマット関連のユーティリティ関数
 */

// 日付を YYYY-MM-DD 形式にフォーマット
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// 日付と時刻を YYYY-MM-DD HH:MM:SS 形式にフォーマット
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 相対時間を表示（例：「3分前」「2時間前」）
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  
  // 秒単位
  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 60) {
    return `${diffSecs}秒前`;
  }
  
  // 分単位
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) {
    return `${diffMins}分前`;
  }
  
  // 時間単位
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours}時間前`;
  }
  
  // 日単位
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays}日前`;
  }
  
  // 月単位
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths}ヶ月前`;
  }
  
  // 年単位
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears}年前`;
};