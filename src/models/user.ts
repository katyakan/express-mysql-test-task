import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../database'; 
interface UserAttributes {
  id: string;
  password: string;
  refreshTokens: string[];
}


interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'refreshTokens'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public password!: string;
  public refreshTokens!: string[];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refreshTokens: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);
