const axios = require('axios');
const crypto = require('crypto');

/**
 * Coincheck API通信用ユーティリティ
 * Coincheck APIへのリクエスト送信とシグネチャ生成を行う
 */

const COINCHECK_API_URL = 'https://coincheck.com';

// Coincheck API用のシグネチャ生成
const generateSignature = (apiSecret, nonce, url, body = '') => {
  const message = nonce + url + body;
  return crypto
    .createHmac('sha256', apiSecret)
    .update(message)
    .digest('hex');
};

// 認証ヘッダーの生成
const createAuthHeaders = (apiKey, apiSecret, path, method = 'GET', body = '') => {
  const nonce = Date.now().toString();
  const url = `${COINCHECK_API_URL}${path}`;
  
  const signature = generateSignature(apiSecret, nonce, url, body);
  
  return {
    'ACCESS-KEY': apiKey,
    'ACCESS-NONCE': nonce,
    'ACCESS-SIGNATURE': signature,
    'Content-Type': 'application/json',
  };
};

// リクエスト送信（認証あり）
const sendAuthenticatedRequest = async (apiKey, apiSecret, path, method = 'GET', data = null) => {
  let body = '';
  if (data && method !== 'GET') {
    body = JSON.stringify(data);
  }
  
  const url = `${COINCHECK_API_URL}${path}`;
  const headers = createAuthHeaders(apiKey, apiSecret, path, method, body);
  
  try {
    const response = await axios({
      method,
      url,
      headers,
      data: method !== 'GET' ? data : undefined,
    });
    
    return response.data;
  } catch (error) {
    // APIからのエラーレスポンスを処理
    if (error.response) {
      const { status, data } = error.response;
      
      // レート制限エラーの場合
      if (status === 429) {
        const err = new Error('Coincheck API rate limit exceeded');
        err.name = 'TooManyRequestsError';
        err.response = error.response;
        throw err;
      }
      
      // その他のAPIエラー
      const err = new Error(data.error || 'Coincheck API error');
      err.statusCode = status;
      err.details = data;
      throw err;
    }
    
    // ネットワークエラーなど
    throw error;
  }
};

// 残高取得
const getBalance = async (apiKey, apiSecret) => {
  return sendAuthenticatedRequest(apiKey, apiSecret, '/api/accounts/balance');
};

// 入金履歴取得
const getDeposits = async (apiKey, apiSecret, currency = 'BTC') => {
  return sendAuthenticatedRequest(apiKey, apiSecret, `/api/deposit_money?currency=${currency}`);
};

// 新規注文（成行買い）
const createMarketBuyOrder = async (apiKey, apiSecret, amount) => {
  const data = {
    pair: 'btc_jpy',
    order_type: 'market_buy',
    market_buy_amount: amount.toString(),
  };
  
  return sendAuthenticatedRequest(apiKey, apiSecret, '/api/exchange/orders', 'POST', data);
};

// BTC送金
const sendBitcoin = async (apiKey, apiSecret, address, amount) => {
  const data = {
    address,
    amount: amount.toString(),
  };
  
  return sendAuthenticatedRequest(apiKey, apiSecret, '/api/send_money', 'POST', data);
};

// 取引所ステータスチェック
const getExchangeStatus = async () => {
  try {
    const response = await axios.get(`${COINCHECK_API_URL}/api/exchange/status`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`Exchange status check failed: ${error.response.status}`);
    }
    throw error;
  }
};

// ETH 購入用関数を追加
const createMarketBuyOrderETH = async (apiKey, apiSecret, amount) => {
  const data = {
    pair: 'eth_jpy',  // ETH/JPY ペア
    order_type: 'market_buy',
    market_buy_amount: amount.toString(),
  };
  
  return sendAuthenticatedRequest(apiKey, apiSecret, '/api/exchange/orders', 'POST', data);
};

// ETH 送金用関数を追加
const sendEthereum = async (apiKey, apiSecret, address, amount) => {
  const data = {
    address,
    amount: amount.toString(),
  };
  
  return sendAuthenticatedRequest(apiKey, apiSecret, '/api/send_ethereum', 'POST', data);
};


module.exports = {
  getBalance,
  getDeposits,
  createMarketBuyOrder,
  sendBitcoin,
  getExchangeStatus,
  createMarketBuyOrderETH,
  sendEthereum,
};