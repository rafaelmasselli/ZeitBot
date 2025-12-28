import { parseStringPromise } from "xml2js";

export async function convertXmlToJson<T>(xml: string): Promise<T> {
  try {
    const result = await parseStringPromise(xml);
    return result as T;
  } catch (error) {
    throw new Error(`Error converting XML to JSON: ${(error as Error).message}`);
  }
}

