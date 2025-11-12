import typescript from 'rollup-plugin-typescript2';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'BitlightWallet',
      globals: {
        'bitcoinjs-lib': 'bitcoin',
        'bitcoin-address-validation': 'bitcoinAddressValidation',
      },
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
    },
  ],
  external: ['bitcoinjs-lib', 'bitcoin-address-validation'],
  plugins: [typescript({ tsconfig: './tsconfig.build.json' }), terser()],
};
