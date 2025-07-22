import React from "react";
import { render } from "@testing-library/react-native";
import { Dashboard } from "../Dashboard";

describe("Dashboard", () => {
  it("renders without crashing", () => {
    const { getByText } = render(<Dashboard />);
    expect(getByText("Hello from Fishbowl Mobile!")).toBeTruthy();
  });
});
