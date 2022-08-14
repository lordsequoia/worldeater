import { createApi, createEffect, createEvent, createStore, forward } from "effector"
import diff from "microdiff"
import { Difference } from "./diff"

export const trackState = <T extends Object>(initialState: T, keepAmount?: number) => {
    const $state = createStore<T>(initialState)

    const {updateState, patchState} = createApi($state, {
        updateState: (_state, payload: T) => payload,
        patchState: (state, payload: Partial<T>) => Object.assign({}, state, payload),
    })

    const $history = $state.map<T[]>((state, history) => {
        const states = (history || []) as T[]

        return [...states, state].splice((keepAmount || 2) * -1) as T[]
    })

    const commitDifferences = createEvent<Difference[]>()
    const commitDifference = createEvent<Difference>()

    const parseDifferencesFx = createEffect((history: T[]) => {
        const original = history.length >= 2 ? history[history.length-2] : undefined
        const updated = history[history.length-1]
        
        return diff(original || {}, updated)
    })

    forward({from: $history, to: parseDifferencesFx})
    forward({from: parseDifferencesFx.doneData, to: commitDifferences})

    commitDifferences.watch(differences => {
        for (const item of differences) {
            commitDifference(item)
        }
    })

    return {$state, $history, updateState, patchState, commitDifference}
}

// export type TrackState = typeof trackState
// export type TrackedState<T> = ReturnType<typeof trackState<T>>