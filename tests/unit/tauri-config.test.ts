import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

type TauriConf = {
  build?: {
    devUrl?: string
    frontendDist?: string
  }
  bundle?: {
    targets?: string[]
  }
}

describe('tauri.conf.json scaffold invariants', () => {
  it('keeps Nuxt devUrl/frontendDist aligned with scripts', async () => {
    const confPath = path.resolve(process.cwd(), 'src-tauri', 'tauri.conf.json')
    const raw = await readFile(confPath, 'utf8')
    const conf = JSON.parse(raw) as TauriConf

    expect(conf.build?.devUrl).toBe('http://127.0.0.1:3000')
    expect(conf.build?.frontendDist).toBe('../dist')
  })

  it('keeps bundle targets constrained during scaffold', async () => {
    const confPath = path.resolve(process.cwd(), 'src-tauri', 'tauri.conf.json')
    const raw = await readFile(confPath, 'utf8')
    const conf = JSON.parse(raw) as TauriConf

    expect(conf.bundle?.targets).toContain('app')
    expect(conf.bundle?.targets).not.toContain('dmg')
  })
})
