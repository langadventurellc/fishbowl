import { pickFields } from "../pickFields";

describe("pickFields", () => {
  it("should pick specified fields", () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 };
    const result = pickFields(obj, ["a", "c"]);
    expect(result).toEqual({ a: 1, c: 3 });
  });

  it("should handle non-existent fields", () => {
    const obj = { a: 1, b: 2 };
    const result = pickFields(obj, ["a", "c" as keyof typeof obj]);
    expect(result).toEqual({ a: 1 });
  });

  it("should handle empty field array", () => {
    const obj = { a: 1, b: 2 };
    const result = pickFields(obj, []);
    expect(result).toEqual({});
  });

  it("should maintain type safety", () => {
    interface User {
      id: number;
      name: string;
      email: string;
      password: string;
    }

    const user: User = {
      id: 1,
      name: "John",
      email: "john@example.com",
      password: "secret",
    };

    const publicUser = pickFields(user, ["id", "name", "email"]);

    expect(publicUser).toEqual({
      id: 1,
      name: "John",
      email: "john@example.com",
    });

    // TypeScript should prevent accessing password
    expect("password" in publicUser).toBe(false);
  });

  it("should prevent prototype pollution", () => {
    const obj = { a: 1, __proto__: { polluted: true } };
    const result = pickFields(obj, ["__proto__" as keyof typeof obj]);
    expect(result).toEqual({});
    expect(({} as unknown as { polluted?: boolean }).polluted).toBeUndefined();
  });

  it("should handle objects with null prototype", () => {
    const obj = Object.create(null);
    obj.a = 1;
    obj.b = 2;
    const result = pickFields(obj, ["a"]);
    expect(result).toEqual({ a: 1 });
  });

  it("should handle complex object types", () => {
    const obj = {
      str: "string",
      num: 42,
      bool: true,
      arr: [1, 2, 3],
      obj: { nested: "value" },
      date: new Date(),
      null: null,
      undef: undefined,
    };

    const result = pickFields(obj, ["str", "num", "arr", "obj"]);
    expect(result).toEqual({
      str: "string",
      num: 42,
      arr: [1, 2, 3],
      obj: { nested: "value" },
    });
  });

  it("should handle constructor property safely", () => {
    const obj = { a: 1, constructor: { polluted: true } };
    const result = pickFields(obj, ["constructor" as keyof typeof obj]);
    expect(result).toEqual({});
    expect(({} as unknown as { polluted?: boolean }).polluted).toBeUndefined();
  });

  it("should handle prototype property safely", () => {
    const obj = { a: 1, prototype: { polluted: true } };
    const result = pickFields(obj, ["prototype" as keyof typeof obj]);
    expect(result).toEqual({});
    expect(({} as unknown as { polluted?: boolean }).polluted).toBeUndefined();
  });

  it("should work with readonly arrays", () => {
    const obj = { a: 1, b: 2, c: 3 };
    const fields: Array<keyof typeof obj> = ["a", "c"];
    const result = pickFields(obj, fields);
    expect(result).toEqual({ a: 1, c: 3 });
  });

  it("should handle symbols as keys", () => {
    const sym1 = Symbol("key1");
    const sym2 = Symbol("key2");
    const obj = {
      [sym1]: "value1",
      [sym2]: "value2",
      regular: "normal",
    };

    const result = pickFields(obj, [sym1, "regular"]);
    expect(result).toEqual({
      [sym1]: "value1",
      regular: "normal",
    });
  });
});
