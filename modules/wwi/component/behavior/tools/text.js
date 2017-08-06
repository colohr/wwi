
function Highlighter(element){
    
}
Highlighter.prototype.set=function(element){
    
    element.addEventListener('mousedown',function(){
        this.start()
    }.bind(this))
     element.addEventListener('mouseup',function(){
        this.end()
    }.bind(this))
    this.element=element;
    this.original=this.element.innerHTML;
    this.text=this.element.innerText;
}
Highlighter.prototype.words=function(e){
    if(this._words) return this._words;
    let div='<div class="highlight-word">';
    this._words = div+this.original.split(' ').join('</div>&nbsp;'+div)+'</div>';
    return this._words;
};
Highlighter.prototype.enable=function(e){
    this.element.innerHTML=this.words();
};
Highlighter.prototype.disable=function(e){
    this.element.innerHTML=this.original;
};
Highlighter.prototype.clear=function(e){
    if(typeof this.timer === 'number'){
        window.clearTimeout(this.timer);
        delete this.timer;
    }
    return this;
};
Highlighter.prototype.start=function(e){
    this.clear().timer = window.setTimeout(function(){
        this.enable();
    }.bind(this),500);
};
Highlighter.prototype.end=function(e){
    this.disable();
};
