import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';
import Product from '@modules/products/infra/typeorm/entities/Product';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomerRepository')
    private customersRepository: ICustomersRepository,
  ) { }

  public async execute({ customer_id, products }: IRequest): Promise<Order> {

    // Check user
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer not valid')
    }

    //  * ! Products
    //  * ? [] Check if product is valid
    //  * ? [] Check if quantity required is attended
    //  * ? [] Subtract the quantity of the product
    //  */



    const productsIds = products.map(product => {
      return { id: product.id }
    });

    const existentProducts = await this.productsRepository.findAllById(productsIds)

    if (!existentProducts.length) {
      throw new AppError('Some products were not found');
    }

    const existentProductsIds = existentProducts.map(product => product.id);

    const checkInexistentProducts = products.filter(
      product => !existentProductsIds.includes(product.id)
    )

    if (checkInexistentProducts.length) {
      throw new AppError(`This product is invalid ${checkInexistentProducts[0].id}`);
    }

    products.forEach(product => {
      const indexExistentProduct = existentProducts.findIndex(p => p.id === product.id)

      if (product.quantity > existentProducts[indexExistentProduct].quantity) {
        throw new AppError(`Quantity ${product.quantity} invalid for product ${product.id}`);
      }

      existentProducts[indexExistentProduct].quantity = existentProducts[indexExistentProduct].quantity - product.quantity;
    });

    await this.productsRepository.updateQuantity(existentProducts);

    const productsToOrder = products.map(product => {
      const indexExistentProduct = existentProducts.findIndex(p => p.id === product.id);

      return {
        product_id: product.id,
        price: existentProducts[indexExistentProduct].price,
        quantity: product.quantity
      }
    });

    const order = await this.ordersRepository.create({
      customer,
      products: productsToOrder
    });

    return order

  }
}

export default CreateOrderService;
