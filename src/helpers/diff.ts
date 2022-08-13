import { Store } from "effector";
import diff from "microdiff";

export interface DifferenceCreate {
	type: "CREATE";
	path: (string | number)[];
	value: any;
}
export interface DifferenceRemove {
	type: "REMOVE";
	path: (string | number)[];
	oldValue: any;
}
export interface DifferenceChange {
	type: "CHANGE";
	path: (string | number)[];
	value: any;
	oldValue: any;
}

export type Difference = 
    | DifferenceCreate
    | DifferenceRemove
    | DifferenceChange

export type DiffState<T> = {
    oldState: T
    differences: Difference[]
}

export const useDiff = <T>($state: Store<T>) => {
    const $states = $state.map<{state: T|undefined}|undefined>((newState, x) => {
        return {state: newState, oldState: x, differences: diff(x?.state || {}, newState)}
    })

    return {$states}
}