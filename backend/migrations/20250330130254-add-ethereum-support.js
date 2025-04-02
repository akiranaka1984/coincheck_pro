'use strict';

/** @type {import('sequelize-cli').Migration} */
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // API キーテーブルに ETH ウォレットを追加
    await queryInterface.addColumn('api_keys', 'ethWalletAddress', {
      type: Sequelize.TEXT,
      allowNull: true  // 後方互換性のためにnullを許容
    });
    
    // 暗号資産タイプのカラムを追加
    await queryInterface.addColumn('api_keys', 'cryptocurrencyType', {
      type: Sequelize.STRING(10),  // ENUMの代わりにSTRINGを使う（SQLiteなど一部のDBではENUMがサポートされていないため）
      defaultValue: 'btc',
      allowNull: false
    });
    
    // Balance テーブルに ETH フィールドを追加
    await queryInterface.addColumn('balances', 'eth', {
      type: Sequelize.DECIMAL(20, 8),
      allowNull: true,
      defaultValue: 0
    });
    
    await queryInterface.addColumn('balances', 'ethReserved', {
      type: Sequelize.DECIMAL(20, 8),
      allowNull: true,
      defaultValue: 0
    });
    
    // トランザクションタイプのEnum値を追加
    // PostgreSQLの場合は以下のようにENUMを拡張します
    try {
      await queryInterface.sequelize.query(
        `ALTER TYPE "enum_transactions_type" ADD VALUE IF NOT EXISTS 'eth_purchase'`
      );
      
      await queryInterface.sequelize.query(
        `ALTER TYPE "enum_transactions_type" ADD VALUE IF NOT EXISTS 'eth_transfer'`
      );
    } catch (error) {
      console.log('ENUMタイプの拡張に失敗しました。これは一部のデータベースでは予想される動作です。');
      console.log('トランザクションモデルのValidation定義を更新してください。');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // ロールバック処理
    await queryInterface.removeColumn('api_keys', 'ethWalletAddress');
    await queryInterface.removeColumn('api_keys', 'cryptocurrencyType');
    await queryInterface.removeColumn('balances', 'eth');
    await queryInterface.removeColumn('balances', 'ethReserved');
    // ENUM値の削除はできないため省略
  }
};
