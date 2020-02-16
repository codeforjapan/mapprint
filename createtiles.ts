const axios = require('axios');
const fs = require('fs');
const shell = require('shelljs')

const TARGET_DIR = './dist/data/';
const CONFIG_DIR = './assets/config/'

// create target directory
if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, {recursive: true});
}

// load config
const list = require(`${CONFIG_DIR}list.json`)
list.map((name) => {
  // load map config
  console.log(`loading ${CONFIG_DIR}${name}`)
  const config = require(`${CONFIG_DIR}${name}`)
  config.sources.forEach((source) => {
    // download source file
    if (!fs.existsSync(`${TARGET_DIR}${config.map_id}`)) {
      fs.mkdirSync(`${TARGET_DIR}${config.map_id}`, {recursive: true});
    }
    console.log(`downloading ${source.url}...`)
    axios.get(source.url).then((response) => {
      // currently, this is supporting only kml
      const file_path = `${TARGET_DIR}${config.map_id}/${source.id}.${source.type}`
      fs.writeFile(file_path, response.data, (err) => {
        // failed
        if(err){
          console.log("Downloading kml file failed" + err)
          throw err
        }
        // success
        else{
          console.log(`Downloaded ${source.id}.${source.type}`)
          // convert kml files to xyz tile
          shell.exec(`./create_tiles.sh ${file_path}`)
        }
      })
    })
  })
})