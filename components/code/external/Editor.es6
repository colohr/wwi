(function(get_editor){ return get_editor() })
(function(){
    return function export_editor(code,fxy){
	
	    //exports
        return Base => class extends Base{
        	static get observedAttributes(){return ['no-wrap']}
	        get bar() { return this.query('code-bar') }
	        changed(name,old,value){
        		switch(name){
			        case 'no-wrap':
				        this.code.option = ['lineWrapping',value !== null ? false:true]
			        	break
		        }
	        }
	        get code(){ return code.logic(this) }
	        connected(){ connect(this)}
	        get cursor() { return this.code.getCursor() }
	        fold(...x){
		        let editor = this.code
		        if(x.length === 0) x = [editor.firstLine()+1,editor.lastLine()-1]
		        let position = code.position(...x)
		        editor.foldCode(position)
		        return this
	        }
	        resize(name){ return resize(this,name) }
	        get value(){return this.code.getValue()}
	        set value(text){ return this.code.setValue(text)}
	        get view() { return this.query('[code]') }
        }
        
	    //shared actions
	    function connect(element){
		    element.define('routes',{
			    language(value){
				    if(value !== null) this.code.option = ["mode", value]
			    },
			    theme(value){
				    if(value !== null) this.code.option = ["theme", value]
			    }
		    })
		    if(!element.language) element.language = 'javascript'
		    if(!element.theme) element.theme = 'dracula'
		    connect_bar(element)
		    window.app.on('resized',size =>element.resize('resized',size))
	    }
	    function connect_bar(element){
		    let bar = element.bar
		    if(bar){
		    	fxy.on(_=>{
				    bar.themes.onchange = event => element.theme = event.currentTarget.value
				    bar.languages.onchange = event => element.language = event.currentTarget.value
				    bar.languages.value = element.language
				    bar.themes.value = element.theme
				    connect_view(element)
			    },element,'bar.themes')
		    }
	    }
	    function connect_view(element){
	    	element.timeout(()=>{
			    let supermodel = element.supermodel
			    if(supermodel && supermodel !== document.body && supermodel.size && supermodel.size.width > 100) element.resize()
			    let initial_value = element.slots.value.items.map(item=>item.outerHTML).join('\n')
			    if(initial_value.length) element.value = initial_value
		    },200)
	    }
	    function resize(element,name){
		    let size = element.size
		    if (element.hasAttribute('lines')) element.code.size = [size.width, size.height]
		    else element.code.size = [size.width, size.height]
		    element.dispatch('update', name)
	    }
    }
})
