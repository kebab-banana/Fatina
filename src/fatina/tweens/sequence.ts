import { BaseTween } from './baseTween';
import { ITicker } from '../core/interfaces/ITicker';
import { ISequence } from '../core/interfaces/ISequence';
import { ITween } from '../core/interfaces/ITween';
import { IPlayable } from '../core/interfaces/IPlayable';
import { Callback } from './callback';
import { Delay } from './delay';
import { State } from '../core/enum/state';

/**
 * Sequence: used to animate other tweens or sequence
 * Can play them sequentially or in parallel
 *
 * @export
 * @class Sequence
 * @extends {BaseTween}
 * @implements {ISequence}
 * @implements {ITicker}
 * @implements {IPlayable}
 */
export class Sequence extends BaseTween implements ISequence, ITicker, IPlayable {
	private eventTick: {(dt: number): void}[] = [];
	private tweens: ((ITween | IPlayable)[])[] = [];
	private eventStepStart: {(tween: ITween | IPlayable): void}[] | undefined;
	private eventStepEnd: {(tween: ITween | IPlayable): void}[] | undefined;
	public currentTween: (ITween | IPlayable)[] | undefined;
	private sequenceIndex = 0;

	public get Count(): number {
		return this.tweens.length;
	}

	constructor() {
		super();
		this.tickCb = this.Tick.bind(this);
	}

	public Start(): ISequence {
		super.Start();
		return this;
	}

	protected LoopInit() {
		this.sequenceIndex = 0;
		for (let i = 0; i < this.tweens.length; i++) {
			let tweenArray = this.tweens[i];
			for (let j = 0; j < tweenArray.length; j++) {
				let tween = tweenArray[j];
				(tween as BaseTween).Reset();
			}
		}
	}

	public SetParent(ticker: ITicker): ISequence {
		super.SetParent(ticker);
		return this;
	}

	public AddTickListener(cb: (dt: number) => void): void {
		this.eventTick.unshift(cb);
	}

	public RemoveTickListener(cb: (dt: number) => void): void {
		let index = this.eventTick.indexOf(cb);
		if (index !== -1) {
			this.eventTick.splice(index, 1);
		}
	}

	private Tick(dt: number) {
		if (this.state === State.Finished || this.state === State.Killed) {
			return;
		}
		let localDt = dt * this.timescale;
		this.elapsed += localDt;
		this.LocalTick(localDt);
	}

	private LocalTick(dt: number, remains?: boolean) {
		// If no current tween, take the first one and start it
		if (!this.currentTween) {
			this.NextTween();
		}

		if (this.currentTween) {
			// Tick every listener
			for (let i = this.eventTick.length - 1; i >= 0; i--) {
				this.eventTick[i](dt);
			}

			// Dont emit update event for remains dt
			if (remains !== true) {
				this.EmitEvent(this.eventUpdate, [dt, 0]);
			}
		}

		let remainsDt = dt;

		// Current tween over
		if (this.currentTween) {
			for (let i = 0; i < this.currentTween.length; i++) {
				if (this.currentTween[i].state !== State.Finished) {
					return;
				}
			}

			let first = this.currentTween[0];
			remainsDt = first.elapsed - first.duration;

			this.EmitEvent(this.eventStepEnd, [this.currentTween[0]]);
			this.currentTween = undefined;
			this.sequenceIndex++;

			if (remainsDt > 0.01) {
				this.LocalTick(remainsDt, true);
				return;
			}
		}

		// Complete
		if (!this.currentTween && this.tweens.length === this.sequenceIndex) {
			this.loop--;
			if (this.loop === 0) {
				this.Complete();
			} else {
				this.ResetAndStart(remainsDt);
			}
		}
	}

	private NextTween() {
		this.currentTween = this.tweens[this.sequenceIndex];
		if (this.currentTween) {
			for (let i = 0; i < this.currentTween.length; i++) {
				let tween = this.currentTween[i];
				tween.Start();
			}

			this.EmitEvent(this.eventStepStart, [this.currentTween[0]]);
		}
	}

