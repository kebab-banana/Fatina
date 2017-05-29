import * as test from 'tape';
import { TweenType } from '../src/fatina/core/enum/tweenType';
let fatina = require('../src/fatina/index');

fatina.Init();

test('[Fatina.Manager] Update manually', function (t: any) {
	let previousTime = fatina.time;
	fatina.Update(1);

	t.equal(previousTime + 1, fatina.time, 'Check the global time was properly updated');
	t.equal(previousTime + 1, fatina.Elapsed(), 'Check the fatina elapsed time was properly updated');

	t.end();
});

test('[Fatina.Manager] Set timescale', function (t: any) {
	let previousTime = fatina.time;
	let previousElapsed = fatina.Elapsed();

	fatina.SetTimescale(0.5);
	fatina.Update(1);

	t.equal(previousTime + 1, fatina.time, 'Check the global time was properly updated without timescale');
	t.equal(previousElapsed + 0.5, fatina.Elapsed(), 'Check the fatina elapsed time was properly updated with the timescale');
	fatina.SetTimescale(1);

	t.end();
});

test('[Fatina.Manager] Pause / Resume', function (t: any) {
	let previousTime = fatina.time;
	let previousElapsed = fatina.Elapsed();

	fatina.Pause();
	fatina.Update(1);

	t.equal(previousTime + 1, fatina.time, 'Check the global time is still updated');
	t.equal(previousElapsed, fatina.Elapsed(), 'Check the fatina elapsed time is paused');

	fatina.Resume();
	fatina.Update(1);

	t.equal(previousTime + 2, fatina.time, 'Check the global time is still updated');
	t.equal(previousElapsed + 1, fatina.Elapsed(), 'Check the fatina elapsed time is updated and was properly resumed');

	t.end();
});

test('[Fatina.Manager] Create tween', function (t: any) {
	let obj = { x: 0 };
	let tween = fatina.Tween(obj, ['x']).To({ x: 1 }, 1);
	tween.Start();

	t.equal(0, obj.x, 'check the tween is not starting magically');
	t.equal(TweenType.Tween, tween.Type, 'Check the tween is really a tween type');

	fatina.Update(0.5);
	t.equal(0.5, obj.x, 'check the tween is halfway through');

	fatina.Update(0.5);
	t.equal(1, obj.x, 'check the tween is finished');
	t.equal(1, tween.Elapsed, 'check the tween is still there with final values');

	fatina.Update(0.5);
	t.equal(0, tween.Elapsed, 'check the tween has been cleaned 1 update after the end');

	t.end();
});

test('[Fatina.Manager] Create sequence', function (t: any) {
	let obj = { x: 0 };
	let sequence = fatina.Sequence();
	sequence.AppendInterval(1);
	sequence.Append(fatina.Tween(obj, ['x']).To({ x: 1 }, 1));
	sequence.Start();

	t.equal(0, obj.x, 'check the sequence is not starting magically');
	t.equal(TweenType.Sequence, sequence.Type, 'Check the tween is really a sequence type');

	fatina.Update(2);
	t.equal(1, obj.x, 'check the sequence is finished');
	t.equal(2, sequence.Elapsed, 'check the sequence is still there with final values');

	fatina.Update(0.5);
	t.equal(0, sequence.Elapsed, 'check the sequence has been cleaned 1 update after the end');

	t.end();
});

test('[Fatina.Manager] Check pooling', function (t: any) {
	t.end();
});
