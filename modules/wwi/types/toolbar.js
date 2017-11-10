(function(get_toolbar){ return get_toolbar() })
(function(){
 
	const toolbar = {
		container:`<div class="toolbar" role="toolbar">
				    <div class="toolbar-item selected"
				       role="button"
				       tabindex="0"
				       aria-selected="true">
				      
				                Tool 1
				            
				    </div>
				    <div class="toolbar-item"
				       role="button"
				       tabindex="-1">
				      Tool 2
				    </div>
				    <div class="toolbar-item"
				       role="button"
				       tabindex="-1">
				      Tool 3
				    </div>
				    <div class="toolbar-item"
				       role="button"
				       tabindex="-1">
				      Tool 4
				    </div>
				    <div class="toolbar-item"
				       role="button"
				       tabindex="-1">
				      Tool 5
				    </div>
				    <div class="menu-wrapper">
				      <button tabindex="-1"
				            aria-haspopup="true"
				            aria-controls="menu1"
				            class="toolbar-item menu-button">
				        
				                Menu
				              
				      </button>
				      <ul role="menu" id="menu1">
				        <li role="menuitem">
				          Item 1
				        </li>
				        <li role="menuitem">
				          Item 2
				        </li>
				        <li role="menuitem">
				          Item 3
				        </li>
				        <li role="menuitem">
				          Item 4
				        </li>
				        <li role="menuitem">
				          Item 5
				        </li>
				        <li role="menuitem">
				          Item 6
				        </li>
				      </ul>
				    </div>
				  </div>`
	}
	
})