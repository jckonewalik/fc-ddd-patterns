import CustomerService from "./customer.service";
import faker from "faker";
import { Sequelize } from "sequelize-typescript";
import CustomerModel from "../../../infrastructure/customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../infrastructure/customer/repository/sequelize/customer.repository";
import { EventDispatcherFactory } from "../../@shared/event/factory/event-dispatcher-factory";
import { EventType } from "../../@shared/event/event-types";
import CustomerFactory from "../factory/customer.factory";
import SendMessage1WhenCustomerIsCreated from "../event/handler/send-message-1-when-customer-is-created";
import SendMessage2WhenCustomerIsCreated from "../event/handler/send-message-2-when-customer-is-created";
import SendMessageWhenCustomerAddressIsUpdated from "../event/handler/send-message-when-customer-address-is-updated";
import Address from "../value-object/address";

describe("Customer service integration tests", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([CustomerModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should save customer", async () => {
    const repository = new CustomerRepository();
    const eventDispatcher = EventDispatcherFactory.create();
    const customerCreatedHandlers =
      eventDispatcher.getEventHandlers()[EventType.CUSTOMER_CREATED];
    const spyHandler1 = jest.spyOn(
      customerCreatedHandlers.filter(
        (h) => h instanceof SendMessage1WhenCustomerIsCreated
      )[0],
      "handle"
    );
    const spyHandler2 = jest.spyOn(
      customerCreatedHandlers.filter(
        (h) => h instanceof SendMessage2WhenCustomerIsCreated
      )[0],
      "handle"
    );

    const service = new CustomerService(repository, eventDispatcher);
    const customer = CustomerFactory.create(faker.name.firstName());
    await service.createCustomer(customer);

    const createdCustomer = await repository.find(customer.id);
    expect(createdCustomer).toStrictEqual(customer);
    expect(spyHandler1).toHaveBeenCalledTimes(1);
    expect(spyHandler2).toHaveBeenCalledTimes(1);
  });
  it("should notify when customer address is updated", async () => {
    const repository = new CustomerRepository();
    const eventDispatcher = EventDispatcherFactory.create();

    const customerCreatedHandlers =
      eventDispatcher.getEventHandlers()[EventType.CUSTOMER_ADDRESS_UPDATED];
    const spyHandler1 = jest.spyOn(
      customerCreatedHandlers.filter(
        (h) => h instanceof SendMessageWhenCustomerAddressIsUpdated
      )[0],
      "handle"
    );

    const service = new CustomerService(repository, eventDispatcher);
    const customer = CustomerFactory.create(faker.name.firstName());
    await service.createCustomer(customer);

    const address = new Address(
      faker.address.streetName(),
      faker.datatype.number(),
      faker.address.zipCode(),
      faker.address.city()
    );
    customer.changeAddress(address);

    await service.updateCustomer(customer);

    const createdCustomer = await repository.find(customer.id);
    expect(createdCustomer).toStrictEqual(customer);
    expect(spyHandler1).toHaveBeenCalledTimes(1);
  });

  it("should not notify when customer address still the same", async () => {
    const repository = new CustomerRepository();
    const eventDispatcher = EventDispatcherFactory.create();

    const customerCreatedHandlers =
      eventDispatcher.getEventHandlers()[EventType.CUSTOMER_ADDRESS_UPDATED];
    const spyHandler1 = jest.spyOn(
      customerCreatedHandlers.filter(
        (h) => h instanceof SendMessageWhenCustomerAddressIsUpdated
      )[0],
      "handle"
    );

    const service = new CustomerService(repository, eventDispatcher);
    const address = new Address(
      faker.address.streetName(),
      faker.datatype.number(),
      faker.address.zipCode(),
      faker.address.city()
    );
    const customer = CustomerFactory.createWithAddress(
      faker.name.firstName(),
      address
    );
    await service.createCustomer(customer);
    customer.activate();
    await service.updateCustomer(customer);

    const createdCustomer = await repository.find(customer.id);
    expect(createdCustomer).toStrictEqual(customer);
    expect(spyHandler1).toHaveBeenCalledTimes(0);
  });
});
