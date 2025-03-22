// settings.js モデル
module.exports = (sequelize, DataTypes) => {
  const Settings = sequelize.define('Settings', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    tableName: 'settings',
    timestamps: true,
  });

  // User モデルとの関連付け
  Settings.associate = (models) => {
    Settings.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return Settings;
};