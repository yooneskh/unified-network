const test = require('node:test');
const assert = require('node:assert/strict');


const { makeUnifiedNetwork } = require('../lib/index');


test('simple', async () => {

  const network = makeUnifiedNetwork();

  const response = await network.get({ url: 'https://www.google.com' });

  assert(response.status === 200);

});


test('base url', async () => {

  const network = makeUnifiedNetwork({});

  const response = await network.get({ baseUrl: 'https://www.google.com', url: '/' });

  assert(response.status === 200);

});


test('base url without url', async () => {

  const network = makeUnifiedNetwork({});

  const response = await network.get({ baseUrl: 'https://www.google.com' });

  assert(response.status === 200);

});


test('config url', async () => {

  const network = makeUnifiedNetwork({ url: 'https://www.google.com' });

  const response = await network.get({});

  assert(response.status === 200);

});


test('basic request', async () => {

  const network = makeUnifiedNetwork({
    baseUrl: 'https://api-mirror.herokuapp.com'
  });

  const { status, data, headers } = await network.get({
    url: 'path',
    queries: {
      'hello': 'world',
    },
  });

  assert(status === 200);

  assert(typeof data === 'object');
  assert(data.method === 'GET');
  assert(data.path === 'path');

  assert('query' in data);
  assert(data.query.hello === 'world');

});


test('advanced request from config', async () => {

  const network = makeUnifiedNetwork({
    method: 'post',
    baseUrl: 'https://api-mirror.herokuapp.com',
    url: 'test/[userid]/book/[bookid]',
    headers: {
      Token: '123',
    },
    parameters: {
      userid: 23,
      bookid: 'the-id'
    },
    queries: {
      account: 'admin'
    },
    body: [
      'hello',
      'world',
    ]
  });

  const { status, data, headers } = await network.request({});

  assert(status === 200);

  assert(typeof data === 'object');
  assert(data.method === 'POST');
  assert(data.path === 'test/23/book/the-id');

  assert(typeof data.headers === 'object');
  assert(data.headers.Token === '123');

  assert('query' in data);
  assert(data.query.account === 'admin');

  assert(!!data.body);
  assert(Array.isArray(data.body));
  assert(data.body.length === 2);
  assert(data.body[0] === 'hello');
  assert(data.body[1] === 'world');

});


test('advanced request from config overriding', async () => {

  const network = makeUnifiedNetwork({
    method: 'post',
    baseUrl: 'https://api-mirror.herokuapp.com',
    url: 'test/[userid]/book/[bookid]',
    headers: {
      Token: '123',
    },
    parameters: {
      userid: 23,
      bookid: 'the-id'
    },
    queries: {
      account: 'admin'
    },
    body: [
      'hello',
      'world',
    ]
  });

  const { status, data, headers } = await network.put({
    url: 'test/[userid]/book/[bookid]/done/[days]?reason=day',
    headers: {
      Token: '33',
      Days: '222'
    },
    parameters: {
      userid: 33,
      bookid: 'id-the',
      days: 5,
    },
    queries: {
      account: 'accountant',
      fails: true
    },
    body: {
      says: 'hello'
    }
  });

  assert(status === 200);

  assert(typeof data === 'object');
  assert(data.method === 'PUT');
  assert(data.path === 'test/33/book/id-the/done/5');

  assert(typeof data.headers === 'object');
  assert(data.headers.Token === '33');
  assert(data.headers.Days === '222');

  assert('query' in data);
  assert(data.query.reason === 'day');
  assert(data.query.account === 'accountant');
  assert(data.query.fails === 'true');

  assert(!!data.body);
  assert(typeof data.body === 'object');
  assert(data.body.says === 'hello');

});
