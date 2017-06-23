import { State } from '../core/enum/state';
import { ISequence } from '../core/interfaces/ISequence';
import { ITween } from '../core/interfaces/ITween';
import { easeNames, easeTypes } from '../easing/easing';
import { EasingType } from '../easing/easingType';
import { BaseTween } from './baseTween';
import { Sequence } from './sequence';

/**
 * Tween: Used to animate values of an object
 *
 * @export
 * @class Tween
 * @extends {BaseTween}
 * @implements {ITween}
 */
export class Tween extends BaseTween<Tween> implements ITween {
	private object: any;
	private properties: string[];
	private from: any;
	private to: any;
	private yoyo = 0;
	private steps = 0;
	private currentFrom: any;
	private currentTo: any;
	private remainsDt: number;
	private relative = false;
	private ease: (t: number) => number;
	private easeId: EasingType | string;

	constructor(object: any, properties: string[], data?: any) {
		super();

		this.object = object;
		this.properties = properties;
		this.tickCb = this.Tick.bind(this);

		if (data) {
			this.Unserialize(data);
		}
	}

	/**
	 * Used to define the object and the properties modified by this tween
	 *
	 * @param {*} object
	 * @param {string[]} properties
	 *
	 * @memberOf Tween
	 */
	public Init(object: any, properties: string[]) {
		this.object = object;
		this.properties = properties;
	}

	/**
	 * Method used to serialize the tween properties
	 *
	 * @returns
	 *
	 * @memberOf Tween
	 */
	public Serialize(): any {
		return {
			elapsed: this.elapsed,
			duration: this.duration,
			loop: this.loop,
			timescale: this.timescale,
			properties: this.properties,
			from: this.from,
			to: this.to,
			yoyo: this.yoyo,
			steps: this.steps,
			relative: this.relative,
			ease: this.easeId,
			eventStart: this.eventStart,
			eventRestart: this.eventRestart,
			eventUpdate: this.eventUpdate,
			eventKill: this.eventKill,
			eventComplete: this.eventComplete
		}
	}

	/**
	 * Method used to set the tween settings from a properties object
	 *
	 * @param {*} data
	 *
	 * @memberOf Tween
	 */
	public Unserialize(data: any): void {
		this.elapsed = data.elapsed || 0;
		this.duration = data.duration || 0;
		this.loop = data.loop || 1,
		this.timescale = data.timescale || 1;
		this.properties = data.properties || [];
		this.from = data.from;
		this.to = data.to;
		this.yoyo = data.yoyo || 0;
		this.steps = data.steps || 0;
		this.relative = data.relative || false;
		this.SetEasing(data.ease || EasingType.Linear);
		this.eventStart = data.eventStart;
		this.eventRestart = data.eventRestart;
		this.eventUpdate = data.eventUpdate;
		this.eventKill = data.eventKill;
		this.eventComplete = data.eventComplete;
	}

	/**
	 * Method used on start to check the values of this tween
	 *
	 * @protected
	 *
	 * @memberOf Tween
	 */
	protected Validate() {
		// Check the object
		if (!this.object) {
			throw new Error('Cant Tween a undefined object');
		}

		// Check the properties of that object
		for (let i = 0; i < this.properties.length; i++) {
			const prop = this.properties[i];
			if (!(prop in this.object)) {
				throw new Error('Cant Tween an unknown property' + prop);
			}
		}

		// Check this tween will be updated
		if (!this.parent) {
			throw new Error('Cant Start a tween without ticker');
		}

		// Easing
		if (!this.ease) {
			this.easeId = EasingType.Linear;
			this.ease = easeTypes[EasingType.Linear];
		}

		this.CheckPosition();
	}

	/**
	 * Method used to calculate currentFrom/currentTo based on the config
	 *
	 * @protected
	 *
	 * @memberOf Tween
	 */
	protected CheckPosition() {
		if (!this.currentFrom) {
			this.currentFrom = {};
		}
		if (!this.currentTo) {
			this.currentTo = {};
		}

		for (let i = 0; i < this.properties.length; i++) {
			const prop = this.properties[i];

			// From
			if (!this.from) {
				this.currentFrom[prop] = this.object[prop];
			} else {
				this.currentFrom[prop] = this.from[prop];
				this.object[prop] = this.from[prop];
			}

			// Relative
			if (this.relative) {
				this.currentTo[prop] = this.object[prop] + this.to[prop];
			} else {
				this.currentTo[prop] = this.to[prop];
			}
		}
	}

