export default {
  input: 'index.js', // or your main entry
  output: {
    dir: 'dist',
    format: 'cjs'
  },
  external: [
    'net',
    'fs',
    'fs/promises',
    'path',
    '@netlify/blobs'
  ]
};
