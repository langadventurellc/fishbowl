import { build, context } from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV === 'development';

const config = {
  entryPoints: [path.resolve(__dirname, 'src/preload/index.ts')],
  outfile: path.resolve(__dirname, 'dist/preload/src/preload/index.js'),
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  external: ['electron'],
  sourcemap: isDev,
  minify: !isDev,
  tsconfig: path.resolve(__dirname, 'tsconfig.preload.json'),
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  loader: {
    '.ts': 'ts',
  },
  resolveExtensions: ['.ts', '.js'],
};

if (process.argv.includes('--watch')) {
  // Watch mode for development
  const ctx = await context({
    ...config,
    plugins: [
      {
        name: 'rebuild-notify',
        setup(build) {
          build.onEnd(result => {
            if (result.errors.length === 0) {
              console.log(
                `[${new Date().toLocaleTimeString()}] Preload bundle rebuilt successfully`,
              );
            } else {
              console.error('Preload bundle build failed:', result.errors);
            }
          });
        },
      },
    ],
  });

  await ctx.watch();
  console.log('Watching preload script for changes...');
} else {
  // One-time build
  try {
    await build(config);
    console.log('Preload script bundled successfully');
  } catch (error) {
    console.error('Preload bundle build failed:', error);
    process.exit(1);
  }
}
