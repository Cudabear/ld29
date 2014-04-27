Enemy = function(gameInstance, x, y){
	this.gameInstance = gameInstance;
	this.sprite = this.gameInstance.add.sprite(x, y, 'enemy');

	this.speed = 100;
	this.direction = 1;
	this.stateChangePotential = 1;

	this.sprite.anchor.set(0.5);

	this.isWalking = false;
	this.changeStateCounter = 0;
	this.walkTimer = Math.random()*200 + 200;
	this.wantToWalk = true;

	this.hand = gameInstance.add.sprite(x, y, 'enemy-hand');
	this.hand.anchor.set(0.25);
	this.isDead = false;;


	this.sprite.animations.add('walk', [0, 1, 2, 3, 4, 5]);
	this.sprite.animations.add('stand', [6, 7]);
	this.sprite.animations.add('die', [8, 9, 10, 11, 12, 13]);

	this.mana = 0;
	this.maxMana = 100;

	this.hasSpotted = false;

	this.bullets = this.gameInstance.add.group();

	this.gameInstance.physics.enable(this.sprite, Phaser.Physics.ARCADE);

	this.sprite.body.immovable = true;

	this.doWalk = function(){
		this.sprite.animations.play('walk', 8, false);	
		this.isWalking = true;
	}

	this.doStand = function(){
		this.sprite.animations.play('stand', 4, false);
		this.isWalking = false;
	}

	this.doDie = function(){
		this.sprite.animations.play('die', 4, false);
		this.isCrouching = false;
		this.numCrouches = 0;
		this.isDead = true;
		this.sprite.body.velocity.x = 0;
		this.sprite.body.checkCollision.up = false;
		this.sprite.body.checkCollision.left = false;
		this.sprite.body.checkCollision.right = false;
	}

	this.update = function(){
		if(!this.isDead){
			if(this.sprite.body.onWall()){
				this.direction *= -1;
			}

			this._handleEdge();

			this.sprite.scale.x = this.direction;

			this.changeStateCounter++;

			if(this.changeStateCounter > this.walkTimer && this.isWalking){
				this.wantToWalk = false;
				this.changeStateCounter = 0;
			}else if(this.changeStateCounter > 100 && !this.isWalking){
				this.wantToWalk = true;
				this.changeStateCounter = 0;
			}

			if(!this._canSeePlayer()){
				this.hand.rotation = this.direction < 0 ? Math.PI : 0;
				this.hand.scale.y = this.direction;

				if(this.wantToWalk){

						this.sprite.body.velocity.x = this.speed*this.direction;
						this.doWalk();
				}else{
					this.sprite.body.velocity.x = 0;
					this.doStand();
				}

				this.hasSpotted = false;
			}else{
				this.sprite.body.velocity.x = 0;
				this.doStand();

				if(!alertFx.isPlaying && !this.hasSpotted){
					alertFx.play();
					this.hasSpotted = true;
					this.mana = 25;
				}

				this.hand.rotation = game.physics.arcade.angleBetween(this.hand, player.sprite) + 0.10*this.direction*-1;

				if(this.hand.rotation < Math.PI/-2 || this.hand.rotation >= Math.PI/2){
					this.sprite.scale.x = -1;
					this.hand.scale.y = -1;
				}else{
					this.sprite.scale.x = 1;
					this.hand.scale.y = 1;
				}

				if(this.mana < this.maxMana){
					this.mana += 2;
				}

				if(this.mana >= this.maxMana ){
					var angle = this.hand.rotation;
					var dy = Math.sin(angle)*7;
					var dx = Math.cos(angle)*7;

					var fireball = this.gameInstance.add.sprite(this.hand.x + 2*dx, this.hand.y + 2*dy, 'fireball');
					this.gameInstance.physics.enable(fireball, Phaser.Physics.ARCADE);
					fireball.body.gravity.y = gravity/400;

					fireball.direction = this.hand.rotation;
					this.mana = 0;
					fireball.body.velocity.x = dx*150;
					fireball.body.velocity.y = dy*150;
					this.bullets.add(fireball);
					shootFx.play(); 
				}
			}

			this.hand.x = this.sprite.x + 3*this.sprite.scale.x;
			this.hand.y = this.sprite.y - 5;
		}

		this.bullets.forEach(function(item){
			game.physics.arcade.collide(item, level.layer, bulletCollisionHandler, null, this);

			game.physics.arcade.collide(item, player.sprite, bulletPlayerCollisionHandler, null, this);
		});
	}

	this._canSeePlayer = function(){
		var dx = player.sprite.x - this.sprite.x;
		var dy = player.sprite.y - this.sprite.y;
		var distance = Math.sqrt((dx*dx) + (dy*dy));

		//check distance
		if(distance < (player.isCrouching ? 50 : 400) && !isDead){
			//check direction
			if(dx < 0 && this.sprite.scale.x == 1 || dx > 0 && this.sprite.scale.x == -1){
				return false;
			}else{
				//check to see if there's a tile blocking our view of the player
				var x = this.sprite.x;
				var y = this.sprite.y -10;

				if(dx < 0){
					x += dx;
					dx *= -1;
				}

				if(dy < 0){
					y += dy;
					dy *= -1;
				}	

				var tiles = level.layer.getTiles(x, y, dx, dy, true);

				if(tiles.length > 0){
					return false;
				}else{
					return true;
				}
			}
		} else{
			return false;
		}
	}

	this._handleEdge = function(){
		var nextTile = level.map.getTile(level.layer.getTileX(this.sprite.x + 32*this.direction), level.layer.getTileY(this.sprite.y + 33), 0);

		if(!nextTile && this.sprite.body.onFloor()){
			this.direction *= -1;
		}
	}
}