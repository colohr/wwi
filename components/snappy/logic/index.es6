window.fxy.exports('snappy',(snappy)=>{
	snappy.extension = [{
		name:'Pointers',
		module:'behavior'
	}].concat(window.components.snappy.mix('Element'))
})