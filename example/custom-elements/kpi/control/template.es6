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
										
										<div item-question item-text>
											${'graphics'}
											<div item-inline-text>
												
												${'question'}
												
											</div>
										</div>
										<div item-graphics question-graphics>
										
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
	
	Template.feedback = function feedback(feedbacks) {
		return feedbacks.map(feedback => {
			return `<div name="${feedback.name}" item-feedback gui horizontal>
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
		return graphics.filter(graphic=>fxy.is.data(graphic))
		               .map(graphic=>graphic_data(graphic))
		               .map(graphic=>{
							if(graphic.hidden !== true) return `<img ${graphic.attributes} src="${graphic.src}" />`
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
				if (key in Template) html[key] = Template[key](data[key])
			}
			
			this.answer = get_answer(data)
			this.info = Template.info(data.info)
			this.html = Template.article(html)
		}
		get model() { return this.html }
	}

	//exports
	kpi.template = {
		get template() { return Template },
		Item,
		item(data){ return new Item(data) }
	}
	
	//shared actions
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
	
	function check_if_graphic_count_matches(english, spanish) {
		let egraphics = Array.isArray(english) ? english : []
		let sgraphics = Array.isArray(spanish) ? spanish : []
		if (egraphics.length === 0 && sgraphics.length === 1) return true
		return false
	}
	
	function fix_item_text(text) {
		Fixes.forEach(part =>text=window._.replace(text, part, ''))
		return text
	}
	
	function get_answer(data){
		let answer = fxy.is.text(data.answer) ? data.answer:null
		if(answer) return answer
		let info = data.info
		if(fxy.is.array(info)) info = info[0]
		if(fxy.is.data(info)) answer = info.Answer
		return answer
	}
	
	function graphic_data(graphic){
		
		let data = {}
		data.src = graphic.src
		data.class = graphic_classes(graphic)
		data.attributes = graphic_attributes(data,graphic['as-question'])
		data.hidden = graphic_is_hidden(data)
		return data
		
		//shared actions
		function graphic_attributes(graphic,as_question){
			let attributes = ''
			if (as_question) attributes += `as-question="${as_question}"`;
			if('class' in graphic) attributes += `class="${graphic.class.join(' ')}"`
			return attributes
		}
		
		function graphic_classes(graphic){
			let classes = graphic.class
			if(fxy.is.text(classes)) classes = classes.split(' ')
			if(fxy.is.array(classes)) return classes
			return []
		}
		
		function graphic_is_hidden(graphic){
			return graphic.class.includes('hidden') || graphic.class.includes('unused')
		}
		
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