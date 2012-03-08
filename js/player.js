function player(radius, ground, gravity, jump, x, velocity_left, velocity_right, leftKey, rightKey, upKey, faceDirection, netWidth) {
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
	this.faceDirection = faceDirection;
	this.netWidth = 4;
	
	//Methods
	
	this.drawPlayer = function(ctx) {
		//Body
		ctx.fillStyle = "rgb(248,248,0)";
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI, true);
		ctx.fill();
		
		//Eye ball
		ctx.fillStyle = "rgb(255,255,255)";
		ctx.beginPath();
		if ( this.faceDirection )
			ctx.arc(this.x - this.radius*0.5, this.y - this.radius*0.5, this.radius*0.2, 0, Math.PI*2, true);
		else
			ctx.arc(this.x + this.radius*0.5, this.y - this.radius*0.5, this.radius*0.2, 0, Math.PI*2, true);
		ctx.fill();
		
		//Eye cornea
		ctx.fillStyle = "rgb(0,0,0)";
		ctx.beginPath();
		if ( this.faceDirection )
			ctx.arc(this.x - this.radius*0.5, this.y - this.radius*0.5, this.radius*0.1, 0, Math.PI*2, true);
		else
			ctx.arc(this.x + this.radius*0.5, this.y - this.radius*0.5, this.radius*0.1, 0, Math.PI*2, true);
		ctx.fill();
	};
	
	this.move = function() {
		// update x-component of position
		this.x_past = this.x;
		this.x += this.velocity_x;
		
		// update y-component of position
		this.y_past = this.y;
		this.y += this.velocity_y;
	};
}