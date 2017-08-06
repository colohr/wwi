
(function(window){
    "use strict";
    
    const speechSynthesis=window.speechSynthesis;
    const SpeechSynthesisUtterance = window.SpeechSynthesisUtterance;
  

    class ReadToolController{
        static available(){return SpeechSynthesisUtterance !== undefined;}
        static get voices(){
            if(!this.available()) return {get length(){return this.english.length + this.spanish.length;},english:[],spanish:[],notAvailable:true};
            if(!this._voices) this._voices = {get length(){return this.english.length + this.spanish.length;},english:[],spanish:[]};
            return this._voices;
        }
        static validateVoices(){
            return new Promise((resolve)=> {
                var voices = this.voices;
                if (voices.notAvailable) return resolve(voices);
                if (voices.length) return resolve(voices);
                this.waitingId = window.setInterval(()=> {
                    var voicesAvailable = speechSynthesis.getVoices();
                    if (voicesAvailable.length !== 0) {
                        for (var i = 0; i < voicesAvailable.length; i++) {
                            if (voicesAvailable[i].lang === 'en-US') {
                                voices.english.push(voicesAvailable[i]);
                            }else if(voicesAvailable[i].lang === 'es-MX'){
                                voices.spanish.push(voicesAvailable[i]);
                            }
                        }
                        window.clearInterval(this.waitingId);
                        delete this.waitingId;
                        this._voices=voices;
                        return resolve(voices);
                    }
                }, 1);
            });
        }
        constructor(element){
            this.element = element;
            this.selectedVoice = undefined;
            this.text = '';
            this.rage = 1;
            this.pitch = 1;
            this.log = '';
            this.constructor.validateVoices().then((voices)=>{
                this.voices = voices;
                this.element.isReady=true;
            });
            
            
           
        }
        get voices(){return this._voices || []}
        set voices(voices){this._voices=voices;}
        get hasVoices(){return this.voices.length > 0;}
        synthesizer(){
            var self=this;
            var selectedVoice = this.selectedVoice;
            var utterance = new SpeechSynthesisUtterance();
            utterance.text = this.text;
            utterance.voice = selectedVoice.uri;
            utterance.lang = selectedVoice.lang;
            utterance.rate = this.rate;
            utterance.pitch = this.pitch;
    
            utterance.onstart = function () {
                self.log = 'Speaker started' + '<br />' + self.log;
            };
    
            utterance.onend = function () {
                self.log = 'Speaker finished' + '<br />' + self.log;
            };
            return {
                utterance,
                speak(){
                    return  speechSynthesis.speak(this.utterance)
                }
            };
        }
    }
    
    
})(window);