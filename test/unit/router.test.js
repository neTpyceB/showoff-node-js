import test from 'node:test';
import assert from 'node:assert/strict';
import { matchRoute, toUpstreamUrl } from '../../src/router.js';

test('router matches prefixes and builds upstream urls', () => {
  const routes = [
    { prefix: '/service-a', service: 'service-a', targetUrl: 'http://service-a' },
    { prefix: '/service-b', service: 'service-b', targetUrl: 'http://service-b' }
  ];

  assert.deepEqual(matchRoute('/service-a', routes), routes[0]);
  assert.deepEqual(matchRoute('/service-b/tasks', routes), routes[1]);
  assert.equal(matchRoute('/missing', routes), null);
  assert.equal(
    toUpstreamUrl(routes[1], new URL('http://gateway/service-b/tasks?x=1')),
    'http://service-b/tasks?x=1'
  );
  assert.equal(
    toUpstreamUrl(routes[0], new URL('http://gateway/service-a')),
    'http://service-a/'
  );
});
