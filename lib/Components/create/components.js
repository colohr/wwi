const fxy = require('fxy')
const Components = require('../Components')
const wwi_components_folder = fxy.join(__dirname,'../components')
const wwi_components = new Components(wwi_components_folder,'wwi')
//exports
module.exports = wwi_components