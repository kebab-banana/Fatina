// Generated by dts-bundle v0.7.2

export { EasingType as Easing };
export let time: number;
export function Elapsed(): number;
export function Init(disableAutoTick?: boolean): boolean;
export function SetTimescale(scale: number): void;
export function Pause(): void;
export function Resume(): void;
export function Destroy(): void;
export function Update(timestamp: number): any;
export function Tween(obj: any, properties: string[]): ITween;
export function Sequence(): ISequence;
export function Ticker(name: string): ITicker;

export interface ITween extends IControl {
    Default(): void;
    Init(object: any, properties: string[]): void;
    Start(): ITween;
    From(from: any): ITween;
    To(to: any, duration: number): ITween;
    Modify(diff: any, updateTo: boolean): void;
    SetParent(ticker: ITicker): ITween;
    SetLoop(loop: number): ITween;
    SetRelative(relative: boolean): ITween;
    SetEasing(type: EasingType | string): ITween;
    SetTimescale(scale: number): ITween;
    ToSequence(): ISequence;
    OnStart(cb: () => void): ITween;
    OnUpdate(cb: (dt: number, progress: number) => void): ITween;
    OnKilled(cb: () => void): ITween;
    OnComplete(cb: () => void): ITween;
}

export interface ISequence extends IControl {
    Count: number;
    Default(): void;
    Start(): ISequence;
    SetParent(ticker: ITicker): ISequence;
    SetTimescale(scale: number): ISequence;
    SetLoop(loop: number): ISequence;
    Append(tween: ITween | ISequence): ISequence;
    AppendCallback(cb: () => void): ISequence;
    AppendInterval(duration: number): ISequence;
    Prepend(tween: ITween | ISequence): ISequence;
    PrependCallback(cb: () => void): ISequence;
    PrependInterval(duration: number): ISequence;
    Join(tween: ITween | ISequence): ISequence;
    OnStart(cb: () => void): ISequence;
    OnStepStart(cb: (tween: ITween | IPlayable) => void): ISequence;
    OnStepEnd(cb: (index: ITween | IPlayable) => void): ISequence;
    OnUpdate(cb: (dt: number, progress: number) => void): ISequence;
    OnKilled(cb: () => void): ISequence;
    OnComplete(cb: () => void): ISequence;
}

export interface ITicker extends IControl {
    AddTickListener(cb: (dt: number) => void): void;
    RemoveTickListener(cb: (dt: number) => void): void;
    SetTimescale(scale: number): void;
}

export enum EasingType {
    Linear = 0,
    InQuad = 1,
    OutQuad = 2,
    InOutQuad = 3,
    InCubic = 4,
    OutCubic = 5,
    InOutCubic = 6,
    InQuart = 7,
    OutQuart = 8,
    InOutQuart = 9,
    InSine = 10,
    OutSine = 11,
    InOutSine = 12,
    InCirc = 13,
    OutCirc = 14,
    InOutCirc = 15,
    InQuint = 16,
    OutQuint = 17,
    InOutQuint = 18,
    InExponential = 19,
    OutExponential = 20,
    InOutExponential = 21,
    InElastic = 22,
    OutElastic = 23,
    InOutElastic = 24,
    InBack = 25,
    OutBack = 26,
    InOutBack = 27,
    InBounce = 28,
    OutBounce = 29,
    InOutBounce = 30,
}

export interface IControl {
    elapsed: number;
    duration: number;
    state: State;
    Start(): void;
    Pause(): void;
    Resume(): void;
    Kill(): void;
    Reset(): void;
    Skip(): void;
}

export interface IPlayable extends IControl {
    state: State;
}

export enum State {
    Idle = 0,
    Run = 1,
    Pause = 2,
    Finished = 3,
    Killed = 4,
}

