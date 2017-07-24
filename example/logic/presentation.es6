(function(presentation){ return presentation() })
(function(){
	return function get_presentation(element) {
		const app = window.app
		let presentation = element.presentation
		presentation.cache = new Map()
		presentation.actions = {populate_music_player, populate_survey}
		let slides = element.slides
		console.log(slides)
		slides.items = Array.from(slides.querySelectorAll('a'))
		                    .map(item => {
			                    item.onclick = open_slide
			                    item.setAttribute('tabindex', '0')
			                    item.setAttribute('aria-label', item.textContent)
			                    item.setAttribute('aria-selected', 'false')
			                    return item
		                    })
		slides.url = href => url.site('pages', 'specialist', 'slides', href)
		class Slide {
			constructor(html_text, item, identity) {
				this.identity = identity
				this.item = item
				this.html = html_text
				this.item.setAttribute('slide-id', this.id)
			}
			
			get(name) { return this.item.getAttribute(name) }
			
			has(name) { return this.item.hasAttribute(name) }
			
			get actions() {
				let actions = {}
				if (this.has('on-open')) actions.open = this.get('on-open')
				return actions
			}
			
			get id() { return this.identity.id }
		}
		return presentation
		function do_action(name, slide) {
			if (name in slide.actions) {
				let action_name = slide.actions[name]
				return presentation.actions[action_name](slide)
			}
			return slide
		}
		
		function open_slide(e) {
			e.preventDefault()
			let item = e.currentTarget
			let href = item.getAttribute('href')
			let slide_url = slides.url(href)
			let identity = app.source.identity(slide_url)
			let id = identity.id
			if (presentation.cache.has(id)) set_presentation(presentation.cache.get(id))
			else {
				console.log('fetching')
				fetch(slide_url)
					.then(response => response.text())
					.then(slide_content_as_text => {
						let slide_cache = new Slide(slide_content_as_text, item, identity)
						return set_presentation(presentation.cache.set(slide_cache.id, slide_cache).get(slide_cache.id))
					})
			}
		}
		
		function select(slide) {
			if (presentation.selected_item) {
				let slide_id = presentation.selected_item.getAttribute('slide-id')
				let slide = presentation.cache.get(slide_id)
				slide.content.remove()
				presentation.selected_item.setAttribute('aria-selected', 'false')
			}
			slide.item.setAttribute('aria-selected', 'true')
			presentation.selected_item = slide.item
			return slide
		}
		
		function set_presentation(slide) {
			let opening
			if (!('content' in slide)) {
				slide.content = document.createElement('div')
				slide.content.id = slide.id
				slide.content.setAttribute('slide-content', '')
				slide.content.innerHTML = slide.html
				opening = true
			}
			presentation.appendChild(select(slide).content)
			if (opening) do_action('open', slide)
			return slide
		}
		
		function populate_survey(slide) {
			let developer_survey_url = window.url.site('pages/specialist/data/developer-survey/index.html')
			app.port(developer_survey_url).then(_ => {
				window.survey = slide.content.querySelector('developer-survey')
			})
		}
		
		function populate_music_player(slide) {
			let player = slide.content.querySelector('media-player')
			player.add('media/Best Kept Secret.mp3',
				'media/Im Better ft. Lamb.mp3',
				'media/Jay-Z Trouble instrumental.mp3',
				'media/Lloyd Banks - On Fire Instrumental.mp3',
				'media/System of a Down - Chop Suey official instrumental.mp3',
				'media/Time to Eat.m4a',
				'media/Trouble.mp3',
				'media/Wanted.m4a',
				'media/White Tennis Sneakers (1960).mp3',
				'media/beat.mp3',
				'media/shawnna_ft_ludacris_shake_dat_shit_instrumental.mp3',
				'media/timbaland and magoo feat missy cop that shit instrumental.mp3')
		}
	}
 
})