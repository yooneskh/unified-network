import { joinPaths } from "./util";


export interface IUnifiedRequest {
  method?: string;
  baseUrl?: string;
  url: string;
  headers?: { [key: string]: string };
  body?: any;
}


export class UnifiedNetwork {

  base: Partial<IUnifiedRequest>;

  constructor(base?: Partial<IUnifiedRequest>) {
    this.base = base ?? {};
    this.base.headers ??= {};
  }


  async request(config: IUnifiedRequest) {

    let { method, baseUrl, url, body } = { ...(this.base ?? {}), ...config };

    let fullUrl = baseUrl ? joinPaths(baseUrl, url) : url;

    let headers = {
      ...(this.base?.headers ?? {}),
      ...(config.headers ?? {}),
    };


    if (typeof body === 'object' && body !== null) {
      body = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
    }


    let status = undefined;
    let data = undefined;


    const response = await fetch(fullUrl, {
      method: method ?? 'get',
      body,
      headers,
    });


    status = response.status;

    if (response.ok) {

      data = await response.text();

      if ((response.headers.get('content-type')?.indexOf('application/json') ?? -1) >= 0) {
        try {
          data = JSON.parse(data);
        }
        catch (error) {
          console.error('could not parse response data');
          console.error(error);
        }
      }

    }


    return {
      status,
      data,
      headers: Object.fromEntries((response.headers as any).entries()),
    };

  }


}