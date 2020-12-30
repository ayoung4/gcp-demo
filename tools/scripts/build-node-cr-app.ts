import * as path from 'path';
import depcheck = require('depcheck');
import * as fs from 'fs';

const packageJson = require('../../package.json') // Take root NX package.json
const ROOT_PATH = path.resolve(__dirname + '/../..')
const srcProjectPath = `${ROOT_PATH}/apps/node-cr-app`
const distProjectPath = `${ROOT_PATH}/dist/apps/node-cr-app`

console.log('Creating device package.json and Dockerfile files...')

let packageJsonStub = {
  main: 'main.js',
  scripts: {
    start: 'node main.js'
  }
}

depcheck(
  distProjectPath,
  {
    package: {
      dependencies: packageJson.dependencies,
    },
  },
  unused => {
    let dependencies = packageJson.dependencies
    if (unused.dependencies.length > 0)
      unused.dependencies.reduce((acc, dep, i) => {
        delete acc[dep]
        return acc
      }, dependencies)

    fs.promises.mkdir(path.dirname(distProjectPath), { recursive: true }).then(() => {
      fs.promises.writeFile(
        `${distProjectPath}/package.json`,
        JSON.stringify({
          ...packageJsonStub,
          dependencies,
        })
      )
        .then(() =>
          console.log(`${distProjectPath}/package.json written successfully.`)
        )
        .then(() =>
          fs.promises.copyFile(
            `${srcProjectPath}/Dockerfile`,
            `${distProjectPath}/Dockerfile`,
          )
        )
        .then(() =>
          console.log(`${distProjectPath}/Dockerfile written successfully.`)
        )
        .catch(e => console.error(e))
    })
  }
)