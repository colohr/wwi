window.fxy.exports('snappy',(snappy)=>{
	
	class SnappyGrid{
		constructor(element){
			this.element = element
			this.color = element.hasAttribute('grid-color') ? this.element.getAttribute('grid-color'):'transparent'
			this.radius = element.hasAttribute('grid-radius') ? this.element.getAttribute('grid-radius'):'0'
			this.padding = get_padding(this)
			this.container.setAttribute('pointers-container','')
		}
		actions(){ return this.pointers.actions() }
		get container(){ return this.element.query('[grid]') }
		get columns(){ return this.element.hasAttribute('grid-columns') ? parseInt(this.element.getAttribute('grid-columns')):3 }
		get item(){
			return {
				width:get_width(this)
			}
		}
		get items(){ return Array.from(this.container.children) }
		get pointers(){ return this.element.pointers }
		get size(){ return get_size(this.container) }
		get stylesheet(){ return get_stylesheet(this.element.shadow) }
		style(){
			let pointers = this.pointers
			pointers.move = this.container
			this.stylesheet.innerHTML = snappy.style(this)
			return this
		}
		reset(){
			this.stylesheet.innerHTML = ''
			return this.items.map(item=>{
				item.style.width=''
				item.remove()
				return item
			})
		}
	}
	//exports
	snappy.grid = get_grid
	//shared actions
	function get_grid(element){return new SnappyGrid(element)}
	
	function get_padding(grid){
		let value = grid.element.getAttribute('grid-padding')
		return value !== null ? parseInt(value):0
	}
	
	function get_size(element){
		return {
			width:element.clientWidth,
			height:element.clientHeight
		}
	}
	
	function get_stylesheet(container){
		let style = container.querySelector('style[grid-style]')
		if(style === null){
			style = document.createElement('style')
			style.setAttribute('grid-style','')
			let first = container.children.item(0)
			container.insertBefore(style,first)
		}
		return style
	}
	
	function get_width(grid){
		return grid.size.width / grid.columns
	}
	
})