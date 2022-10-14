import EventDispatcherInterface from "../../@shared/event/event-dispatcher.interface";
import Customer from "../entity/customer";
import CustomerAddressUpdatedEvent from "../event/customer-address-updated.event";
import CustomerCreatedEvent from "../event/customer-created.event";
import CustomerRepositoryInterface from "../repository/customer-repository.interface";
import { CusomerServiceInterface } from "./customer.service.interface";

export default class CustomerService implements CusomerServiceInterface {
  constructor(
    private repository: CustomerRepositoryInterface,
    private eventDispatcher: EventDispatcherInterface
  ) {}

  async createCustomer(customer: Customer): Promise<void> {
    await this.repository.create(customer);

    const event = new CustomerCreatedEvent(customer);
    this.eventDispatcher.notify(event);
  }

  async updateCustomer(customer: Customer): Promise<void> {
    const currentData = await this.repository.find(customer.id);
    let addressUpdated = false;

    if (!customer.Address.equals(currentData.Address)) {
      addressUpdated = true;
    }

    await this.repository.update(customer);
    if (addressUpdated) {
      this.eventDispatcher.notify(new CustomerAddressUpdatedEvent(customer));
    }
  }
}
