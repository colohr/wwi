(function(root,factory){
    return factory(root)
})(window,function factory(window){
	
	const Braintree = Symbol.for('braintree')
	const queryElement = window.queryElement;
	class PayCard extends HTMLElement{
		constructor(){
			super()
			this.formItems = [];
			this.currentFormItem = 0;
		}
		get form(){ return this.querySelector('#cardForm'); }
		get messages(){
			return {
				form:this.querySelector('.container-wrap'),
				container:this.querySelector('#message'),
				get error(){return this.container.querySelector('#error');},
				set error(html){ return this.container.querySelector('#error').innerHTML = html; },
				get text(){return this.container.querySelector('#text')},
				set text(html){ return this.container.querySelector('#text').innerHTML = html; },
				clear(){
					this.error.innerHTML = ''
					this.text.innerHTML = ''
					return this;
				},
				show(e){
					this.clear().container.style.display='block';
					this.form.style.display='none';
					
					var detail = e.detail;
					switch(e.type){
						case 'error':
							this.error=detail.message;
							break;
						case 'message':
							this.text=detail.message;
							break;
					}
					window.setTimeout(()=>{
						this.container.style.opacity=1;
					},10)
					
					return this;
				},
				hide(){
					this.container.style.opacity=0;
					window.setTimeout(()=>{
						this.container.style.display='none';
						this.form.style.display='';
					},200);
					return this;
				}
			};
		}
		get active(){ return this.hasAttribute('active') }
		set active(active){
			this.style.display=''
			window.document.body.style.overflow='hidden';
			if(active){
				this.setAttribute('active','');
				this.setAttribute('arial-expanded','true');
			}else{
				this.removeAttribute('active');
				this.setAttribute('arial-expanded','false');
			}
		}
		$(querySelector){ return queryElement(this.querySelector(querySelector));}
		checkFormVisibility() {
			var currentFormItem = this.currentFormItem
			var buttons = this.buttons
			if (currentFormItem === 0) {
				buttons.prev.addClass('form-controls--hidden');
			} else {
				buttons.prev.removeClass('form-controls--hidden');
			}
			
			if (currentFormItem === 3) {
				buttons.next.addClass('form-controls--hidden');
			} else {
				buttons.next.removeClass('form-controls--hidden');
			}
			return this;
		}
		changeStepperNumber() {
			var currentFormItem = this.currentFormItem
			if (currentFormItem === 3) {
				this.$('.form-controls__steps').setText('4 / 4');
				this.$('.field-message').setText('All set to submit payment.');
				this.$('.form-controls').addClass('form-controls--end');
			} else if (currentFormItem === 2) {
				this.$('.form-controls__steps').setText('3 / 4');
				this.$('.field-message').setText('This is on the back of your card.');
				this.$('.form-controls').removeClass('form-controls--end');
			} else if (currentFormItem === 1) {
				this.$('.form-controls__steps').setText('2 / 4');
				this.$('.field-message').setText('When will your card expire?');
			} else {
				this.$('.form-controls__steps').setText('1 / 4');
				this.$('.field-message').setText('Complete your Kindle Sparks order.');
			}
			return this;
		}
		formControlNext() {
			var currentFormItem = this.currentFormItem
			var formItems = this.formItems;
			
			formItems[currentFormItem].addClass('field-container--hidden');
			var input = this.inputContainer(formItems[currentFormItem+1])
			if (input.hasClass('braintree-hosted-fields-valid')) {
				this.buttons.next.removeClass('form-controls--hidden');
			}
			formItems[currentFormItem + 1].removeClass('field-container--hidden');
			
			this.currentFormItem = currentFormItem + 1;
			this.checkFormVisibility();
			this.changeStepperNumber();
			
			this.hideNext();
			
			return false;
		}
		
		hideNext() {
			var formItems = this.formItems
			var currentFormItem = this.currentFormItem
			
			var field = formItems[currentFormItem]
			var input = this.inputContainer(field)
			if(field) field = queryElement(field)
			if(input.hasClass('braintree-hosted-fields-valid') === false){
				this.buttons.next.addClass('form-controls--hidden');
			}
			this.buttons.prev.addClass('form-controls--back');
		}
		
		inputContainer(item){
			var el = item ? item.querySelector('.hosted-field'):null;
			if(el) el = queryElement(el)
			return el ? el:{hasClass(){return true}};
		}
		formControlPrev() {
			var formItems = this.formItems
			var currentFormItem = this.currentFormItem
			formItems[currentFormItem].addClass('field-container--hidden');
			
			formItems[currentFormItem - 1].removeClass('field-container--hidden');
			
			this.currentFormItem = currentFormItem - 1;
			this.checkFormVisibility();
			this.changeStepperNumber();
		}
		showNext() {
			this.buttons.next.removeClass('form-controls--hidden');
			this.buttons.prev.removeClass('form-controls--back');
		}
		braintree(){
			if(!this[Braintree]) this[Braintree] = new BraintreePayments({
				token:'/shop/process/client_token/',
				submit:'/shop/pay/',
				template:'basic'
			})
			return this[Braintree]
		}
		get buttons(){
			if(!this._buttons) {
				this._buttons = {
					prev: queryElement(this.querySelector('#prevButton')),
					next: queryElement(this.querySelector('#nextButton')),
					ok:this.querySelector('#closeMessage')
				}
			}
			return this._buttons;
		}
		bindControls(){
			var paycard=this;
			var buttons = this.buttons;
			buttons.next.addEventListener('click',function() {
				paycard.formControlNext()
				return false;
			});
			
			buttons.prev.addEventListener('click',function() {
				paycard.formControlPrev();
				return false;
			})
			
			buttons.ok.addEventListener('click',function(){
				paycard.messages.hide()
				return false;
			})
		}
		emit(type,detail){
			if(type !== 'receipt'){
				return this.messages.show({type,detail})
			}
			return this.dispatchEvent(new CustomEvent(type,{
				detail,
				bubbles:true
			}))
		}
		bindActions(){
			var hostedFields = this.hostedFields
			var pay = this;
			var form = this.form;
			
			
			form.addEventListener('submit', function(event) {
				event.preventDefault();
				
				var shopper = pay.shopper || null;
				if(!shopper || shopper.user.needsLogin) return pay.emit('message',{message:'Please log in to continue with purchase'})
				hostedFields.tokenize(function(err, payload) {
					if (err) {
						console.error(err);
						return;
					}
					var orderData = pay.shopper.payload(payload)
					
					pay.braintree().submit(orderData).then((data)=>{
						console.log(data)
						return pay.emit(data.type,data.detail)
					}).catch((error)=>{
						return pay.emit('error',error)
					})
					
				});
			},false);
		}
		finished(){
			this.removeWhenInactive=true;
			this.active=false;
			return null;
		}
		connectedCallback(){
			this.active=false;
			this.innerHTML = this.braintree().template;
			queryElement(this)
			this.find('.field-container').forEach(function(item) {
				this.formItems.push(item);
			},this);
			this.bindControls()
			this.braintree().create(this).then((hostedFields)=>{
				this.hostedFields = hostedFields;
				this.bindActions()
			}).catch((error)=>{
				console.error(error)
			});
			this.addEventListener('transitionend',()=>{
				window.document.body.style.overflow='';
				if(this.active){}
				else if(this.removeWhenInactive){
					this.remove();
				}
				else{this.style.display='none'}
			})
			
		}
	}
	
    return customElements.define('pay-card',PayCard);
})