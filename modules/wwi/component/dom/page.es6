wwi.exports('dom',(dom,fxy)=>{
	
	const Page = Base=>class extends Base{
		constructor(...x){
			super(...x)
			this.addEventListener('animationend', app_page_transitioned.bind(this), false)
			this.at('app-page')
			//this.onfocus = e => {
				//let first = this.first_focus
				//if(first) first.focus()
			//}
		}
	}
	
	//exports
	dom.Page = Page
	
	//shared actions
	function app_page_transitioned(e){
		let page = e.currentTarget
		if('transitioned' in page) page.transitioned(e)
	}
})