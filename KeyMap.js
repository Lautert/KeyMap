var KeyMap = (function(){

	// CONVERSÃO E ALIAS DE CHAVES
	var alias = {
		16	: ['shift'],
		17	: ['control', 'ctrl'],
		18	: ['alt'],
		13	: ['enter'],
		8	: ['backspace'],
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
		2000 : ['mouse_0'],
		2001 : ['mouse_1'],
		2002 : ['mouse_2'],
	};

	function getKeyCodeFromAlias(str){
		if(str.length == 1){
			return str.toUpperCase().charCodeAt();
		}
		for(var keyCode in alias){
			if(alias[keyCode].indexOf(str.toLowerCase()) != -1){
				return parseInt(keyCode);
			}
		}
		return false;
	}

	// OBJETO DE MONITORAMENTO
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

			// SETA COMBO PARA INSTANCIA CRIADA
			this.onComboKey[len].push({
				keys : combo,
				callback : callback,
			});

			return true;
		},
		keyMapEvent : function(e){
			e = e || event;
			console.log(e);

			if(typeof e.keycode == 'undefined'){
				this.map[2000+e.button] = (e.type == 'mousedown');
			}else{
				this.map[e.keyCode] = (e.type == 'keydown');
			}

			// RESETA APOS 1s CASO POR ALGUM MOTIVO keyup NÃO SEJA DISPARADO
			var self = this;
			if(e.type == 'keydown'){
				setTimeout(function(){
					if(typeof e.keycode == 'undefined'){
						self.map[2000+e.button] = false;
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
				alias[key].concat(strAlias);
			}else if(typeof strAlias == 'string'){
				alias[key].push(strAlias);
			}else{
				return false;
			}
			return true;
		},
		addEvent : function(combo, callback, options){

			if(this.onkeyup === 'undefined' || this.onkeydown === 'undefined'){
				return false;
			}

			if(typeof callback != 'function'){
				return false;
			}

			// CONVERTE AS KEYS PARA CODIGO QUE DEVE BATER COM e.keyCode
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

			// AQUI JA TENHO AS TECLAS QUE DEVEM SE PROCESSADAS

			// CRIA UMA INTANCIA EM UM ARRAY PARA PODER SER RECUPERADO POSTERIORMENTE
			// LIKE Singleton
			var i = elements.map(function(t){return t.element;}).indexOf(this);

			if(!options){
				options = {};
			}

			if(i == -1){
				elements.push({
					element : this,
					keyMap : new keyMap(),
					options : Object.assign(defaultOptions, options),
				});
				i = elements.length-1;
			}

			// RECUPERA A INSTANCIA JA CRIADA (Singleton)
			var current = elements[i];

			current.keyMap.addCombo(_keys, callback);

			var action = function(e){
				if(current.options.preventDefault){
					e.preventDefault();
				}
				var action = current.keyMap.keyMapEvent(e);
			}

			if(this.onkeyup == null){
				this.onkeyup = action;
				this.onkeydown = action;
			}

			if(this.onmousedown == null){
				this.onmousedown = action;
				this.onmouseup = action;
			}

			// if(options['eventMouse']){
			// 	this.onmousedown = this.onmouseup = current.keyMapEvent;
			// }

			return true;
		}
	}

	Object.prototype.onKeyMap = function(combo, callback, options){
		newKeyObj.addEvent.call(this, combo, callback, options);
	}

	return newKeyObj
}());

window.onload = function(){
	area = document.getElementsByTagName('textarea')[0];
	area.onKeyMap(['ctrl', 'mouse_0'], function(e){
		alert('area save');
	});

	// document.onKeyMap('esc', function(){
	// 	alert('doc escape');
	// });
}

// Exemples
// KeyMap.addEvent(['alt', 'shift', 'f'], function(e){
// 	console.log(new Date());
// });

// KeyMap.addEvent(['ctrl', 's'], function(e){
// 	console.log('save');
// });

// KeyMap.addEvent('esc', function(e){
// 	console.log('exit');
// });

// KeyMap.addEvent(['shift','esc'], function(e){
// 	console.log('exit');
// });

// KeyMap.addEvent('backspace', function(e){
// 	console.log('remove char');
// });