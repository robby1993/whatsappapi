import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript';

@Table({
  tableName: 'ContactNames',
  timestamps: true,
})
export class ContactName extends Model<ContactName> {
  @PrimaryKey
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  accountPhone: string;

  @PrimaryKey
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phone: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;
}
