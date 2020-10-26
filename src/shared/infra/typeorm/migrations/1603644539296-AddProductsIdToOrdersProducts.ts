import { MigrationInterface, QueryRunner, TableForeignKey, TableColumn } from "typeorm";

export default class AddProductsIdToOrdersProducts1603644539296 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.addColumn('orders_products', new TableColumn({
      name: 'product_id',
      type: 'uuid',
      isNullable: true
    }));

    await queryRunner.createForeignKey('orders_products', new TableForeignKey({
      name: 'OrdersProductsToProducts',
      columnNames: ['product_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'products',
      onDelete: 'SET NULL'
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('orders_products', 'OrdersProductsToProducts');

    await queryRunner.dropColumn('orders_products', 'product_id')
  }

}
