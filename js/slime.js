/**
code by James Anselm
gameplay based off that popular slime volleyball game on oneslime.net by Quin Pendragon and Daniel Wedge.

Help Received
- ball collision - http://stackoverflow.com/questions/3604842/javascript-html5-canvas-collision-detection
- ball collision algorithm - http://www.vobarian.com/collisions/2dcollisions2.pdf
**/

function player(radius, ground, gravity, jump, x, velocity_left, velocity_right, leftKey, rightKey, upKey, teamRight, netWidth) {
	//Variables
	this.radius = radius;
	this.ground = ground;
	this.gravity = gravity;
	this.jump = jump;
	this.x_initial = x;
	this.x = x;
	this.y = ground;
	this.x_past = x;
	this.y_past = ground;
	this.velocity_x = 0;
	this.velocity_y = 0;
	this.velocity_left = velocity_left;
	this.velocity_right = velocity_right;
	this.leftKey = leftKey;
	this.rightKey = rightKey;
	this.upKey = upKey;
	this.teamRight = teamRight;
	this.netWidth = 4;
	
	//Methods
	this.drawPlayer = drawPlayer;
	this.movePlayer = movePlayer;

}

function game(ctx, canvas) {
	//Variables
	this.refresh = refresh;
	this.netWidth = 4;
	this.netHeight = 50;
	this.groundHeight = 50;
	this.score = [0,0];
	this.players = [new player(30, canvas.getAttribute("height")-50, .1, -4, 500, -2.5, 2.5, 37, 39, 38, true, 4), new player(30, canvas.getAttribute("height")-50, .1, -4, 100, -2.5, 2.5, 65, 68, 87, false, 4)];
	this.balls = [new ball(10, 100, 100, canvas.getAttribute("height")-50, .2, 9, 7, 0.6)];
	this.intervalID = 0;
	this.ctx = ctx;
	this.canvas = canvas;
	this.pauseGame = false;
	this.pointsToWin = 7;
	this.pauseTime = 1000;
	this.gameOverTime = 3000;
	this.pauseKey = 80;
	
	//Methods
	this.drawBackground = drawBackground;
	this.keyDownHandler = keyDownHandler;
	this.keyUpHandler = keyUpHandler;
	this.collisions = collisions;
	this.updateScore = updateScore;
	this.pause = pause;
	this.unpause = unpause;
	this.gameOver = gameOver;
}

function ball(radius, x, y, ground, gravity, maxVelocity, maxVelocity_y, speedFactor) {
	//Variables
	this.radius = radius;
	this.x_initial = x;
	this.x = x;
	this.y_initial = y;
	this.y = y;
	this.x_past;
	this.y_past;
	this.velocity_x = 0;
	this.velocity_y = 0;
	this.ground = ground;
	this.gravity = gravity;
	this.maxVelocity = maxVelocity;
	this.speedFactor = speedFactor;
	this.maxVelocity_y = maxVelocity_y;
		
	//Methods
	this.drawBall = drawBall;
	this.moveBall = moveBall;
}

