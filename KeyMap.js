/*
 * @name            KeyMap
 * @namespace       KeyMap
 * @version         0.1.5
 * @description     A simple class to call a callback when combo key are pressed on element
 * @author          Guilherme Lautert (lautert250@gmail.com)
 *
 * @license         MIT (https://github.com/Lautert/KeyMap/blob/master/LICENSE)
 */

var KeyMap = (function(){

	var resetKeyAfter = 1; // second
	var resetCallAfter = 1; // second

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

	function keyMap(){
		this.onComboKey = [];
		this.map = {};
		this.doAction = false;
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
				},resetKeyAfter*1000);
			}

			// GET TOTAL KEYS DOWN
			var len = Object.values(this.map).filter(function(value){
				return value;
			}).length;

			if(typeof this.onComboKey[len] === 'undefined'){
				return false;
			}

			// CHECK ALL COMBOS CREATED
			var self = this;
			for (var i = 0; i < this.onComboKey[len].length; i++){
				var current = this.onComboKey[len][i];
				// PASS THE KEYS FROM COMBO TO CHECK IF IS OK WITH THE MAP
				if(this.checkCombo(current.keys)){
					if(!current.called){
						current.callback(e, current.keys);
						// USED TO NOT CALL AGAIN
						current.called = true;
						// USED TO SAY AN EVENT WAS SHOT
						self.doAction = true;
						setTimeout(function(){
							current.called = false;
							self.doAction = false;
						}, resetCallAfter*1000);
						return true;
					}
				}
			}
			return false;
		}
	}

	var elements = [];

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
			var parser = newKeyObj.parseAlias(combo);
			if(parser == false){
				return parser;
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
					events : [],
				});
				i = elements.length-1;
			}

			// GET INSTANCE OF this (Singleton)
			var current = elements[i];

			current.keyMap.addCombo(_keys, callback);

			// CREATE A FUNCTION IN OBJECT THAT CAN USE TO REMOVE THE LISTENER
			var n = current.events.length+1;
			current.events.push({
				combo : _keys,
				action : function(e){
					var check = current.keyMap.keyMapEvent(e);
					// CHECK IF EVENT IS KEYBOARD
					// if(typeof e.keyCode != 'undefined' && !check){
						// NEED CHECK IF this IS THE LAST LISTENER CALLED, IF NOT THE LAST 
						// USE e.preventDefault(); TO ENSURE THAT THE CURRENT DOES NOT INTERFERE IN OTHERS
						// if(n != current.events.length){
							// e.preventDefault();
						// }else{
							// IF IT IS THE LAST, CHECK IF ANYONE HAS BEEN CALLED
						// 	if(current.keyMap.doAction && e.defaultPrevented()){
						// 		e.preventDefault();
						// 	}
						// }
					// }
				}
			});
			var action = current.events[current.events.length-1].action;

			element.addEventListener('keydown', action);
			element.addEventListener('keyup', action);

			if(hasMouseKey){
				element.addEventListener('mousedown', action);
				element.addEventListener('mouseup', action);
			}

			return true;
		},
		// RETURN THE INSTANCE Singleton OF ELEMENT
		getInstance : function(element){
			var i = elements.map(function(t){return t.element;}).indexOf(element);
			if(i == -1){
				return null;
			}
			return elements[i];
		},
		disableCombo : function(element, combo){
			var current = this.getInstance(element);
			if(current != null){
				var parser = this.parseAlias(combo);
				if(!parser){
					return false;
				}
				var i = current.events.map(function(t){return t.combo.toString();}).indexOf(parser.keys.toString());
				if(i !== -1){
					var action = current.events[i].action;
					element.removeEventListener('keydown', action);
					element.removeEventListener('keyup', action);

					if(parser.hasMouseKey){
						element.removeEventListener('mousedown', action);
						element.removeEventListener('mouseup', action);
					}

					return current.keyMap.removeCombo(parser.keys);
				}
			}
			return false;
		}
	}

	// CREATE A CALLABLE EVENT on, LIKE DEFAULT
	Object.prototype.onKeyMap = function(combo, callback){
		return newKeyObj.addEvent(this, combo, callback);
	}

	Object.prototype.offKeyMap = function(combo){
		return newKeyObj.disableCombo(this, combo);
	}

	return newKeyObj;
}());

window.onload = function(){

	area = document.getElementsByTagName('textarea')[0];
	form = document.getElementsByTagName('form')[0];

	area.onKeyMap(['ctrl', 's'], function(e){
		e.preventDefault();
		alert('save');
	});

	// area.onKeyMap(['ctrl', 'w'], function(e){
	// 	e.preventDefault();
	// 	alert('dont close');
	// });

	area.onKeyMap(['ctrl', 'b'], function(e){
		// e.preventDefault();
		alert('favorites');
	});

	// area.onKeyMap(['ctrl', 'mouse_0'], function(e){
	// 	alert('ctrl+mouse_0');
	// });

	// area.onKeyMap(['ctrl', 'alt', 'mouse_2'], function(e){
	// 	e.stopPropagation();
	// 	alert('ctrl+alt+mouse_2');
	// });

	document.onKeyMap('esc', function(e){
	 alert('exit page');
	});
}