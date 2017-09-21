

function Tetris(){

	/**
	 * переменные
	 * @type {Tetris}
	 */
	var scope = this;

	var deltaTime=0; //разница между текущим временем и временем последнего падения фигуры
	var lastStepDownTime=0; //время последнего падения фигуры

	var figureFallTime=700; //время падения фигуры
	var score=0; //счет
	var is_paused=false; //остановлена ли игра
	var curState="playing"; //текущее состояние игры
	var isGameOver; //закончена ли игра

	var interval; //идентификатор setInterval

	var fieldMatrix; //сетка игрового поля, состоит из 0 и 1. 0 - поле не зпаолнено, 1 - заполнено

	var fieldCanvas; //canvas игрового поля
	var stage; //коннтейнер, на котором располагаются слои

	var layerStatic; //статичный слой, на котором рисуется игровой стакан
	var layerActive; //активный слой, на котором движется фигура

	var figureValues =  [ "11,11", "1,1,1,1", "110,011", "10,10,11", "111,010"]; //значения фигур
	var figures=[]; //массив объектов фигур
	var activeFigure; //активная фигура

	var scoreDOMElem; //ссылки на элементы DOM
	var stateDOMElem;
	var gameOverDOMElem;

	/**
	 * константы
	 * @type {number}
	 */
	var SCORE_FOR_FALL=10; //очки за падение фигуры
	var SCORE_FOR_DEL_ROW=100; //очки за сгорание слоя

	var CELLSIZE = 40; //размер клетки

	var NUM_OF_ROWS=20;//количество строк сетки
	var NUM_OF_COLUMNS=10; //количество столбцов сетки

	var GAME_OVER_STATE="gameover"; //состояние окончания игры
	var PLAY_GAME_STATE="start"; //состояние начала игры
	var INACTIVE_GAME_STATE="inactive"; //состояние паузы игры

	init();

	/**
	 * вызывается при создании объекта тетрис, инициализирует и создает слои, фигуры и т. д.
	 */
	function init(){

		bindEvents(); //привязка событий

		createLayers(); //создание слоев

		scoreDOMElem=document.getElementById('scoreResult');  //создание ссылок на элементы DOM
		stateDOMElem=document.getElementById('stateVal');
		gameOverDOMElem=document.getElementById('game-over').style;

		for(var i=0; i<figureValues.length; i++) {  //создание фигур
			figures.push(new Figure(figureValues[i]));
		}
	}

	/**
	 * возвращает состояние игры
	 * @returns {string}
	 */
	this.getState=function(){
		return curState;
	};

	/**
	 * возвращает счет игры
	 * @returns {number}
	 */
	this.getScore=function(){
		return score;
	};

	/**
	 * обновляет счет
	 * @param val
	 */
	function updateScore(val){
		if(!isGameOver)
			score+=val;
		else
			score=val;
		scoreDOMElem.value=score.toString();
	}

	/**
	 * обновляет состояние игры
	 * @param data
	 */
	function updateState(data){
		curState=data;
		stateDOMElem.value=curState;
	}


	/**
	 * функция запуска игры
	 */
	this.start=function(){
		reset();
		draw( layerStatic, fieldMatrix, 0, 0 );
		getRandomFigure();
		lastStepDownTime = Date.now();
		interval=setInterval(gameStep, Math.floor(1000/20));
	};

	/**
	 * ресетит данные игры
	 */
	function reset(){

		updateState(PLAY_GAME_STATE); //ресет данных игры
		updateScore(0);
		isGameOver=false;
		initField();

		clearInterval(interval); //очистка интервала

		layerStatic.graphics.clear(); //очистка слоев
		layerActive.graphics.clear();
		stage.update();

		gameOverDOMElem.display = 'none';
	}

	/**
	 * управление паузой игры
	 * @param flag
	 */
	this.setPaused=function(flag){
		is_paused=flag;
		if(is_paused)
			updateState(INACTIVE_GAME_STATE);
		else
			updateState(PLAY_GAME_STATE);
	};


	/**
	 * игровой шаг
	 */
	function gameStep(){
		if(!is_paused && !isGameOver) {
			handleKeyEvents();
			deltaTime = Date.now() - lastStepDownTime;
			if (deltaTime >= figureFallTime) {
				lastStepDownTime += figureFallTime;
				makeFigureStepDown();
			}
		}
		else{
			lastStepDownTime=Date.now();
		}
	}

	/**
	 * удаляет строки в стакане игры
	 */
	function deleteFullRows(){
		for(var y = NUM_OF_ROWS - 1; y >= 0; y--) {

			var counter = 0;
			var row = fieldMatrix[y];
			for (var x = 0; x < NUM_OF_COLUMNS; x++) {  //считаем количество единиц в строке
				if (row[x] == 1){
					counter++;
				}
			}

			if(counter == NUM_OF_COLUMNS){    //если строка заполнена единицами, удаляем её
				var nullRow = [];
				for(var i = 0; i < NUM_OF_COLUMNS; i++)
					nullRow[i] = 0;
				fieldMatrix.splice( y , 1);
				fieldMatrix.unshift(nullRow);
				y++;

				updateScore(SCORE_FOR_DEL_ROW); //обновляем счет
				figureFallTime -= 25;      //уменьшаем время падения фигуры

				callBackCBScored(function (score) {   //вызов колбека после сгорания слоя
					console.log("callback called! " + score);
				});
			}
		}
	}

	/**
	 * рисует матрицу в консоль
	 * @param matrix
	 */
	function printMatrix(matrix){
		var s = "";
		for(var y = 0,  l=matrix.length; y<l; y++) {
			s += (y < 10 ? " " : "") + (y) + "> ";
			for (var x = 0, t = matrix[y].length; x<t; x++) {
				s += matrix[y][x] ? "O" : ".";
			}
			s += "\n";
		}
		console.log(s);
	}


	/**
	 * сделать шаг фигуры вниз
	 * @returns {boolean}
	 */
	function makeFigureStepDown(){

		var matrixToDraw = activeFigure.getCurrentMatrix();  //присвоение позиций и матрицы активной фигуры переменным
		var posX = activeFigure.getPosX();
		var posY = activeFigure.getPosY();

		if(canFigureMove(posX, posY+1, matrixToDraw)) {   //если фигура может двигаться, смещаем её вниз и рисуем
			activeFigure.setPosY(posY+1 );
			draw( layerActive, matrixToDraw, posX*CELLSIZE, posY*CELLSIZE);
			return true;
		}

		else{                             //если фигура не может двигаться:

			addToStaticLayer(posX, posY, matrixToDraw); //добавляем в статику
			deleteFullRows();                          //удаляем заполненные строки
			draw( layerStatic, fieldMatrix, 0, 0);     //рисуем
			updateScore(SCORE_FOR_FALL);                    //увеличиваем счет
			getRandomFigure();                           //создаем новую фигуру
			return false;
		}
	}

	/**
	 * сделать шаг фигуры влево - вправо + повороты
	 * @param deltaX
	 * @param deltaY
	 * @param doRotate
	 */
	function makeRelativeMove( deltaX, deltaY, doRotate ){

		var matrixToDraw=activeFigure.getCurrentMatrix();   //присвоение позиций и матрицы активной фигуры переменным
		var posX=activeFigure.getPosX();
		var posY=activeFigure.getPosY();


		if(doRotate) {                   //если можно повернуть, присваиваем фигуре новые координаты относительно её центра
			matrixToDraw = activeFigure.getNextMatrix();
			posY += activeFigure.getCurrentPivotY()-1;
			posX += activeFigure.getCurrentPivotX()-1;
		}


		if(canFigureMove( posX + deltaX, posY + deltaY, matrixToDraw)) {  //если фигура может двигаться, присваиваем ей новые позиции
			activeFigure.setPosX(posX+deltaX);
			activeFigure.setPosY(posY+deltaY);
			if(doRotate){
				activeFigure.setCurrentStateIndex(activeFigure.getCurrentStateIndex()+1);
				activeFigure.setCurrentState();
			}

			draw(layerActive, matrixToDraw, activeFigure.getPosX() * CELLSIZE, activeFigure.getPosY()* CELLSIZE);  //рисуем фигуру
		}
	}


	/**
	 * инициализация основного поля (сетки), (заполнение нулями)
	 */
	function initField(){
		fieldMatrix = [];
		for(var i = 0; i < NUM_OF_ROWS; i++){
			fieldMatrix[i] = [];
			for(var j = 0; j < NUM_OF_COLUMNS; j++){
				fieldMatrix[i][j] = 0;//Math.random()>.5 ? 1 : 0;
			}
		}
	}

	/**
	 * добавление фигуры на игровой стакан
	 * @param posX
	 * @param posY
	 * @param matrix
	 */
	function addToStaticLayer(posX, posY, matrix){
		for(var i = 0; i < matrix.length; i++) {
			for (var j = 0; j < matrix[i].length; j++) {
				fieldMatrix[posY + i][posX + j] += matrix[i][j];
			}
		}
	}

	/**
	 * обрабатывает окончание игры
	 */
	function gameOver() {
		gameOverDOMElem.display = 'block';
		isGameOver = true;
		updateState(GAME_OVER_STATE);

		callBackGameOver(function (state) {
			console.log("callback called! " + state);
		});
	}

	/**
	 * проверяет, может ли фигура находиться в такой позиции и состоянии
	 * @param posX
	 * @param posY
	 * @param figureMatrix
	 * @returns {boolean}
	 */
	function canFigureMove(posX, posY, figureMatrix){

		var numOfRowsFigure = figureMatrix.length;
		var numOfColumnsFigure = figureMatrix[0].length;

		if(posY + numOfRowsFigure-1 == NUM_OF_ROWS)  //достигла ли фигура пола
			return false;

		if(posX + numOfColumnsFigure-1 >= NUM_OF_COLUMNS)   //достигла ли фигура правой стенки стакана
			return false;

		if(posX < 0)   //достигла ли фигура левой стенки стакана
			return false;

		for(var i = 0; i < numOfRowsFigure; i++) {     //пересекается ли фигура с другими
			for (var j = 0; j < numOfColumnsFigure; j++) {
				if(fieldMatrix[posY + i][posX + j] + figureMatrix[i][j] == 2) {
					return false;
				}
			}
		}
		return true;
	}


	/**
	 * создание слоев
	 */
	function createLayers(){

		var fieldCanvas = document.createElement('canvas'); //создание канвы
		fieldCanvas.id="fieldCanvas";
		fieldCanvas.width = 400;
		fieldCanvas.height = 800;
		document.getElementById("game").appendChild(fieldCanvas);

		stage = new createjs.Stage( fieldCanvas );  //создание stage

		layerStatic = new createjs.Shape();  //создание статического слоя
		stage.addChild(layerStatic);

		layerActive = new createjs.Shape(); //создание активного слоя
		stage.addChild(layerActive);

	}


	/**
	 * генерирование рандомной формы фигуры
	 * @returns {*} форма фигуры
	 */
	function getRandomFigure() {

		var result = Math.floor( Math.random() * figureValues.length ); //генерирование случайного числа

		activeFigure = figures[result]; //создание активной фигуры из массива фигур и присвоение ей значений по умолчанию
		activeFigure.reset();

		//проверка, может ли фигура двигаться, если не может - gameover
		if(!canFigureMove(activeFigure.getPosX(), activeFigure.getPosY(), activeFigure.getCurrentMatrix())) {
			gameOver();
		}
		else  //если фигура может двигаться - рисуем
			draw( layerActive, activeFigure.getCurrentMatrix(), activeFigure.getPosX()*CELLSIZE, activeFigure.getPosY()*CELLSIZE);

	}


	/**
	 * рисует графические элементы по матрице из 0 и 1
	 * @param matrix
	 * @param stage
	 * @param shape
	 * @param posX
	 * @param posY
	 */
	function draw( shape, matrix, posX, posY ){
		var g = shape.graphics;
		g.clear();
		g.beginStroke("Black").beginFill("White");
		for (var j = 0, l = matrix.length; j < l; j++) {
			for (var i = 0, t = matrix[j].length; i < t; i++) {
				if (matrix[j][i] == 1) {
					g.drawRect(i * CELLSIZE + posX, j * CELLSIZE + posY, CELLSIZE, CELLSIZE);
				}
			}
		}
		g.endFill();
		stage.update();
	}


	/**
	 * обработка событий нажатия клавиш клавиатуры
	 */
	function handleKeyEvents(){
		switch(keyCode){
			case 37:
				if(keysArray[37].is_pressed ){   //влево
					makeRelativeMove(-1, 0, false);
					keysArray[37].is_pressed = false;
				}
			break;

			case 38:
				if(keysArray[38].is_pressed && !keysArray[38].is_used){   //вверх (поворот фигуры)
					makeRelativeMove(0, 0, true);
					keysArray[38].is_pressed = false;
					keysArray[38].is_used = true;
				}
				break;

			case 39:
				if(keysArray[39].is_pressed ){   //вправо
					makeRelativeMove(1, 0, false);
					keysArray[39].is_pressed = false;
				}
				break;

			case 40:
				if(keysArray[40].is_pressed){   //вниз
					makeFigureStepDown();
					keysArray[40].is_pressed = false;
				}
				break;

			case 32:
				if(keysArray[32].is_pressed && !keysArray[32].is_used){ //пробел
					for(var i = activeFigure.getPosY(); i < NUM_OF_ROWS; i++)
						if(!makeFigureStepDown())
							break;
					keysArray[32].is_pressed = false;
					keysArray[32].is_used = true;
					lastStepDownTime = Date.now();
				}
				break;
		}
	}

	var keysArray = []; //клавиши, доступные в игре
	var key = {  //определяет , нажата ли клавиша и используется ли
		is_used:false,
		is_pressed:false
	};
	var keyCode; //кейкод нажатой клавиши

	/**
	 * привязка событий нажатия клавиш
	 */
	function bindEvents(){
		addEventListener("keydown", function(event) {
			keyCode=event.keyCode;
			if(!keyCode)keysArray = {};
			else keysArray[keyCode]=key;
			keysArray[keyCode].is_pressed = true;
			keysArray[keyCode].is_used = true;
		});

		addEventListener("keyup", function(event) {
			keyCode=event.keyCode;
			if(!key)keysArray = {};
			else keysArray[keyCode] = key;
			keysArray[keyCode].is_used = false;
		});
	}

	function callBackGameOver(CB_Gameover) {
		CB_Gameover(curState);
	}

	function callBackCBScored(CB_Scored) {
		CB_Scored(curState);
	}

}


