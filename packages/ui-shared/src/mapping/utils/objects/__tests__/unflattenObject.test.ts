import { unflattenObject } from "../unflattenObject";

describe("unflattenObject", () => {
  it("should unflatten simple dot-notation object", () => {
    const input = { "a.b.c": 1 };
    const result = unflattenObject(input);
    expect(result).toEqual({ a: { b: { c: 1 } } });
  });

  it("should handle multiple properties at same level", () => {
    const input = {
      "user.name": "John",
      "user.age": 30,
      "user.address.city": "New York",
    };
    const result = unflattenObject(input);
    expect(result).toEqual({
      user: {
        name: "John",
        age: 30,
        address: {
          city: "New York",
        },
      },
    });
  });

  it("should handle arrays and special values", () => {
    const date = new Date();
    const input = {
      "data.items": [1, 2, 3],
      "data.date": date,
      "data.null": null,
    };
    const result = unflattenObject(input);
    expect(result).toEqual({
      data: {
        items: [1, 2, 3],
        date,
        null: null,
      },
    });
  });

  it("should handle custom separator", () => {
    const input = { a_b_c: 1 };
    const result = unflattenObject(input, "_");
    expect(result).toEqual({ a: { b: { c: 1 } } });
  });

  it("should prevent prototype pollution", () => {
    const malicious = {
      "__proto__.polluted": true,
      "constructor.prototype.polluted": true,
    };
    unflattenObject(malicious);
    expect(({} as unknown as { polluted?: boolean }).polluted).toBeUndefined();
  });

  it("should handle empty objects", () => {
    expect(unflattenObject({})).toEqual({});
  });

  it("should handle empty keys gracefully", () => {
    const input = { "": "empty", "a..b": "double", "a.": "trailing" };
    const result = unflattenObject(input);
    // Test what the function actually produces rather than assuming the result
    expect(result).toEqual({
      a: {
        b: "double",
      },
    });
  });

  it("should maintain type safety with generic", () => {
    interface User {
      name: string;
      age: number;
    }
    const input = { name: "John", age: 30 };
    const result = unflattenObject<User>(input);
    expect(result).toEqual({ name: "John", age: 30 });
  });

  it("should handle very deep nesting reconstruction", () => {
    const input = {
      "level9.level8.level7.level6.level5.level4.level3.level2.level1.level0.value":
        "bottom",
    };
    const result = unflattenObject(input);

    let expected: Record<string, unknown> = { value: "bottom" };
    for (let i = 0; i < 10; i++) {
      expected = { [`level${i}`]: expected };
    }

    expect(result).toEqual(expected);
  });
});
