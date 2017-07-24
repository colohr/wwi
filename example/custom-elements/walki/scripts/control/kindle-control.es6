(function(root,factory){
    return factory(root)
})(window,function factory(window){
    'use strict';
	const PacksKey = Symbol('LicensePacks')
	
	const KindlePublishingApp = {
		get options(){
			if(window.fireabase) return window.firebase.app().options
			return {}
		},
		get apiKey(){return this.options.apiKey},
	}
	
	const EmailRegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	
	
	class Contacts{
		static isEmail(email){
			return _.isString(email) && !_.isEmpty(email) && this.validEmail(email);
		}
		static validEmail(email) {
			return EmailRegExp.test(email);
		}
		static compose(sender,subject,body,attachment){
			if(!this.validEmail(sender)) return new Error('Email address is not valid');
			if(!_.isString(body) || _.isEmpty(body)) return new Error('Message body is is empty');
			if( !_.isString(subject) || _.isEmpty(subject) ) subject = 'QOTD: Support Message'
			return { body:JSON.stringify({sender,subject,body,attachment}), headers:new Headers({'Content-type':'application/json'}), method:'POST' }
		}
		static send(message){
			console.log({message,Contacts:'send'})
		}
	}
	
	const licensePack = target => {
		var item = {}
		var parent = target;
		var dom = target
		
		item.value = target.hasAttribute('value') ? parseFloat(target.getAttribute('value')):4.99;
		item.detail = dom.textContent.trim();
		item.quantity = 1;
		
		item.price = item.quantity * item.value;
		item.type = target.hasAttribute('type') ? target.getAttribute('type'):'user'
		item.name = target.hasAttribute('name') ? target.getAttribute('name'):'Single User'
		item.duration = target.hasAttribute('duration') && !isNaN(parseInt(target.getAttribute('duration'))) ? parseInt(target.getAttribute('duration')) : 365;
		
		item.accounts = target.hasAttribute('accounts') ? parseInt(target.getAttribute('accounts')) : 1;
		item.banks = target.hasAttribute('banks') ? target.getAttribute('banks'):'single'
		var banks = item.banks === 'all' ? 'all':parseInt(item.banks);
		var innerBank = 'KindleSparks.com License'
		item.detailHTML = ShopBar.Item.HTML(item,{duration:item.duration === 365 ?'1-Year':'1/2 Year',inner:item.banks === 'all' ? 'All Access License':innerBank})
		
		return item;
	};
	
	licensePack.list = (api)=>{
		return fetch('/shop/licenses',{
			method:'GET',
			headers:new Headers({'Content-Type':'application/json', 'kindle-shopper':api})
		}).then(res => res.json())
	};
	licensePack.dispatch = function(event){
		var item = licensePack(event.currentTarget)
		window.dispatchEvent(new CustomEvent('shop',{
			detail:{ action:'item', item },
			bubbles:true
		}))
	}
	licensePack.packs = ()=>{
		return new Promise((resolve,reject)=>{
			if(licensePack[PacksKey]) return resolve(licensePack[PacksKey])
			return licensePack.list(KindlePublishingApp.apiKey).then((o)=>{
				licensePack[PacksKey] = o
				return resolve(licensePack[PacksKey])
			}).catch(reject)
		})
	}
	licensePack.buttonKey = Symbol.for('LicenseButtonKey')
	licensePack.button = (button) => {
		if(button[licensePack.buttonKey]) return button
		if(!licensePack[PacksKey]) throw new Error('packs not loaded')
		let id = button.getAttribute('pack')
		let item = licensePack[PacksKey].licenses[id]
		for(let key in item) button.setAttribute(key,item[key]);
		button[licensePack.buttonKey] = {id,item,click:true}
		button.addEventListener('click',licensePack.dispatch,false)
		return button
	}
	licensePack.getList = (buttons)=>{
		return licensePack.packs().then((o)=>{
			return buttons.map(licensePack.button);
		}).catch(console.error)
	}
	

	
	const KindlePublishing = {
		get Contacts(){return Contacts},
		licenseButton(button){
			return new Promise((resolve)=>{
				return licensePack.packs().then(()=>{
					return resolve(licensePack.button(button))
				})
			})
		},
		get LicenseBehavior(){
			return {
				properties:{
					licenseButtons:{type:Array,observer:'_handleLicenseButtons'}
				},
				licensePack(...args){return licensePack(...args)},
				licenseList(buttons){
					return licensePack.getList(buttons);
				},
				_handleLicenseButtons(buttons){
					if(buttons){
						this.licenseList(buttons).then(()=>{
							
						})
					}
				}
			}
		}
	}
    return window.KindlePublishing =  KindlePublishing
})