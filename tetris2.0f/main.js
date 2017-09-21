$( document ).ready(function() {
	var newGame = new Tetris();
	newGame.start();


	this.startGame=function(){
		if(newGame.getState()=="gameover")
			newGame.start();
	};


	$('#button').click(function() {

		if(newGame.getState()!="gameover") {
			if (newGame.getState() == "inactive") {
				newGame.setPaused(false);
				$(this).attr("class", "pause");

			} else {
				newGame.setPaused(true);
				$(this).attr("class", "play");
			}
		}
	});
});

