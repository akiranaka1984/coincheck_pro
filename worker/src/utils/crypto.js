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

module.exports = {
  encrypt,
  decrypt,
};