	public Append(tween: ITween | ISequence): ISequence {
		tween.SetParent(this);
		this.tweens[this.tweens.length] = [tween];
		return this;
	}

	public AppendCallback(cb: () => void): ISequence {
		let playable = new Callback(cb);
		playable.SetParent(this);
		this.tweens[this.tweens.length] = [playable];
		return this;
	}

	public AppendInterval(duration: number): ISequence {
		let playable = new Delay(duration);
		playable.SetParent(this);
		this.tweens[this.tweens.length] = [playable];
		return this;
	}

	public Prepend(tween: ITween | ISequence): ISequence {
		tween.SetParent(this);
		this.tweens.unshift([tween]);
		return this;
	}

	public PrependCallback(cb: () => void): ISequence {
		let playable = new Callback(cb);
		playable.SetParent(this);
		this.tweens.unshift([playable]);
		return this;
	}

	public PrependInterval(duration: number): ISequence {
		let playable = new Delay(duration);
		playable.SetParent(this);
		this.tweens.unshift([playable]);
		return this;
	}

	public Skip(): void {
		if (this.state === State.Killed || this.state === State.Finished) {
			console.warn('cant skip this tween', this.state);
			return;
		}
		for (let i = 0; i < this.tweens.length; i++) {
			let tweenArray = this.tweens[i];
			for (let j = 0; j < tweenArray.length; j++) {
				let tween = tweenArray[j];
				if (tween.state === State.Killed || tween.state === State.Finished) {
					continue;
				}
				if (tween.elapsed === 0) {
					this.EmitEvent(this.eventStepStart, [tween]);
				}
				tween.Skip();
				this.EmitEvent(this.eventStepEnd, [tween]);
			}
		}
		super.Skip();
	}

	public Kill(): void {
		if (this.state === State.Killed) {
			return;
		}

		for (let i = 0; i < this.tweens.length; i++) {
			let tweenArray = this.tweens[i];
			for (let j = 0; j < tweenArray.length; j++) {
				tweenArray[j].Kill();
			}
		}

		super.Kill();
	}

	public Join(tween: ITween | ISequence): ISequence {
		if (this.tweens.length === 0) {
			return this.Append(tween);
		}
		tween.SetParent(this);
		this.tweens[this.tweens.length - 1].push(tween);
		return this;
	}

	public SetTimescale(scale: number): ISequence {
		this.timescale = scale;
		return this;
	}

	public SetLoop(loop: number): ISequence {
		this.loop = Math.round(loop);
		return this;
	}

	public Default() {
		super.Default();
		this.tweens.length = 0;
		this.currentTween = undefined;
		this.sequenceIndex = 0;
	}

	public OnStart(cb: () => void): ISequence {
		if (!this.eventStart) {
			this.eventStart = new Array(0);
		}
		this.eventStart[this.eventStart.length] = cb;
		return this;
	}

	public OnUpdate(cb: (dt: number, progress: number) => void): ISequence {
		if (!this.eventUpdate) {
			this.eventUpdate = new Array(0);
		}
		this.eventUpdate[this.eventUpdate.length] = cb;
		return this;
	}

	public OnKilled(cb: () => void): ISequence {
		if (!this.eventKill) {
			this.eventKill = new Array(0);
		}
		this.eventKill[this.eventKill.length] = cb;
		return this;
	}

	public OnComplete(cb: () => void): ISequence {
		if (!this.eventComplete) {
			this.eventComplete = new Array(0);
		}
		this.eventComplete[this.eventComplete.length] = cb;
		return this;
	}

	public OnStepStart(cb: (index: ITween | IPlayable) => void): ISequence {
		if (!this.eventStepStart) {
			this.eventStepStart = new Array(0);
		}
		this.eventStepStart[this.eventStepStart.length] = cb;
		return this;
	}

	public OnStepEnd(cb: (index: ITween | IPlayable) => void): ISequence {
		if (!this.eventStepEnd) {
			this.eventStepEnd = new Array(0);
		}
		this.eventStepEnd[this.eventStepEnd.length] = cb;
		return this;
	}
}
