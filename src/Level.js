Level = function(gameInstance){
	this.gameInstance = gameInstance;

	this._createLevel = function(number){
		this.map = this.gameInstance.add.tilemap('level'+number);
		this.map.addTilesetImage('bridges', 'bridges', 32, 32, 0, 0, 1);
		this.map.addTilesetImage('block-grate', 'block-grate', 32, 32, 0, 0, 11);
		this.map.addTilesetImage('block-metal', 'block-metal', 32, 32, 0, 0, 27);
		this.map.addTilesetImage('startpos', 'startpos', 32, 32, 0, 0, 9)
		this.map.addTilesetImage('clone-maker', 'clone-maker', 32, 32, 0, 0, 43)
		this.map.setCollisionBetween(1, 255, true);

			//make the bridges not collide
		this.map.setCollisionBetween(1, 8, false);
		this.map.setCollisionBetween(43, 44, false);

		this.layer = this.map.createLayer('background');
		this.spawns = this.map.createLayer('spawns');
		
		//find better way to do this?
		for(var w = 0; w < this.layer.layer.data.length; w++){
			for(var q = 0; q < this.layer.layer.data[w].length; q++){
				var tile = this.layer.layer.data[w][q];

				//is a bridge
				if(isTileBridge(tile)){
					tile.collideUp = true;
					tile.faceTop = true;
				}
			}
		}

		this._parseData();

		game.stage.backgroundColor = '#121212';

		if(!text){
			text = game.add.text(500, 600, '', { font: '22px Iceland', align: 'center', fill: '#FFFFFF'});
		}else{
			text.destroy();
			text = game.add.text(500, 600, '', { font: '22px Iceland', align: 'center', fill: '#FFFFFF'});
		}

		text.alpha = 0;
		text.setText('');
	};

	this.resetLevel =function(){
		if(this.layer){
			this.layer.destroy();
		}

		if(this.map){
			this.map.destroy();
		}

		for(var i = 0; i < enemies.length; i++){
			enemies[i].hand.destroy();
			enemies[i].sprite.destroy();
			enemies[i].bullets.destroy();
		}

		enemies = [];
		textCount = 0;
		if(player){
			player.hand.destroy();
			player.sprite.destroy();
			player.bullets.destroy();
		}

		this._createLevel(currentLevel);

		isDead = false;
	}

	this.retryLevel = function(){
		if(this.layer){
			this.layer.destroy();
		}

		if(this.map){
			this.map.destroy();
		}

		for(var i = 0; i < enemies.length; i++){
			enemies[i].hand.destroy();
			enemies[i].sprite.destroy();
			enemies[i].bullets.destroy();
		}
		enemies = [];

		if(player){
			player.hand.destroy();
			player.sprite.destroy();
			player.bullets.destroy();
		}

		this._createLevel(currentLevel);

		isDead = false;
	}

	this._parseData = function(){
		for(var w = 0; w < this.spawns.layer.data.length; w++){
			for(var q = 0; q < this.spawns.layer.data[w].length; q++){
				var tile = this.spawns.layer.data[w][q];

				if(isPlayerSpawn(tile)){
					player = new Player(game, tile.x*32, tile.y*32);
					player.mana = currentLevel == 10 ? 9000000 : currentLevel - 1;
					tile.destroy();
				}

				if(isEnemySpawn(tile)){
					enemies.push(new Enemy(game, tile.x*32, tile.y*32));
				}
			}
		}

		this.spawns.destroy();
	}

}

function isTileBridge(tile){
	if(tile && (tile.index == 1 || tile.index == 2 || tile.index == 3 || tile.index == 4 || tile.index == 5 || tile.index == 6 || tile.index == 7 || tile.index == 8)){
		return true;
	}

	return false;
}

function isPlayerSpawn(tile){
	if(tile && tile.index == 9){
		return true;
	}

	return false;
}

function isEnemySpawn(tile){
	if(tile && tile.index == 10){
		return true;
	}

	return false;
}

function isCloneMaker(tile){
	if(tile && (tile.index == 43 || tile.index == 44)){
		return true;
	}

	return false;
}