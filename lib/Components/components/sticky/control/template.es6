wwi.exports('sticky',(sticky,fxy)=>{
	
	
	sticky.template = get_list_template
	
	function get_list_template(list,theme){
		theme = fxy.require('sticky/theme')(theme)
		const selectors = list.selectors
		return `
		        
		            @import "/modules/wwi/component/design/host/scroll-view.css";
		            @import "/modules/wwi/component/design/css/attr.css";

		              :host{
		                  //--item-background:rgba(244,244,244,1);
		                  --item-border:0 0 1px 0;
		                  --item-border-style:solid;
		                  --item-border-color:rgba(0,0,0,0.2);
		                  --list-item-height:${theme.item_height};
		                  --item-selected-background:${theme.selected_background};
		                  --item-selected-color:${theme.selected_color};
		                  //--item-padding:${theme.item_padding};
		                  --item-color:black;
		                  --header-background: ${theme.header_background};
		                  --header-background-mid: ${theme.header_background_mid};
		                  --header-color: ${theme.header_color};
		                  //--header-padding:${theme.header_padding};
		                  --sticky-shadow:drop-shadow(-3px 3px 5px rgba(70,70,80,0.48));
						 
		              }

		              :host{
		                  top:0;
		                  display: block;
		                  overflow: hidden;
		                  overflow-y:scroll;
		                  pointer-events: auto;
		                  position: relative;
		                  background:var(--list-background,white);
		                  box-sizing: border-box;
		                  outline:none;
		              }

		              /*group*/
		              ${selectors.group}{
		                position:relative;
		                overflow:visible;
		                box-sizing: border-box;
		              }
		            
		              /*header-wrap*/
		              ${selectors.header} {
		                  top:0;
		                  overflow: visible;
		                  position: relative;
		                  z-index: 2;
		                  font-size:14px;
		                  font-weight:900;
		                  padding: var(--header-padding);
		                  color: var(--header-color);
		                  height: var(--header-height,30px);
		                  max-height: var(--header-height,30px);
		                  box-sizing: border-box;
		                  width:100%;
		                  transform:translateY(0px);
		                  will-change: transform;
		                  transition-property: transform;
		                  transition-duration: 200ms;
		                  transition-timing-function: ease-in-out;
		                  transform-style: flat;
		                  background:var(--header-back,transparent);
		                  
		              }

		              ${selectors.header} [title]{
		                position:relative;
		                z-index:1;
		                text-transform:capitalize;
		                border-radius:var(--header-radius,100px);
		                background:var(--header-background,white);
		                width:22px;
		                height:22px;
		                text-align:center;
		                margin-left:var(--header-title-left,5px);
		                line-height:1;
		                box-sizing:border-box;
		                transition:width 200ms ease-out;
		                will-change:width;
		              }

		              ${selectors.header}.fixed {
		                  top:${list.offsetTop}px;
		                  position: fixed;
		                  transform:var(--header-fixed-y,translateY(-1px));
		                  -webkit-filter:var(--header-fixed-shadow,clear);
		                  filter:var(--header-fixed-shadow,clear);
		              }
		              
		              
		              ${selectors.header}.fixed [title]{
		                width:var(--header-fixed-width,calc(100% - 10px));
		                -webkit-filter:var(--header-shadow,var(--sticky-shadow));
		                filter:var(--header-shadow,var(--sticky-shadow));
		              }
		            
		              ${selectors.header}.fixed.absolute {
		                  position: absolute;
		              }
		             
		              ${selectors.item}{
		                display:block;
		                position:relative;
						box-sizing: border-box;
						height:var(--list-item-height);
		              }

		                :host([scrolling]) ${selectors.item},
		                ${selectors.item}[aria-disabled="true"]{
		                    pointer-events:none;
		                }
		         
		       `;
	}

})