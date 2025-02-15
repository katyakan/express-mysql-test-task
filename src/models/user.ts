import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../database'; // Adjust according to your project setup

// Define User attributes interface
interface UserAttributes {
  id: string;
  password: string;
  refreshToken: string | null;
//   email: string; // Add email to the attributes
// }
}
// Define the creation attributes (optional fields)
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public password!: string;
  public refreshToken!: string | null;
  // public email!: string; // Declare email property

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
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,  // Allow null if no refreshToken is set initially
    },
    // email: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    //   unique: true,  // Ensure email is unique
    //   validate: {
    //     isEmail: true,  // Validate email format
    //   },
    // },
  },
  {
    sequelize,
    tableName: 'users',
  }
);