function collisions() {
	var i=0, j=0;
	for( i = 0; i < this.balls.length; i++) {
		
		// ball hitting side of net
		if ( this.balls[i].y + this.balls[i].radius > canvas.getAttribute("height")-this.netHeight-this.groundHeight ) {
			if ( this.balls[i].x >= canvas.getAttribute("width")/2 - this.netWidth/2 - this.balls[i].radius && this.balls[i].x_past < canvas.getAttribute("width")/2 - this.netWidth/2 - this.balls[i].radius ) {
				this.balls[i].x = canvas.getAttribute("width")/2 - this.netWidth/2 - this.balls[i].radius; 
				this.balls[i].velocity_x *= -1;
			}
			else if ( this.balls[i].x <= canvas.getAttribute("width")/2 + this.netWidth/2 + this.balls[i].radius && this.balls[i].x_past > canvas.getAttribute("width")/2 + this.netWidth/2 + this.balls[i].radius ) {
				this.balls[i].x = canvas.getAttribute("width")/2 + this.netWidth/2 + this.balls[i].radius; 
				this.balls[i].velocity_x *= -1;
			}				
		}
		
		// ball hitting top of net
		if ( Math.abs(this.balls[i].x - canvas.getAttribute("width")/2) < this.netWidth/2 + this.balls[i].radius && this.balls[i].y + this.balls[i].radius >= canvas.getAttribute("height")-this.netHeight-this.groundHeight && this.balls[i].y_past + this.balls[i].radius < canvas.getAttribute("height")-this.netHeight-this.groundHeight ) {
			this.balls[i].velocity_y *= -1;
		}
		
		// ball hitting player
		for( j = 0; j < this.players.length; j++) {				
			if( Math.sqrt( Math.pow( this.balls[i].x - this.players[j].x , 2) + Math.pow( this.balls[i].y - this.players[j].y , 2 ) ) <= ( this.balls[i].radius + this.players[j].radius ) && this.balls[i].y + this.balls[i].radius - this.players[j].y < 2) { //ball contacts player in circular portion of player.

				//Reposition the ball to be just touching the player	
				var angle = Math.atan( (this.players[j].y - this.balls[i].y)/(this.balls[i].x - this.players[j].x) );
				if ( angle < 0 )
					angle += Math.PI;
				
				this.balls[i].x = this.players[j].x + ( this.balls[i].radius + this.players[j].radius )*Math.cos(angle);
				this.balls[i].y = this.players[j].y - ( this.balls[i].radius + this.players[j].radius )*Math.sin(angle);
				
				//Define masses for the player and ball
				var mass_player = 10;
				var mass_ball = 0.1;
					
				//Get unit normal vector for colliding bodies
				var normal = [this.balls[i].x - this.players[j].x, this.balls[i].y - this.players[j].y];
				var k=0;
				for (k=0; k<2; k++)
						normal[k] /= Math.sqrt( Math.pow( this.balls[i].x - this.players[j].x , 2) + Math.pow( this.balls[i].y - this.players[j].y , 2 ));
					
				//Get the unit tangent vector
				var tangent = [ -normal[1], normal[0] ];
					
				//Get the velocity vectors of the bodies in normal-tangential coordinates [n,t] using dot product
				var velocity_player_old_nt = [ normal[0]*this.players[j].velocity_x + normal[1]*this.players[j].velocity_y, tangent[0]*this.players[j].velocity_x + tangent[1]*this.players[j].velocity_y ];
				var velocity_ball_old_nt = [ normal[0]*this.balls[i].velocity_x + normal[1]*this.balls[i].velocity_y, tangent[0]*this.balls[i].velocity_x + tangent[1]*this.balls[i].velocity_y ];
					
				//Get the new velocity vectors in n-t form
				var velocity_player_new_nt = [ (velocity_player_old_nt[0]*(mass_player - mass_ball) + 2*mass_ball*velocity_ball_old_nt[0] )/(mass_player + mass_ball), velocity_player_old_nt[1] ];
				var velocity_ball_new_nt = [ (velocity_ball_old_nt[0]*(mass_ball - mass_player) + 2*mass_player*velocity_player_old_nt[0] )/(mass_player + mass_ball), velocity_ball_old_nt[1] ];
					
				//Update the velocites
				//this.players[j].velocity_x = velocity_player_new_nt[0]*normal[0] + velocity_player_new_nt[0]*tangent[0];
				//this.players[j].velocity_y = velocity_player_new_nt[0]*normal[1] + velocity_player_new_nt[0]*tangent[1];
				this.balls[i].velocity_x = velocity_ball_new_nt[0]*normal[0] + velocity_ball_new_nt[1]*tangent[0];
				this.balls[i].velocity_y = velocity_ball_new_nt[0]*normal[1] + velocity_ball_new_nt[1]*tangent[1];
				
				/**if ( this.balls[i].velocity_y > 0)
					this.balls[i].velocity_y = -this.balls[i].velocity_y;
				
				//Check if the player and ball will collide again next refresh. If yes, then give the ball more speed
				if( Math.sqrt( Math.pow( (this.balls[i].x + this.balls[i].velocity_x) - (this.players[j].x + this.players[j].velocity_x) , 2) + Math.pow( ( this.balls[i].y + this.balls[i].velocity_y ) - ( this.players[j].y + this.players[i].velocity_y ), 2 ) ) <= ( this.balls[i].radius + this.players[j].radius ) && ( this.balls[i].y + this.balls[i].velocity_y ) + this.balls[i].radius - ( this.players[j].y + this.players[i].velocity_y ) < 2) { //ball contacts player in circular portion of player.
					document.getElementById("gameMessage").innerHTML= "potential conflict" //DEBUG;
					this.balls[i].velocity_x += 40*Math.cos(angle);
					this.balls[i].velocity_y += 40*Math.sin(angle);
					
				}**/
			}
			
			// (2012-02-27) - disabling slime bottom code for now until i figure out whats causing the weird activity when ball is hit near corner of player.
			/**else if ( Math.abs(this.balls[i].y + this.balls[i].radius - this.players[j].y) < 20 && Math.abs(this.balls[i].x - this.players[j].x) < this.players[j].radius ) { //If the ball hits the bottom of the player, treat the player as a flat plate.
				this.balls[i].y = this.players[j].y + this.balls[i].radius; //Re-position the ball to be under the player
				if ( this.balls[i].x - this.players[j].x > 0) //Move the ball from under the player
					this.balls[i].x = this.players[j].x + this.players[j].radius + this.balls[i].radius;
				else
					this.balls[i].x = this.players[j].x - this.players[j].radius - this.balls[i].radius;
				this.balls[i].velocity_y *= -1;
			}**/
		}
	}
}

