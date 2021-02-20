const fs = require('fs')
const path = require('path')
const axios = require('axios')
const shell = require('shelljs')

const TARGET_DIR = './dist/data/'
const CONFIG_DIR = './assets/config/'

// create target directory
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true })
}

const _make_tilejson = (dir, base_name) => {
  const metadata = require(`${dir}${base_name}/metadata.json`)
  // console.log(metadata)
  const vector_layers = JSON.parse(metadata.json)
  delete metadata.json
  metadata.vector_layers = vector_layers.vector_layers
  metadata.center = metadata.center.split(',').map(v => parseFloat(v))
  metadata.bounds = metadata.bounds.split(',').map(v => parseFloat(v))
  metadata.pixel_scale = 256
  metadata.tilejson = '2.0.0'
  metadata.tile = [
    `https://kamimap.com/data/${base_name}/zxy/{z}/{x}/{y}.pbf`
  ]
  fs.writeFile(`${dir}${base_name}/tilejson.json`, JSON.stringify(metadata), (err) => {
    if (err) {
      console.log('Wrighting tilejson.json failed: ' + err)
    }
  })
}

// load config
const list = require(`${CONFIG_DIR}list.json`)
list.map((name) => {
  // load map config
  console.log(`loading ${CONFIG_DIR}${name}`)
  const config = require(`${CONFIG_DIR}${name}`)
  const funcs = config.sources.map((source) => {
    return new Promise((resolve, reject) => {
      // download source file
      if (!fs.existsSync(`${TARGET_DIR}${config.map_id}`)) {
        fs.mkdirSync(`${TARGET_DIR}${config.map_id}`, { recursive: true })
      }
      console.log(`downloading ${source.url}...`)
      axios.get(source.url).then((response) => {
        // currently, this is supporting only kml
        const file_path = `${TARGET_DIR}${config.map_id}/${source.id}.${source.type}`
        fs.writeFile(file_path, response.data, (err) => {
          // failed
          if (err) {
            console.log('Downloading kml file failed' + err)
            reject(err)
          }
          // success
          else {
            console.log(`Downloaded ${source.id}.${source.type}`)
            // convert kml files to xyz tile
            shell.exec(`./create_tiles.sh ${file_path}`)
            resolve()
          }
        })
      })
    })
  })
  Promise.all(funcs).then(() => {
    shell.exec(`./merge_tiles.sh ${name} ${TARGET_DIR}`)
    const base_name = path.basename(name, '.json')
    _make_tilejson(TARGET_DIR, base_name)
  })
})
