import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'RcsAgents',
  timestamps: true,
})
export class RcsAgent extends Model<RcsAgent> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userNumber: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  agentName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  agentId: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  serviceAccountJson: string;

  @Column({
    type: DataType.STRING,
    defaultValue: 'active',
  })
  status: string;

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
