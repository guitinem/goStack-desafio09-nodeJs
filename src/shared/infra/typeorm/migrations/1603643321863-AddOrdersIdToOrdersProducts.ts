import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export default class AddOrdersIdToOrdersProducts1603643321863 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('orders_products', new TableColumn({
      name: 'order_id',
      type: 'uuid',
      isNullable: true
    }));

    await queryRunner.createForeignKey('orders_products', new TableForeignKey({
      name: 'OrdersProductsToOrders',
      columnNames: ['order_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'orders',
      onDelete: 'SET NULL'
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('orders_products', 'OrdersProductsToOrders');

    await queryRunner.dropColumn('orders_products', 'order_id')
  }

}