function drawBackground() {
	//sky
	this.ctx.fillStyle = "rgb(67,110,238)";
	this.ctx.fillRect (0, 0, this.canvas.getAttribute("width"), this.canvas.getAttribute("height")-this.groundHeight);
	
	//ground
	this.ctx.fillStyle = "rgb(150,150,150)";
	this.ctx.fillRect (0, this.canvas.getAttribute("height")-this.groundHeight, this.canvas.getAttribute("width"), this.canvas.getAttribute("height"));
	
	//net
	this.ctx.fillStyle = "rgb(255,255,255)";
	this.ctx.fillRect (this.canvas.getAttribute("width")/2-this.netWidth/2, this.canvas.getAttribute("height")-this.netHeight-this.groundHeight, this.netWidth, this.netHeight);
	
	//score
	var i=0;
	this.ctx.fillStyle = "rgb(255,255,255)";
	this.ctx.strokeStyle = "rgb(255,255,255)";
	for (i=0; i<this.pointsToWin; i++) { //left player score
		if ( i < this.score[0] )	
			this.ctx.fillRect (i*20+20, 10, 10, 10);
		else
			this.ctx.strokeRect (i*20+20, 10, 10, 10);
	}
	for (i=0; i<this.pointsToWin; i++) { //right player score
		this.ctx.fillStyle = "rgb(255,255,255)";
		if ( i < this.score[1] )
			this.ctx.fillRect (this.canvas.getAttribute("width") - i*20 - 20, 10, 10, 10);
		else
			this.ctx.strokeRect (this.canvas.getAttribute("width") - i*20 - 20, 10, 10, 10);
	}
}

function drawBall(ctx) {
	ctx.fillStyle = "rgb(210,105,30)";
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
	ctx.fill();
}

function drawPlayer(ctx) {
	//Body
	ctx.fillStyle = "rgb(248,248,0)";
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.radius, 0, Math.PI, true);
	ctx.fill();
	
	//Eye ball
	ctx.fillStyle = "rgb(255,255,255)";
	ctx.beginPath();
	if ( this.teamRight )
		ctx.arc(this.x - this.radius*0.5, this.y - this.radius*0.5, this.radius*0.2, 0, Math.PI*2, true);
	else
		ctx.arc(this.x + this.radius*0.5, this.y - this.radius*0.5, this.radius*0.2, 0, Math.PI*2, true);
	ctx.fill();
	
	//Eye cornea
	ctx.fillStyle = "rgb(0,0,0)";
	ctx.beginPath();
	if ( this.teamRight )
		ctx.arc(this.x - this.radius*0.5, this.y - this.radius*0.5, this.radius*0.1, 0, Math.PI*2, true);
	else
		ctx.arc(this.x + this.radius*0.5, this.y - this.radius*0.5, this.radius*0.1, 0, Math.PI*2, true);
	ctx.fill();
}

