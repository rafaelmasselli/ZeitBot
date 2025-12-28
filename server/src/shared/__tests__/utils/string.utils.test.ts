import { StringUtils } from "../../utils/string.utils";

describe("StringUtils", () => {
  describe("removeSpaces", () => {
    it("should remove all spaces from string", () => {
      const result = StringUtils.removeSpaces("hello world test");
      expect(result).toBe("helloworldtest");
    });

    it("should handle empty string", () => {
      const result = StringUtils.removeSpaces("");
      expect(result).toBe("");
    });

    it("should handle string with only spaces", () => {
      const result = StringUtils.removeSpaces("   ");
      expect(result).toBe("");
    });

    it("should handle string with multiple consecutive spaces", () => {
      const result = StringUtils.removeSpaces("hello    world");
      expect(result).toBe("helloworld");
    });

    it("should handle string without spaces", () => {
      const result = StringUtils.removeSpaces("helloworld");
      expect(result).toBe("helloworld");
    });

    it("should handle string with tabs and newlines", () => {
      const result = StringUtils.removeSpaces("hello\tworld\ntest");
      expect(result).toBe("helloworldtest");
    });
  });
});

