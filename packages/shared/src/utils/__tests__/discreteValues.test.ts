import {
  DISCRETE_VALUES,
  DISCRETE_STEP,
  DISCRETE_VALUE_SET,
  DiscreteValue,
  snapToNearestDiscrete,
  isDiscreteValue,
  convertToDiscreteValue,
} from "../discreteValues";

describe("discreteValues", () => {
  describe("constants", () => {
    test("DISCRETE_VALUES contains correct values", () => {
      expect(DISCRETE_VALUES).toEqual([0, 20, 40, 60, 80, 100]);
    });

    test("DISCRETE_STEP is 20", () => {
      expect(DISCRETE_STEP).toBe(20);
    });

    test("DISCRETE_VALUE_SET contains all discrete values", () => {
      expect(DISCRETE_VALUE_SET).toEqual(new Set([0, 20, 40, 60, 80, 100]));
    });
  });

  describe("snapToNearestDiscrete", () => {
    test("snaps exact discrete values to themselves", () => {
      expect(snapToNearestDiscrete(0)).toBe(0);
      expect(snapToNearestDiscrete(20)).toBe(20);
      expect(snapToNearestDiscrete(40)).toBe(40);
      expect(snapToNearestDiscrete(60)).toBe(60);
      expect(snapToNearestDiscrete(80)).toBe(80);
      expect(snapToNearestDiscrete(100)).toBe(100);
    });

    test("snaps values closer to lower discrete value", () => {
      expect(snapToNearestDiscrete(1)).toBe(0);
      expect(snapToNearestDiscrete(9)).toBe(0);
      expect(snapToNearestDiscrete(21)).toBe(20);
      expect(snapToNearestDiscrete(29)).toBe(20);
      expect(snapToNearestDiscrete(41)).toBe(40);
      expect(snapToNearestDiscrete(49)).toBe(40);
    });

    test("snaps values closer to higher discrete value", () => {
      expect(snapToNearestDiscrete(11)).toBe(20);
      expect(snapToNearestDiscrete(19)).toBe(20);
      expect(snapToNearestDiscrete(31)).toBe(40);
      expect(snapToNearestDiscrete(39)).toBe(40);
      expect(snapToNearestDiscrete(51)).toBe(60);
      expect(snapToNearestDiscrete(59)).toBe(60);
      expect(snapToNearestDiscrete(91)).toBe(100);
      expect(snapToNearestDiscrete(99)).toBe(100);
    });

    test("rounds halfway values up", () => {
      expect(snapToNearestDiscrete(10)).toBe(20); // 10 is halfway between 0 and 20
      expect(snapToNearestDiscrete(30)).toBe(40); // 30 is halfway between 20 and 40
      expect(snapToNearestDiscrete(50)).toBe(60); // 50 is halfway between 40 and 60
      expect(snapToNearestDiscrete(70)).toBe(80); // 70 is halfway between 60 and 80
      expect(snapToNearestDiscrete(90)).toBe(100); // 90 is halfway between 80 and 100
    });

    test("clamps values below 0 to 0", () => {
      expect(snapToNearestDiscrete(-1)).toBe(0);
      expect(snapToNearestDiscrete(-10)).toBe(0);
      expect(snapToNearestDiscrete(-100)).toBe(0);
    });

    test("clamps values above 100 to 100", () => {
      expect(snapToNearestDiscrete(101)).toBe(100);
      expect(snapToNearestDiscrete(150)).toBe(100);
      expect(snapToNearestDiscrete(1000)).toBe(100);
    });

    test("handles floating point inputs", () => {
      expect(snapToNearestDiscrete(19.5)).toBe(20);
      expect(snapToNearestDiscrete(39.9)).toBe(40);
      expect(snapToNearestDiscrete(60.1)).toBe(60);
      expect(snapToNearestDiscrete(79.4)).toBe(80);
    });

    test("is deterministic for same input", () => {
      const testValue = 37.5;
      const result1 = snapToNearestDiscrete(testValue);
      const result2 = snapToNearestDiscrete(testValue);
      expect(result1).toBe(result2);
    });

    test("returns values that are discrete", () => {
      const testValues = [-5, 0.5, 15.7, 33.3, 45, 67.8, 89.2, 105];

      testValues.forEach((value) => {
        const result = snapToNearestDiscrete(value);
        expect(DISCRETE_VALUES).toContain(result);
      });
    });
  });

  describe("isDiscreteValue", () => {
    test("returns true for valid discrete values", () => {
      expect(isDiscreteValue(0)).toBe(true);
      expect(isDiscreteValue(20)).toBe(true);
      expect(isDiscreteValue(40)).toBe(true);
      expect(isDiscreteValue(60)).toBe(true);
      expect(isDiscreteValue(80)).toBe(true);
      expect(isDiscreteValue(100)).toBe(true);
    });

    test("returns false for invalid discrete values", () => {
      expect(isDiscreteValue(1)).toBe(false);
      expect(isDiscreteValue(10)).toBe(false);
      expect(isDiscreteValue(30)).toBe(false);
      expect(isDiscreteValue(50)).toBe(false);
      expect(isDiscreteValue(70)).toBe(false);
      expect(isDiscreteValue(90)).toBe(false);
    });

    test("returns false for values outside range", () => {
      expect(isDiscreteValue(-1)).toBe(false);
      expect(isDiscreteValue(101)).toBe(false);
      expect(isDiscreteValue(-20)).toBe(false);
      expect(isDiscreteValue(120)).toBe(false);
    });

    test("returns false for floating point values", () => {
      expect(isDiscreteValue(20.1)).toBe(false);
      expect(isDiscreteValue(39.9)).toBe(false);
      expect(isDiscreteValue(60.0001)).toBe(false);
    });

    test("handles edge cases", () => {
      expect(isDiscreteValue(0.0)).toBe(true); // 0.0 equals 0
      expect(isDiscreteValue(NaN)).toBe(false);
      expect(isDiscreteValue(Infinity)).toBe(false);
      expect(isDiscreteValue(-Infinity)).toBe(false);
    });
  });

  describe("convertToDiscreteValue", () => {
    test("is an alias for snapToNearestDiscrete", () => {
      const testValues = [-10, 0, 15, 30, 45, 60, 75, 90, 110];

      testValues.forEach((value) => {
        expect(convertToDiscreteValue(value)).toBe(
          snapToNearestDiscrete(value),
        );
      });
    });

    test("returns discrete values", () => {
      const result = convertToDiscreteValue(37.5);
      expect(isDiscreteValue(result)).toBe(true);
    });
  });

  describe("type safety", () => {
    test("DiscreteValue type accepts valid values", () => {
      // TypeScript compile-time test
      const validValues: DiscreteValue[] = [0, 20, 40, 60, 80, 100];
      expect(validValues).toHaveLength(6);
    });

    test("snapToNearestDiscrete returns DiscreteValue type", () => {
      const result = snapToNearestDiscrete(50);
      // This should compile without TypeScript errors
      const discreteResult: DiscreteValue = result;
      expect(discreteResult).toBe(60);
    });
  });

  describe("function purity", () => {
    test("snapToNearestDiscrete is pure", () => {
      const input = 37;
      const result1 = snapToNearestDiscrete(input);
      const result2 = snapToNearestDiscrete(input);
      expect(result1).toBe(result2);
    });

    test("isDiscreteValue is pure", () => {
      const input = 40;
      const result1 = isDiscreteValue(input);
      const result2 = isDiscreteValue(input);
      expect(result1).toBe(result2);
    });

    test("convertToDiscreteValue is pure", () => {
      const input = 73;
      const result1 = convertToDiscreteValue(input);
      const result2 = convertToDiscreteValue(input);
      expect(result1).toBe(result2);
    });
  });

  describe("performance characteristics", () => {
    test("operations complete quickly", () => {
      const startTime = Date.now();

      // Run operations many times
      for (let i = 0; i < 10000; i++) {
        snapToNearestDiscrete(Math.random() * 120 - 10);
        isDiscreteValue(Math.floor(Math.random() * 120));
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in well under 100ms
      expect(duration).toBeLessThan(100);
    });
  });
});
