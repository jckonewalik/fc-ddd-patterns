import EventDispatcher from "../../@shared/event/event-dispatcher";
import CustomerService from "./customer.service";
import faker from "faker";
import CustomerRepositoryInterface from "../repository/customer-repository.interface";
import Customer from "../entity/customer";
import CustomerCreatedEvent from "../event/customer-created.event";
import CustomerFactory from "../factory/customer.factory";

class MockCustomerRepository implements CustomerRepositoryInterface {
  async create(entity: Customer): Promise<void> {
    console.log("creating user...");
  }
  async update(entity: Customer): Promise<void> {
    console.log("updating user...");
  }
  async find(id: string): Promise<Customer> {
    console.log("finding user...");
    return null;
  }
  async findAll(): Promise<Customer[]> {
    return [];
  }
}
describe("Customer service unit tests", () => {
  it("should save customer and notify event dispatcher", async () => {
    const repository = new MockCustomerRepository();
    const eventDispatcher = new EventDispatcher();
    const spyRepository = jest.spyOn(repository, "create");
    const spyEventDispatcher = jest.spyOn(eventDispatcher, "notify");

    const service = new CustomerService(repository, eventDispatcher);
    const customer = CustomerFactory.create(faker.name.firstName());
    await service.createCustomer(customer);

    expect(spyRepository).toHaveBeenCalled();
    expect(spyRepository).toHaveBeenCalledWith(customer);
    expect(spyEventDispatcher).toHaveBeenCalled();
    expect(spyEventDispatcher).toHaveBeenCalledWith(
      expect.any(CustomerCreatedEvent)
    );
  });
});
