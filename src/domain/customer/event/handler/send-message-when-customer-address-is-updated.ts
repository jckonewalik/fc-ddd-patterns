import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import CustomerCreatedEvent from "../customer-created.event";

export default class SendMessageWhenCustomerAddressIsUpdated
  implements EventHandlerInterface<CustomerCreatedEvent>
{
  handle({ eventData }: CustomerCreatedEvent): void {
    console.log(
      `Endereço do cliente: ${eventData.id}, ${eventData.name} alterado para: ${eventData.Address}`
    );
  }
}
