import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const source = fs.readFileSync(new URL('../../src/features/earth/minigames/solarStormLogic.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exports = {};
new Function('exports', compiled)(exports);
const { initialStormState, stormReducer, stormFailure } = exports;
const run = (state, ...actions) => actions.reduce(stormReducer, state);

test('crew require the alarm and separate actions; hatch requires both and backup', () => {
  let state = run(initialStormState('normal'), 'start', 'crewA', 'hatch');
  assert.equal(state.crewA, false);
  assert.equal(state.hatch, false);
  assert.equal(state.actions, 7);
  state = run(state, 'alarm', 'crewA', 'backup', 'hatch');
  assert.equal(state.hatch, false);
  state = run(state, 'crewB', 'hatch');
  assert.equal(state.hatch, true);
});

test('blocked route consumes an action and undo restores it', () => {
  const state = run(initialStormState(), 'start', 'alarm', 'blockedA');
  assert.equal(state.actions, 6);
  assert.equal(state.crewA, false);
  const undone = stormReducer(state, 'undo');
  assert.equal(undone.actions, 7);
  assert.equal(undone.alarm, true);
});

test('telemetry packets are optional and unavailable after protection', () => {
  const state = run(initialStormState(), 'start', 'packet', 'telemetry', 'packet');
  assert.equal(state.packets, 1);
  assert.equal(state.actions, 6);
  assert.equal(state.feedback, 'antennaRetracted');
});

test('normal mode supports a safe strategy with one packet and fails without protection', () => {
  const win = run(initialStormState('normal'), 'start', 'alarm', 'crewA', 'crewB', 'backup', 'hatch', 'packet', 'telemetry', 'resolve');
  assert.equal(win.phase, 'result');
  assert.equal(win.packets, 1);
  assert.equal(stormFailure(win), null);
  const fail = run(initialStormState('normal'), 'start', 'alarm', 'crewA', 'impact', 'resolve');
  assert.equal(fail.phase, 'result');
  assert.equal(stormFailure(fail), 'crewOutside');
});
