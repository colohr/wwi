window.fxy.exports('snappy',(snappy,fxy)=>{
	let template = fxy.tag`
		:host{ contain:paint; }
		[grid]{
			display:block;
			position:relative;
			perspective:1000px;
			image-rendering: -webkit-optimize-contrast;
			image-rendering: crisp-edges;
			-webkit-backface-visibility:hidden;
			backface-visibility: hidden;
		}
		[grid-item-container]{
			border-width:1px;
			border-style:solid;
			border-color:transparent;
			display:inline-block;
			height:${'height'}px;
			width:${'width'}px;
			overflow:visible;
			box-sizing:border-box;
			vertical-align:top;
			transition: border 100ms linear;
			will-change:border;
		}
		[drag-active] [grid-item-container]{
			border-color:${'color'};
		}
		[grid-item-container][aria-grabbed="true"] [grid-item]{
			opacity:0;
		}
		[grid] [grid-item]{
			position:absolute;
			transform:translate3d(0,0,0);
			transform-style: flat;
			top:${'offset'}px;
			left:${'offset'}px;
			height:auto;
			max-width:${'max_width'};
			transition:transform 230ms cubic-bezier(0.333, 0.5, 0, 1);
			transition:transform 0.2s cubic-bezier(0.333, 0, 0, 1);
			will-change:transform;
		}
		
		[grid-item]:active{
			cursor: grabbing; cursor: -moz-grabbing; cursor: -webkit-grabbing;
		}
		[grid] [aria-grabbed="true"] [grid-item]{
			cursor: grabbing; cursor: -moz-grabbing; cursor: -webkit-grabbing;
		}
		
		${'rules'}
	`;
	
	//exports
	snappy.style = get_style
	//shared actions
	function get_rule({height,width},{i,row,column,border}){
		let x = width * column
		let y = height * row
		return `
			[grid-item-container]:nth-of-type(${i+1}){${border.radius}${border.color}}
			[grid-item-container]:nth-of-type(${i+1}) [grid-item]{
				transform:translate3d(${x}px,${y}px,0);
			}
		`
	}
	function get_rules(grid,item){
		let items = grid.items
		let rules = []
		let count = items.length
		let row = 0
		let column = 0
		let height = null
		let radius = grid.radius
		let rows = Math.round(count / grid.columns)
		item.color = grid.color
		
		for(let i=0;i<count;i++){
			let container = items[i]
			container.setAttribute('grid-item-container','')
			let target = container.querySelector('*:first-child')
			if(target){
				target.style.width = item.width+'px'
				target.setAttribute('grid-item','')
				let local_name = target.localName
				if(height === null){
					if(local_name === 'img'){
						height = target.height
						item.height = height
					}
					else{
						height = container.clientHeight
						item.height = height
					}
					let target_width = fxy.is.number(target.width) ? target.width:target.clientWidth
					item.max_width = (target_width - grid.padding)+'px'
					item.offset = grid.padding / 2
				}
				if(local_name !== 'img') {
					container.draggable=true
					target.style.height = (height-grid.padding)+'px'
					target.style.maxHeight = (height-grid.padding)+'px'
				}
			}
			
			rules.push(get_rule(item,get_item(row,column,i)))
			if(column === grid.columns-1) {
				column = 0
				row = row+1
			}
			else column = column+1
		}
		//return value
		return rules.join('\n')
		//shared actions
		function get_item(row,column,i){
			let value = []
			let radius_value = []
			let last = column === grid.columns-1 || i === count-1
			if(row === 0){
				if(column === 0) radius_value.push(`border-top-left-radius:${radius}px;`)
				else if(last) radius_value.push(`border-top-right-radius:${radius}px;`)
			}
			else if(rows-1 === row){
				if(column === 0) radius_value.push(`border-bottom-left-radius:${radius}px;`)
				else if(last) radius_value.push(`border-bottom-right-radius:${radius}px;`)
			}
			if(row !== 0) value.push(`border-top-color:transparent;`);
			if(column !== 0) value.push(`border-left-color:transparent;`)
			return {i,row,column,border:{
				color:value.join('\n'),
				radius:radius_value.join('\n')
			}}
		}
	}
	
	function get_style(grid){
		let item = grid.item
		item.rules=get_rules(grid,item)
		return template(item)
	}
})
