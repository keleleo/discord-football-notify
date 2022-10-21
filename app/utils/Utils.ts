export class Utils {
  public static copy<T>(object: T): T {
    return JSON.parse(JSON.stringify(object));
  }
}
