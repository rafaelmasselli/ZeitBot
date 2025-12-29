export class StringUtils {
  static removeSpaces(text: string): string {
    return text.replace(/\s+/g, "");
  }

  static normalize(text: string): string {
    return text.trim().toLowerCase();
  }

  static joinArray(values: string[]): string {
    return values.join(",");
  }
}

