wwi.exports('element',(element)=>{
	element.classes = Base => class extends Base {
		addClass(value) {
			return this.classList.toggle(value, true)
		}
		hasClass(value) {
			return this.classList.contains(value)
		}
		removeClass(value) {
			return this.classList.toggle(value, false)
		}
		toggleClass(value) {
			return this.hasClass(value) ? this.removeClass(value) : this.addClass(value)
		}
	}
})