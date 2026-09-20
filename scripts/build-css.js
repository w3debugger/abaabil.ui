import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { transform, bundle } from 'lightningcss'

const TARGETS = { chrome: 116 << 16, firefox: 125 << 16, safari: 17 << 16 }
const root = new URL('..', import.meta.url).pathname

const out = (p) => { mkdirSync(dirname(join(root, 'dist', p)), { recursive: true }); return join(root, 'dist', p) }

// theme.css: layer order + tokens. The single file consumers override.
const theme = ['tokens/layers.css', 'tokens/primitive.css', 'tokens/semantic.css']
  .map((f) => readFileSync(join(root, 'src', f), 'utf8'))
  .join('\n')

writeFileSync(out('theme.css'), transform({
  filename: 'theme.css', code: Buffer.from(theme), minify: true, targets: TARGETS,
}).code)

// Per-component CSS, emitted alongside its JS.
const components = readdirSync(join(root, 'src')).filter((d) => d !== 'tokens')
const all = [theme]
for (const c of components) {
  const src = join(root, 'src', c, `${c}.css`)
  if (!existsSync(src)) continue
  const css = readFileSync(src, 'utf8')
  writeFileSync(out(`${c}/${c}.css`), transform({
    filename: `${c}.css`, code: Buffer.from(css), minify: true, targets: TARGETS,
  }).code)
  all.push(css)
}

// styles.css: everything, for consumers who just want it all.
writeFileSync(out('styles.css'), transform({
  filename: 'styles.css', code: Buffer.from(all.join('\n')), minify: true, targets: TARGETS,
}).code)

console.log(`css: built theme.css, styles.css, and ${components.length} component stylesheets`)
