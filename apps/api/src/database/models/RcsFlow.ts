import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'RcsFlows',
  timestamps: true,
})
export class RcsFlow extends Model<RcsFlow> {
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
  triggerKeyword: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  flowData: any;

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
