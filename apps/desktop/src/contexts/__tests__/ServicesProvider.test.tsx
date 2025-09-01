import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import { ServicesProvider } from "../ServicesProvider";
import { RendererProcessServices } from "../../renderer/services";
import { useServices } from "../useServices";

// Mock the conversation store from ui-shared
const mockInitialize = jest.fn();

jest.mock("@fishbowl-ai/ui-shared", () => ({
  useConversationStore: {
    getState: () => ({
      initialize: mockInitialize,
    }),
  },
}));

// Mock RendererProcessServices
const mockConversationService = {
  listConversations: jest.fn(),
  createConversation: jest.fn(),
  listMessages: jest.fn(),
  createMessage: jest.fn(),
  deleteMessage: jest.fn(),
  listConversationAgents: jest.fn(),
  addAgent: jest.fn(),
  removeAgent: jest.fn(),
  updateConversationAgent: jest.fn(),
  sendToAgents: jest.fn(),
  getConversation: jest.fn(),
  renameConversation: jest.fn(),
  deleteConversation: jest.fn(),
};

const createMockRendererProcessServices = (): RendererProcessServices =>
  ({
    conversationService: mockConversationService,
    cryptoUtils: {} as any,
    deviceInfo: {} as any,
    clipboardBridge: {} as any,
    personalityDefinitionsClient: {} as any,
    logger: {} as any,
  }) as unknown as RendererProcessServices;

jest.mock("../../renderer/services", () => ({
  RendererProcessServices: jest
    .fn()
    .mockImplementation(() => createMockRendererProcessServices()),
}));

// Test component to verify services are available
const TestComponent = () => {
  const services = useServices();
  return (
    <div>
      <span data-testid="services-available">
        {services ? "Services Available" : "No Services"}
      </span>
      <span data-testid="conversation-service-available">
        {services.conversationService
          ? "Conversation Service Available"
          : "No Conversation Service"}
      </span>
    </div>
  );
};

describe("ServicesProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInitialize.mockResolvedValue(undefined);
  });

  it("provides services to child components", () => {
    render(
      <ServicesProvider>
        <TestComponent />
      </ServicesProvider>,
    );

    expect(screen.getByTestId("services-available")).toHaveTextContent(
      "Services Available",
    );
    expect(
      screen.getByTestId("conversation-service-available"),
    ).toHaveTextContent("Conversation Service Available");
  });

  it("initializes conversation store with conversation service", () => {
    render(
      <ServicesProvider>
        <div>Test</div>
      </ServicesProvider>,
    );

    expect(mockInitialize).toHaveBeenCalledWith(mockConversationService);
    expect(mockInitialize).toHaveBeenCalledTimes(1);
  });

  it("accepts custom services instance", () => {
    const customConversationService = {
      listConversations: jest.fn(),
      createConversation: jest.fn(),
      listMessages: jest.fn(),
    };

    const customServices = {
      conversationService: customConversationService,
    } as unknown as RendererProcessServices;

    render(
      <ServicesProvider services={customServices}>
        <div>Test</div>
      </ServicesProvider>,
    );

    expect(mockInitialize).toHaveBeenCalledWith(customConversationService);
    expect(mockInitialize).toHaveBeenCalledTimes(1);
  });

  it("handles conversation store initialization errors gracefully", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    mockInitialize.mockImplementation(() => {
      throw new Error("Initialization failed");
    });

    render(
      <ServicesProvider>
        <TestComponent />
      </ServicesProvider>,
    );

    // Component should still render and services should be available
    expect(screen.getByTestId("services-available")).toHaveTextContent(
      "Services Available",
    );
    expect(
      screen.getByTestId("conversation-service-available"),
    ).toHaveTextContent("Conversation Service Available");

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to initialize conversation store:",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  it("does not reinitialize conversation store on re-render with same services", () => {
    const customServices = {
      conversationService: mockConversationService,
    } as unknown as RendererProcessServices;

    const { rerender } = render(
      <ServicesProvider services={customServices}>
        <div>Test</div>
      </ServicesProvider>,
    );

    expect(mockInitialize).toHaveBeenCalledTimes(1);

    // Re-render with same services instance
    rerender(
      <ServicesProvider services={customServices}>
        <div>Test Updated</div>
      </ServicesProvider>,
    );

    // Should not initialize again
    expect(mockInitialize).toHaveBeenCalledTimes(1);
  });

  it("reinitializes conversation store when services instance changes", () => {
    const services1 = {
      conversationService: mockConversationService,
    } as unknown as RendererProcessServices;

    const services2 = {
      conversationService: {
        listConversations: jest.fn(),
        createConversation: jest.fn(),
        listMessages: jest.fn(),
      },
    } as unknown as RendererProcessServices;

    const { rerender } = render(
      <ServicesProvider services={services1}>
        <div>Test</div>
      </ServicesProvider>,
    );

    expect(mockInitialize).toHaveBeenCalledWith(mockConversationService);
    expect(mockInitialize).toHaveBeenCalledTimes(1);

    // Re-render with different services instance
    rerender(
      <ServicesProvider services={services2}>
        <div>Test Updated</div>
      </ServicesProvider>,
    );

    // Should initialize again with new service
    expect(mockInitialize).toHaveBeenCalledWith(services2.conversationService);
    expect(mockInitialize).toHaveBeenCalledTimes(2);
  });

  it("creates default RendererProcessServices when no services provided", () => {
    render(
      <ServicesProvider>
        <TestComponent />
      </ServicesProvider>,
    );

    expect(screen.getByTestId("services-available")).toHaveTextContent(
      "Services Available",
    );
    expect(
      screen.getByTestId("conversation-service-available"),
    ).toHaveTextContent("Conversation Service Available");
    expect(mockInitialize).toHaveBeenCalledTimes(1);
  });
});
