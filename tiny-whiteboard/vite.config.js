import { defineConfig } from 'vite'
const path = require('path')

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'es2015',
    lib: {
      entry: path.resolve(__dirname, './src/index.js'),
      name: 'tiny-whiteboard',
      fileName: format => `tiny-whiteboard.${format}.js`
    }
  }
})

/*
"main": "./dist/tiny-whiteboard.umd.js",
"module": "./dist/tiny-whiteboard.es.js",
"exports": {
  ".": {
    "import": "./dist/tiny-whiteboard.es.js",
    "require": "./dist/tiny-whiteboard.umd.js"
  }
}
*/
