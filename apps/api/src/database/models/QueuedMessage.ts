import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'QueuedMessages',
  timestamps: true,
})
export class QueuedMessage extends Model<QueuedMessage> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  sender: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  receiver: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  message: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  mediaUrl: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  mediaType: string;

  @Column({
    type: DataType.ENUM('pending', 'processing', 'sent', 'failed'),
    defaultValue: 'pending',
  })
  status: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  scheduledAt: Date;

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
