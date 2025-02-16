import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database";

class File extends Model {
  public id!: number;
  public name!: string;
  public extension!: string;
  public mimeType!: string;
  public size!: number;
  public uploadedAt!: Date;
}

File.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    extension: { type: DataTypes.STRING, allowNull: false },
    mimeType: { type: DataTypes.STRING, allowNull: false },
    size: { type: DataTypes.INTEGER, allowNull: false },
    uploadedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "File", tableName: "files", timestamps: false }
);

export default File;
