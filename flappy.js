/*

	flappy.js

	Created by Mateusnbm on Mar 11, 2017.

	*** Important Notice:

	Portions of this software were obtained from the w3schools website 
	on Mar 11, 2017 at 4:25 PM, publicly available through the URL:

	https://www.w3schools.com/graphics/game_intro.asp
	
	The source code was modified for learning purposes and made
	publicly available through the URL:

	https://github.com/mateusnbm/js-flappy/

	*** License:

	MIT License

	Copyright (c) 2017 Mateus

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.

*/

var heroBlock;

var scoreLabel;
var scoreBottomBar;

var jars = [];
var obstacles = [];

var gameScene;
var gameScore = 0;

/*

 Conveniences.

 */

 function convertCanvasToImage(canvas) {

	var image = new Image();

	image.src = canvas.toDataURL("image/png");

	return image;
}

function textLabel(x, y, font, fontSize, textColor) {

	this.x = x;
	this.y = y;
	
	this.font = font;
	this.fontSize = fontSize;

	this.textColor = textColor;
	
	this.update = function(scene, text) {

		context = scene.context;
		
		context.font = this.fontSize + " " + this.font;
		context.fillStyle = textColor;

		var width = context.measureText(text).width;
		var height = context.measureText(text).height;

		var x = this.x - width;
		var y = this.y;

		context.fillText(text, x, y);
	
	}
	
}

function rectangularBlock(x, y, width, height, color) {

	this.width = width;
	this.height = height;
	
	this.speedX = 0;
	this.speedY = 0;

	this.x = x;
	this.y = y;
	
	this.gravity = 0;
	this.gravitySpeed = 0;

	this.update = function(scene) {
		
		context = scene.context;
		
		context.fillStyle = color;
		context.fillRect(this.x, this.y, this.width, this.height);
		
	}
	
}

function heroBlock(x, y, width, height, color) {

	this.width = width;
	this.height = height;
	
	this.speedX = 0;
	this.speedY = 0;

	this.x = x;
	this.y = y;
	
	this.gravity = 0;
	this.gravitySpeed = 0;

	this.update = function(scene) {
		
		context = scene.context;
		
		context.fillStyle = color;
		context.fillRect(this.x, this.y, this.width, this.height);
		
	}

	this.accelerate = function(g) {

		this.gravity = g;

	}
	
	this.newPos = function(scene) {

		this.gravitySpeed += this.gravity;
		
		this.x += this.speedX;
		this.y += this.speedY + this.gravitySpeed;
		
		this.hitBottom(scene);

	}
	
	this.hitBottom = function(scene) {

		var rockbottom = scene.gameCanvasHeigth - this.height;
		
		if (this.y > rockbottom) {

			this.y = rockbottom;
			this.gravitySpeed = 0;

		}

	}
	
	this.crashWith = function(otherobj) {

		var myleft = this.x;
		var myright = this.x + (this.width);
		var mytop = this.y;
		var mybottom = this.y + (this.height);
		var otherleft = otherobj.x;
		var otherright = otherobj.x + (otherobj.width);
		var othertop = otherobj.y;
		var otherbottom = otherobj.y + (otherobj.height);
		var crash = true;
		
		if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {

			crash = false;

		}

		return crash;
	}

}

/*

 Game Controls.

 */

window.addEventListener("keydown", keyboardKeyDown, false);
window.addEventListener("keyup", keyboardKeyUp, false);

function accelerate(g) {

	heroBlock.accelerate(g);

}

function keyboardKeyDown(keyboardEvent) {

	if (keyboardEvent.keyCode == 32) {

		heroBlock.accelerate(-0.2);

	}

}

function keyboardKeyUp(keyboardEvent) {

	if (keyboardEvent.keyCode == 32) {

		heroBlock.accelerate(0.05);

	}

}

/*

 Game setup.

 */

function generateGameScene(width, height) {

	return {

		canvas : document.createElement("canvas"),
		
		start : function() {

			this.canvas.width = width;
			this.canvas.height = height;

			this.gameCanvasWidth = width;
			this.gameCanvasHeigth = height-50;
			
			this.context = this.canvas.getContext("2d");

			// Update the game scene every 20ms.

			this.frameNo = 0;
			this.interval = setInterval(updateGameScene, 20);
			
		},
		
		clear : function() {

			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		}

	};

}

/* 

 Game handling. 

 */

