import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'WabaFlows',
  timestamps: true,
})
export class WabaFlow extends Model<WabaFlow> {
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
