const fxy = require('fxy')
const Components = require('../Components')
//const Folder = require('../Folder')

const wwi_components_folder = fxy.join(__dirname,'../components')
const wwi_components = new Components(wwi_components_folder,'wwi')
//wwi_components.folders_router = Folder.router('wwi',{folder:wwi_components_folder,name:'wwi'})

//exports
module.exports = wwi_components