function startGame() {

	var sceneWidth = 512;
	var sceneHeight = 350;

	// Create the main game scene.

	gameScene = generateGameScene(sceneWidth, sceneHeight);

	// Create the main character, the moving red block.

	heroBlock = new heroBlock(10, (sceneHeight-30)/2, 30, 30, "red");

	heroBlock.gravity = 0.05;

	// Create a bottom bar to display the score.

	scoreBottomBar = new rectangularBlock(0, sceneHeight-50, sceneWidth, 50, "#CECECE");

	// Create a text label to display the score.
	
	scoreLabel = new textLabel(sceneWidth-10, sceneHeight-15, "Consolas", "30px", "black");
	
	gameScene.start();

}

function updateGameScene() {

	// Game loop, called every 20ms.

	// Clean up obstacles no longer visible.
	// Check if the hero crashed with an obstacle.

	for (i = 0; i < obstacles.length; i += 1) {

		var obstacle = obstacles[i];

		if (obstacle.x < -obstacle.width) {

			// The obstacle is no longer visible, remove it.

			obstacles .splice(i, 1);

		}else{

			if (heroBlock.crashWith(obstacles[i])) {

				return;

			}

		}

	}

	// Clean up jars no longer visible.
	// Check if the hero collected the jar.

	for (i = 0; i < jars.length; i += 1) {

		var jar = jars[i];

		if (jar.x < -jar.width) {

			// The obstacle is no longer visible, remove it.

			jars.splice(i, 1);

		}else{

			if (heroBlock.crashWith(jar)) {

				gameScore += 250;

				jars.splice(i, 1);

			}

		}

	}

	gameScene.clear();
	gameScene.frameNo += 1;

	// Genereate new obstacles every 3 seconds.
	// Frame count increases every 20ms, 3000/20 = 150 calls.

	if (gameScene.frameNo == 1 || gameScene.frameNo % 150 == 0) {

		var x, height, gap, minHeight, maxHeight, minGap, maxGap;

		x = gameScene.gameCanvasWidth;
		
		minHeight = 20;
		maxHeight = 200;
		
		height = Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);
		
		minGap = 50;
		maxGap = 200;
		
		gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap);
		
		obstacles.push(new rectangularBlock(x, 0, 10, height, "green"));
		obstacles.push(new rectangularBlock(x, height + gap, 10, x - height - gap, "green"));

	}

	// Generate a bonus jar every 12 seconds, appearing between obstacles.
	// Frame count increases every 20ms, 12000/20 = 600 calls.

	if (gameScene.frameNo % 600 == 0) {

		var minPos = 30;
		var maxPos = gameScene.gameCanvasHeigth-60;

		var posX = gameScene.gameCanvasWidth + 75;
		var posY = Math.floor(Math.random()*(maxPos-minPos+1)+minPos);

		var jar = new rectangularBlock(posX, posY, 15, 15, "blue");

		jars.push(jar);

	}
	
	// Move the obstacles.

	for (i = 0; i < obstacles.length; i += 1) {

		var obstacle = obstacles[i];

		obstacle.x -= 1;

		obstacle.update(gameScene);

	}

	// Move the jars.

	for (i = 0; i < jars.length; i++) {

		var jar = jars[i];

		jar.x -= 1;

		jar.update(gameScene);

	}

	// A hundred points are given for each obstacle crossed.

	var barCrossPoints = 100 * Math.floor(Math.max(0, (gameScene.frameNo / 150) - 2.2));

	var score = gameScore + barCrossPoints;

	// Update the canvas content.

	scoreBottomBar.update(gameScene);
	
	scoreLabel.update(gameScene, "SCORE: " + score);

	heroBlock.newPos(gameScene);
	heroBlock.update(gameScene);

	// Sometimes looks like the obstacles are blinking, the first thought was to create
	// some sort of screen buffering system to fix the delay between cleaning the game canvas
	// and drawing a new frame. Well, this didn't work as expected, needs further investigation.

	// Draw the game scene.
	// Draw the buffered canvas to the main game canvas.

	var image = convertCanvasToImage(gameScene.canvas);

	var gameCanvas = document.getElementById("gameCanvas");
	var context = gameCanvas.getContext("2d");

	image.onload = function() {

		context.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
		context.drawImage(image, 0, 0);

		// Remove the reference to the image, so (theoretically), the garbage collector can dispose it.

		image = null;

	}

}







