const CryptoJS = require('crypto-js');

/**
 * 機密データを暗号化するユーティリティ
 * APIキーなどの機密情報をデータベースに保存する前に暗号化する
 */

// 暗号化キー
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

// データを暗号化する
const encrypt = (text) => {
  if (!text) return null;
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

// 暗号化されたデータを復号する
const decrypt = (ciphertext) => {
  if (!ciphertext) return null;
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// データの一部分だけを表示し、残りをマスク処理する（表示用）
const maskData = (text, visibleChars = 4) => {
  if (!text) return null;
  
  // 短すぎる文字列はすべてマスク
  if (text.length <= visibleChars) {
    return '*'.repeat(text.length);
  }
  
  // 先頭の数文字を表示し、残りをマスク
  const visiblePart = text.substring(0, visibleChars);
  const maskedPart = '*'.repeat(text.length - visibleChars);
  
  return `${visiblePart}${maskedPart}`;
};

module.exports = {
  encrypt,
  decrypt,
  maskData,
};