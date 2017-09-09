(function(get_example){ return get_example() })
(function(){
    //exports
    return function export_example(transitions){
		
	    let animations = transitions.constructor.animations
	    let menu = transitions.example_menu = get_menu()
	    let container = transitions.example_container || transitions.view
	    container.appendChild(menu)
	
	    //return value
	    return transitions
	
	    //shared actions
	    function check(){
		    if (transitions.animating) return false
		    if (menu.animcursor > animations.count) menu.animcursor = 1
		    else if (menu.animcursor < 1) menu.animcursor = animations.count
		    return menu.animcursor
	    }
	    
	    function get_menu(){
		    let menu_element = get_menu_element()
		    menu_element.get_animation = get_animation
		    menu_element.animcursor = 1
		    menu_element.button = menu_element.querySelector('#iterateEffects')
		    menu_element.next = function(){
			    transitions.next(check())
			    menu_element.animcursor = menu_element.animcursor + 1
		    }
		    
		    menu_element.button.onclick = e => menu_element.next()
		
		    let links = Array.from(menu_element.querySelectorAll('li'))
		    for(let link of links) {
			    let a = link.querySelector('a')
			    if(a) a.removeAttribute('href')
				if(link.hasAttribute('data-animation')){
					
					link.onclick = function clicked(event) {
						event.preventDefault()
						transitions.next(this.dataset.animation)
					}
				}
			   
		    }
		
		    //return value
		    return menu_element
	    }
    }
    
	//shared actions
	function get_animation(index){
		if(!window.fxy.is.number(index)) index = parseInt(index)
		let out_class = ''
		let in_class = ''
		switch (index) {
			case 1:
				out_class = 'pt-page-moveToLeft';
				in_class = 'pt-page-moveFromRight';
				break;
			case 2:
				out_class = 'pt-page-moveToRight';
				in_class = 'pt-page-moveFromLeft';
				break;
			case 3:
				out_class = 'pt-page-moveToTop';
				in_class = 'pt-page-moveFromBottom';
				break;
			case 4:
				out_class = 'pt-page-moveToBottom';
				in_class = 'pt-page-moveFromTop';
				break;
			case 5:
				out_class = 'pt-page-fade';
				in_class = 'pt-page-moveFromRight pt-page-ontop';
				break;
			case 6:
				out_class = 'pt-page-fade';
				in_class = 'pt-page-moveFromLeft pt-page-ontop';
				break;
			case 7:
				out_class = 'pt-page-fade';
				in_class = 'pt-page-moveFromBottom pt-page-ontop';
				break;
			case 8:
				out_class = 'pt-page-fade';
				in_class = 'pt-page-moveFromTop pt-page-ontop';
				break;
			case 9:
				out_class = 'pt-page-moveToLeftFade';
				in_class = 'pt-page-moveFromRightFade';
				break;
			case 10:
				out_class = 'pt-page-moveToRightFade';
				in_class = 'pt-page-moveFromLeftFade';
				break;
			case 11:
				out_class = 'pt-page-moveToTopFade';
				in_class = 'pt-page-moveFromBottomFade';
				break;
			case 12:
				out_class = 'pt-page-moveToBottomFade';
				in_class = 'pt-page-moveFromTopFade';
				break;
			case 13:
				out_class = 'pt-page-moveToLeftEasing pt-page-ontop';
				in_class = 'pt-page-moveFromRight';
				break;
			case 14:
				out_class = 'pt-page-moveToRightEasing pt-page-ontop';
				in_class = 'pt-page-moveFromLeft';
				break;
			case 15:
				out_class = 'pt-page-moveToTopEasing pt-page-ontop';
				in_class = 'pt-page-moveFromBottom';
				break;
			case 16:
				out_class = 'pt-page-moveToBottomEasing pt-page-ontop';
				in_class = 'pt-page-moveFromTop';
				break;
			case 17:
				out_class = 'pt-page-scaleDown';
				in_class = 'pt-page-moveFromRight pt-page-ontop';
				break;
			case 18:
				out_class = 'pt-page-scaleDown';
				in_class = 'pt-page-moveFromLeft pt-page-ontop';
				break;
			case 19:
				out_class = 'pt-page-scaleDown';
				in_class = 'pt-page-moveFromBottom pt-page-ontop';
				break;
			case 20:
				out_class = 'pt-page-scaleDown';
				in_class = 'pt-page-moveFromTop pt-page-ontop';
				break;
			case 21:
				out_class = 'pt-page-scaleDown';
				in_class = 'pt-page-scaleUpDown pt-page-delay300';
				break;
			case 22:
				out_class = 'pt-page-scaleDownUp';
				in_class = 'pt-page-scaleUp pt-page-delay300';
				break;
			case 23:
				out_class = 'pt-page-moveToLeft pt-page-ontop';
				in_class = 'pt-page-scaleUp';
				break;
			case 24:
				out_class = 'pt-page-moveToRight pt-page-ontop';
				in_class = 'pt-page-scaleUp';
				break;
			case 25:
				out_class = 'pt-page-moveToTop pt-page-ontop';
				in_class = 'pt-page-scaleUp';
				break;
			case 26:
				out_class = 'pt-page-moveToBottom pt-page-ontop';
				in_class = 'pt-page-scaleUp';
				break;
			case 27:
				out_class = 'pt-page-scaleDownCenter';
				in_class = 'pt-page-scaleUpCenter pt-page-delay400';
				break;
			case 28:
				out_class = 'pt-page-rotateRightSideFirst';
				in_class = 'pt-page-moveFromRight pt-page-delay200 pt-page-ontop';
				break;
			case 29:
				out_class = 'pt-page-rotateLeftSideFirst';
				in_class = 'pt-page-moveFromLeft pt-page-delay200 pt-page-ontop';
				break;
			case 30:
				out_class = 'pt-page-rotateTopSideFirst';
				in_class = 'pt-page-moveFromTop pt-page-delay200 pt-page-ontop';
				break;
			case 31:
				out_class = 'pt-page-rotateBottomSideFirst';
				in_class = 'pt-page-moveFromBottom pt-page-delay200 pt-page-ontop';
				break;
			case 32:
				out_class = 'pt-page-flipOutRight';
				in_class = 'pt-page-flipInLeft pt-page-delay500';
				break;
			case 33:
				out_class = 'pt-page-flipOutLeft';
				in_class = 'pt-page-flipInRight pt-page-delay500';
				break;
			case 34:
				out_class = 'pt-page-flipOutTop';
				in_class = 'pt-page-flipInBottom pt-page-delay500';
				break;
			case 35:
				out_class = 'pt-page-flipOutBottom';
				in_class = 'pt-page-flipInTop pt-page-delay500';
				break;
			case 36:
				out_class = 'pt-page-rotateFall pt-page-ontop';
				in_class = 'pt-page-scaleUp';
				break;
			case 37:
				out_class = 'pt-page-rotateOutNewspaper';
				in_class = 'pt-page-rotateInNewspaper pt-page-delay500';
				break;
			case 38:
				out_class = 'pt-page-rotatePushLeft';
				in_class = 'pt-page-moveFromRight';
				break;
			case 39:
				out_class = 'pt-page-rotatePushRight';
				in_class = 'pt-page-moveFromLeft';
				break;
			case 40:
				out_class = 'pt-page-rotatePushTop';
				in_class = 'pt-page-moveFromBottom';
				break;
			case 41:
				out_class = 'pt-page-rotatePushBottom';
				in_class = 'pt-page-moveFromTop';
				break;
			case 42:
				out_class = 'pt-page-rotatePushLeft';
				in_class = 'pt-page-rotatePullRight pt-page-delay180';
				break;
			case 43:
				out_class = 'pt-page-rotatePushRight';
				in_class = 'pt-page-rotatePullLeft pt-page-delay180';
				break;
			case 44:
				out_class = 'pt-page-rotatePushTop';
				in_class = 'pt-page-rotatePullBottom pt-page-delay180';
				break;
			case 45:
				out_class = 'pt-page-rotatePushBottom';
				in_class = 'pt-page-rotatePullTop pt-page-delay180';
				break;
			case 46:
				out_class = 'pt-page-rotateFoldLeft';
				in_class = 'pt-page-moveFromRightFade';
				break;
			case 47:
				out_class = 'pt-page-rotateFoldRight';
				in_class = 'pt-page-moveFromLeftFade';
				break;
			case 48:
				out_class = 'pt-page-rotateFoldTop';
				in_class = 'pt-page-moveFromBottomFade';
				break;
			case 49:
				out_class = 'pt-page-rotateFoldBottom';
				in_class = 'pt-page-moveFromTopFade';
				break;
			case 50:
				out_class = 'pt-page-moveToRightFade';
				in_class = 'pt-page-rotateUnfoldLeft';
				break;
			case 51:
				out_class = 'pt-page-moveToLeftFade';
				in_class = 'pt-page-rotateUnfoldRight';
				break;
			case 52:
				out_class = 'pt-page-moveToBottomFade';
				in_class = 'pt-page-rotateUnfoldTop';
				break;
			case 53:
				out_class = 'pt-page-moveToTopFade';
				in_class = 'pt-page-rotateUnfoldBottom';
				break;
			case 54:
				out_class = 'pt-page-rotateRoomLeftOut pt-page-ontop';
				in_class = 'pt-page-rotateRoomLeftIn';
				break;
			case 55:
				out_class = 'pt-page-rotateRoomRightOut pt-page-ontop';
				in_class = 'pt-page-rotateRoomRightIn';
				break;
			case 56:
				out_class = 'pt-page-rotateRoomTopOut pt-page-ontop';
				in_class = 'pt-page-rotateRoomTopIn';
				break;
			case 57:
				out_class = 'pt-page-rotateRoomBottomOut pt-page-ontop';
				in_class = 'pt-page-rotateRoomBottomIn';
				break;
			case 58:
				out_class = 'pt-page-rotateCubeLeftOut pt-page-ontop';
				in_class = 'pt-page-rotateCubeLeftIn';
				break;
			case 59:
				out_class = 'pt-page-rotateCubeRightOut pt-page-ontop';
				in_class = 'pt-page-rotateCubeRightIn';
				break;
			case 60:
				out_class = 'pt-page-rotateCubeTopOut pt-page-ontop';
				in_class = 'pt-page-rotateCubeTopIn';
				break;
			case 61:
				out_class = 'pt-page-rotateCubeBottomOut pt-page-ontop';
				in_class = 'pt-page-rotateCubeBottomIn';
				break;
			case 62:
				out_class = 'pt-page-rotateCarouselLeftOut pt-page-ontop';
				in_class = 'pt-page-rotateCarouselLeftIn';
				break;
			case 63:
				out_class = 'pt-page-rotateCarouselRightOut pt-page-ontop';
				in_class = 'pt-page-rotateCarouselRightIn';
				break;
			case 64:
				out_class = 'pt-page-rotateCarouselTopOut pt-page-ontop';
				in_class = 'pt-page-rotateCarouselTopIn';
				break;
			case 65:
				out_class = 'pt-page-rotateCarouselBottomOut pt-page-ontop';
				in_class = 'pt-page-rotateCarouselBottomIn';
				break;
			case 66:
				out_class = 'pt-page-rotateSidesOut';
				in_class = 'pt-page-rotateSidesIn pt-page-delay200';
				break;
			case 67:
				out_class = 'pt-page-rotateSlideOut';
				in_class = 'pt-page-rotateSlideIn';
				break;
		}
		
		return {
			out_class,
			in_class,
			add(element,type){
				element.setAttribute('class',this[type+'_class'])
				return element
			},
			is_example:true
		}
	}
	
	function get_menu_element(){
		let menu = document.createElement('div')
		menu.setAttribute('id','randomizer')
		menu.classList.add('pt-triggers')
		menu.innerHTML = `
					<button id="iterateEffects" class="pt-touch-button">New Transition</button>
					<div id="dl-menu" class="dl-menuwrapper">
						<ul class="dl-menu">
							<li>
								<a href="#">Move</a>
								<ul class="dl-submenu">
									<li data-animation="1"><a href="#">Move to left/ from right</a></li>
									<li data-animation="2"><a href="#">Move to right/ from left</a></li>
									<li data-animation="3"><a href="#">Move to top/ from bottom</a></li>
									<li data-animation="4"><a href="#">Move to bottom/ from top</a></li>
								</ul>
							</li>
							<li>
								<a href="#">Fade</a>
								<ul class="dl-submenu">
									<li data-animation="5"><a href="#">Fade / from right</a></li>
									<li data-animation="6"><a href="#">Fade / from left</a></li>
									<li data-animation="7"><a href="#">Fade / from bottom</a></li>
									<li data-animation="8"><a href="#">Fade / from top</a></li>
									<li data-animation="9"><a href="#">Fade left / Fade right</a></li>
									<li data-animation="10"><a href="#">Fade right / Fade left</a></li>
									<li data-animation="11"><a href="#">Fade top / Fade bottom</a></li>
									<li data-animation="12"><a href="#">Fade bottom / Fade top</a></li>
								</ul>
							</li>
							<li>
								<a href="#">Different easing</a>
								<ul class="dl-submenu">
									<li data-animation="13"><a href="#">Different easing / from right</a></li>
									<li data-animation="14"><a href="#">Different easing / from left</a></li>
									<li data-animation="15"><a href="#">Different easing / from bottom</a></li>
									<li data-animation="16"><a href="#">Different easing / from top</a></li>
								</ul>
							</li>
							<li>
								<a href="#">Scale</a>
								<ul class="dl-submenu">
									<li data-animation="17"><a href="#">Scale down / from right</a></li>
									<li data-animation="18"><a href="#">Scale down / from left</a></li>
									<li data-animation="19"><a href="#">Scale down / from bottom</a></li>
									<li data-animation="20"><a href="#">Scale down / from top</a></li>
									<li data-animation="21"><a href="#">Scale down / scale down</a></li>
									<li data-animation="22"><a href="#">Scale up / scale up</a></li>
									<li data-animation="23"><a href="#">Move to left / scale up</a></li>
									<li data-animation="24"><a href="#">Move to right / scale up</a></li>
									<li data-animation="25"><a href="#">Move to top / scale up</a></li>
									<li data-animation="26"><a href="#">Move to bottom / scale up</a></li>
									<li data-animation="27"><a href="#">Scale down / scale up</a></li>
								</ul>
							</li>
							<li>
								<a href="#">Rotate</a>
								<ul class="dl-submenu">
									<li>
										<a href="#">Glue</a>
										<ul class="dl-submenu">
											<li data-animation="28"><a href="#">Glue left / from right</a></li>
											<li data-animation="29"><a href="#">Glue right / from left</a></li>
											<li data-animation="30"><a href="#">Glue bottom / from top</a></li>
											<li data-animation="31"><a href="#">Glue top / from bottom</a></li>
										</ul>
									</li>
									<li>
										<a href="#">Flip</a>
										<ul class="dl-submenu">
											<li data-animation="32"><a href="#">Flip right</a></li>
											<li data-animation="33"><a href="#">Flip left</a></li>
											<li data-animation="34"><a href="#">Flip top</a></li>
											<li data-animation="35"><a href="#">Flip bottom</a></li>
										</ul>
									</li>
									<li data-animation="36"><a href="#">Fall</a></li>
									<li data-animation="37"><a href="#">Newspaper</a></li>
									<li>
										<a href="#">Push / Pull</a>
										<ul class="dl-submenu">
											<li data-animation="38"><a href="#">Push left / from right</a></li>
											<li data-animation="39"><a href="#">Push right / from left</a></li>
											<li data-animation="40"><a href="#">Push top / from bottom</a></li>
											<li data-animation="41"><a href="#">Push bottom / from top</a></li>
		
											<li data-animation="42"><a href="#">Push left / pull right</a></li>
											<li data-animation="43"><a href="#">Push right / pull left</a></li>
											<li data-animation="44"><a href="#">Push top / pull bottom</a></li>
											<li data-animation="45"><a href="#">Push bottom / pull top</a></li>
										</ul>
									</li>
									<li>
										<a href="#">Fold / Unfold</a>
										<ul class="dl-submenu">
											<li data-animation="46"><a href="#">Fold left / from right</a></li>
											<li data-animation="47"><a href="#">Fold right / from left</a></li>
											<li data-animation="48"><a href="#">Fold top / from bottom</a></li>
											<li data-animation="49"><a href="#">Fold bottom / from top</a></li>
											<li data-animation="50"><a href="#">Move to right / unfold left</a></li>
											<li data-animation="51"><a href="#">Move to left / unfold right</a></li>
											<li data-animation="52"><a href="#">Move to bottom / unfold top</a></li>
											<li data-animation="53"><a href="#">Move to top / unfold bottom</a></li>
										</ul>
									</li>
									<li>
										<a href="#">Room</a>
										<ul class="dl-submenu">
											<li data-animation="54"><a href="#">Room to left</a></li>
											<li data-animation="55"><a href="#">Room to right</a></li>
											<li data-animation="56"><a href="#">Room to top</a></li>
											<li data-animation="57"><a href="#">Room to bottom</a></li>
										</ul>
									</li>
									<li>
										<a href="#">Cube</a>
										<ul class="dl-submenu">
											<li data-animation="58"><a href="#">Cube to left</a></li>
											<li data-animation="59"><a href="#">Cube to right</a></li>
											<li data-animation="60"><a href="#">Cube to top</a></li>
											<li data-animation="61"><a href="#">Cube to bottom</a></li>
										</ul>
									</li>
									<li>
										<a href="#">Carousel</a>
										<ul class="dl-submenu">
											<li data-animation="62"><a href="#">Carousel to left</a></li>
											<li data-animation="63"><a href="#">Carousel to right</a></li>
											<li data-animation="64"><a href="#">Carousel to top</a></li>
											<li data-animation="65"><a href="#">Carousel to bottom</a></li>
										</ul>
									</li>
									<li data-animation="66"><a href="#">Sides</a></li>
								</ul>
							</li>
							<li data-animation="67"><a href="#">Slide</a></li>
						</ul>
					</div>
				</div>`
		//return value
		return menu
	}
	
	//let keys = transitions.constructor.keys
	//window.document.body.addEventListener('keyup',function(event){
	//	let key = event.which
	//	menu.animation = menu.get_animation()
	//
	//	if (key === keys.RIGHT || key === keys.SPACE || key === keys.ENTER || key === keys.DOWN || key === keys.PAGE_DOWN) {
	//		transitions.next(check())
	//		menu.animcursor = menu.animcursor + 1
	//	}
	//	if (key === keys.LEFT || key === keys.BACKSPACE || key === keys.PAGE_UP) {
	//		menu.animcursor = menu.animcursor - 1
	//		transitions.next(check())
	//	}
	//})
	
})