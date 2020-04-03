var game = {
	state:"first",
};
var overlay = {
	counter:0,
	 title: "Space N Vaders",
    subtitle: "Press Enter for select spaceship",
    subtitle2: "Press Space for start",
    subtitle3: "Press \"P\" for pause it",
};
var player ={
	x:100,
	y:350,
	width:20,
	height:50,
	counter:0,
};
var keyboard ={ };
var playerBullets =[];
var enemies=[];
var enemyBullets=[];
var p_hp = 3; 
var score = 0;
var time_c = 900;

//игра

function updateGame (){
	if(game.state == "first" && keyboard[13]) {
        game.state = "custom";
        
        overlay.counter = 0;
    }
    
    if(game.state == "first" && keyboard[32]) {
        game.state = "start";
        player.state = "alive";
        overlay.counter = -1;
    }

    if(game.state == 'custom' && (keyboard[49] || keyboard[97])){
        ship_player = ship_image;
        game.state = "first";
        overlay.counter = 0;
    }

    if(game.state == 'custom' && (keyboard[50] || keyboard[98])){
        ship_player = ship_image2;
        game.state = "first";
        overlay.counter = 0;
    }

    if(game.state == "playing" && enemies.length == 0) {
        game.state = "won";
        overlay.title = "SWARM DEAD";
        overlay.subtitle = "press space to play again";
        overlay.counter = 0;
    }
    if(game.state == "over" && keyboard[32]) {
        game.state = "start";
        player.state = "alive";
        overlay.counter = -1;
    }
    if(game.state == "won" && keyboard[32]) {
        game.state = "start";
        player.state = "alive";
        overlay.counter = -1;
    }
    
    if(game.state == "playing" && keyboard[80]) {
        game.state = "pause";
        overlay.title = "game for pause";
        overlay.subtitle = "press space to continue";
        overlay.counter = 0;
    }
    if(game.state == "pause" && keyboard[32]) {
        game.state = "playing";
        overlay.counter = -1;
    }

    if(overlay.counter >= 0) {
        overlay.counter++;
    } 
}

function updatePlayer(){
	if(player.state=="dead") return;

//стрелка влево


if (keyboard[37]){
	player.x -=10;
	if (player.x<0) player.x=0;
}
// стрелка влево

if (keyboard[39]){
	player.x+=10;
	var right = canvas.width - player.width;
	if (player.x>right)player.x=right;
}
//пробел

if (keyboard[32]){
	if(!keyboard.fired){
		firePlayerBullet();
		keyboard.fired=true;
	}
} else{
	keyboard.fired=false;
}

if (player.state == "hit"){
	player.counter++;
	if (player.counter>=40){
		player.counter=0;
		player.state="dead";
		game.state="over";
		overlay.title="GAME OVER";
		overlay.subtitle="press space to play again";
		overlay.counter=0;
	}
}
}

function updatePlayerBullets(){
//движение каждой пули
for ( i in playerBullets){
	var bullet = playerBullets[i];
	bullet.y-=8;
	bullet.counter++;
}
//удаляем те,которые находятся вне экрана
playerBullets = playerBullets.filter (function(bullet){
	return bullet.y >0;
});
}

function updateBackground (){
}
//враг
function updateEnemies(){
 //создание новых врагов с 10 новых до конца
 if (game.state == "start"){
 	enemies = [];
 	enemyBullets = [];
 	for (var i=0;i<10;i++){
 		enemies.push({
 			x:50+ i*50,
 			y:10,
 			width:40,
 			height:40,
 			state:"alive",//начальное состояние врагов
 			counter:0,
 			phase:Math.floor(Math.random()*50),
 			shrink:20,

 		});
 	}
 	game.state = "playing";
 }
 //для каждого врага
 for(var i=0; i<10;i++){
 	var enemy = enemies[i];
 	if(!enemy) continue;
 	//Движение туда,сюда пока враг жив
 	if (enemy && enemy.state == "alive"){
 		enemy.counter++;
 		enemy.x += Math.sin(enemy.counter*Math.PI*2/100)*2;
 		//Стрельба пулей каждые 50 шагов
 		//ВОспользуемся коммандой,чтобы они не стреляли все одновремнно
 		if ((enemy.counter+enemy.phase)%200==0){
 			enemyBullets.push(createEnemyBullet(enemy));

 		}
 	}
 	//разрушать при попадении
 	if (enemy && enemy.state == "hit"){
 		enemy.counter++;
 		//очещать платформу,когда он мертв
 		if (enemy.counter>=20){
 			enemy.state="dead";
 			enemy.counter = 0;
 		}
 	}
 }
 //убераем мертвых
 enemies  = enemies.filter(function(e){
 	if(e && e.state !="dead") return true;
 	return false;
 });
}

function updateEnemyBullets(){
	for(var i in enemyBullets){
		var bullet = enemyBullets[i];
		bullet.y+=2;
		bullet.counter++;
	}
}
//Проверка на наличие столконовений
function checkCollisions(){
	for (var i in playerBullets){
		var bullet = playerBullets[i];
		for(var j in enemies){
			var enemy = enemies[j];
			if (collided(bullet,enemy)){
				bullet.state = "hit";
				enemy.state="hit";
				enemy.counter=0;

			}

		}
	}

	if(player.state == "hit" || player.state == "dead")return;
	for (var i in enemyBullets){
		var bullet = enemyBullets[i];
		if(collided(bullet,player)){
			bullet.state = "hit";
			player.state="hit";
			 if(p_hp == 0)
			player.counter = 0;
		}
	}
}

function collided(a,b){
	//проверка горизонтального столкновения
	if (b.x + b.width >= a.x && b.x < a.x + a.width ){
	//проверка на вертикальное столкновение
	if(b.y + b.height>= a.y && b.y < a.y + a.height ){
		return true;
	}	
	}
	//проверка а внутри б
	if(b.x <= a.x && b.x+b.width>= a.x+a.width){
		if(b.y<=a.y && b.y + b.height >= a.y+a.height){
			return true;
		}
	}
	//проверка б внутри а
	if(a.x <= b.x && a.x+a.width>= b.x+b.width){
		if(a.y <= b.y && a.y + a.height >= b.y+b.height){
			return true;
		}
	}
	return false;
}

function doSetup(){
	attachEvent(document, "keydown", function(e){
		keyboard[e.keyCode]=true;
	});
	attachEvent(document,"keyup",function(e){
		keyboard[e.keyCode]=false;
	});
}

function attachEvent(node, name,func){
	if(node.addEventListener){
		node.addEventListener(name,func,false);	
	}
	else if(node.attachEvent){
		node.attachEvent(name, func);
	}
};