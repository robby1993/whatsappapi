import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'WabaCampaigns',
  timestamps: true,
})
export class WabaCampaign extends Model<WabaCampaign> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userNumber: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  templateName: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  numbers: string[];

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  scheduledTime: number;

  @Column({
    type: DataType.STRING,
    defaultValue: 'pending',
  })
  status: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  sentCount: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  failedCount: number;

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
