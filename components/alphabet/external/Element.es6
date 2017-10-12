(function(get_element){ return get_element() })
(function(){
    return function export_element(alphabet,fxy){
        //exports
        return Base => class extends Base{
        	static get observedAttributes(){return ['type']}
        	match_items(...x){
		        let count = x.length
		        if(count === 0) return null
        		let type = match_type()
		        let selection = this.value
		        let texts = []
		        let match = this.hasAttribute('match') ? this.getAttribute('match'):null
		        switch(type){
			        case 'element':
				        texts = x.map(i=>{
					        if(match) return i.hasAttribute(match) ? i.getAttribute(match):''
					        return i.textContent.trim()
				        })
			        	break
			        case 'data':
			        	texts = x.map(i=>{
			        		if(match) {
			        			let text = match[i]
						        if(fxy.is.text(text)) return text
			        			return ''
					        }
					        return ''
				        })
			        	break
			        case 'text': texts=x
		        }
		        
		        for(let i=0;i<count;i++){
		        	let text = texts[i].trim().charAt(0).toLowerCase()
			        if(text===selection) return x[i]
		        }
		        
		        //return value
		        return null
		        //shared actions
        		function match_type(){
			        if(x.length){
				        let sample = x[0]
				        if(fxy.is.element(sample)) return 'element'
				        else if(fxy.is.data(sample)) return 'data'
				        else if(fxy.is.text(sample)) return 'text'
			        }
			        return null
		        }
	        }
	        scroll_element(element,selector){
        		if(!fxy.is.text(selector)) selector = '*'
		        let items = Array.from(element.querySelectorAll(selector))
		        let item = this.match_items(...items)
		        if(item) item.scrollIntoView()
		        return item
	        }
        	changed(name,old,value){
        	    switch(name){
		            case 'type':
		            	this.view.innerHTML = get_html(value)
			            this.update_items()
		            	break
	            }
	        }
            connected(){
	            this.view.innerHTML = get_html(this.getAttribute('type'))
	            this.item_selector_options = {query:true,item:'a'}
            }
            get value(){
            	let item = this.selector.item
	            if(!item) return null
	            return item.title
            }
        }
        //shared actions
        function get_items(type){
        	type = get_type(type)
        	let characters = fxy.characters
        	let items = type === '# only' ? characters.numbers.split(''):characters.abc.split('')
	        if(type === '#') items.unshift('#')
	        else if(type === 'numbers') items = items.concat(characters.numbers.split(''))
	        return items
        }
        function get_html(type){
        	let items = get_items(type)
	        return  fxy.wrap.a(...items).attributes({
		        tabindex:0,
		        'aria-selected':'false',
		        'role':'option',
		        'gui':'',
		        'horizontal':'',
		        'center-center':''
	        }).elements.map(item=>{
	        	item.setAttribute('title',item.textContent)
		        item.setAttribute('aria-label',item.textContent)
		        return item.outerHTML
	        }).join('')
        }
        function get_type(type){
        	if(!fxy.is.text(type)) return null
	        if(type.includes('only')) return '# only'
	        else if(type === 'number') return '#'
	        return type
        }
    }
})