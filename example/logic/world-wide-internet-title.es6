(function(wwi_init){ return wwi_init() })
(function(){
    return function get_wwi_init(element){
	    let app = window.app;
	    const TitleHtml = `<div gui horizontal center-center >
			<explode-button id="letters" slot="item" color="dodgerblue"  pointer="letterify" kind="button">
				Wide
			</explode-button>
			<explode-button id="explode" slot="item" color="dodgerblue">
				World
			</explode-button>
			<explode-button id="silly" slot="item" color="dodgerblue" pointer="letterify">
				Internet
			</explode-button>
		</div>
		<div style="width:20px;"></div>
		<div id="rgb" gui horizontal center-center>
			<div>
				<div>R</div>
				<input type="number" id="red" title="red" aria-label="red" aria-valuemin="0" aria-valuemax="255" min="0" max="255" value="30" onchange="window.Title.update(event)">
			</div>
	
			<div>
				<div>G</div>
				<input type="number" id="green" title="green" aria-label="green" aria-valuemin="0" aria-valuemax="255" min="0" max="255" value="144" onchange="window.Title.update(event)">
			</div>
	
			<div>
				<div>B</div>
				<input type="number" id="blue" title="blue" aria-label="blue" aria-valuemin="0" aria-valuemax="255" min="0" max="255" value="255" onchange="window.Title.update(event)">
			</div>
			<div>
				<div>O</div>
				<input type="number" id="opacity" title="opacity" aria-label="opacity" aria-valuemin="0" aria-valuemax="1" min="0" max="1" value="1" onchange="window.Title.update(event)">
			</div>
		</div>`;
	
	    const Title = {
		    get active(){ return this.controls.hasAttribute('active') },
		    set active(value){
			    if(value) this.controls.setAttribute('active','')
			    else this.controls.removeAttribute('active')
			    return value
		    },
		    element,
		    get blue(){ return this.query('input#blue').value },
		    get container(){ return this.element.query('div#title') },
		    get controls(){ return this.query('#rgb') },
		    get green(){ return this.query('input#green').value },
		    get opacity(){ return this.query('input#opacity').value },
		    get red(){ return this.query('input#red').value },
		    get pi(){ return app.query('#pi') },
		    query(selector){ return this.element.query(selector) },
		    update(event){
			    let value = this.value
			    if(this.buttons){
				    this.buttons.forEach(button=>{
					    button.ui('background',value)
				    })
			    }
			
		    },
		    get value(){
			    return `rgba(${[this.red,this.green,this.blue,this.opacity].join(',')})`
		    }
	    };
	
	    Title.container.innerHTML = TitleHtml;
	    Title.buttons = [Title.query('#explode'),Title.query('#letters'),Title.query('#silly')];
	    wwi.when('code-π').then(()=>{
		    Title.buttons[0].on('click', (e) => {  })
		    Title.buttons[1].on('click', (e) => {  })
		    Title.buttons[2].a11y_callback = (e) => {
			    let activates = 'key' in e.detail ? e.detail.key.activates:false
			    if(activates){
				    let button = e.currentTarget
				    console.log('silly',button.silly)
				    if(button.silly) button.silly=null
				    else button.silly = ''
			    }
		    };
		    Title.buttons[2].on('click', (e) => {
			    let button = e.currentTarget
			    if(button.silly) button.silly=null
			    else button.silly = ''
		    });
		    Title.pi.on('state',(e)=>{
			    let data = e.detail.state
			    if(data.value === 'colors') Title.active=true
			    else Title.active=false
		    });
		    window.Title = Title;
	    })
	    
	    
	    
    }
})
