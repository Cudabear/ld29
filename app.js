var WIDTH = 960;
var HEIGHT = 736;
var game;


//config
var gravity = 400;

var player;

var level;

var isLoading = true;
var isTalking = true;
var isDead = false;

var cursors;

var manaBar;

var enemies = [];

var currentLevel = 1;
var numLevels = 10;
var numCloneMakers = 10;

var textTimer = 0;
var text;
var textCount = 0;
var combatPromptTextCount = 0;

var deaths = 0;
var kills = 0;

var goodEnding = false;

var jumpFx;
var shootFx;
var alertFx;
var dieFx;
var music;
var explosionFx;
var finalFx;

window.onload = function(){
	game = new Phaser.Game(WIDTH, HEIGHT, Phaser.CANVAS, 'game', {preload: preload, create: create, update: update, render: render});

	doPreloadStuff();
	//$('#game-blocker').hide();
	//isLoading = false;
}

function preload(){
	//sprites and animations
	game.load.atlasJSONHash('guy', 'res/img/guy.png', 'res/img/walking_guy.json');
	game.load.atlasJSONHash('enemy', 'res/img/enemy.png', 'res/img/walking_enemy.json');
	game.load.atlasJSONHash('explosion', 'res/img/explosion.png', 'res/img/explosion.json');
	game.load.image('hand', 'res/img/hand.png');
	game.load.image('enemy-hand', 'res/img/enemy-hand.png');
	game.load.image('fireball', 'res/img/fireball.png');

	//levels
	game.load.tilemap('level0', 'res/levels/test.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.tilemap('level1', 'res/levels/level1.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.tilemap('level2', 'res/levels/level2.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.tilemap('level3', 'res/levels/level3.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.tilemap('level4', 'res/levels/level4.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.tilemap('level5', 'res/levels/level5.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.tilemap('level6', 'res/levels/level6.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.tilemap('level7', 'res/levels/level7.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.tilemap('level8', 'res/levels/level8.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.tilemap('level9', 'res/levels/level9.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.tilemap('level10', 'res/levels/level10.json', null, Phaser.Tilemap.TILED_JSON);

	//tilesets
	game.load.image('bridges', 'res/img/bridges.png');
	game.load.image('block-grate', 'res/img/grate-tiles.png');
	game.load.image('block-metal', 'res/img/metal-tiles.png');
	game.load.image('startpos', 'res/img/startpos.png');
	game.load.image('clone-maker', 'res/img/clone-maker.png');

	//audio
	game.load.audio('jump', 'res/sfx/jump.wav');
	game.load.audio('shoot', 'res/sfx/shoot.wav');
	game.load.audio('alert', 'res/sfx/alert.wav');
	game.load.audio('die', 'res/sfx/die.wav');
	game.load.audio('explode', 'res/sfx/explosion.wav');
	game.load.audio('music', 'res/sfx/dark.mp3');
	game.load.audio('final', 'res/sfx/final.mp3');
}

function create(){
	jumpFx = game.add.audio('jump');
	shootFx = game.add.audio('shoot');
	alertFx = game.add.audio('alert');
	dieFx = game.add.audio('die');
	music = game.add.audio('music');
	explosionFx = game.add.audio('explode');
	finalFx = game.add.audio('final');


	game.physics.startSystem(Phaser.Physics.ARCADE);

	level = new Level(game);

	cursors = game.input.keyboard.createCursorKeys();
	game.input.onDown.add(function(){ player.handleClick(); });

	game.physics.arcade.gravity.y = gravity;


	level.resetLevel();
	music.play('', 0, 1, true);
}

function update(){
	if(player || isDead){
		player.update();


		game.physics.arcade.collide(player.sprite, level.layer)

		var recievedInput = false;
		if(!isLoading && !isTalking && !isDead){
			if(cursors.up.isDown){
				player.handleInput('up');
				recievedInput = true;
			}

			if(cursors.left.isDown){
				player.handleInput('left');
				recievedInput = true;
			}

			if(cursors.right.isDown){
				player.handleInput('right');
				recievedInput = true;
			}

			if(cursors.down.isDown){
				player.handleInput('down');
				recievedInput = true;
			}
		}

		if(!recievedInput && !isDead){
			player.handleInput('none');
		}

		for(var i = 0; i < enemies.length; i++){
			game.physics.arcade.collide(enemies[i].sprite, level.layer);
			enemies[i].update();
		}

		if(player.sprite.y < 0){
			if(currentLevel < 10){
				doTransitionStuff();
			}else{
				doVictoryStuff();
			}
		}

		if(!isDead){
			if(textCount < Quotes['level'+currentLevel].length){
				text.x = player.sprite.x - ((currentLevel == 3 || currentLevel == 4 || currentLevel == 10) ? 200 : 60);
				text.y = player.sprite.y - 60;
				isTalking = true;
				text.alpha = 1;

				text.setText(Quotes['level'+currentLevel][textCount]);
			}else{
				text.alpha = 0;
				isTalking = false;

				if(currentLevel === 1 && player.sprite.x > 550){
					if(combatPromptTextCount < Quotes.combatPrompt.length){
						isTalking = true;
						text.alpha = 1;
						text.x = player.sprite.x - 60;
						text.y = player.sprite.y - 60;

						text.setText(Quotes.combatPrompt[combatPromptTextCount]);
					}else{
						isTalking = false;
					}
				}
			}
		}

		if(game.input.keyboard.isDown(Phaser.Keyboard.R)){
			level.retryLevel();
		}
	}else if(isDead){
		//level.resetLevel();
	}
}

function render(){
	if(player){
		game.debug.geom(manaBar, 'rgba(15, 255, 255, 0.3)');
	}
}

function bulletCollisionHandler(bullet, landscape){
	bullet.destroy();
}

function bulletEnemyCollisionHandler(bullet, enemy){
	

	var enemyObj;
	var index;
	for(var i = 0; i < enemies.length; i++){
		if(enemies[i].sprite == enemy){
			enemyObj = enemies[i];
			index = i;
		}
	}

	if(!enemyObj.isDead){
		bullet.destroy();
		enemyObj.doDie();
		enemyObj.hand.destroy();
		dieFx.play();
		kills++;
	}
}

function bulletPlayerCollisionHandler(bullet, playerSprite){
	 player.doDie();
	 player.hand.destroy();
	 bullet.destroy();
	 isDead = true;
	 manaBar.width = 0;
	 dieFx.play();
	 text.alpha = 1;
	 text.setText("Press R to retry");
	 text.x = player.sprite.x - 60;
	 text.y = player.sprite.y - 60;
	 deaths++;

}

function doTransitionStuff(){
	player.sprite.y = 1000;

	if(currentLevel === 9){
		music.stop();
		finalFx.play('', 0, 1, true);
	}

	$('#game-blocker').children().remove();
	$('#game-blocker').html("<p> </p>");
	$('#game-blocker').fadeIn(1000, function(){
		currentLevel++;
		level.resetLevel();

		$('#game-blocker').fadeOut(1000, function(){
		
		});
	});
}

function doVictoryStuff(){
	var goodEnding = true;

	for(var w = 0; w < level.layer.layer.data.length; w++){
		for(var q = 0; q < level.layer.layer.data[w].length; q++){
			var tile = level.layer.layer.data[w][q];
			if(isCloneMaker(tile)){
				goodEnding = false;
			}
		}
	}

	for(var i = 0; i < enemies.length; i++){
		if(!enemies[i].isDead){
			goodEnding = false;
		}
	}


	$('#game-blocker').children().remove();

	var victoryMessage;
	if(goodEnding){
		victoryMessage = "The Clone Factory lay in shambles, years of research and work now a smoldering junk heap.  But Unit 3429x3 new the world would again be safe"+
		" from the horrors born in that place, and that made him happy.  Under the surface of his artificial skin, his clone heart beat its clone rhythm.";
	}else{
		victoryMessage = "Unit 3429x3 fled the factory, vowing to never return to the horrific place that had breathed him life.  Would he ever really be free from it, though?" +
		" Only time could tell.  Under the surface, his clone heart beat its clone rhythm.";
	}

	$('#game-blocker').html(
		"<p style='text-align: center; margin-top: 100px'>" + victoryMessage + "</p>"+
		"<p style='text-align: center;'> You died: "+deaths+" times.  You killed: "+kills+" clones. </p>"+
		"<p style='text-align: center; margin-top: 100px'> Thanks for playing! Now try to find the other ending! </p>"+
		"<p style='text-align: center;'> To play again, refresh the page </p>"
	);
	$('#game-blocker').fadeIn(1000, function(){
		game.destroy();
	});
}

function doPreloadStuff(){
	$('#cuda').fadeIn(1500, function(){
		$('#logo').fadeIn(1500, function(){
			setTimeout(function(){
				$('#cuda').fadeOut(1000);
				$('#logo').fadeOut(1000, function(){
					//we'll try to play music here, but if it's not loaded yet
					//it's no big deal
					//if(!music.isPlaying){
					//	music.play();
					//}

					$('#cuda').remove();
					$('#logo').remove();

					$('#game-blocker').html(
						'<p id="paragraph1" style="margin-left: 100px; margin-top: 150px; display: none;"> "I was always told I was special. </p>'+
						'<p id="paragraph2" style="margin-left: 350px; display: none;"> Different. Unique. Individual. </p>'+
						'<p id="paragraph3" style="text-align: center; display: none;"> But In this world, there\'s no such thing." </p>' +
						'<p id="paragraph4" style="margin-right: 250px; text-align: right; display: none;"> - Unit 3429x3 </p>'
					);

					$('#paragraph1').fadeIn(1500, function(){
						setTimeout(function(){	
							$('#paragraph2').fadeIn(1500, function(){
								setTimeout(function(){
									$('#paragraph3').fadeIn(1500, function(){
										setTimeout(function(){
											$('#paragraph4').fadeIn(1500, function(){
												setTimeout(function(){
													$('#paragraph1').fadeOut(1000);
													$('#paragraph2').fadeOut(1000);
													$('#paragraph3').fadeOut(1000);
													$('#paragraph4').fadeOut(1000, function(){

														$('#game-blocker').html(
															'<div id="start-menu" style="display: none;">' +
																'<p style="font-size: 64px; text-align: center; margin-top: 200px"> Clone Escape </p>' +
																'<button style="font-size: 28px; height: 75px; width: 300px; margin-left: auto;  margin-right: auto; display: block;" onclick="startButtonHandler()"> Start Game </button>'+
																'<p style="text-align: center;"> Created in 48 hours for Ludum Dare #29: Beneath the Surface </p>' +
															'</div>'
														);

														$('#start-menu').fadeIn(1000);

													});
												}, 2000);
											});
										}, 2000);
									});
								}, 1500);
							});
						}, 1500);
					});
				});
			}, 1000);
		});
	});
}

function startButtonHandler(){
	$('#game-blocker').fadeOut(1000, function(){
		isLoading = false;
	});
}