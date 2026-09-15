import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'SubscriptionHistory',
  timestamps: true,
})
export class SubscriptionHistory extends Model<SubscriptionHistory> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userNumber: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  userName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  planName: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  days: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  price: number;

  @Column({
    type: DataType.STRING,
    defaultValue: 'Direct',
  })
  paymentMethod: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  startDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  expiryDate: Date;

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
