/*
 * @name            KeyMap
 * @namespace       KeyMap
 * @version         0.1.0
 * @description     A simple class to call a callback when combo key are pressed on element
 * @author          Guilherme Lautert (lautert250@gmail.com)
 *
 * @license         MIT (https://github.com/Lautert/KeyMap/blob/master/LICENSE)
 */

var KeyMap = (function(){

    var alias = {
        16  : ['shift'],
        17  : ['control', 'ctrl'],
        18  : ['alt'],
        13  : ['enter'],
        8   : ['backspace'],
        46  : ['delete', 'del'],
        9   : ['tab'],
        27  : ['escape', 'esc'],
        91  : ['os', 'super', 'window', 'windows', 'iniciar'],
        38  : ['arrowup', 'up'],
        37  : ['arrowleft', 'left'],
        39  : ['arrowright', 'right'],
        40  : ['arrowdown', 'down'],
        46  : ['delete'],
        36  : ['home'],
        33  : ['pageup'],
        34  : ['pagedown'],
        35  : ['end'],
        'mouse_0' : ['mouse_0'],
        'mouse_1' : ['mouse_1'],
        'mouse_2' : ['mouse_2'],
    };

    function getKeyCodeFromAlias(str){
        if(str.length == 1){
            return str.toUpperCase().charCodeAt();
        }
        for(var keyCode in alias){
            if(alias[keyCode].indexOf(str.toLowerCase()) != -1){
                return keyCode;
            }
        }
        return false;
    }

    var keyMap = function(){
        this.onComboKey = [];
        this.map = {};
    };

    keyMap.prototype = {
        checkCombo : function(_keys){
            var _return = true;
            if(Array.isArray(_keys)){
                for(var i = 0; i < _keys.length; i++){
                    var key = _keys[i];
                    if(typeof this.map[key] === 'undefined' || !this.map[key]){
                        _return = false;
                        return;
                    }
                }
            }else if(typeof _keys == 'object'){
                for(var i in _keys){
                    var key = _keys[i];
                    if(typeof this.map[key] === 'undefined' || !this.map[key]){
                        _return = false;
                        return;
                    }
                }
            }else if(typeof _keys == 'number'){
                _return = typeof this.map[_keys] !== 'undefined' && this.map[_keys];
            }else{
                _return = false;
            }
            return _return;
        },
        addCombo : function(combo, callback){

            var len = combo.length;

            if(typeof this.onComboKey[len] === 'undefined'){
                this.onComboKey[len] = [];
            }

            this.onComboKey[len].push({
                keys : combo,
                callback : callback,
            });

            return true;
        },
        keyMapEvent : function(e){

            if(typeof e.keyCode == 'undefined'){
                this.map['mouse_'+e.button] = (e.type == 'mousedown');
            }else{
                this.map[e.keyCode] = (e.type == 'keydown');
            }

            // RESET AFTER 1s CASE EVENT keyup NOT INVOKED
            var self = this;
            if(['keydown','mousedown'].indexOf(e.type) != -1){
                setTimeout(function(){
                    if(typeof e.keyCode == 'undefined'){
                        self.map['mouse_'+e.button] = false;
                    }else{
                        self.map[e.keyCode] = false;
                    }
                },1000);
            }

            // GET TOTAL KEYS DOWN
            var len = Object.values(this.map).filter(function(value){
                return value;
            }).length;

            if(typeof this.onComboKey[len] === 'undefined'){
                return false;
            }
            
            // CHECK ALL COMBOS CREATED
            for (var i = 0; i < this.onComboKey[len].length; i++) {
                var current = this.onComboKey[len][i];
                // PASS THE KEYS FROM COMBO TO CHECK IF IS OK WITH THE MAP
                if(this.checkCombo(current.keys)){
                    current.callback(e, current.keys);
                    return true;
                }
            }
            return false;
        }
    }

    var elements = [];
    var defaultOptions = {
        preventDefault : false,
    };

    var newKeyObj = {
        addAlias : function(key, strAlias){
            if(typeof alias[key] == 'undefined'){
                alias[key] = [];
            }
            if(Array.isArray(strAlias)){
                alias[key] = alias[key].concat(strAlias);
            }else if(typeof strAlias == 'string'){
                alias[key].push(strAlias);
            }else{
                return false;
            }
            return true;
        },
        addEvent : function(combo, callback, options){

            // CHECK IF this OBJECT CAN BE SET EVENTS on
            if(this.onkeydown === 'undefined'){
                return false;
            }

            if(typeof callback != 'function'){
                return false;
            }

            // CONVERT combo KEYS TO DEFAULT NUMBER keyCode OR CORRESPONDENT ALIAS.
            var _keys = [];

            function processKey(key){
                if(typeof key == 'number'){
                    _keys.push(key);
                    return true;
                }else if(typeof key == 'string'){
                    keyCode = getKeyCodeFromAlias(key);
                    if(keyCode !== false){
                        _keys.push(keyCode);
                    }
                    return true;
                }
                return false
            }

            if(Array.isArray(combo)){
                for(var i = 0; i < combo.length; i++){
                    var key = combo[i];
                    processKey(key);
                }
            }else if(typeof combo == 'object'){
                for(var i in combo){
                    var key = combo[i];
                    processKey(key);
                }
            }else{
                if(!processKey(combo)){
                    return false;
                }
            }

            // Singleton
            // SEARCH IN elements IF this EXISTS
            var i = elements.map(function(t){return t.element;}).indexOf(this);

            if(!options){
                options = {};
            }

            // IF i IS -1, this NOT INITIATED, CREATE A NEW INSTANCE WITH keyMap.
            if(i == -1){
                elements.push({
                    element : this,
                    keyMap : new keyMap(),
                    options : Object.assign(defaultOptions, options),
                });
                i = elements.length-1;
            }

            // GET INSTANCE OF this (Singleton)
            var current = elements[i];

            current.keyMap.addCombo(_keys, callback);

            var action = function(e){
                if(current.options.preventDefault){
                    e.preventDefault();
                }
                var action = current.keyMap.keyMapEvent(e);
            }

            // NEED UPGRATE TO CREATE A NEW CALLABLE EVENT WITH options
            if(this.onkeyup == null){
                this.onkeyup = action;
                this.onkeydown = action;
            }

            if(this.onmousedown == null){
                this.onmousedown = action;
                this.onmouseup = action;
            }

            return true;
        }
    }

    // CREATE A CALLABLE EVENT on, LIKE DEFAULT
    Object.prototype.onKeyMap = function(combo, callback, options){
        newKeyObj.addEvent.call(this, combo, callback, options);
    }

    return newKeyObj
}());

window.onload = function(){

    area = document.getElementsByTagName('textarea')[0];

    area.onKeyMap(['ctrl', 's'], function(e){
        alert('save');
    });

    area.onKeyMap(['ctrl', 'mouse_0'], function(e){
        alert('ctrl+mouse_1');
    });

    area.onKeyMap(['ctrl', 'alt', 'mouse_2'], function(e){
        e.stopPropagation();
        alert('ctrl+alt+mouse_2');
    });

    document.onKeyMap('esc', function(e){
        alert('exit page');
    });
}