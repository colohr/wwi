wwi
=============
```
  npm uninstall wwi
```

World Wide Internet Setup
-------------
```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, minimum-scale=1, initial-scale=1, user-scalable=yes">
	<title>World Wide Internet</title>
        <!--Load main wwi file-->
	<script src="http://localhost:8888/modules/wwi/port.es6" 
	        import="custom-elements.html" 
	        modules="modules" 
	        path="/"></script>
</head>
<body>
    <list-element></list-element>
</body>
```


Create an element
-------------
```html
<template id="list-element-template">
  <style>
    @import "modules/wwi/design/attr.css";
    :host{
      display:block;
      background:ghostwhite;
      color:black;
      position:relative;
      padding:10px;
    }
    ::slotted(*){
      border-bottom:red 1px solid;
      padding:10px;
    }
  </style>

  <div id="view" gui layout vertical>
    <slot name="item"></slot>
  </div>

</template>
<script>
  ((doc)=>{
    let List = wwi.element(doc)
    List(class extends List.Element{
      changed(name,old,value){
        switch(name){
          case 'bg':
            this.ui({background:value})
            break
          default:
            console.log('attribute changed' ,{name,old,value})
        }
      }
      connected(){
        this.define({
          bg:true
        })
      }
    })
  })(document)
</script>
```



