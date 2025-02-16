import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../database'; // Adjust according to your project setup

// Define User attributes interface
interface UserAttributes {
  id: string;
  password: string;
  refreshTokens: string[]; // Store multiple refresh tokens as an array
}

// Define the creation attributes (optional fields)
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'refreshTokens'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public password!: string;
  public refreshTokens!: string[]; // Use an array for refresh tokens

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
      type: DataTypes.JSON,  // JSONB to store an array of tokens
      allowNull: true,
      defaultValue: [],  // Default empty array
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,  // Automatically includes createdAt and updatedAt
  }
);
