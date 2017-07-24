wwi.exports('media',(media)=>{
	media.time = function get_time(time) {
		let minutes = get_minutes(time)
		let seconds = get_seconds(time, minutes)
		return {minutes: `${get_print(minutes)}`, seconds: `${get_print(seconds)}`}
		function get_minutes(time) {
			return Math.floor(time / 60)
		}
		function get_print(number) {
			if (number < 10) return `0${number}`
			return number
		}
		function get_seconds(time, minutes) {
			return Math.round(time - minutes * 60)
		}
	}
})