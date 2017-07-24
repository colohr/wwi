wwi.exports('kpi', (kpi, fxy) => {
	const Fixes = ['??ER??']
	
	
	function Template(strings, ...keys) {
		return (function (...values) {
			var dict = values[values.length - 1] || {};
			var result = [strings[0]];
			keys.forEach(function (key, i) {
				var value = Number.isInteger(key) ? values[key] : dict[key];
				result.push(value, strings[i + 1]);
			});
			return result.join('');
		});
	}
	
	Template.article = Template`<div item-body gui vertical>
									<div item-content-label><u>Question</u></div>
									<div item-passage gui inline>
										${'passage'}
									</div>
									<div item-stem gui horizontal wrap >
										
										<div item-question gui inline flex>
											<div item-text>${'question'}</div>
										</div>
										<div item-graphics gui question-graphics inline self-sart>
											${'graphics'}
										</div>
										
									</div>
									<div item-content-label><u>Choices</u></div>
									<div item-choices gui horizontal wrap start>
										
										${'choices'}
									</div>
									<div item-content-label><u>Feedback</u></div>
									<div item-feedbacks gui vertical>
										
										${'feedback'}
									</div>
								</div>`;
	
	Template.choices = function choices(choices) {
		return choices.map(choice => {
			return `<div item-choice name="${choice.name}" gui horizontal>
						<div item-label gui inline center-center self-start>
							${choice.name}
						</div>
						<div item-text gui inline self-center>
							<div>${choice.text}</div>
						</div>
			        </div>`;
		}).join('')
	}
	
	Template.feedback = function choices(feedbacks) {
		return feedbacks.map(feedback => {
			return `<div item-feedback gui horizontal>
						<div item-label  gui inline center-center self-start>
							${feedback.name}
						</div>
						<div item-text gui inline self-center>
							<div>${feedback.text}</div>
						</div>
					</div>`;
		}).join('')
	}
	
	Template.graphics = function graphics_template(graphics) {
		if (!Array.isArray(graphics)) return ''
		return graphics.map(graphic => {
			if(!graphic_is_hidden(graphic)){
				var atts = ''
				if ('as-question' in graphic) atts += `as-question="${graphic['as-question']}"`;
				return `<img ${atts} src="${graphic.src}" />`;
			}
			return ''
		}).join('')
	}
	
	Template.info = function item_info(info){
		let html = ''
		if(fxy.is.array(info)){
			let data = info[0]
			let names = ['Name', 'Grade', 'Subject' , 'Language' , 'Type' , 'Objective' , 'Target' , 'Randomize', 'DITL', 'Answer']
			html += '<div item-info gui vertical>'
			for(let name of names){
				if(name in data){
					let item = `<div info-value gui horizontal>`
					item += `<div name>${name}</div> <div value>${data[name]}</div>`
					item += '</div>'
					html += item
				}
			}
			html += '</div>'
		}
		return html
	}
	
	Template.passage = datas => {
		if (!Array.isArray(datas)) return ''
		let data = datas[0]
		if (!data) return ''
		let psg = document.createElement('div')
		psg.innerHTML = data.text
		let metas = Array.from(psg.querySelectorAll('meta'))
		metas.forEach(meta => meta.remove())
		let links = Array.from(psg.querySelectorAll('link'))
		links.forEach(link => link.remove())
		let title = psg.querySelector('title')
		if (title) {
			let h1 = document.createElement('h4')
			h1.innerHTML = title.textContent
			h1.style.display = 'none'
			psg.replaceChild(h1, title)
		}
		return psg.outerHTML
	}
	
	Template.question = function (question) {
		return question.map(line => {
			return fix_item_text(line.text)
		})
	}
	
	
	class Item {
		constructor(data) {
			let html = {}
			let keys = new Set(['question', 'passage', 'choices', 'feedback', 'graphics'])
			for (let key of keys) {
				if (key in Template) {
					html[key] = Template[key](data[key])
				}
			}
			this.html = Template.article(html)
			this.info = Template.info(data.info)
		}
		
		get model() { return this.html }
	}

	kpi.template = {
		get template() { return Template },
		Item,
		item(data){ return new Item(data) }
	}
	//----------shared actions--------
	function combine_item_content(item, itemKey, language) {
		let i = {}
		let props = Object.keys(item)
		props.forEach((prop) => {
			let v = item[prop]
			var value;
			if (Array.isArray(v)) {
				var images = 0
				value = '';
				v.forEach(b => {
					if (typeof b === 'object' && b !== null) {
						if (prop === 'passage') value += ItemPassage(b)
						else if (typeof b.text === 'string') {
							b.text = fix_item_text(b.text)
						}
					}
				})
				if (images) {
					if (images > 1) {
						value = `<div class="graphics-box">${value}</div>`;
					}
				}
			} else value = v;
			i[prop] = value;
		})
		return i
	}
	
	function graphic_is_hidden(graphic){
		if(fxy.is.data(graphic) && 'class' in graphic && (fxy.is.text(graphic.class) || fxy.is.array(graphic.class))){
			if(graphic.class.includes('hidden') || graphic.class.includes('unused')) return true
		}
		return false
	}
	
	function check_if_graphic_count_matches(english, spanish) {
		let egraphics = Array.isArray(english) ? english : []
		let sgraphics = Array.isArray(spanish) ? spanish : []
		if (egraphics.length === 0 && sgraphics.length === 1) return true
		return false
	}
	
	function fix_item_text(text) {
		Fixes.forEach(part => {
			text = window._.replace(text, part, '')
		})
		return text
	}
	
	function template_item_model(model) {
		let english = model.english
		english.language = 'english'
		let spanish = model.spanish
		let items = [english]
		if (spanish) {
			if (check_if_graphic_count_matches(english.graphics, spanish.graphics)) {
				english.graphics = spanish.graphics
			}
			spanish.language = 'spanish'
			items.push(spanish)
		}
		let data = {}
		items.forEach((item, index) => {
			item.modelKey = model.key
			item.bankName = name
			if (index === 0) data.english = combine_item_content(item, model.key, 'english')
			else data.spanish = combine_item_content(item, model.key, 'spanish')
		})
		return data
	}
	
})