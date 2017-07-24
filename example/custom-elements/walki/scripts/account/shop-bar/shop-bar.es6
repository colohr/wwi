(function(root,factory){
    return factory(root)
})(window,function factory(window){
	var ShopBar = {}
	var ShopBarItem = function(item,ops){
		if(item instanceof HTMLElement){
			if(typeof item.detailHTML === 'undefined'){
				item.detailHTML = ShopBarItem.HTML(item,ops)
			}
		}
		return item;
	}
	ShopBarItem.Items = function(items,parent,binder){
		if(Array.isArray(items) && parent instanceof HTMLElement){
			for(var i=0;i<items.length;i++){
				var item = items[i];
				if(item) parent.appendChild(this.Create(ShopBarItem.HTML(item),i,binder));
			}
		}
		return items;
	};
	ShopBarItem.Create = function(html,index,binder){
		var a = document.createElement('a')
		a.classList.toggle('order-item',true);
		a.innerHTML = html;
		a.dataset.index = index;
		var buttonFrame = a.querySelector('#button')
		if(buttonFrame){
			var removeItem = document.createElement('close-button');
			removeItem.id = 'removeOrderItem'+index;
			removeItem.title='Click to remove';
			removeItem.setAttribute('color','white');
			removeItem.setAttribute('dim','');
			if(binder.removeItem) removeItem.addEventListener('close',binder.removeItem.bind(binder));
			removeItem.dataset.index = index;
			buttonFrame.appendChild(removeItem);
		}
		return a;
	}
	ShopBarItem.HTML = function(item,ops) {
		if(typeof item !== 'object' || item === null) return '';
		if(item.detailHTML && !ops) return item.detailHTML;
		if(!ops || typeof ops !== 'object') ops={}
		
		return `
				<div class="item" data-type="${ops.type || item.type || 'shop-bar-item'}">
					<div class="name">${ops.name || item.name}</div>
					<div class="duration">${ops.duration || item.duration || ''}</div>
					<div class="detail">
						<div class="inner">${ops.inner || ''}</div>
						${item.detailHTML || ops.detail || ''}
					</div>
					<div class="price">$${ops.price || item.price}</div>
					<div id="button"></div>
				</div>
			`;
	}
	ShopBar.Item = ShopBarItem;
    return window.ShopBar = ShopBar;
})