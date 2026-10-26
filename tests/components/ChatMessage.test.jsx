// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChatMessage } from "@/components/chatbot/ChatMessage";

describe("ChatMessage", () => {
  it("renders model output as plain text, never as HTML", () => {
    const { container } = render(
      <ChatMessage
        message={{
          role: "assistant",
          content: '<img src=x onerror="alert(1)"> <b>hi</b>',
        }}
      />,
    );

    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("b")).toBeNull();
    expect(screen.getByText(/onerror/)).toBeInTheDocument();
  });

  it("announces the typing state while waiting for the first chunk", () => {
    render(
      <ChatMessage message={{ role: "assistant", content: "" }} streaming />,
    );
    expect(screen.getByText("Assistant is typing")).toBeInTheDocument();
  });
});
