wwi.exports('element',(element)=>{
	element.classes = Base => class extends Base {
		addClass(value) {
			return this.classList.toggle(value, true)
		}
		removeClass(value) {
			return this.classList.toggle(value, false)
		}
		hasClass(value) {
			return this.classList.contains(value)
		}
		toggleClass(value) {
			return this.hasClass(value) ? this.removeClass(value) : this.addClass(value)
		}
	}
})