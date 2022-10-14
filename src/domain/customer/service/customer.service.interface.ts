import Customer from "../entity/customer";

export interface CusomerServiceInterface {
  createCustomer(customer: Customer): Promise<void>;
  updateCustomer(customer: Customer): Promise<void>;
}
