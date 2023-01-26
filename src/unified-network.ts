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
  [optionalProp: string]: unknown;
}

export interface IUnifiedRequestProcessorConfig {
  method: 'get' | 'post' | 'patch' | 'put' | 'delete' | 'head';
  url: string;
  headers?: { [key: string]: string };
  body?: any;
  [optionalProp: string]: unknown;
}

export interface IUnifiedResponse {
  status: number;
  headers: { [key: string]: string };
  data?: any;
}

export type IUnifiedRequestProcessor = (
  (config: IUnifiedRequestProcessorConfig) => Promise<IUnifiedResponse>
);


export async function httpProcessorFetch({ method, url, headers, body, }: IUnifiedRequestProcessorConfig) {

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

    const method = config.method ?? this.base.method;
    const baseUrl = config.baseUrl ?? this.base.baseUrl;
    const url = config.method ?? this.base.method ?? '/';

    const parameters = {
      ...(this.base.parameters ?? {}),
      ...(config.parameters ?? {}),
    };

    const queries = {
      ...(this.base.queries ?? {}),
      ...(config.queries ?? {}),
    };

    let body = config.body ?? this.base.body;
    const processor = config.processor ?? this.base.processor ?? httpProcessorFetch;


    const otherProps: any = { ...this.base, ...config };
    delete otherProps['method'];
    delete otherProps['baseUrl'];
    delete otherProps['url'];
    delete otherProps['parameters'];
    delete otherProps['queries'];
    delete otherProps['body'];
    delete otherProps['processor'];


    let fullUrl = baseUrl ? joinPaths(baseUrl, url) : url;

    if (parameters && Object.keys(parameters).length > 0) {
      for (const key in parameters) {
        fullUrl = fullUrl.replaceAll(`[${key}]`, parameters[key]);
      }
    }

    if (queries && Object.keys(queries).length > 0) {
      fullUrl = fullUrl + (fullUrl.includes('?') ? '&' : '?') + Object.keys(queries).map(key => `${key}=${queries![key]}`).join('&');
    }


    let headers = {
      ...(this.base?.headers ?? {}),
      ...(config.headers ?? {}),
    };


    if (typeof body === 'object' && body !== null && !(body instanceof FormData) && !(body instanceof URLSearchParams)) {
      body = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
    }


    let responseStatus = undefined;
    let responseData = undefined;
    let responseHeaders = {} as Record<string, string>;


    try {

      const { status: processorStatus, data: processorData, headers: processorHeaders } = await processor({
        ...otherProps,
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


  setHeader(header: string, value: string) {
    this.base.headers![header] = value;
  }

  removeHeader(header: string) {
    delete this.base.headers![header];
  }

  applyHeader(header: string, value: string) {
    if (value === undefined || value == null || value === '') {
      this.removeHeader(header);
    }
    else {
      this.setHeader(header, value);
    }
  }

}
