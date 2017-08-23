const fxy = require('fxy')
const wxy = require('wxy')
//const get_template = require('es6-template-strings/compile')
//const set_template = require('es6-template-strings/resolve-to-string')

const code_file = fxy.join(__dirname,'code.es6')
//const code_template = get_template(fxy.readFileSync(code_file,'utf8'))

const template = wxy.template(code_file)

//exports
module.exports.code = get_code

//shared actions
function get_code(collection){
	return template.get(collection)
}