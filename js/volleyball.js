/**
code by James Anselm
gameplay based off that popular slime volleyball game on oneslime.net by Quin Pendragon and Daniel Wedge.

Help Received
- ball collision - http://stackoverflow.com/questions/3604842/javascript-html5-canvas-collision-detection
- ball collision algorithm - http://www.vobarian.com/collisions/2dcollisions2.pdf
**/

function game(ctx, canvas) {
	//Variables
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
	
	this.drawBackground = function() {
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
	};
	
	this.keyDownHandler = function(e) {
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
	};
	
	this.keyUpHandler = function(e) {
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
	};

	this.collisions = function() {
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
	};

	this.updateScore = function() {
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
	};
	
	this.pause = function(pauseTime) {
		var _this = this;
		this.pauseGame = true;
		setTimeout( function(){_this.unpause();}, pauseTime );
	};
	
	this.unpause = function() {
		this.pauseGame = false;
	};
	
	this.gameOver = function() {
		this.pause( this.gameOverTime );
		
		// reset score
		this.score[0] = 0;
		this.score[1] = 0;
	};
	
	this.movePlayer = function(i) {
		if ( this.players[i].x < this.players[i].radius ) //touching left wall
			this.players[i].x = this.players[i].radius;
		else if ( this.players[i].x > this.canvas.getAttribute("width")-this.players[i].radius ) //touching right wall
			this.players[i].x = this.canvas.getAttribute("width")-this.players[i].radius;
		//else if ( this.x + this.radius  >= canvas.getAttribute("width")/2 - this.netWidth/2  && this.x_past + this.radius  < canvas.getAttribute("width")/2 - this.netWidth/2) { // left player touching net
		else if ( this.players[i].x + this.players[i].radius  > this.canvas.getAttribute("width")/2 - this.netWidth/2  && !this.players[i].faceDirection ) {
			this.players[i].x = this.canvas.getAttribute("width")/2 - this.netWidth/2 - this.players[i].radius;
			this.players[i].velocity_x = 0;
		}
		//else if ( this.x - this.radius  <= canvas.getAttribute("width")/2 + this.netWidth/2  && this.x_past - this.radius  > canvas.getAttribute("width")/2 + this.netWidth/2) {// right player touching net
		else if ( this.players[i].x - this.players[i].radius  < this.canvas.getAttribute("width")/2 + this.netWidth/2  && this.players[i].faceDirection ) {
			this.players[i].x = this.canvas.getAttribute("width")/2 + this.netWidth/2 + this.players[i].radius;
			this.players[i].velocity_x = 0;
		}
		
		if ( this.players[i].y < this.players[i].ground ) //while player is off the ground
			this.players[i].velocity_y += this.players[i].gravity;
		if ( this.players[i].y > this.players[i].ground ) { //when player is on the ground
			this.players[i].y = this.players[i].ground;
			this.players[i].velocity_y = 0;
		}
		
		this.players[i].move();
	};
	
	this.moveBall = function(i) {
		//Throttle maximum velocity
		if ( Math.sqrt( Math.pow( this.balls[i].velocity_x , 2) + Math.pow( this.balls[i].velocity_y , 2) ) > this.balls[i].maxVelocity ) {
			var oldMagnitude = Math.sqrt( Math.pow( this.balls[i].velocity_x , 2) + Math.pow( this.balls[i].velocity_y , 2) );
			this.balls[i].velocity_x = ( this.balls[i].velocity_x / oldMagnitude )*this.balls[i].maxVelocity;
			this.balls[i].velocity_y = ( this.balls[i].velocity_y / oldMagnitude )*this.balls[i].maxVelocity;
		}
		
		if ( (this.balls[i].x - this.balls[i].radius) <= 0 ) { // ball touches left wall
			this.balls[i].velocity_x *= -1;
			this.balls[i].x = this.balls[i].radius;
		}
		if ( (this.balls[i].x + this.balls[i].radius) >= this.canvas.getAttribute("width") ) { // ball touches right wall
			this.balls[i].velocity_x *= -1;
			this.balls[i].x = this.canvas.getAttribute("width") - this.balls[i].radius;
		} 
		
		if ( (this.balls[i].y + this.balls[i].radius) >= this.balls[i].ground ) { // ball touches the ground (used for games where ball is allowed to touch ground)
			this.balls[i].y = this.balls[i].ground - this.balls[i].radius;
			this.balls[i].velocity_y *= -0.8;
			this.balls[i].velocity_x *= 0.9;
			if( Math.abs( this.balls[i].velocity_y ) < 4 ) //ball takes too long to get to actual zero velocity, so set y-component of velocity to be zero when its close enough to zero.
				this.balls[i].velocity_y = 0;
		}
		if ( this.balls[i].y - this.balls[i].radius <= 0) { //ball hits roof
			this.balls[i].y = this.balls[i].radius;
			this.balls[i].velocity_y = 0;
		}
		if ( (this.balls[i].y + this.balls[i].radius) < this.balls[i].ground ) //while ball is off the ground, decrease speed due to gravity.
			this.balls[i].velocity_y += this.balls[i].gravity*this.balls[i].speedFactor;
		
		if ( Math.abs(this.balls[i].velocity_y) >= this.balls[i].maxVelocity_y )
			this.balls[i].velocity_y = (this.balls[i].velocity_y*this.balls[i].maxVelocity_y)/Math.abs(this.balls[i].velocity_y);
	
		//move the ball
		this.balls[i].move();
	};
	
	this.refresh = function() {
		this.updateScore();
	
		if (!this.pauseGame) {
			this.drawBackground();
			this.collisions();
			var i=0;
			for( i = 0; i < this.balls.length; i++) {
				this.moveBall(i);
				this.balls[i].drawBall(this.ctx);
			}
			for( i = 0; i < this.players.length; i++) {
				this.movePlayer(i);
				this.players[i].drawPlayer(this.ctx);
			}
		}
	};
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