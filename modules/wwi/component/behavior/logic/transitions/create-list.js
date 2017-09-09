
let animations = []
let types = {
	move_scale:['mode','scale'],
	room:['room','room'],
	push:['push','move'],
	cube:['cube','cube'],
	side:['side','side'],
	carousel:['carousel','carousel'],
	glue:['rotate','move'],
	move:['move'],
	ease:['easing'],
	fade:['fade'],
	scale:['scale'],
	flip:['flip'],
	fall:['fall'],
	paper:['paper'],
	slide:['slide']
}


for(let i=1;i<66;i++){
	let data = get_animation(i)
	let animation = {
		id:`${i}`,
		classes:data,
		type:get_type(data),
		from:get_from(data.out_class),
		to:get_to(data.in_class),
	}
	animations.push(animation)
}

window.animations = animations

function get_type(data){
	let o = data.out_class.toLowerCase()
	let i = data.in_class.toLowerCase()
	for(let name in types){
		let type = types[name]
		if(o.includes(type[0])){
			if(type[1] && i.includes(type[1])) return name
			else return name
		}
	}
	return ''
}
function get_to(in_class){
	let clean = in_class.replace(/pt-page-/g,'')
	return fxy.id.dash(clean)
}
function get_from(out_class){
	let clean = out_class.replace(/pt-page-/g,'')
	return fxy.id.dash(clean)
}

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
		in_class
	}
}
