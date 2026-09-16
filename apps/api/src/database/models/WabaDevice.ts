import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'WabaDevices',
  timestamps: true,
})
export class WabaDevice extends Model<WabaDevice> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userNumber: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phone: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phoneNumberId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  wabaAccountId: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  accessToken: string;

  @Column({
    type: DataType.STRING,
    defaultValue: 'active',
  })
  status: string;

  @Column({
    type: DataType.STRING,
    defaultValue: 'GREEN',
  })
  qualityRating: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: DataType.NOW,
  })
  createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: DataType.NOW,
  })
  updatedAt: Date;
}
