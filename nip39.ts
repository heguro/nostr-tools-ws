var _fetch: any

try {
  _fetch = fetch
} catch {}

export function useFetchImplementation(fetchImplementation: any) {
  _fetch = fetchImplementation
}

export async function validateGithub(
  pubkey: string,
  username: string,
  proof: string,
  options: {
    headers?: {[name: string]: string}
    userAgent?: string
  } = {}
): Promise<boolean> {
  let {headers = {}, userAgent = ''} = options

  try {
    let res = await (
      await _fetch(`https://gist.github.com/${username}/${proof}/raw`, {
        headers: {
          ...headers,
          ...(userAgent ? {'User-Agent': userAgent} : {})
        }
      })
    ).text()
    return (
      res ===
      `Verifying that I control the following Nostr public key: ${pubkey}`
    )
  } catch (_) {
    return false
  }
}
