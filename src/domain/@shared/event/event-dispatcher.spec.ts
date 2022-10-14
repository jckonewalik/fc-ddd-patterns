import SendEmailWhenProductIsCreatedHandler from "../../product/event/handler/send-email-when-product-is-created.handler";
import ProductCreatedEvent from "../../product/event/product-created.event";
import EventDispatcher from "./event-dispatcher";
import { EventType } from "./event-types";

describe("Domain events tests", () => {
  it("should register an event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register(EventType.PRODUCT_CREATED, eventHandler);

    expect(
      eventDispatcher.getEventHandlers()[EventType.PRODUCT_CREATED]
    ).toBeDefined();
    expect(
      eventDispatcher.getEventHandlers()[EventType.PRODUCT_CREATED].length
    ).toBe(1);
    expect(
      eventDispatcher.getEventHandlers()[EventType.PRODUCT_CREATED][0]
    ).toMatchObject(eventHandler);
  });

  it("should unregister an event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register(EventType.PRODUCT_CREATED, eventHandler);

    expect(
      eventDispatcher.getEventHandlers()[EventType.PRODUCT_CREATED][0]
    ).toMatchObject(eventHandler);

    eventDispatcher.unregister(EventType.PRODUCT_CREATED, eventHandler);

    expect(
      eventDispatcher.getEventHandlers()[EventType.PRODUCT_CREATED]
    ).toBeDefined();
    expect(
      eventDispatcher.getEventHandlers()[EventType.PRODUCT_CREATED].length
    ).toBe(0);
  });

  it("should unregister all event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register(EventType.PRODUCT_CREATED, eventHandler);

    expect(
      eventDispatcher.getEventHandlers()[EventType.PRODUCT_CREATED][0]
    ).toMatchObject(eventHandler);

    eventDispatcher.unregisterAll();

    expect(
      eventDispatcher.getEventHandlers()[EventType.PRODUCT_CREATED]
    ).toBeUndefined();
  });

  it("should notify all event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();
    const spyEventHandler = jest.spyOn(eventHandler, "handle");

    eventDispatcher.register(EventType.PRODUCT_CREATED, eventHandler);

    expect(
      eventDispatcher.getEventHandlers()[EventType.PRODUCT_CREATED][0]
    ).toMatchObject(eventHandler);

    const productCreatedEvent = new ProductCreatedEvent({
      name: "Product 1",
      description: "Product 1 description",
      price: 10.0,
    });

    // Quando o notify for executado o SendEmailWhenProductIsCreatedHandler.handle() deve ser chamado
    eventDispatcher.notify(productCreatedEvent);

    expect(spyEventHandler).toHaveBeenCalled();
  });
});
