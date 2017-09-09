window.fxy.exports('dom',(dom)=>{
	
	const Page = Base=>class extends Base{
		constructor(...x){
			super(...x)
			this.addEventListener('animationend', app_page_transitioned.bind(this), false)
			this.at('app-page')
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