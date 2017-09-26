const wxy = require('wxy')
class WWIApp extends wxy.Cloud{}
module.exports = folder=>new WWIApp(folder)