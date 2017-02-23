var KeyMap = (function(){

	var keyMap = function(){};
	var alias = {
		8	: ['backspace'],
		13	: ['enter'],
		17	: ['control', 'ctrl'],
		18	: ['alt'],
		16	: ['shift'],
		46	: ['delete', 'del'],
		9	: ['tab'],
		27	: ['escape', 'esc'],
		91	: ['os', 'super', 'window', 'windows', 'iniciar'],
		38	: ['arrowup', 'up'],
		37	: ['arrowleft', 'left'],
		39	: ['arrowright', 'right'],
		40	: ['arrowdown', 'down'],
		46	: ['delete'],
		36	: ['home'],
		33	: ['pageup'],
		34	: ['pagedown'],
		35	: ['end'],
	};
	var onComboKey = [];
	var map = {};

	function getKeyCodeFromAlias(str){
		for(var keyCode in alias){
			if(alias[keyCode].indexOf(str.toLowerCase()) != -1){
				return parseInt(keyCode);
			}
		}
		if(str.length == 1){
			return str.toUpperCase().charCodeAt();
		}
		return false;
	}

	keyMap.prototype = {
		checkCombo : function(_keys){
			var _return = true;
			if(Array.isArray(_keys)){
				for(var i = 0; i < _keys.length; i++){
					var key = _keys[i];
					if(typeof map[key] === 'undefined' || !map[key]){
						_return = false;
						return;
					}
				}
			}else if(typeof _keys == 'object'){
				for(var i in _keys){
					var key = _keys[i];
					if(typeof map[key] === 'undefined' || !map[key]){
						_return = false;
						return;
					}
				}
			}else if(typeof _keys == 'number'){
				_return = typeof map[_keys] !== 'undefined' && map[_keys];
			}else{
				_return = false;
			}
			return _return;
		},
		addAlias : function(key, strAlias){
			if(typeof alias[key] == 'undefined'){
				alias[key] = [];
			}
			if(Array.isArray(strAlias)){
				alias[key].concat(strAlias);
			}else if(typeof strAlias == 'string'){
				alias[key].push(strAlias);
			}else{
				return false;
			}
			return true;
		},
		addEvent : function(combo, callback){

			if(typeof callback != 'function'){
				return false;
			}

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

			var len = _keys.length;

			if(typeof onComboKey[len] === 'undefined'){
				onComboKey[len] = [];
			}

			onComboKey[len].push({
				keys : _keys,
				callback : callback,
			});

			return true;
		}
	}

	var newKeyMap = new keyMap();
	
	// GET KEYS UP AND DOWN
	// SET TRUE WHEN KEY DOWN
	onkeydown = onkeyup = function(e){
		e = e || event;
		map[e.keyCode] = (e.type == 'keydown');

		// GET TOTAL KEYS DOWN
		var len = Object.values(map).filter(function(value){
			return value;
		}).length;

		if(typeof onComboKey[len] === 'undefined'){
			return;
		}
		
		// CHECK ALL COMBOS CREATED
		for (var i = 0; i < onComboKey[len].length; i++) {
			var current = onComboKey[len][i];
			// PASS THE KEYS FROM COMBO TO CHECK IF IS OK WITH THE MAP
			if(newKeyMap.checkCombo(current.keys)){
				e.preventDefault();
				current.callback(e, current.keys);
			}
		}
	}

	return newKeyMap;
}());

// Exemples
KeyMap.addEvent(['alt', 'shift', 'f'], function(e){
	console.log(new Date());
});

KeyMap.addEvent(['ctrl', 's'], function(e){
	console.log('save');
});

KeyMap.addEvent('esc', function(e){
	console.log('exit');
});

KeyMap.addEvent(['shift','esc'], function(e){
	console.log('exit');
});

KeyMap.addEvent('backspace', function(e){
	console.log('remove char');
});