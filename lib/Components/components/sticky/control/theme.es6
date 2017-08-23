wwi.exports('sticky',(sticky,fxy)=>{
	
	sticky.theme = (theme)=>{ return default_theme(theme) }
	
	function default_theme(theme){
		if(!fxy.is.data(theme)) theme = {}
		return Object.assign({
			header_background:'white',
			header_background_mid:'white',
			header_color:'black',
			//header_padding:'10px 10px',
			//item_padding:'10px',
			item_height:'var(--item-height,52px)',
			selected_background:'var(--blue)',
			selected_color:'white'
		},theme)
	}
	
})