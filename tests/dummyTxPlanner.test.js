const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateDummyTxCount, pickExtraDummyTxCount } = require('../src/runner/dummyTxPlanner');

test('pickExtraDummyTxCount returns inclusive lower and upper bounds', () => {
  assert.equal(pickExtraDummyTxCount(() => 0), 6);
  assert.equal(pickExtraDummyTxCount(() => 0.999999), 10);
});

test('calculateDummyTxCount adds random extra on top of remaining target txs', () => {
  assert.equal(calculateDummyTxCount({ totalTargetTx: 49, txCount: 43, topUpOnly: false, rng: () => 0 }), 12);
  assert.equal(calculateDummyTxCount({ totalTargetTx: 49, txCount: 49, topUpOnly: false, rng: () => 0.999999 }), 10);
});

test('calculateDummyTxCount supports top-up-only mode for today', () => {
  assert.equal(calculateDummyTxCount({ totalTargetTx: 49, txCount: 51, topUpOnly: true, rng: () => 0.4 }), 8);
});
