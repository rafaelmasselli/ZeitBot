export class Utils {
  static removeSpaces(value: string): string {
    return value.replace(/\s/g, "");
  }

  static joinStringArray(values: string[]): string {
    return values.join(",");
  }

  static isLastNewsOlderThan(lastNewsDate: Date, hours: number): boolean {
    const hoursInMs = hours * 60 * 60 * 1000;
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - lastNewsDate.getTime();
    return timeDifference > hoursInMs;
  }
}
