import SendMessage1WhenCustomerIsCreated from "../../../customer/event/handler/send-message-1-when-customer-is-created";
import SendMessage2WhenCustomerIsCreated from "../../../customer/event/handler/send-message-2-when-customer-is-created";
import SendMessageWhenCustomerAddressIsUpdated from "../../../customer/event/handler/send-message-when-customer-address-is-updated";
import SendEmailWhenProductIsCreatedHandler from "../../../product/event/handler/send-email-when-product-is-created.handler";
import EventDispatcher from "../event-dispatcher";
import EventDispatcherInterface from "../event-dispatcher.interface";
import { EventType } from "../event-types";

export class EventDispatcherFactory {
  static create(): EventDispatcherInterface {
    const dispatcher = new EventDispatcher();
    dispatcher.register(
      EventType.CUSTOMER_CREATED,
      new SendMessage1WhenCustomerIsCreated()
    );
    dispatcher.register(
      EventType.CUSTOMER_CREATED,
      new SendMessage2WhenCustomerIsCreated()
    );
    dispatcher.register(
      EventType.CUSTOMER_ADDRESS_UPDATED,
      new SendMessageWhenCustomerAddressIsUpdated()
    );
    dispatcher.register(
      EventType.PRODUCT_CREATED,
      new SendEmailWhenProductIsCreatedHandler()
    );
    return dispatcher;
  }
}
