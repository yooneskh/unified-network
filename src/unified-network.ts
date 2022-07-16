import { joinPaths } from './util';


export interface IUnifiedRequest {
  method?: 'get' | 'post' | 'patch' | 'put' | 'delete' | 'head';
  baseUrl?: string;
  url: string;
  queries?: { [key: string]: string };
  parameters?: { [key: string]: string };
  headers?: { [key: string]: string };
  body?: any;
  processor?: IUnifiedRequestProcessor;
}

export interface IUnifiedRequestProcessorConfig {
  method: 'get' | 'post' | 'patch' | 'put' | 'delete' | 'head';
  url: string;
  headers?: { [key: string]: string };
  body?: any;
}

export interface IUnifiedResponse {
  status: number;
  headers: { [key: string]: string };
  data?: any;
}

export type IUnifiedRequestProcessor = (
  (config: IUnifiedRequestProcessorConfig) => Promise<IUnifiedResponse>
);


async function httpProcessorFetch({ method, url, headers, body }: IUnifiedRequestProcessorConfig) {

  let responseStatus = undefined;
  let responseData = undefined;
  let responseHeaders = undefined;


  const response = await fetch(url, {
    method,
    body,
    headers,
  });


  responseStatus = response.status;
  responseHeaders = Object.fromEntries((response.headers as any).entries()) as Record<string, string>;

  if (response.ok) {

    responseData = await response.text();

    if (responseHeaders['content-type']?.toLowerCase().includes('application/json')) {
      try {
        responseData = JSON.parse(responseData);
      }
      catch (error) {
        throw new Error('could not parse response data ' + (error as Error).message);
      }
    }

  }
  else {
    responseData = await response.text();
  }


  return {
    status: responseStatus,
    headers: responseHeaders,
    data: responseData
  };

}


export class UnifiedNetwork {

  base: Partial<IUnifiedRequest>;

  constructor(base?: Partial<IUnifiedRequest>) {
    this.base = base ?? {};
    this.base.headers ??= {};
  }


  async request(config: IUnifiedRequest) {

    let {
      method,
      baseUrl,
      url,
      parameters,
      queries,
      body,
      processor
    } = { ...(this.base ?? {}), ...config };

    url ??= '/';
    processor ??= httpProcessorFetch;

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


    let responseStatus = undefined;
    let responseData = undefined;
    let responseHeaders = {} as Record<string, string>;


    try {

      const { status: processorStatus, data: processorData, headers: processorHeaders } = await processor({
        url: fullUrl,
        method: method ?? 'get',
        headers,
        body,
      });

      responseStatus = processorStatus;
      responseHeaders = processorHeaders;
      responseData = processorData;

    }
    catch (error: unknown) {

      console.error(error)

      responseStatus = -1;
      responseData = undefined;

    }


    return {
      status: responseStatus,
      data: responseData,
      headers: responseHeaders
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