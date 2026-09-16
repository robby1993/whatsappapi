import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'WabaAutomations',
  timestamps: true,
})
export class WabaAutomation extends Model<WabaAutomation> {
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
    defaultValue: 'text',
  })
  responseType: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  messageText: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  templateName: string;

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
