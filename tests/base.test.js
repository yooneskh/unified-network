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


test('config url', async () => {

  const network = makeUnifiedNetwork({ baseUrl: 'https://api-mirror.herokuapp.com' });

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
