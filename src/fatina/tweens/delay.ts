import { IPlayable } from '../core/interfaces/IPlayable';
import { BaseTween } from './baseTween';

/**
 * Fake tween used to delay other tweens in a sequence
 *
 * @export
 * @class Delay
 * @extends {BaseTween}
 * @implements {IPlayable}
 */
export class Delay extends BaseTween<Delay> implements IPlayable {
	private remainsDt: number;

	constructor(duration: number) {
		super();
		this.duration = duration;
		this.tickCb = this.Tick.bind(this);
	}

	private Tick(dt: number) {
		this.remainsDt = dt * this.timescale;

		while (this.remainsDt > 0) {
			this.elapsed += this.remainsDt;
			const progress = Math.max(Math.min(this.elapsed / this.duration, 1), 0);
			this.EmitEvent(this.eventUpdate, [this.remainsDt, progress]);

			if (this.elapsed < this.duration) {
				return;
			}

			this.remainsDt = this.elapsed - this.duration;

			if (this.loop) {
				this.loop.value--;
				if (this.loop.value !== 0) {
					this.ResetAndStart(0);
					continue;
				}
			}

			this.Complete();
			return;
		}
	}
}
