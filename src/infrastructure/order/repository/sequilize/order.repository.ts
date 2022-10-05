import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  async update(entity: Order): Promise<void> {
    const orderModel = await OrderModel.findOne({
      where: { id: entity.id },
    });
    if (orderModel) {
      const t = await OrderModel.sequelize?.transaction();
      try {
        for (const item of entity.items) {
          const itemModel = await OrderItemModel.findOne({
            where: { id: item.id },
          });
          if (itemModel) {
            await itemModel.update(
              {
                name: item.name,
                price: item.price,
                product_id: item.productId,
                quantity: item.quantity,
              },
              { transaction: t }
            );
          } else {
            await OrderItemModel.create(
              {
                id: item.id,
                name: item.name,
                price: item.price,
                product_id: item.productId,
                quantity: item.quantity,
                order_id: orderModel.id,
              },
              { transaction: t }
            );
          }
        }
        await orderModel.update(
          {
            id: entity.id,
            customer_id: entity.customerId,
            total: entity.total(),
          },
          { transaction: t }
        );
        await t.commit();
      } catch (error) {
        await t.rollback();
      }
    }
  }
  async find(id: string): Promise<Order> {
    const orderModel = await OrderModel.findOne({
      where: { id },
      include: ["items"],
    });
    return new Order(
      orderModel.id,
      orderModel.customer_id,
      orderModel.items.map(
        (item) =>
          new OrderItem(
            item.id,
            item.name,
            item.price,
            item.product_id,
            item.quantity
          )
      )
    );
  }
  async findAll(): Promise<Order[]> {
    const orderModels = await OrderModel.findAll({ include: ["items"] });
    return orderModels.map(
      (model) =>
        new Order(
          model.id,
          model.customer_id,
          model.items.map(
            (item) =>
              new OrderItem(
                item.id,
                item.name,
                item.price,
                item.product_id,
                item.quantity
              )
          )
        )
    );
  }

  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }
}
