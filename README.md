# KeyMap

KeyMap is a keyboard/mouse event manager, it helps you to create trigger when a combo keys is found.

## USING

### Create Combo

If you need create a combo key to textarea to save content, use :

``` js
// DOMElement.onKeyMap(Array|Object|Number|String, function);
DOMTextArea.onKeyMap(['ctrl', 's'], function(e){
    e.preventDefault();
    // code to save this content
    alert('Text Save');
});

// KeyMap.addEvent(DOMElement, Array|Object|Number|String, function);
KeyMap.addEvent(DOMTextArea, ['ctrl', 's'], function(){
    e.preventDefault();
    // code to save this content
    alert('Text Save');
});
```

Note : This method return a boolean to check if event create

### Disable Combo

``` js
DOMTextArea.offKeyMap(['ctrl', 's']);

KeyMap.disableCombo(DOMTextArea, ['ctrl', 's']);
```

Note : This method return a boolean to check if event destroy

### Add Alias

Create a alias :

``` js
// KeyMap.addAlias(keyCode, String alias);
KeyMap.addAlias(53, 'five');
```

Note : Alias must be in lowercase, and have minimum two letters, because if you use 's' it auto picks up 83 keyCode
Note 2 : This method return a boolean to check if alias create

## Alias Default

``` js
{
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
}
```

Note : Currenty not have a method to remove alias, if you need remove Default alias, you need remove in [KeyMap.js](https://github.com/Lautert/KeyMap/blob/master/KeyMap.js)

Download this project and see [index.html](https://github.com/Lautert/KeyMap/blob/master/index.html)

## Bugs
- In JS is not possibel check if a key is pressed, only can listener keyup/keydown [link](http://stackoverflow.com/questions/1828613/check-if-a-key-is-down), so after "resetKeyAfter"(5s) the key pressed is reset.

``` js
KeyMap.addEvent(DOMTextArea, 'five', function(){
    alert('Number FIVE');
});

KeyMap.addEvent(DOMTextArea, 53, function(){
    alert('Number FIVE not override');
});
```
- In this code is create two triggers, but the second event is not called because when he check keys pressed 'five' is alias to 53 so he call first occurrence there.

## License

[MIT](https://github.com/Lautert/KeyMap/blob/master/LICENSE)