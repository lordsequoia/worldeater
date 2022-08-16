import { Event, createEffect, createEvent, forward, guard } from "effector";
import { Request, Response } from "express";
import { FileWatcherEventName, loadJsonArrayFile, trackState } from "../helpers";
import { WorldEater } from "./worldEater";

export type UserEntry<T = undefined> = {
  uuid: string;
  name: string;
} & T

export type UsercacheEntry = UserEntry<{
  expiresOn: string;
}>

export type OpsEntry = UserEntry<{
  level: MemberLevel;
  bypassesPlayerLimit: boolean;
}>
export type WhitelistEntry = UserEntry<{}>
export type BannedPlayersEntry = UserEntry<{
  created: string,
  source: UserEntry['name'],
  expires: 'forever' | string,
  reason?: string
}>

export type BannedIpsEntry = {

}

export type MemberFlag = 'operator' | 'whitelisted' | 'banned' | 'cached'
export type MemberFlags = {[key in MemberFlag]: boolean}

export type MemberLevel = 0 | 1 | 2 | 3 | 4

export type MemberEntry = {
  uuid: string;
  name: string;
  cached?: {
    uuid: string;
    name: string;
    expiresOn: string;
  },
  operator?: {
    level?: MemberLevel;
    bypassesPlayerLimit?: boolean;
  },
  banned?: {
    created: string,
    source: UserEntry['name'],
    expires: 'forever' | string,
    reason?: string
  },
  flags?: MemberFlags
}

export type Members = Record<string, MemberEntry>

export const useUsercache = ({ storage }: { storage: WorldEater['storage'] }, patchState: Event<Partial<Members>>) => {
  const source = storage.matchFileEvent('usercache.json')

  const loadUsercacheFx = createEffect(async ({ fullPath }: { fullPath: string }) => {
    const jsonData = await loadJsonArrayFile<UsercacheEntry>(fullPath)

    return jsonData
  })

  const processUsercacheFx = createEffect((usercache: UsercacheEntry[]) => {
    const patches = {} as Members

    for (const { uuid, name, expiresOn } of usercache) {
      patches[uuid] = {
        uuid,
        name,
        cached: {uuid, name, expiresOn},
      }
    }

    return patches
  })

  const eventNamed = (v: FileWatcherEventName) =>
    ({ eventName }: { eventName: FileWatcherEventName }) =>
      eventName === v

  guard({
    source,
    filter: eventNamed('add'),
    target: loadUsercacheFx
  })

  forward({
    from: loadUsercacheFx.doneData,
    to: processUsercacheFx,
  })

  forward({
    from: processUsercacheFx.doneData,
    to: patchState,
  })

  return { loadUsercacheFx, processUsercacheFx }
}

export const useMemberList = (app: WorldEater) => {
  const members$ = trackState<Members>({})

  const listMembers = createEvent<{ request: Request, response: Response }>()
  
  listMembers.watch(({ response }) => {
    const members = members$.$state.getState()

    response.json({ members, count: members.length })
  })

  const usercache = useUsercache(app, members$.patchState)

  app.server.get('/members', (request, response) => listMembers({ request, response }))

  return {
    members$,
    usercache,
    listMembers,
  }
}

export type MemberListFeature = ReturnType<typeof useMemberList>