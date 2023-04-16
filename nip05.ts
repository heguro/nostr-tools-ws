import {ProfilePointer} from './nip19'

var _fetch: any

try {
  _fetch = fetch
} catch {}

export function useFetchImplementation(fetchImplementation: any) {
  _fetch = fetchImplementation
}

export async function searchDomain(
  domain: string,
  query = '',
  options: {
    headers?: {[name: string]: string}
    userAgent?: string
  } = {}
): Promise<{[name: string]: string}> {
  let {headers = {}, userAgent = ''} = options

  try {
    let res = await (
      await _fetch(`https://${domain}/.well-known/nostr.json?name=${query}`, {
        headers: {
          ...headers,
          ...(userAgent ? {'User-Agent': userAgent} : {})
        }
      })
    ).json()

    return res.names
  } catch (_) {
    return {}
  }
}

export async function queryProfile(
  fullname: string,
  options: {
    headers?: {[name: string]: string}
    userAgent?: string
  } = {}
): Promise<ProfilePointer | null> {
  let {headers = {}, userAgent = ''} = options

  let [name, domain] = fullname.split('@')

  if (!domain) {
    // if there is no @, it is because it is just a domain, so assume the name is "_"
    domain = name
    name = '_'
  }

  if (!name.match(/^[A-Za-z0-9-_.]+$/)) return null
  if (!domain.includes('.')) return null

  let res
  try {
    res = await (
      await _fetch(`https://${domain}/.well-known/nostr.json?name=${name}`, {
        headers: {
          ...headers,
          ...(userAgent ? {'User-Agent': userAgent} : {})
        }
      })
    ).json()
  } catch (err) {
    return null
  }

  if (!res?.names?.[name]) return null

  let pubkey = res.names[name] as string
  let relays = (res.relays?.[pubkey] || []) as string[] // nip35

  return {
    pubkey,
    relays
  }
}
