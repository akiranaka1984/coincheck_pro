const { Transaction, ApiKey, User, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * ダッシュボード情報コントローラー
 * ダッシュボード表示に必要な集計データを提供
 */

// ダッシュボード情報の取得
const getDashboardInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // 同時に複数のクエリを実行
    const [activeApiKeys, transactionStats, recentTransactions] = await Promise.all([
      // アクティブなAPIキーの数
      ApiKey.count({
        where: { userId, isActive: true },
      }),
      
      // 取引統計（タイプ別の合計）
      Transaction.findAll({
        where: { userId },
        attributes: [
          'type',
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('depositAmount')), 'totalDeposit'],
          [sequelize.fn('SUM', sequelize.col('purchaseAmount')), 'totalPurchase'],
          [sequelize.fn('SUM', sequelize.col('transferAmount')), 'totalTransfer'],
        ],
        group: ['type', 'status'],
        raw: true,
      }),
      
      // 最近の取引（最新5件）
      Transaction.findAll({
        where: { userId },
        attributes: ['id', 'type', 'status', 'depositAmount', 'purchaseAmount', 'transferAmount', 'createdAt'],
        order: [['createdAt', 'DESC']],
        limit: 5,
        include: [
          {
            model: ApiKey,
            as: 'apiKey',
            attributes: ['id', 'name'],
          },
        ],
      }),
    ]);
    
    // 統計データの整形
    const stats = {
      deposit: {
        total: 0,
        completed: 0,
        pending: 0,
        failed: 0,
      },
      purchase: {
        total: 0,
        completed: 0,
        pending: 0,
        failed: 0,
      },
      transfer: {
        total: 0,
        completed: 0,
        pending: 0,
        failed: 0,
      },
      error: {
        total: 0,
      },
    };
    
    // 統計データの整形
    transactionStats.forEach((stat) => {
      if (stats[stat.type]) {
        stats[stat.type].total += parseInt(stat.count, 10);
        if (stat.status && stats[stat.type][stat.status] !== undefined) {
          stats[stat.type][stat.status] += parseInt(stat.count, 10);
        }
      }
    });
    
    // 日次取引量の取得（直近30日間）
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyTransactions = await Transaction.findAll({
      where: { 
        userId,
        createdAt: { [Op.gte]: thirtyDaysAgo },
      },
      attributes: [
        [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('depositAmount')), 'depositAmount'],
        [sequelize.fn('SUM', sequelize.col('purchaseAmount')), 'purchaseAmount'],
        [sequelize.fn('SUM', sequelize.col('transferAmount')), 'transferAmount'],
      ],
      group: [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt'))],
      order: [[sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'ASC']],
      raw: true,
    });
    
    return res.status(200).json({
      status: 'success',
      data: {
        activeApiKeys,
        stats,
        recentTransactions,
        dailyTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardInfo,
};