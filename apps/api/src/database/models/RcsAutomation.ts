import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'RcsAutomations',
  timestamps: true,
})
export class RcsAutomation extends Model<RcsAutomation> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userNumber: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  triggerKeyword: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  cardTitle: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  replyText: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  mediaUrl: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isActive: boolean;

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