function gameOver(winningTeam) {
	this.pause( this.gameOverTime );
	
	// reset score
	this.score[0] = 0;
	this.score[1] = 0;
}

function keyDownHandler(e) {
	var key=window.event? event : e //distinguish between IE's explicit event object (window.event) and Firefox's implicit.
	var i=0;
	
	// look for pause key
	if( key.keyCode == this.pauseKey ) {
		this.pauseGame = !this.pauseGame;
	}
	else {
		// look for player movement keypress
		for( i = 0; i < this.players.length; i++) {
			switch(key.keyCode) {
				case this.players[i].leftKey: //LEFT
					this.players[i].velocity_x = this.players[i].velocity_left;
					break;
				case this.players[i].rightKey: //RIGHT
					this.players[i].velocity_x = this.players[i].velocity_right;
					break;
				case this.players[i].upKey: //UP
					if ( this.players[i].y == this.players[i].ground) {//only jump when on the ground.
						this.players[i].velocity_y = this.players[i].jump;
					}
					break;
				default:
			}
		}
	}
}

function keyUpHandler(e) {
	var key=window.event? event : e //distinguish between IE's explicit event object (window.event) and Firefox's implicit.
	var i=0;
	for( i = 0; i < this.players.length; i++) {
		switch(key.keyCode) {
			case this.players[i].leftKey: //LEFT
				if (this.players[i].velocity_x != this.players[i].velocity_right) //because of some "debouncing" in the left key, ignore the left key going up when the player is going right.
					this.players[i].velocity_x = 0;
				break;
			case this.players[i].rightKey: //RIGHT
				if (this.players[i].velocity_x != this.players[i].velocity_left)
					this.players[i].velocity_x = 0;
				break;
			default:
		}
	}
}

function moveBall() {
	//Throttle maximum velocity
	if ( Math.sqrt( Math.pow( this.velocity_x , 2) + Math.pow( this.velocity_y , 2) ) > this.maxVelocity ) {
		var oldMagnitude = Math.sqrt( Math.pow( this.velocity_x , 2) + Math.pow( this.velocity_y , 2) );
		this.velocity_x = ( this.velocity_x / oldMagnitude )*this.maxVelocity;
		this.velocity_y = ( this.velocity_y / oldMagnitude )*this.maxVelocity;
	}
	
	if ( (this.x - this.radius) <= 0 ) { // ball touches left wall
		this.velocity_x *= -1;
		this.x = this.radius;
	}
	if ( (this.x + this.radius) >= canvas.getAttribute("width") ) { // ball touches right wall
		this.velocity_x *= -1;
		this.x = canvas.getAttribute("width") - this.radius;
	} 
	
	// update x-component of position
	this.x_past = this.x;
	this.x += this.velocity_x*this.speedFactor;

	if ( (this.y + this.radius) >= this.ground ) { // ball touches the ground (used for games where ball is allowed to touch ground)
		this.y = this.ground - this.radius;
		this.velocity_y *= -0.8;
		this.velocity_x *= 0.9;
		if( Math.abs( this.velocity_y ) < 4 ) //ball takes too long to get to actual zero velocity, so set y-component of velocity to be zero when its close enough to zero.
			this.velocity_y = 0;
	}
	if ( this.y - this.radius <= 0) { //ball hits roof
		this.y = this.radius;
		this.velocity_y = 0;
	}
	if ( (this.y + this.radius) < this.ground ) //while ball is off the ground, decrease speed due to gravity.
		this.velocity_y += this.gravity*this.speedFactor;
	
	if ( Math.abs(this.velocity_y) >= this.maxVelocity_y )
		this.velocity_y = (this.velocity_y*this.maxVelocity_y)/Math.abs(this.velocity_y);
	// update y-component of position
	this.y_past = this.y;
	this.y += this.velocity_y*this.speedFactor;
}

