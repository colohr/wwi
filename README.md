WWI
=============

Install `wwi` 
-------------
```
  npm i wwi
```

World Wide Internet HTML Page & Loading
-------------
```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, minimum-scale=1, initial-scale=1, user-scalable=yes">
	<title>World Wide Internet</title>
  <!--Define the source of wwi/port.es6 in the folder you have your static modules-->
  <!--path defines a subpath for the website-->
  <!--import defines the file to be imported for you custom elements-->
	<script src="modules/wwi/port.es6" import="custom-elements.html" modules="modules" path="/"></script>
</head>

<body>

  <list-element id=list>
    <a slot=item href=a.html>A Item</a>
    <a slot=item href=b.html>B Item</a>
    <a slot=item href=c.html>C Item</a>
  </list-element>

	<script>
    //the app event is triggered once all wwi files have been loaded
		window.addEventListener('app',function(e){

      let list = app.query('#list')
      list.bg = 'skyblue'


		})
	</script>
</body>
</html>
```


Sample custom-elements.html file
-------------
```html
<link rel="import" href="elements/list-element.html">
```



Creating an element with wwi library
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



