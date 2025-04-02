// migrations/20xx_add_ethereum_support.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // API キーテーブルに ETH ウォレットを追加
    await queryInterface.addColumn('api_keys', 'ethWalletAddress', {
      type: Sequelize.TEXT,
      allowNull: true
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
    
    // トランザクションテーブルの type の ENUM を更新
    await queryInterface.sequelize.query(
      `ALTER TYPE enum_transactions_type ADD VALUE IF NOT EXISTS 'eth_purchase'`
    );
    
    await queryInterface.sequelize.query(
      `ALTER TYPE enum_transactions_type ADD VALUE IF NOT EXISTS 'eth_transfer'`
    );
  },

  down: async (queryInterface, Sequelize) => {
    // ロールバック処理
    await queryInterface.removeColumn('api_keys', 'ethWalletAddress');
    await queryInterface.removeColumn('balances', 'eth');
    await queryInterface.removeColumn('balances', 'ethReserved');
    // ENUM 値の削除はできないため、スキップ
  }
};