import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { expect, it } from "vitest";

import type { Info } from "./+types/home";

import Home from "./home";
import { createRouteStub } from "./test-utils/createRouteStub";

const Stub = createRoutesStub([
  createRouteStub<Info>({
    Component: Home,
    path: "/",
  }),
]);

it("renders the loader message", async () => {
  render(<Stub />);
  expect(
    await screen.findByRole("heading", { level: 1, name: "Hello, World!" }),
  ).toBeInTheDocument();
});
