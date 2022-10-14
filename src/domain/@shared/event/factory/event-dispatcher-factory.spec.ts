import SendMessage1WhenCustomerIsCreated from "../../../customer/event/handler/send-message-1-when-customer-is-created";
import SendMessage2WhenCustomerIsCreated from "../../../customer/event/handler/send-message-2-when-customer-is-created";
import SendMessageWhenCustomerAddressIsUpdated from "../../../customer/event/handler/send-message-when-customer-address-is-updated";
import SendEmailWhenProductIsCreatedHandler from "../../../product/event/handler/send-email-when-product-is-created.handler";
import { EventType } from "../event-types";
import { EventDispatcherFactory } from "./event-dispatcher-factory";

describe("Event Dispatcher Factory unit tests", () => {
  it("should create an instance with required handlers", () => {
    const eventDispatcher = EventDispatcherFactory.create();

    expect(eventDispatcher).toBeDefined();
    expect(eventDispatcher.getEventHandlers()).toBeDefined();
    const customerCreatedHandlers =
      eventDispatcher.getEventHandlers()[EventType.CUSTOMER_CREATED];
    expect(customerCreatedHandlers).toBeDefined();
    expect(customerCreatedHandlers.length).toBe(2);
    expect(customerCreatedHandlers).toEqual(
      expect.arrayContaining([expect.any(SendMessage1WhenCustomerIsCreated)])
    );
    expect(customerCreatedHandlers).toEqual(
      expect.arrayContaining([expect.any(SendMessage2WhenCustomerIsCreated)])
    );

    const customerAddressUpdatedHandlers =
      eventDispatcher.getEventHandlers()[EventType.CUSTOMER_ADDRESS_UPDATED];

    expect(customerAddressUpdatedHandlers).toEqual(
      expect.arrayContaining([
        expect.any(SendMessageWhenCustomerAddressIsUpdated),
      ])
    );

    const productHandlers =
      eventDispatcher.getEventHandlers()[EventType.PRODUCT_CREATED];
    expect(productHandlers).toBeDefined();
    expect(productHandlers.length).toBe(1);
    expect(productHandlers).toEqual(
      expect.arrayContaining([expect.any(SendEmailWhenProductIsCreatedHandler)])
    );
  });
});
