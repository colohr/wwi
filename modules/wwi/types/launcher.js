(function(get_launcher){ return get_launcher() })
(function(){
    const launcher = {
    	section:fxy.tag`<section gui vertical>
							<div gui horizontal center-center>
								<div header-label>${'label'}</div>
								<div separator></div>
							</div>
							<div gui horizontal boxes>
								<div horizontal-scroll>
									${'boxes'}
								</div>
							</div>
						</section>`
    }
	
	//exports
	return fxy.exports('wwi-types').launcher = launcher
	
	//shared actions
	function get_boxes(data){}
	
	
})