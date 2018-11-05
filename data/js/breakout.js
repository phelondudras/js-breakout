/*!
  * JS-Breakout v1.0.1 (https://phelondudras.de/)
  * Copyright 2018 Phelon Dudras (https://github.com/phelondudras/js-breakout)
  * Licensed under GNU GENERAL PUBLIC LICENSE 3
  * 
  * Implementations:
  * 	bombs, expansion, empty spots, cheats
  * CheatCodes: ( Breakout.enableCheats=true; )
  * 	e = expand
  * 	l = increase live
  * 	s = increase score
  * 	x = win level
  * 	numpad+ = increase speed
  * 	numpad- = decrease speed
  * 
  */

var Breakout = {

	version : "1.0.1",
	thread : null,
	element : null,
	hiScore : 0,
	root : null,
	musicObj : null,
	failSndObj : null,
	wonSndObj : null,
	expandSndObj : null,
	showBombs : true,
	showMeta : false,
	soundEffects : true,
	enableCheats : false,
	expansion : null,
	expansionTime : 10,
	expansionCount : 0,
	levels : [

		{

			brickRows : 0,
			brickCol  : 0,
			speedX : 0,
			speedY : 0,
			bgColor : "#FFFFFF",
			brickColor : "#FFFFFF",
			pongColor : "#000000",
			ballColor : "#FF6347",
			emptySpot : [],
			bombs : 0,
			bombColor : "#FF0000",
			expansions : 0

		},

		{

			brickRows : 3,
			brickCol  : 9,
			speedX : 3,
			speedY : -3,
			bgColor : "#FFFFFF",
			brickColor : "#999999",
			pongColor : "#000000",
			ballColor : "#FF6347",
			emptySpot : [ "r1c1", "r1c7" ],
			bombs : 5,
			bombColor : "#FF0000",
			expansions : 2

		},

		{

			brickRows : 4,
			brickCol  : 9,
			speedX : 4,
			speedY : -4,
			bgColor : "#CCffCC",
			brickColor : "#009933",
			pongColor : "#000000",
			ballColor : "#FF6347",
			emptySpot : [ "r1c1", "r1c7", "r2c1", "r2c7", "r0c0", "r0c8", "r3c0", "r3c8" ],
			bombs : 4,
			bombColor : "#FF0000",
			expansions : 2

		},

		{

			brickRows : 5,
			brickCol  : 9,
			speedX : 5,
			speedY : -5,
			bgColor : "#FFFFCC",
			brickColor : "#FF9900",
			pongColor : "#000000",
			ballColor : "#FF6347",
			emptySpot : [ "r0c0", "r0c8", "r4c0", "r4c8" ],
			bombs : 3,
			bombColor : "#FF0000",
			expansions : 2

		},

		{

			brickRows : 6,
			brickCol  : 9,
			speedX : 6,
			speedY : -6,
			bgColor : "#FFCC99",
			brickColor : "#CC0066",
			pongColor : "#000000",
			ballColor : "#FF6347",
			emptySpot : [ "r0c0", "r0c8", "r5c0", "r5c8", "r2c0", "r2c8", "r3c0", "r3c8" ],
			bombs : 2,
			bombColor : "#FF0000",
			expansions : 1

		},

		{

			brickRows : 7,
			brickCol  : 9,
			speedX : 7,
			speedY : -7,
			bgColor : "#CCCCFF",
			brickColor : "#3366CC",
			pongColor : "#000000",
			ballColor : "#FF6347",
			emptySpot : [ "r0c4", "r1c4", "r2c4", "r3c4", "r4c4", "r5c4", "r6c4", "r2c0", "r3c0", "r4c0", "r2c8", "r3c8", "r4c8" ],
			bombs : 1,
			bombColor : "#FF0000",
			expansions : 1

		},

		{

			brickRows : 8,
			brickCol  : 9,
			speedX : 8,
			speedY : -8,
			bgColor : "#FF9999",
			brickColor : "#800000",
			pongColor : "#000000",
			ballColor : "#FF6347",
			emptySpot : [ "r0c0", "r0c8", "r1c0", "r1c8", "r6c0", "r6c8", "r7c0", "r7c8", "r0c4", "r7c4" ],
			bombs : 0,
			bombColor : "#FF0000",
			expansions : 1

		}

	],

	run : function ( ele, root ) {

		this . root = root ;
		this . element = ele ;

		this . stopMusic () ;
		this . stopGameOver () ;
		this . stopGameWon () ;
		this . setProperties () ;
		this . setListeners () ;
		this . hideLayers () ;
		this . setStats () ;
		this . setUpLevel ( 1 ) ;

		if ( this . thread ) {

			clearInterval ( this . thread ) ;

			this . thread = null ;

		}

		this . thread = setInterval ( Breakout . execute, 10 ) ;

	},

	setProperties : function () {

		this . canvas          = document . getElementById ( this . element ) ;
		this . ctx             = this . canvas . getContext ( "2d" ) ;
		this . ballR           = 10 ;
		this . x               = this . canvas . width / 2 ;
		this . y               = this . canvas . height - 30 ;
		this . dx              = 3 ;
		this . dy              = -3 ;
		this . pongH           = 15 ;
		this . pongW           = 80 ;
		this . pongX           = ( this . canvas . width - this . pongW ) / 2 ;
		this . rightKey        = false ;
		this . leftKey         = false ;
		this . bricks          = [] ;
		this . brickRows       = 3 ;
		this . brickCol        = 9 ;
		this . brickW          = 75 ;
		this . brickH          = 20 ;
		this . brickPadding    = 10 ;
		this . brickOffsetTop  = 30 ;
		this . brickOffsetLeft = 30 ;
		this . brickColor      = "#999999" ;
		this . pongColor       = "#000000" ;
		this . ballColor       = "#FF6347" ;
		this . RIGHT_ARROW     = 0 ;
		this . LEFT_ARROW      = 0 ;
		this . scoreRate       = 100 ;
		this . lives           = 5 ;
		this . score           = 0 ;
		this . level           = 1 ;
		this . pause           = false ;
		this . running         = true ;
		this . bombPlace       = [] ; // to prevent infinity loops while tracing bomb waves

	},

	setListeners : function () {

		document . addEventListener ( "keydown", Breakout . keyDown, false ) ;
		document . addEventListener ( "keyup", Breakout . keyUp, false ) ;

	},

	hideLayers : function () {

		this . display ( "gameover", "none" ) ;
		this . display ( "gamepause", "none" ) ;
		this . display ( "gamewon", "none" ) ;
		this . display ( "gameintro", "none" ) ;

	},

	setStats : function () {

		this . html ( "gamestats_lives", this . lives ) ;
		this . html ( "gamestats_score", this . score ) ;
		this . html ( "gamestats_level", this . level ) ;

	},

	setUpLevel : function ( lvl ) {

		this . bricks = [] ;

		var sta, idx ;
		var obj = this . levels [ lvl ] ;

		this . brickRows = obj . brickRows ;
		this . brickCol = obj . brickCol ;
		this . brickColor = obj . brickColor ;
		this . pongColor = obj . pongColor ;
		this . ballColor = obj . ballColor ;
		this . dx = obj . speedX ;
		this . dy = obj . speedY ;

		document . getElementById ( this . element ) . style . backgroundColor = obj . bgColor ;

		for ( c = 0; c < this . brickCol; c ++ ) {

			for ( r = 0; r < this . brickRows; r ++ ) {

				idx = "r" + r + "c" + c ;
				sta = ( ( obj . emptySpot . indexOf ( idx ) !== -1 ) ? 0 : 1 ) ;

				this . bricks . push ( {

					x         : ( c * ( Breakout . brickW + Breakout . brickPadding ) ) + Breakout . brickOffsetLeft,
					y         : ( r * ( Breakout . brickH + Breakout . brickPadding ) ) + Breakout . brickOffsetTop,
					r         : r,
					c         : c,
					id        : idx,
					status    : sta,
					isBomb    : false,
					isExpand  : false

				} ) ;

			}

		}

		this . calculateBombs ( obj, 0 ) ;
		this . calculateExpansions ( obj, 0 ) ;
		this . resetBall () ;

	},

	calculateBombs : function ( obj, loop ) {

		if ( obj . bombs > 0 ) {

			var i, brk, cnt = 0, all = obj . brickCol * obj . brickRows ;
			var rnd = Math . floor ( Math . random () * all ) ;

			if ( rnd in this . bricks ) {

				var sta = this . bricks [ rnd ] . status ;
				var bom = this . bricks [ rnd ] . isBomb ;

				if ( sta && ! bom ) {

					this . bricks [ rnd ] . isBomb = true ;

				}

			}

			for ( i in this . bricks ) {

				brk = this . bricks [ i ] ;

				if ( brk . isBomb ) {

					cnt ++ ;

				}

			}

			if ( cnt < obj . bombs && loop < 25 ) {

				loop ++ ;

				this . calculateBombs ( obj, loop ) ;

			}

		}

	},

	calculateExpansions : function ( obj, loop ) {

		if ( obj . expansions > 0 ) {

			var i, brk, cnt = 0, all = obj . brickCol * obj . brickRows ;
			var rnd = Math . floor ( Math . random () * all ) ;

			if ( rnd in this . bricks ) {

				var sta = this . bricks [ rnd ] . status ;
				var ext = this . bricks [ rnd ] . isExpand ;

				if ( sta && ! ext ) {

					this . bricks [ rnd ] . isExpand = true ;

				}

			}

			for ( i in this . bricks ) {

				brk = this . bricks [ i ] ;

				if ( brk . isExpand ) {

					cnt ++ ;

				}

			}

			if ( cnt < obj . expansions && loop < 25 ) {

				loop ++ ;

				this . calculateExpansions ( obj, loop ) ;

			}

		}

	},

	execute : function () {

		if ( Breakout . running ) {

			if ( ! Breakout . pause ) {

				if ( ! Breakout . gameOver () ) {

					Breakout . draw () ;

				}	else if ( Breakout . lives > 1 ) {

					Breakout . playFail () ;
					Breakout . liveDown () ;
					Breakout . resetBall () ;

				}	else {

					Breakout . running = false ;
					Breakout . playGameOver () ;
					Breakout . display ( "gameover", "block" ) ;

				}

			}

		}

	},

	resetBall : function () {

		Breakout . ballR = 10 ;
		Breakout . x = Breakout . pongX + ( Breakout . pongW / 2 ) ;
		Breakout . y = Breakout . canvas . height - 30 ;

	},

	pauseGame : function ( e ) {

		if ( e . keyCode === 80 || e . keyCode === 32 ) {

			Breakout . pause = ! Breakout . pause ;

			var type = ( ( Breakout . pause ) ? "block" : "none" ) ;

			Breakout . display ( "gamepause", type ) ;

		}

	},

	drawBall : function () {

		this . ctx . beginPath () ;
		this . ctx . arc ( this . x, this . y, this . ballR, 0, Math . PI * 2 ) ;
		this . ctx . fillStyle = this . ballColor ;
		this . ctx . fill () ;
		this . ctx . closePath () ;

	},

	drawPong : function () {

		this . ctx . beginPath () ;
		this . ctx . rect ( this . pongX, this . canvas . height - this . pongH, this . pongW, this . pongH ) ;
		this . ctx . fillStyle = this . pongColor ;
		this . ctx . fill () ;
		this . ctx . closePath () ;

	},

	drawBricks : function () {

		var check = true ;

		this . bricks . forEach (

		function ( brick ) {

			if ( ! brick . status ) return ;

			check = false ;

			var obj = Breakout . levels [ Breakout . level ] ;

			Breakout . ctx . beginPath () ;
			Breakout . ctx . rect ( brick . x, brick . y, Breakout . brickW, Breakout . brickH ) ;
			Breakout . ctx . fillStyle = ( ( Breakout . showBombs && brick . isBomb ) ? obj . bombColor : Breakout . brickColor )  ;
			Breakout . ctx . fill () ;
			Breakout . ctx . closePath () ;

		} ) ;

		if ( check ) {

			this . levelUp () ;

		}

	},

	levelUp : function () {

		this . level ++ ;

		if ( this . level in this . levels ) {

			this . playLevelUp () ;
			this . liveUp () ;
			this . setUpLevel ( this . level ) ;
			this . html ( "gamestats_level", this . level ) ;

		}	else {

			this . running = false ;

			this . playGameWon () ;
			this . display ( "gamewon", "block" ) ;

		}

	},

	collisionDetection : function () {

		this . bricks . forEach (

			function ( b ) {

				if ( ! b . status ) return ;

				var inBricksColumn = Breakout . x > b . x && Breakout . x < b . x + Breakout . brickW ;
				var inBricksRow = Breakout . y > b . y && Breakout . y < b . y + Breakout . brickH ;

				if ( inBricksColumn && inBricksRow ) {

					Breakout . dy = - Breakout . dy ;

					b . status = 0 ;

					Breakout . scoreUp () ;
					Breakout . playHit () ;

					if ( b . isBomb ) {

						Breakout . playBomb () ;
						Breakout . bombWave ( b . r, b . c ) ;

						Breakout . bombPlace = [] ;

					}

					if ( b . isExpand ) {

						Breakout . expand () ;

					}

				}

			}

		) ;

	},

	bombWave : function ( r, c ) {

		var i, j, brk, top, rgt, bot, lft ;

		for ( i in Breakout . bricks ) {

			brk = Breakout . bricks [ i ] ;

			if ( Breakout . bombPlace . indexOf ( brk . id ) === -1 && brk . status > 0 ) {

				top = ( brk . r === ( r - 1 ) && brk . c === c ) ;
				rgt = ( brk . c === ( c + 1 ) && brk . r === r ) ;
				bot = ( brk . r === ( r + 1 ) && brk . c === c ) ;
				lft = ( brk . c === ( c - 1 ) && brk . r === r ) ;

				if ( top || rgt || bot || lft ) {

					Breakout . bombPlace . push ( brk . id ) ;
					Breakout . scoreUp () ;

					brk . status = 0 ;

					if ( brk . isBomb ) {

						Breakout . playBomb () ;
						Breakout . bombWave ( brk . r, brk . c ) ;

					}

					if ( brk . isExpand ) {

						Breakout . expand () ;

					}

				}

			}

		}

	},

	expand : function () {

		if ( ! Breakout . expansion ) {

			Breakout . expansionCount = 0 ;
			Breakout . pongW = ( Breakout . pongW * 2 ) ;

			Breakout . playExpansion () ;
			Breakout . expansion = setInterval ( Breakout . expandExe, 1000 ) ;

		}

	},

	expandExe : function () {

		if ( Breakout . pause ) {

			if ( Breakout . expandSndObj ) {

				Breakout . expandSndObj . pause () ;

			}

		}	else {

			if ( Breakout . expandSndObj ) {

				Breakout . expandSndObj . play () ;

			}

			Breakout . expansionCount ++ ;

			if ( Breakout . expansionCount > Breakout . expansionTime ) {

				clearInterval ( Breakout . expansion ) ;

				Breakout . expansion = null ;
				Breakout . pongW = ( Breakout . pongW / 2 ) ;

				Breakout . stopExpansion () ;

			}

		}

	},

	hitPong : function () { return this . hitBottom () && this . ballOverPong () ; },

	ballOverPong : function () { return this . x > this . pongX && this . x < this . pongX + this . pongW ; },

	hitBottom : function () { return this . y + this . dy > this . canvas . height - this . ballR ; },

	gameOver : function () { return this . hitBottom () && ! this . ballOverPong () ; },

	hitSideWall : function () { return this . x + this . dx > this . canvas . width - this . ballR || this . x + this . dx < this . ballR ; },

	hitTop : function () { return this . y + this . dy < this . ballR ; },

	xOutOfBounds : function () { return this . x + this . dx > this . canvas . width - this . ballR || this . x + this . dx < this . ballR ; },

	rightPressed : function ( e ) { return e . keyCode == this . RIGHT_ARROW ; },

	leftPressed : function ( e ) { return e . keyCode == this . LEFT_ARROW ; },

	scoreUp : function () {

		Breakout . score += ( Breakout . scoreRate * Breakout . level ) ;

		if ( Breakout . score > Breakout . hiScore ) {

			Breakout . hiScore = Breakout . score ;

		}

		Breakout . html ( "gamestats_score", Breakout . score ) ;
		Breakout . html ( "gamestats_hiscore", Breakout . hiScore ) ;

	},

	liveUp : function () {

		Breakout . lives ++ ;

		Breakout . html ( "gamestats_lives", Breakout . lives ) ;

	},

	liveDown : function () {

		Breakout . lives -- ;

		Breakout . html ( "gamestats_lives", Breakout . lives ) ;

	},

	keyDown : function ( e ) {

		Breakout . pauseGame ( e ) ;
		Breakout . processCheats ( e ) ;
		Breakout . rightKey = Breakout . rightPressed ( e ) ;
		Breakout . leftKey = Breakout . leftPressed ( e ) ;

	},

	keyUp : function ( e ) {

		Breakout . rightKey = ( ( Breakout . rightPressed ( e ) ) ? false : Breakout . rightKey ) ;
		Breakout . leftKey = ( ( Breakout . leftPressed ( e ) ) ? false : Breakout . leftKey ) ;

	},

	draw : function () {

		if ( this . showMeta ) {

			this . writeMeta () ;

		}

		this . ctx . clearRect ( 0, 0, this . canvas . width, this . canvas . height ) ;

		this . drawBricks () ;
		this . drawBall () ;
		this . drawPong () ;
		this . collisionDetection () ;

		if ( this . hitPong () ) {

			this . playPong () ;

		}

		if ( this . hitTop () || this . hitSideWall () ) {

			// too much noise, sound is not exclusive anymore
			//this . playWall () ;

		}

		if ( this . hitSideWall () ) {

			this . dx = - this . dx ;

		}

		if ( this . hitTop () || this . hitPong () ) {

			this . dy = - this . dy ;

		}

		if ( this . gameOver () ) {

			//hmmm...

		}

		this . RIGHT_ARROW = 39 ;
		this . LEFT_ARROW = 37 ;

		var minX = 0 ;
		var maxX = this . canvas . width - this . pongW ;

		this . pongDelta = ( ( this . rightKey ) ? 7 : ( ( this . leftKey ) ? -7 : 0 ) ) ;
		this . pongX = this . pongX + this . pongDelta ;
		this . pongX = Math . min ( this . pongX, maxX ) ;
		this . pongX = Math . max ( this . pongX, minX ) ;

		this . x += this . dx ;
		this . y += this . dy ;

	},

	clearLevel : function () {

		for ( var i in Breakout . bricks ) {

			Breakout . bricks [ i ] . status = 0 ;

		}

	},

	writeMeta : function () {

		var ele = "gamemeta", con = "" ;
		var box = document . getElementById ( ele ) ;

		con += " X = " + this . x ;
		con += " Y = " + this . y ;
		con += " DX = " + this . dx ;
		con += " DY = " + this . dy ;

		this . html ( ele, con ) ;

	},

	pathAudio : function ( wav ) {

		var pth = this . root + "data/sound/" + wav ;

		return pth ;

	},

	playHit : function () {

		if ( this . soundEffects ) {

			var pth = this . pathAudio ( "hit.wav" ) ;
			var snd = new Audio ( pth ) ;

			snd . loop = false ;
			snd . play () ;

		}

	},

	playPong : function () {

		if ( this . soundEffects ) {

			var pth = this . pathAudio ( "pong.wav" ) ;
			var snd = new Audio ( pth ) ;

			snd . loop = false ;
			snd . play () ;

		}

	},

	playWall : function () {

		if ( this . soundEffects ) {

			var pth = this . pathAudio ( "wall.wav" ) ;
			var snd = new Audio ( pth ) ;

			snd . loop = false ;
			snd . play () ;

		}

	},

	playLevelUp : function () {

		if ( this . soundEffects ) {

			var pth = this . pathAudio ( "levelup.wav" ) ;
			var snd = new Audio ( pth ) ;

			snd . loop = false ;
			snd . play () ;

		}

	},

	playFail : function () {

		if ( this . soundEffects ) {

			var pth = this . pathAudio ( "fail.wav" ) ;
			var snd = new Audio ( pth ) ;

			snd . loop = false ;
			snd . play () ;

		}

	},

	playGameOver : function () {

		if ( this . soundEffects ) {

			var pth = this . pathAudio ( "gameover.wav" ) ;

			this . failSndObj = new Audio ( pth ) ;

			this . failSndObj . loop = false ;
			this . failSndObj . play () ;

		}

	},

	playGameWon : function () {

		if ( this . soundEffects ) {

			var pth = this . pathAudio ( "gamewon.wav" ) ;

			this . wonSndObj = new Audio ( pth ) ;

			this . wonSndObj . loop = false ;
			this . wonSndObj . play () ;

		}

	},

	playBomb : function () {

		if ( this . soundEffects ) {

			var pth = this . pathAudio ( "bomb.wav" ) ;
			var snd = new Audio ( pth ) ;

			snd . loop = false ;
			snd . play () ;

		}

	},

	playExpansion : function () {

		if ( this . soundEffects ) {

			var pt1 = this . pathAudio ( "expand.wav" ) ;
			var pt2 = this . pathAudio ( "expand_loop.wav" ) ;
			var snd = new Audio ( pt1 ) ;

			snd . loop = false ;
			snd . play () ;

			var iVal = setInterval (

				function () {

					Breakout . stopExpansion () ;

					Breakout . expandSndObj = new Audio ( pt2 ) ;
					Breakout . expandSndObj . loop = true ;
					Breakout . expandSndObj . play () ;

					clearInterval ( iVal ) ;

					iVal = null ;

				}, 1500

			) ;

		}

	},

	playMusic : function ( root ) {

		if ( this . musicObj ) {

			if ( this . musicObj . paused ) {

				this . musicObj . play () ;

			}	else {

				this . musicObj . pause () ;

			}

		}	else {

			var pth = ( ( root ) ? root : "" ) + "data/sound/music.wav" ;

			this . musicObj = new Audio ( pth ) ;

			this . musicObj . loop = true ;
			this . musicObj . play () ;

		}

	},

	stopMusic : function () {

		if ( this . musicObj ) {

			this . musicObj . pause () ;
			this . musicObj . currentTime = 0 ;

		}

	},

	stopGameOver : function () {

		if ( this . failSndObj ) {

			this . failSndObj . pause () ;
			this . failSndObj . currentTime = 0 ;

		}

	},

	stopGameWon : function () {

		if ( this . wonSndObj ) {

			this . wonSndObj . pause () ;
			this . wonSndObj . currentTime = 0 ;

		}

	},

	stopExpansion : function () {

		if ( Breakout . expandSndObj ) {

			Breakout . expandSndObj . pause () ;
			Breakout . expandSndObj . currentTime = 0 ;

		}

	},

	setVersion : function ( ele ) {

		this . html ( ele, this . version ) ;

	},

	processCheats : function ( e ) {

		if ( Breakout . enableCheats ) {

			var cod = e. keyCode ;

			switch ( cod ) {

				case 69 :

					if ( ! Breakout . pause ) {

						Breakout . expand () ;

					}

					break ;

				case 76 :

					Breakout . liveUp () ;
					break ;

				case 83 :

					Breakout . scoreUp () ;
					break ;

				case 88 :

					if ( ! Breakout . pause ) {

						Breakout . clearLevel () ;

					}

					break ;

				case 107 :

					( ( Breakout . dx > 0 ) ? Breakout . dx ++ : Breakout . dx -- ) ;
					( ( Breakout . dy > 0 ) ? Breakout . dy ++ : Breakout . dy -- ) ;
					break ;

				case 109 :

					( ( Breakout . dx > 1 ) ? Breakout . dx -- : Breakout . dx ++ ) ;
					( ( Breakout . dy > 1 ) ? Breakout . dy -- : Breakout . dy ++ ) ;
					break ;

				default :

					//
					break ;

			}

		}

	},

	display : function ( ele, type ) {

		document . getElementById ( ele ) . style . display = type ;

	},

	html : function ( ele, content ) {

		document . getElementById ( ele ) . innerHTML = content ;

	}

} ; 
