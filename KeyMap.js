/*
 * @name            KeyMap
 * @namespace       KeyMap
 * @version         1.0.0
 * @description     A simple class to trigger a callback when combo key are pressed on element
 * @author          Guilherme Lautert (lautert250@gmail.com)
 *
 * @license         MIT (https://github.com/Lautert/KeyMap/blob/master/LICENSE)
 */
var KeyMap = (function(){

	var resetKeyAfter = 5; // second
	var resetCallAfter = .01; // second

	var alias = {
		16  : ['shift'],
		17  : ['control', 'ctrl'],
		18  : ['alt'],
		13  : ['enter'],
		8   : ['backspace'],
		46  : ['delete', 'del'],
		9   : ['tab'],
		27  : ['escape', 'esc'],
		91  : ['os', 'super', 'window', 'windows'],
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

	function keyMap(){
		this.onComboKey = [];
		this.map = {};
	};

	keyMap.prototype = {
		// CHECK IF _keys ARE MAPPING AND true
		// THIS METHOD CHECK ONLY FINAL keys NOT ALIAS
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
				called : false,
			});

			return true;
		},
		removeCombo : function(combo){
			var len = combo.length;
			var index = this.onComboKey[len].map(function(t){
				return t.keys.toString();
			}).indexOf(combo.toString());
			
			if(index != -1){
				this.onComboKey[len].splice(index, 1);
				return true;
			}
			return false;
		},
		// THIS EVENT CAN BE CALLED FROM mouse AND key
		keyMapEvent : function(e){

			var key = null;

			if(typeof e.keyCode == 'undefined'){
				key = 'mouse_'+e.button;
			}else{
				key = e.keyCode;
			}

			this.map[key] = (['mousedown','keydown'].indexOf(e.type) != -1);

			// RESET AFTER "resetKeyAfter" CASE EVENT keyup NOT INVOKED
			// HAVE MANY REASONS TO DON'T DO IT, example : alert, open console, breakpoint
			var self = this;
			if(['keydown','mousedown'].indexOf(e.type) != -1){
				// IF THERE WAS ANOTHER REMOVE AND CREATE AGAIN
				clearTimeout(self.map[key].timeout);
				self.map[key].timeout = setTimeout(function(){
					self.map[key] = false;
				}, resetKeyAfter*1000);
			}

			// GET TOTAL KEYS DOWN, USED TO FILTER SEQUENCE THAT NEED CHECK
			var len = Object.values(this.map).filter(function(value){
				return value;
			}).length;

			if(typeof this.onComboKey[len] === 'undefined'){
				return false;
			}

			var self = this;
			for (var i = 0; i < this.onComboKey[len].length; i++){
				var current = this.onComboKey[len][i];
				// PASS THE KEYS FROM COMBO TO CHECK IF IS OK WITH THE MAP
				if(this.checkCombo(current.keys)){
					if(!current.called){
						current.callback.call(e.target, e, current.keys);
						current.called = true;
						setTimeout(function(){
							current.called = false;
						}, resetCallAfter*1000);
						return true;
					}
				}
			}
			return false;
		}
	}

	var elements = [];
	
	// RETURN THE INSTANCE Singleton OF ELEMENT
	function getInstance (element){
		var i = elements.map(function(t){return t.element;}).indexOf(element);
		if(i == -1){
			return null;
		}
		return elements[i];
	}

	var keyMapObj = {
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
		parseAlias : function(combo){
			var _keys = [];

			var hasMouseKey = false;
			function processKey(key){
				if(typeof key == 'number'){
					_keys.push(key);
					return true;
				}else if(typeof key == 'string'){
					keyCode = getKeyCodeFromAlias(key);
					if(keyCode.toString().indexOf('mouse') != -1) hasMouseKey = true;
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

			return { keys:_keys, hasMouseKey:hasMouseKey };
		},
		addEvent : function(element, combo, callback){

			// CHECK IF this OBJECT CAN BE SET EVENTS on
			if(typeof element.addEventListener !== 'function'){
				return false;
			}

			if(typeof callback != 'function'){
				return false;
			}

			// CONVERT combo KEYS TO DEFAULT NUMBER keyCode OR CORRESPONDENT ALIAS.
			var parser = keyMapObj.parseAlias(combo);
			if(parser == false){
				return false;
			}
			var _keys = parser.keys;
			var hasMouseKey = parser.hasMouseKey;

			// Singleton
			// SEARCH IN elements IF this EXISTS
			var i = elements.map(function(t){return t.element;}).indexOf(element);

			// IF i IS -1, this NOT INITIATED, CREATE A NEW INSTANCE WITH keyMap.
			if(i == -1){
				elements.push({
					element : element,
					keyMap : new keyMap(),
					options : {
						keyboard : false,
						mouse : false,
					},
				});
				i = elements.length-1;
			}

			// GET INSTANCE OF this (Singleton)
			var current = elements[i];

			current.keyMap.addCombo(_keys, callback);

			function action(e){
				var check = current.keyMap.keyMapEvent(e);
			}

			if(!current.options.keyboard){
				current.options.keyboard = true;
				element.addEventListener('keydown', action);
				element.addEventListener('keyup', action);
			}

			if(!current.options.mouse && hasMouseKey){
				current.options.mouse = true;
				element.addEventListener('mousedown', action);
				element.addEventListener('mouseup', action);
			}

			return true;
		},
		disableCombo : function(element, combo){
			var current = getInstance(element);
			if(current != null){
				var parser = this.parseAlias(combo);
				if(!parser){
					return false;
				}
				return current.keyMap.removeCombo(parser.keys);
			}
			return false;
		}
	}

	// CREATE A CALLABLE EVENT on, LIKE DEFAULT
	Object.prototype.onKeyMap = function(combo, callback){
		return keyMapObj.addEvent(this, combo, callback);
	}

	Object.prototype.offKeyMap = function(combo){
		return keyMapObj.disableCombo(this, combo);
	}

	return keyMapObj;
}());