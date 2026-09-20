import { nodeResolve } from '@rollup/plugin-node-resolve'
import esbuild from 'rollup-plugin-esbuild'
import preserveDirectives from 'rollup-plugin-preserve-directives'
import { globSync } from 'node:fs'

export default {
  input: globSync('src/**/*.jsx'),
  output: {
    dir: 'dist',
    format: 'es',
    preserveModules: true,
    preserveModulesRoot: 'src',
    entryFileNames: '[name].js',
  },
  external: (id) =>
    id === 'react' || id.startsWith('react/') || id === 'react-dom' || id.endsWith('.css'),
  plugins: [
    nodeResolve({ extensions: ['.js', '.jsx'] }),
    esbuild({ jsx: 'automatic', minify: true, target: 'es2022', include: /\.jsx?$/ }),
    preserveDirectives(),
  ],
  onwarn(warning, warn) {
    // Rollup warns on directives it cannot hoist; the plugin handles them.
    if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return
    warn(warning)
  },
}
