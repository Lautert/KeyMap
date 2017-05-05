window.onload = function(){

	l = console.log;

	l('Alias five', KeyMap.addAlias(53, 'five'));

	area = document.getElementsByTagName('textarea')[0];

	area.onKeyMap(['ctrl','s'], function(e){
		e.preventDefault();
		alert('Save');
	});

	area.onKeyMap(['ctrl','b'], function(e){
		e.preventDefault();
		alert('favorites');
	});

	area.onKeyMap({'keyboard':'ctrl', 'mouse':'mouse_0'}, function(e){
		alert('Attack');
	});

	KeyMap.addEvent(area, 'five', function(){
		alert('Number FIVE');
	});

	KeyMap.addEvent(area, 53, function(){
		alert('Number FIVE not override');
	});

	l("Create document event 'five'", KeyMap.addEvent(document, 'five', function(){
		alert('DOM Number FIVE');
	}));

	l("Remove document event 'five'", document.offKeyMap('five'));

	document.onKeyMap(54, function(){
		alert('Number SIX');
	});	

	document.onKeyMap('esc', function(e){
		alert('exit page');	
	});

	document.onKeyMap(['ctrl','shift','s'], function(e){
		e.preventDefault();
		alert('Save All DOM');
	});
}