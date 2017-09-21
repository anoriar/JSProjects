
function Figure( data ){

	var NUM_OF_COLUMNS=10; //количество столбцов игрового стакана
	var states = new Array(4); //массив состояний поворта матрицы
	var posX=Math.ceil(NUM_OF_COLUMNS/2)-1; //позиция фигуры по оси x
	var posY=0; //позиция фигуры по оси y
	var NUM_OF_STATES=4; //количество состояний поврота фигуры

	parseFigure(data);

	/**
	 * ресетит данные о фигуре
	 */
	this.reset=function(){
		posX=Math.ceil(NUM_OF_COLUMNS/2)-1;
		posY=0;
		current_state_index = 0;
	};


	this.getNumOfStates= function(){
		return NUM_OF_STATES;
	};

	this.getPosX = function(){
		return posX;
	};

	this.getPosY = function(){
		return posY;
	};

	this.setPosY = function(data){
		posY=data;
	};

	this.setPosX = function(data){
		posX=data;
	};


	this.setCurrentState=function(){
		current_state=states[current_state_index];
	};


	this.getCurrentMatrix = function(){
		if(current_state_index==NUM_OF_STATES)
			return states[0].matrix;
		else
			return states[current_state_index].matrix;
	};

	this.getNextMatrix=function(){
		if(current_state_index+1==NUM_OF_STATES)
			return states[0].matrix;
		else
			return states[current_state_index+1].matrix;
	};

	this.getCurrentPivotX = function(){
		return states[current_state_index].pivot_x;
	};

	this.getCurrentPivotY = function(){
		return states[current_state_index].pivot_y;
	};

	this.setCurrentStateIndex = function(data){
		if(data==states.length)
			current_state_index=0;
		else
			current_state_index=data;
	};

	this.getCurrentStateIndex = function(){
		return current_state_index;
	};

	var current_state_index = 0; //текущий индекс состояния поворота
	var current_state=states[current_state_index]; //текущее состояние поворота фигуры


	/**
	 * генерирует 4 состояния фигуры (для вращения)
	 * @param figureMatrix
	 */
	function generateRotation(figureMatrix){

		states[0]= { matrix:figureMatrix, pivot_x: Math.floor(figureMatrix[0].length/2), pivot_y: Math.floor(figureMatrix.length/2) };

		for(var arrIndex = 1; arrIndex<4; arrIndex++) {
			var a = states[arrIndex-1].matrix;
			var m = a.length;
			var n =a[0].length;
			var AT = [];

			for(var i=0;i<n;i++) {
				AT[i] = [];
				for (var j = 0; j < m; j++) {
					AT[i][j] = 0;
				}
			}
			for(var x=0; x < n; x++) {
				var arr=[];
				var t=0;
				for (var y = m-1; y >= 0; y--) {
					arr[t] = a[y][x];
					t++;
				}
				AT[x]=arr;
			}

			states[arrIndex]= { matrix:AT, pivot_x: Math.floor(AT[0].length/2), pivot_y: Math.floor(AT.length/2) };
		}
	}

	/**
	 * парсинг фигуры в матрицу, затем передает эту матрицу в генератор состояний
	 * @param figures
	 */
	function parseFigure(figures){
		var array=figures.split(",");
		var matrix=[];
		for(var i=0; i<array.length; i++) {
			matrix[i]=array[i].split("");
		}
		for(var i=0; i<matrix.length; i++)
			for(var j=0; j<matrix[i].length; j++)
				matrix[i][j]=Number(matrix[i][j]);
		generateRotation(matrix);
	}

}