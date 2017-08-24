wwi
=============
```
  npm uninstall wwi
```

Setup wwi "index.html" 
-------------
```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, minimum-scale=1, initial-scale=1, user-scalable=yes">
	<title>World Wide Internet</title>
    <!--Load wwi code-->
	<script src="http://localhost:8888/modules/wwi/code.es6" 
	        import="custom-elements.html" 
	        modules="modules" 
	        path="/"></script>
    <!--wwi/code.es6 attributes-->
    <!--import="file-of-webcomponents-to-import-after-loading.html"-->
    <!--modules="sub/path/modules/folder"-->
    <!--path="sub/path/of/site"-->
</head>
```


Create an element "my-elements/list-element/index.html"
-------------
```html
<template id="list-element">
  <style>
    /*Use css @import - An engineerical & technological web advancement of the future. */
    @import "modules/wwi/component/design/host.css";
    /*Includes flex attributes from: wwi/component/design/css/attr.css*/
    /*Includes beautiful colors from: wwi/component/design/css/colors.css*/
    :host{
      background:var(--watermelon); 
      color:var(--day);
      display:block;
      padding:10px;
      position:relative; 
    }
    [name="item"]::slotted(*){
      border-bottom:var(--emerald) 1px solid;
      padding:10px;
    }
  </style>

  <!--Use flex attributes inline - inspired by iron-flex-layout by Polymer-->
  <!--gui is flex-layout keyword-->
  <div id="view" gui vertical>
    <slot name="item"></slot>
  </div>

</template>
<script>
  ((document)=>{
    //Define the element with wwi
    //1 element per file    
    let List = wwi.element(document) //pass the document
                  .extension({
                        //Mix in a built-in but externally loaded mixin
                        module:'behavior',
                        //Selector mixin with a11y, aria attributes & events                        
                        name:'Selector'
                   },{
    	                //Mix in a custom & externally loaded mixin
    	                path:'my-behaviors/external/mixins/',
                        //A window.fxy module (fake module or folder system)                            	                
    	                module:'my_behaviors',
                        //Name the file MyList.es6 - I hate the name JavaScript    	                
    	                name:'MyList' // my-behaviors/external/mixins/MyList.es6 
                        // ((get)=>get())(()=>function export_my_list(my_behaviors_module,fxy){ return Base => class MyList extends Base{...} }))
                        // return a function with the name "export" in it 
                        // reuse it with fxy.require('my_behaviors/MyList') => MyList (synchronous)                          	                              
                   }) 
            
    //Opens a shadowRoot & sets your template    
    //Defines your element as id of template    
    List(class extends List.Element{
      //same as attributeChangedCallback    	
      changed(name,old,value){
        switch(name){
          case 'bg':
            this.style.background=value
            break
          default:
            console.log('attribute changed' ,{name,old,value})
        }
      }
    })
  })(document)
</script>
```

Use the list-element
-------------
```html
<!DOCTYPE html>
<html lang="en">
<head>...</head>
<body>
    <list-element>
        <a role="option" id="home">Home</a>
        <a role="option" id="about">About</a>
    </list-element>
</body>
<script>
    //app event fired when wwi is ready
    window.addEventListener('app',test_element)
    
    function test_element(){
    	//window.fxy (included in wwi)
        //window.url (included in wwi) - absolute url to paths
        let list_element_url = window.url("my-elements/list-element","index.html") //returns https://mysite.com/my-elements/list-element/index.html
        
        //import the element somewhere or use fxy.port(file_url)        
        /* 
           fxy.port will create a link[rel="import"] & append it to the head (if file-name.html)
            - also can be used for other resources (if js/es6 will append script to body)
         */
        fxy.port(list_element_url) // => Promise
            /* fxy.when is same as customElements.whenDefined
               but better - check many fxy.when(...element_names) */
           .then(_=>fxy.when('list-element')) 
           .then(_=>{
             let list = document.body.querySelector('list-element')
             list.define({bg:true}) //adds bg property & notifier for changes (I don't like static observedAttributes)
             
             //use defined bg attribute/property   
             list.bg = 'white' //triggers change + add attribute value
             
             //Use Selector mixin             
             list.on('select',e=>{
             	let selected_item = e.detail.item
             	//a[aria-selected="true"]
             	console.log('other crap',e.detail) 
             }) 
             
             //use "on"  or "addEventListener"    
             list.on('mouseenter',e=>{
             	list.bg = 'red'
             	list.off('mouseenter') //removed mouseenter
             })
             
             //add listener & dispatch
             list.on('jangy type',e=>alert(e.detail.message /*jangyness!*/))
             //use "dispatch(type,detail)" or "dispatchEvent(new CustomEvent...blah blah blah blah blah blah blah blah"          
             list.dispatch('jangy type',{message:'jangyness!',some_thing:'will be the event.detail'})
             
           })
    }
    
</script>
```


