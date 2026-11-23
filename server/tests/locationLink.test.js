import test from 'node:test';
import assert from 'node:assert/strict';

import { buildBusinessLocationHref, buildDirectionsHref } from '../../client/src/utils/location.js';

test('uses the exact business map link when provided', () => {
  const exactLink = 'https://maps.app.goo.gl/example';
  const href = buildBusinessLocationHref('Connaught Place, Delhi', exactLink);

  assert.equal(href, exactLink);
});

test('falls back to a Google Maps search for the city name', () => {
  const href = buildBusinessLocationHref('Connaught Place, Delhi');

  assert.ok(href.includes('google.com/maps/search'));
  assert.ok(href.includes(encodeURIComponent('Connaught Place, Delhi')));
});

test('builds directions link to location', () => {
  const href = buildDirectionsHref('Connaught Place, Delhi');
  assert.ok(href.includes('google.com/maps/dir'));
  assert.ok(href.includes(encodeURIComponent('Connaught Place, Delhi')));
});

