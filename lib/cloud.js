const wxy = require('wxy')

class WWIApp extends wxy.Cloud{
	constructor(...x){
		super(...x)
		let options = this.options
		if(!options.wwi) {
			options.wwi = {modules:true,components:true}
			this.options = options
		}
	}
}

//exports
module.exports = folder=>new WWIApp(folder)