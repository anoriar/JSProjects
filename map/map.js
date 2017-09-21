
$(function(){
	$(document).ready(function(){
		initCities();
		initTooltips();
	});

	function initCities(){
		$.getJSON( "res/cities.json", function( data ){
			for(var i=0; i < data.cities.length; i++){
				$("div.map").append("<figure class = 'markers' id = marker" + i + " title = "+ data.cities[i].cityName +">");
				var offsety = data.cities[i].y;
				var offsetx = data.cities[i].x;
				$("#marker" + i + "").css({
					"top" : "" + offsety + "px",
					"left" : "" + offsetx + "px"
				});
			}

			$(".markers").each(function(index){
				$(this).fadeIn("slow");
				$(this).tooltip({
					position: { my: "center top", at: "center bottom+15" }
				});
			});
		});
	}

	function initTooltips(){
		$.getJSON( "res/areas.json", function( areaData ) {
			setInterval(function () {
				var maxNumberOfImg = 5;
				$(".imgTooltip").remove();
				var positionArray = [];
				var randomElemArr = [];
				for (var k = 0; k < areaData.imgList.length; k++)
					randomElemArr[k] = k;
				for (var i = 0; i < maxNumberOfImg; i++) {
					var indexOfRandomElem = getRandomInt(0, randomElemArr.length);
					var numOfImg = randomElemArr[indexOfRandomElem];
					randomElemArr.splice(indexOfRandomElem, 1);
					var flag = false;
					if (i == 0) {
						positionArray.push({x: areaData.imgList[numOfImg].x, y: areaData.imgList[numOfImg].y});
						flag = true;
					}
					else {
						if(checkElements(positionArray, {x: areaData.imgList[numOfImg].x, y: areaData.imgList[numOfImg].y}) && !flag){
							flag=true;
							positionArray.push({x: areaData.imgList[numOfImg].x, y: areaData.imgList[numOfImg].y});
						}
					}
					if (flag) {
						$("<label>", {
							class: "imgTooltip",
							title:"",
							style: "top:" + (areaData.imgList[numOfImg].y + $(".map").offset().top) +
							"px; left:" + (areaData.imgList[numOfImg].x + $(".map").offset().left) + "px;"
						}).appendTo("body").tooltip({
							content: "<img src='" + areaData.imgList[numOfImg].str + "'>",
							show: { effect: "fade", duration: 1000 },
							hide: { effect: "explode", duration: 1000 },
							position: { my: "center bottom-15", at: "center top+15" }
						}).tooltip("open");
					}
				}
			}, 5000);

		});
	}

	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	}

	function isItemsAway(x1, y1, x2, y2, rad){
		if((Math.abs(x1-x2)>=rad)&&(Math.abs(y1-y2)>=rad))
			return true;
		return false;
	}

	function checkElements(array, obj){
		if(!(array instanceof  Array))
			return false;
		if(array.length==0)
			return false;
		var k=0;
		for(var i=0; i<array.length; i++){
			if(isItemsAway(array[i].x, array[i].y, obj.x, obj.y, 80))
				k++;
		}
		if (k==array.length)
			return true;
		return false;
	}
});

