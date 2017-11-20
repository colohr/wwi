window.fxy.exports('navigator',(navigator_exports,fxy)=>{
	fxy.external.component({
		module:'behavior',
		name:'AriaTrigger'
	}).then(AriaTrigger=>{
		navigator_exports.Button = Base => class extends AriaTrigger(Base){
			connectedCallback(){
				super.connectedCallback()
				this.setAttribute('tabindex','0')
				this.setAttribute('role','button')
				this.aria.selected='false'
				this.define('routes',{
					icon:true,
					selected(value){
						if(value !== null) this.aria.selected=true
						else this.aria.selected=false
					}
				})
				this.on('aria trigger',e=>{
					let data = e.detail.action
					if(data.activates) this.dispatch(this.event_name,data)
				})
			}
			get event_name(){ return this.hasAttribute('event-name') ? this.getAttribute('event-name'):this.localName.replace('navigator-','') }
		}
	})
})