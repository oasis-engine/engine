import { Config, Loader, LoaderType } from "../types";

export class TextLoader implements Loader<any>{
  load(url: string): Promise<any>;
  load(config: Config): Promise<any>;
  load(url: string | Config): Promise<any> {
    return undefined;
  }

}