	private Tick(dt: number) {
		if (this.state === State.Finished || this.state === State.Killed) {
			return;
		}

		this.remainsDt = dt * this.timescale;

		while (this.remainsDt > 0) {
			this.elapsed += this.remainsDt;
			const progress = Math.max(Math.min(this.elapsed / this.duration, 1), 0);
			let val = this.ease(progress);
			if (this.steps !== 0) {
				val = Math.round(val * this.steps) / this.steps;
			}
			if (this.object) {
				for (let i = 0; i < this.properties.length; i++) {
					const prop = this.properties[i];
					this.object[prop] = this.currentFrom[prop] + (this.currentTo[prop] - this.currentFrom[prop]) * val;
				}
			}
			this.EmitEvent(this.eventUpdate, [this.remainsDt, progress]);

			if (this.elapsed < this.duration) {
				return;
			}

			this.remainsDt = this.elapsed - this.duration;

			// Yoyo effect ( A -> B -> A )
			if (this.yoyo > 0) {
				this.Reverse();
				this.ResetAndStart(0);
				this.yoyo--;
				continue;
			}

			// Loop management
			this.loop--;
			if (this.loop === 0) {
				this.Complete();
				return;
			}

			this.CheckPosition();
			this.ResetAndStart(0);
		}
	}

	/**
	 * Method used to set the values at the beginning of the tween
	 *
	 * @param {*} from
	 * @returns {ITween}
	 *
	 * @memberOf Tween
	 */
	public From(from: any): ITween {
		this.from = from;
		return this;
	}

	/**
	 * Method used to set the values at the end of the tween
	 *
	 * @param {*} to
	 * @param {number} duration
	 * @returns {ITween}
	 *
	 * @memberOf Tween
	 */
	public To(to: any, duration: number): ITween {
		this.to = to;
		this.duration = duration;
		return this;
	}

	/**
	 * Method used to define if the tween as to work in relative or not
	 *
	 * @param {boolean} relative
	 * @returns {ITween}
	 *
	 * @memberOf Tween
	 */
	public SetRelative(relative: boolean): ITween {
		this.relative = relative;
		return this;
	}

	/**
	 * To apply a modifier on a current tween
	 *
	 * @param {*} diff
	 * @param {boolean} updateTo
	 *
	 * @memberOf Tween
	 */
	public Modify(diff: any, updateTo: boolean): void {
		for (let i = 0; i < this.properties.length; i++) {
			const prop = this.properties[i];
			if (!diff.hasOwnProperty(prop)) {
				continue;
			}
			this.object[prop] += diff[prop];
			if (updateTo) {
				this.currentTo[prop] += diff[prop];
			} else {
				this.currentFrom[prop] += diff[prop];
			}
		}
	}

	/**
	 * Method used to reverse the tween
	 *
	 * @memberOf Tween
	 */
	public Reverse(): void {
		let previous = this.currentFrom;
		this.currentFrom = this.currentTo;
		this.currentTo = previous;

		previous = this.from;
		this.from = this.to;
		this.to = previous;

		const elapsed = (1 - (this.elapsed / this.duration)) * this.duration;
		this.elapsed = Math.round(elapsed * 1000) / 1000;

		if (this.state === State.Finished) {
			this.Reset(true);
			this.Start();
		}
	}

	/**
	 * Method used to reverse the tween N times at the end
	 *
	 * @param {number} time
	 * @returns {ITween}
	 *
	 * @memberOf Tween
	 */
	public Yoyo(time: number): ITween {
		this.yoyo = time;
		return this;
	}

	/**
	 * Method used to Quantify the tween value to a certain amount of steps
	 *
	 * @param {number} steps
	 * @returns {ITween}
	 *
	 * @memberOf Tween
	 */
	public SetSteps(steps: number): ITween {
		this.steps = steps;
		return this;
	}

	/**
	 * Method used to create a sequence with this tween as first value.
	 * Usually used with .AppendInterval(1250) or .PrependInterval(160) to add a delay
	 *
	 * @returns {ISequence}
	 *
	 * @memberOf Tween
	 */
	public ToSequence(): ISequence {
		if (!this.parent) {
			throw new Error('Cant convert to a sequence, parent ticker not defined');
		}
		return new Sequence().SetParent(this.parent).Append(this);
	}

	private Easing(type: EasingType | string): (t: number) => number {
		const name = type as string;
		const isNumber = !isNaN(parseFloat(name));

		if (isNumber) {
			const index = parseInt(name, 10);
			if (index in easeTypes) {
				return easeTypes[index];
			}
		}

		if (name in easeNames) {
			return easeNames[name];
		}

		throw new Error('Unknown ease method ' + type);
	}

	/**
	 * Method used to set the type of easing for this tween
	 *
	 * @param {(EasingType | string)} type
	 * @returns {ITween}
	 *
	 * @memberOf Tween
	 */
	public SetEasing(type: EasingType | string): ITween {
		this.easeId = type;
		this.ease = this.Easing(type);
		return this;
	}

	/**
	 * Method used when the tween is reset (loop)
	 *
	 * @protected
	 *
	 * @memberOf Tween
	 */
	protected LoopInit() {
		this.elapsed = 0;
	}

	/**
	 * Method used set everything back to normal values
	 *
	 *
	 * @memberOf Tween
	 */
	public Default() {
		super.Default();
		this.object = undefined;
		this.properties.length = 0;
		this.from = undefined;
		this.to = undefined;
		this.currentFrom = undefined;
		this.currentTo = undefined;
		this.relative = false;
	}
}
