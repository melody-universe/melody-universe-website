import { expect, it } from "vitest";

import { loader } from "./home";

it("presents an environment variable through the loader", () => {
  expect(
    loader({
      context: { VALUE_FROM_EXPRESS: "Hello, World!" },
      params: {},
      request: new Request("http://app/"),
    }),
  ).toEqual({ message: "Hello, World!" });
});
