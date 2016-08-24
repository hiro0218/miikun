'use strict'

const path = require('path')
const pkg = require('./app/package.json')
const platform = process.env.PLATFORM_TARGET || 'all'

let config = {
  // Name of electron app
  // Will be used in production builds
  name: 'miikun',

  // Use ESLint (extends `standard`)
  // Further changes can be made in `.eslintrc.js`
  eslint: true,

  // webpack-dev-server port
  port: 1234,

  // electron-packager options
  // Docs: https://simulatedgreg.gitbooks.io/electron-vue/content/docs/building_your_app.html
  building: {
    // darwin
    'app-version': pkg.version,
    'app-bundle-id': 'jp.0218.app.Miikun',
    // win32
    'version-string': {
      FileDescription: pkg.description,
      FileVersion: pkg.version,
      ProductName: pkg.name,
      ProductVersion: pkg.version,
      CompanyName: pkg.author,
      OriginalFilename: pkg.name,
      InternalName: pkg.name,
      LegalCopyright: pkg.copyright
    },
    arch: 'x64',
    asar: true,
    dir: path.join(__dirname, 'app'),
    icon: path.join(__dirname, 'app/static/icon'),
    ignore: /node_modules|src|main.ejs|icons/,
    out: path.join(__dirname, 'builds'),
    overwrite: true,
    platform
  }
}

config.building.name = config.name

module.exports = config
