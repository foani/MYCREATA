import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import dts from 'rollup-plugin-dts';

import pkg from './package.json';

export default [
  // 브라우저 번들 (UMD)
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/crelink.js',
        format: 'umd',
        name: 'CreLink',
        sourcemap: true,
      },
      {
        file: 'dist/crelink.min.js',
        format: 'umd',
        name: 'CreLink',
        sourcemap: true,
        plugins: [terser()]
      }
    ],
    plugins: [
      peerDepsExternal(),
      resolve({
        browser: true
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        exclude: ["**/__tests__/**"]
      })
    ]
  },
  
  // ESM 번들
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        exclude: ["**/__tests__/**"]
      })
    ]
  },
  
  // React 컴포넌트 번들
  {
    input: 'src/react/index.ts',
    output: [
      {
        file: 'dist/react/index.js',
        format: 'esm',
        sourcemap: true
      }
    ],
    external: ['react', 'react-dom'],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist/types',
        exclude: ["**/__tests__/**"]
      })
    ]
  },
  
  // 타입 정의 파일
  {
    input: 'dist/types/index.d.ts',
    output: [{ file: 'dist/types/index.d.ts', format: 'es' }],
    plugins: [dts()]
  },
  {
    input: 'dist/types/react/index.d.ts',
    output: [{ file: 'dist/react/index.d.ts', format: 'es' }],
    plugins: [dts()]
  }
];
