(function(get_columns){ return get_columns() })
(function(){
	const description = {
		bullets(...items){
			let html = items.map(item=>`<li bullet-item>${item}</li>`).join('')
			return `<ul bullet-list>${html}</ul>`
		},
		data(data){
			let value = data.description
			if(fxy.is.data(value)){
				let output = ''
				if('text' in value) output+=value.text
				if('bullets' in value) output+=this.bullets(...value.bullets)
				value = output
			}
			data.description = value || ''
			return data
		}
	}
	
	const list = {
		item:fxy.tag`
			<li gui item>
				<a gui link href="${'link'}" target="${'target'}" title="${'title'}">
					${'title'}
					<div gui description>${'description'}</div>
				</a>
			</li>
		`,
		data(data){
			data.list = data.items
			                .map(get_link_item)
			                .map(data=>this.item(data)).join('')
			//return value
			return data
			//shared actions
			function get_link_item(data){
				if(!('target' in data)) data.target = '_self'
				return description.data(data)
			}
		}
	}
	
	const column =  {
		item:fxy.tag`
			<div gui label bold uppercase title="${'title'}"></div>
			<ul gui list>${'list'}</ul>`,
		element(data){
			let element = fxy.dom('div',{'column-item':''})
			data = list.data(data)
			let html = this.item(data)
			element.innerHTML = `${html}`
			return element
		}
		
	}
	
    //exports
    return fxy.exports('wwi-types').columns = {
	    list,
	    column,
	    controller:get_controller
	}
	
	//shared actions
	function get_controller(container){
		container.setAttribute('gui','')
		container.setAttribute('scrollbars','x')
		
		container.Type = {
			collapse(){
				if('before_collapse' in this) this.before_collapse()
				let state = this.state
				this.collapsed=true
				container.aria_hidden=true
				
				if('button' in this) this.button.aria_pressed= !this.collapsed
				return this.notify(state)
			},
			get collapsed(){ return container.collapsed===true },
			set collapsed(value){ return container.collapsed=value },
			expand(){
				if('before_expand' in this) this.before_expand()
				let state = this.state
				
				return fxy.timeline(()=>{
					this.collapsed=false
					container.aria_hidden=false
					this.notify(state)
				},0)
			},
			get state(){ return {collapsed:this.collapsed} },
			notify(old){
				let state = this.state
				state.changed = state.collapsed !== old.collapsed
				if('changed' in this && state.changed) container.changed('state',state,old)
				else if('on_state' in container) container.on_state(state,old)
				if('button' in this) this.button.aria_pressed= !this.collapsed
				return this
			},
			toggle(){
				if(!this.collapsed) this.collapse()
				else this.expand()
				return this
			}
		}
		let links = container.all('a')
		for(let link of links) link.ondblclick = e=>container.Type.collapse()
		return container.Type
	}
})