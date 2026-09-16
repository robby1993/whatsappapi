import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'WabaTemplates',
  timestamps: true,
})
export class WabaTemplate extends Model<WabaTemplate> {
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
    defaultValue: 'en_US',
  })
  language: string;

  @Column({
    type: DataType.STRING,
    defaultValue: 'MARKETING',
  })
  category: string;

  @Column({
    type: DataType.STRING,
    defaultValue: 'APPROVED',
  })
  status: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  components: any;

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
