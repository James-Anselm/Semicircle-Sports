// BALL
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
	this.drawBall = function(ctx) {
		ctx.fillStyle = "rgb(210,105,30)";
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
		ctx.fill();
	};
	
	this.move = function() {
		
		// update x-component of position
		this.x_past = this.x;
		this.x += this.velocity_x*this.speedFactor;
		
		// update y-component of position
		this.y_past = this.y;
		this.y += this.velocity_y*this.speedFactor;
	};
}