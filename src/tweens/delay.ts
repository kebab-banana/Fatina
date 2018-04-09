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
	private remains: number;

	constructor(duration: number) {
		super();
		this.duration = duration;
		this.tickCb = this.tick.bind(this);
	}

	private tick(dt: number) {
		this.remains = dt * this.timescale;

		while (this.remains > 0) {
			this.elapsed += this.remains;
			const progress = Math.max(Math.min(this.elapsed / this.duration, 1), 0);
			this.emitEvent(this.events.update, [this.remains, progress]);

			if (this.elapsed < this.duration) {
				return;
			}

			this.remains = this.elapsed - this.duration;

			if (this.loop) {
				this.loop.value--;
				if (this.loop.value !== 0) {
					this.resetAndStart(0);
					continue;
				}
			}

			this.complete();
			return;
		}
	}
}
