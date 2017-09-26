const fxy = require('fxy')
const wxy = require('wxy')
const code_file = fxy.join(__dirname,'code.es6')
const template = wxy.template(code_file)

//exports
module.exports.code = get_code

//shared actions
function get_code(collection){ return template.get(collection) }