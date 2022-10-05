import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";
import { v4 as uuid } from "uuid";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  async function createNewOrder(
    id: string,
    repository: OrderRepository
  ): Promise<Order> {
    const customerRepository = new CustomerRepository();
    const customer = new Customer(uuid(), "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product(uuid(), "Product 1", 10);
    await productRepository.create(product);

    const ordemItem = new OrderItem(
      uuid(),
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order(id, customer.id, [ordemItem]);

    await repository.create(order);
    return order;
  }

  it("should create a new order", async () => {
    const orderRepository = new OrderRepository();
    const order = await createNewOrder("123", orderRepository);
    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    compareEntityAndModel(order, orderModel);
  });
  it("should find an order", async () => {
    const orderRepository = new OrderRepository();
    const order = await createNewOrder("123", orderRepository);

    const foundOrder = await orderRepository.find("123");
    expect(foundOrder).toStrictEqual(order);
  });

  it("should find all orders", async () => {
    const orderRepository = new OrderRepository();
    const order1 = await createNewOrder("1", orderRepository);
    const order2 = await createNewOrder("2", orderRepository);

    const foundProducts = await orderRepository.findAll();
    const orders = [order1, order2];

    expect(foundProducts).toEqual(orders);
  });
  it("should update an existing order", async () => {
    const orderRepository = new OrderRepository();
    const productRepository = new ProductRepository();

    const product2 = new Product(uuid(), "Product 2", 10);
    await productRepository.create(product2);
    const order = await createNewOrder("123", orderRepository);
    let orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    compareEntityAndModel(order, orderModel);
    order.addItem(
      new OrderItem(uuid(), product2.name, product2.price, product2.id, 5)
    );
    await orderRepository.update(order);
    orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });
    compareEntityAndModel(order, orderModel);
  });

  function compareEntityAndModel(order: Order, orderModel: OrderModel) {
    expect(orderModel.toJSON()).toStrictEqual({
      id: order.id,
      customer_id: order.customerId,
      total: order.total(),
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        order_id: order.id,
        product_id: item.productId,
      })),
    });
  }
});
