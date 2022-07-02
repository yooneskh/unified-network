import { joinPaths } from './util';


export interface IUnifiedRequest {
  method?: 'get' | 'post' | 'patch' | 'put' | 'delete' | 'head';
  baseUrl?: string;
  url: string;
  queries?: { [key: string]: string };
  parameters?: { [key: string]: string };
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

    let { method, baseUrl, url, parameters, queries, body } = { ...(this.base ?? {}), ...config };

    url ??= '/';

    let fullUrl = baseUrl ? joinPaths(baseUrl, url) : url;

    if (parameters) {
      for (const key in parameters) {
        fullUrl = fullUrl.replaceAll(`[${key}]`, parameters[key]);
      }
    }

    if (queries) {
      fullUrl = fullUrl + (fullUrl.includes('?') ? '&' : '?') + Object.keys(queries).map(key => `${key}=${queries![key]}`).join('&');
    }


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
    let responseHeaders = {} as Record<string, string>;


    try {

      const response = await fetch(fullUrl, {
        method: method ?? 'get',
        body,
        headers,
      });


      status = response.status;
      responseHeaders = Object.fromEntries((response.headers as any).entries());

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
      else {
        data = await response.text();
      }

    }
    catch {
      status = -1;
      data = undefined;
    }


    return {
      status,
      data,
      headers: responseHeaders,
    };

  }


  async get(config: IUnifiedRequest) {
    return this.request({
      ...config,
      method: 'get',
    });
  }

  async post(config: IUnifiedRequest) {
    return this.request({
      ...config,
      method: 'post',
    });
  }

  async put(config: IUnifiedRequest) {
    return this.request({
      ...config,
      method: 'put',
    });
  }

  async patch(config: IUnifiedRequest) {
    return this.request({
      ...config,
      method: 'patch',
    });
  }

  async delete(config: IUnifiedRequest) {
    return this.request({
      ...config,
      method: 'delete',
    });
  }

  async head(config: IUnifiedRequest) {
    return this.request({
      ...config,
      method: 'head',
    });
  }

}