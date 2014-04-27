Player = function(gameInstance, x, y){
	this.gameInstance = gameInstance;
	this.sprite = gameInstance.add.sprite(x, y, 'guy');
	this.sprite.animations.add('walk', [0, 1, 2, 3, 4, 5]);
	this.sprite.animations.add('stand', [6, 7]);
	this.sprite.animations.add('crouch', [8,9]);
	this.sprite.animations.add('die', [10, 11, 12, 13, 14, 15]);
	this.sprite.anchor.set(0.5);
	this.hand = gameInstance.add.sprite(x, y, 'hand');
	this.hand.anchor.set(0.25);

	this.gameInstance.physics.enable(this.sprite,  Phaser.Physics.ARCADE);
	
	this.sprite.body.setSize(this.sprite.width - 6, this.sprite.height - 6, 3, 3);

	this.speed = 150;

	this.isCrouching = false;
	this.numCrouches = 0;

	this.bullets = this.gameInstance.add.group();

	this.mana = 0;
	this.maxMana = 10;

	//create mana bar
	manaBar = new Phaser.Rectangle(this.sprite.x, this.sprite.y, 50, 10);

	this.doWalk = function(){
		this.sprite.animations.play('walk', 8, false);	
		this.isCrouching = false;
		this.numCrouches = 0;
		this.sprite.alpha = 1;
		this.hand.alpha = 1;
	}

	this.doDie = function(){
		this.sprite.animations.play('die', 4, false);
		this.isCrouching = false;
		this.numCrouches = 0;
		isDead = true;
		this.sprite.alpha = 1;
		this.hand.alpha = 1;
	}

	this.doStand = function(){
		this.sprite.animations.play('stand', 4, false);
		this.isCrouching = false;
		this.sprite.alpha = 1;
		this.hand.alpha = 1;
	}

	this.doCrouch = function(){
		this.sprite.animations.play('crouch', 4, false);
		this.isCrouching = true;
		this.numCrouches++;
		this.sprite.alpha = 0.5;
		this.hand.alpha = 0.5;


		if(this.numCrouches > 1){
			var nextTile = level.map.getTileBelow(level.map.getLayer(), level.layer.getTileX(this.sprite.x), level.layer.getTileY(this.sprite.y));

			if(isTileBridge(nextTile)){
				this.sprite.y += 20
				this.sprite.body.velocity.y = 20;

			}
		}
	}

	this.update = function(){
		this.sprite.body.velocity.x = 0;


		if(!isDead){
			this.hand.rotation = game.physics.arcade.angleToPointer(this.hand);

			if(this.hand.rotation < Math.PI/-2 || this.hand.rotation >= Math.PI/2){
				this.sprite.scale.x = -1;
				this.hand.scale.y = -1;
			}else{
				this.sprite.scale.x = 1;
				this.hand.scale.y = 1;
			}

			this.hand.x = this.sprite.x + 3*this.sprite.scale.x;
			this.hand.y = this.sprite.y - (this.isCrouching ? -5 : 5);
		}

		this.bullets.forEach(function(item){
			game.physics.arcade.collide(item, level.layer, bulletCollisionHandler, null, this);

			for(var i = 0; i < enemies.length; i++){
				game.physics.arcade.collide(item, enemies[i].sprite, bulletEnemyCollisionHandler, null, this);
			}

			if((currentLevel === 10 || currentLevel === 8) && item){
				var tile = level.map.getTile(level.layer.getTileX(item.x), level.layer.getTileY(item.y), 0);

				if(tile && isCloneMaker(tile)){
					level.map.removeTile(tile.x, tile.y, 0);

					var explosion = gameInstance.add.sprite(item.x, item.y, 'explosion');
					explosion.animations.add('explode');
					explosion.animations.play('explode', 8, false);
					item.destroy();
					explosionFx.play();
				}
			}
		});

		manaBar.width = isDead ? 0 : ((currentLevel == 10) ? 0 : (this.mana/this.maxMana)*(50))
		manaBar.x = this.sprite.x - this.sprite.width/2*this.sprite.scale.x;
		manaBar.y = this.sprite.y - this.sprite.height/2 - 10;
				
	}

	this.handleInput = function(input){
		switch(input){
			case 'up':
				if(this.sprite.body.onFloor() && (!cursors.down.isDown || !this.isCrouching)){
					this.sprite.body.velocity.y = -300;
					jumpFx.play();
				}

				break;
			case 'left':
				if(!cursors.down.isDown || !this.isCrouching){
					this.sprite.body.velocity.x = -this.speed;
					//this.sprite.scale.x = -1;
					this.doWalk();
				}

				break;
			case 'right':
				if(!cursors.down.isDown || !this.isCrouching){
					this.sprite.body.velocity.x = this.speed;
					//this.sprite.scale.x = 1;
					this.doWalk();
				}

				break;
			case 'down':
				if(this.sprite.body.onFloor() && !this.isCrouching){
					this.doCrouch();
				}else{
					this.sprite.body.velocity.y += 20;
				}

				break;
			case 'none':
				this.doStand();
				break;
		}
	}

	this.handleClick = function(){
		if(!isDead){
			if(!isTalking){
				if(this.mana > 0){
					var angle = this.hand.rotation;
					var dy = Math.sin(angle)*7;
					var dx = Math.cos(angle)*7;

					var fireball = this.gameInstance.add.sprite(this.hand.x + 2*dx, this.hand.y + 2*dy, 'fireball');
					this.gameInstance.physics.enable(fireball, Phaser.Physics.ARCADE);
					fireball.body.gravity.y = gravity/400;

					fireball.direction = this.hand.rotation;
					this.mana -= 1;
					fireball.body.velocity.x = dx*150;
					fireball.body.velocity.y = dy*150;
					this.bullets.add(fireball);
					shootFx.play();
				}
			}else{
				if(currentLevel === 1 && textCount >= Quotes['level1'].length){
					combatPromptTextCount++;
				}

				textCount++;
			}
		}
	}
}