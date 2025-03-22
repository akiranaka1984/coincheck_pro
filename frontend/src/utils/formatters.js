/**
 * 金額フォーマット用ユーティリティ関数
 */

/**
 * 数値を日本円形式にフォーマット
 * @param {number|string} amount - フォーマットする金額
 * @param {boolean} showSymbol - 通貨記号を表示するかどうか
 * @returns {string} - フォーマットされた金額
 */
export const formatCurrency = (amount, showSymbol = true) => {
  const numAmount = parseFloat(amount) || 0;
  
  // 日本円形式でフォーマット（3桁ごとにカンマ、小数点以下はカット）
  const formatter = new Intl.NumberFormat("ja-JP", {
    style: showSymbol ? "currency" : "decimal",
    currency: "JPY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return formatter.format(numAmount);
};

/**
 * 数値をビットコイン形式にフォーマット
 * @param {number|string} amount - フォーマットする金額
 * @param {boolean} showSymbol - 通貨記号を表示するかどうか
 * @returns {string} - フォーマットされた金額
 */
export const formatBitcoin = (amount, showSymbol = true) => {
  const numAmount = parseFloat(amount) || 0;
  
  // BTCは8桁までの精度で表示
  const formatted = numAmount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  });
  
  return showSymbol ? `${formatted} BTC` : formatted;
};

/**
 * パーセンテージのフォーマット
 * @param {number|string} percent - フォーマットするパーセンテージ
 * @param {number} precision - 小数点以下の桁数
 * @returns {string} - フォーマットされたパーセンテージ
 */
export const formatPercent = (percent, precision = 2) => {
  const numPercent = parseFloat(percent) || 0;
  
  const formatter = new Intl.NumberFormat("ja-JP", {
    style: "percent",
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
  
  return formatter.format(numPercent / 100);
};

/**
 * 日時のフォーマット
 * @param {string|Date} date - フォーマットする日時
 * @param {boolean} includeTime - 時間を含めるかどうか
 * @returns {string} - フォーマットされた日時
 */
export const formatDate = (date, includeTime = true) => {
  if (!date) return "---";
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return "無効な日付";
  }
  
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(includeTime ? {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    } : {})
  };
  
  return dateObj.toLocaleString("ja-JP", options);
};

/**
 * 数値を指定された桁数で切り捨て
 * @param {number|string} value - 切り捨てる数値
 * @param {number} precision - 小数点以下の桁数
 * @returns {number} - 切り捨てられた数値
 */
export const truncateNumber = (value, precision = 8) => {
  const numValue = parseFloat(value) || 0;
  const factor = Math.pow(10, precision);
  
  return Math.floor(numValue * factor) / factor;
};