function movePlayer() {

	if ( this.x < this.radius ) //touching left wall
		this.x = this.radius;
	else if ( this.x > canvas.getAttribute("width")-this.radius ) //touching right wall
		this.x = canvas.getAttribute("width")-this.radius;
	//else if ( this.x + this.radius  >= canvas.getAttribute("width")/2 - this.netWidth/2  && this.x_past + this.radius  < canvas.getAttribute("width")/2 - this.netWidth/2) { // left player touching net
	else if ( this.x + this.radius  > canvas.getAttribute("width")/2 - this.netWidth/2  && !this.teamRight ) {
		this.x = canvas.getAttribute("width")/2 - this.netWidth/2 - this.radius;
		this.velocity_x = 0;
	}
	//else if ( this.x - this.radius  <= canvas.getAttribute("width")/2 + this.netWidth/2  && this.x_past - this.radius  > canvas.getAttribute("width")/2 + this.netWidth/2) {// right player touching net
	else if ( this.x - this.radius  < canvas.getAttribute("width")/2 + this.netWidth/2  && this.teamRight ) {
		this.x = canvas.getAttribute("width")/2 + this.netWidth/2 + this.radius;
		this.velocity_x = 0;
	}
	// update x-component of position
	this.x_past = this.x;
	this.x += this.velocity_x;
	
	if ( this.y < this.ground ) //while player is off the ground
		this.velocity_y += this.gravity;
	if ( this.y > this.ground ) { //when player is on the ground
		this.y = this.ground;
		this.velocity_y = 0;
	}
	// update y-component of position
	this.y_past = this.y;
	this.y += this.velocity_y;
}

function pause(pauseTime) {
	var _this = this;
	this.pauseGame = true;
	setTimeout( function(){_this.unpause();}, pauseTime );
}

function refresh() {
	
	this.updateScore();
	
	if (!this.pauseGame) {
		this.drawBackground();
		this.collisions();
		var i=0;
		for( i = 0; i < this.balls.length; i++) {
			this.balls[i].moveBall();
			this.balls[i].drawBall(this.ctx);
		}
		for( i = 0; i < this.players.length; i++) {
			this.players[i].movePlayer();
			this.players[i].drawPlayer(this.ctx);
		}
	}
}

function unpause() {
	this.pauseGame = false;
}

function updateScore() {
	var i=0;
	var j=0;
	for( i = 0; i < this.balls.length; i++) {
		if( this.balls[i].y + this.balls[i].radius >= canvas.getAttribute("height") - this.groundHeight ) {
			if ( this.balls[i].x + this.balls[i].radius < canvas.getAttribute("width")/2 ) { //ball touched left player's floor, point for right player
				this.score[1] += 1;
				j = 1;
			}
			else { //ball touched right player's floor, point for left player
				this.score[0] += 1;
				j = 0;
			}
			
			// pause game 
			if ( this.score[j] >= this.pointsToWin )
				this.gameOver(j);
			else
				this.pause(this.pauseTime);
			
			// reset initial positions of players and balls
			for( i = 0; i < this.balls.length; i++) {
				this.balls[i].x = this.players[j].x_initial;
				this.balls[i].y = this.balls[i].y_initial;
				this.balls[i].velocity_x = 0;
				this.balls[i].velocity_y = 0;
			}
			for( i = 0; i < this.players.length; i++) {	
				this.players[i].x = this.players[i].x_initial;
				this.players[i].y = canvas.getAttribute("height")-this.groundHeight;
				this.players[i].velocity_x = 0;
				this.players[i].velocity_y = 0;
			}
		}
	}
}

function init() {
	var canvas = document.getElementById("canvas");
	if (canvas.getContext) {
		var ctx = canvas.getContext("2d");
		var test = new game(ctx, canvas);
		document.onkeydown = function(e) {test.keyDownHandler(e);};
		document.onkeyup = function(e) {test.keyUpHandler(e);};
		setInterval(function(){test.refresh()}, 10);
	}
	else {
		document.getElementById("gameMessage").innerHTML= "your browser doesn't support HTML 5 Canvas. Please get a compatible broswer.";
	}
}