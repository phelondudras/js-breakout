/*!
  * JS-Breakout v1.0.0 (https://phelondudras.de/)
  * Copyright 2018 Phelon Dudras (https://github.com/phelondudras/js-breakout)
  * Licensed under GNU GENERAL PUBLIC LICENSE 3
  */

var Breakout = {

	thread : null,
	element : null,
	hiScore : 0,
	root : null,
	musicObj : null,
	levels : [

		{

			brickRows : 0,
			brickCol  : 0,
			speedX : 0,
			speedY : 0,
			bgColor : '#FFFFFF',
			brickColor : '#FFFFFF',
			pongColor : '#000000',
			ballColor : '#FF6347'

		},

		{

			brickRows : 3,
			brickCol  : 9,
			speedX : 3,
			speedY : -3,
			bgColor : '#FFFFFF',
			brickColor : '#999999',
			pongColor : '#000000',
			ballColor : '#FF6347'

		},

		{

			brickRows : 4,
			brickCol  : 9,
			speedX : 4,
			speedY : -4,
			bgColor : '#CCffCC',
			brickColor : '#009933',
			pongColor : '#000000',
			ballColor : '#FF6347'

		},

		{

			brickRows : 5,
			brickCol  : 9,
			speedX : 5,
			speedY : -5,
			bgColor : '#FFFFCC',
			brickColor : '#FF9900',
			pongColor : '#000000',
			ballColor : '#FF6347'

		},

		{

			brickRows : 6,
			brickCol  : 9,
			speedX : 6,
			speedY : -6,
			bgColor : '#FFCC99',
			brickColor : '#CC0066',
			pongColor : '#000000',
			ballColor : '#FF6347'

		},

		{

			brickRows : 7,
			brickCol  : 9,
			speedX : 7,
			speedY : -7,
			bgColor : '#CCCCFF',
			brickColor : '#3366CC',
			pongColor : '#000000',
			ballColor : '#FF6347'

		},

		{

			brickRows : 8,
			brickCol  : 9,
			speedX : 8,
			speedY : -8,
			bgColor : '#FF9999',
			brickColor : '#800000',
			pongColor : '#000000',
			ballColor : '#FF6347'

		}

	],

	run : function ( ele, root ) {

		this . root = root ;
		this . element = ele ;

		this . stopMusic () ;
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
		this . brickColor      = '#999999' ;
		this . pongColor       = '#000000' ;
		this . ballColor       = '#FF6347' ;
		this . RIGHT_ARROW     = 0 ;
		this . LEFT_ARROW      = 0 ;
		this . scoreRate       = 100 ;
		this . lives           = 5 ;
		this . score           = 0 ;
		this . level           = 1 ;
		this . pause           = false ;
		this . running         = true ;
		this . showMeta        = false ;

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
		this . html ( "gamestats_score", this . score ) ;
		this . html ( "gamestats_level", this . level ) ;

	},

	setUpLevel : function ( lvl ) {

		this . bricks = [] ;

		var obj = this . levels [ lvl ] ;

		this . brickRows = obj . brickRows ;
		this . brickCol = obj . brickCol ;
		this . brickColor = obj . brickColor ;
		this . pongColor = obj . pongColor ;
		this . ballColor = obj . ballColor ;
		this . dx = obj . speedX ;
		this . dy = obj . speedX ;

		document . getElementById ( this . element ) . style . backgroundColor = obj . bgColor ;

		for ( c = 0; c < this . brickCol; c ++ ) {

			for ( r = 0; r < this . brickRows; r ++ ) {

				this . bricks . push ( {

					x      : ( c * ( Breakout . brickW + Breakout . brickPadding ) ) + Breakout . brickOffsetLeft,
					y      : ( r * ( Breakout . brickH + Breakout . brickPadding ) ) + Breakout . brickOffsetTop,
					status : 1

				} ) ;

			}

		}

		this . resetBall () ;

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

			Breakout . ctx . beginPath () ;
			Breakout . ctx . rect ( brick . x, brick . y, Breakout . brickW, Breakout . brickH ) ;
			Breakout . ctx . fillStyle = Breakout . brickColor  ;
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

				}

			}

		) ;

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

		var pth = this . pathAudio ( "hit.wav" ) ;
		var snd = new Audio ( pth ) ;

		snd . loop = false ;
		snd . play () ;

	},

	playPong : function () {

		var pth = this . pathAudio ( "pong.wav" ) ;
		var snd = new Audio ( pth ) ;

		snd . loop = false ;
		snd . play () ;

	},

	playWall : function () {

		var pth = this . pathAudio ( "wall.wav" ) ;
		var snd = new Audio ( pth ) ;

		snd . loop = false ;
		snd . play () ;

	},

	playLevelUp : function () {

		var pth = this . pathAudio ( "levelup.wav" ) ;
		var snd = new Audio ( pth ) ;

		snd . loop = false ;
		snd . play () ;

	},

	playFail : function () {

		var pth = this . pathAudio ( "fail.wav" ) ;
		var snd = new Audio ( pth ) ;

		snd . loop = false ;
		snd . play () ;

	},

	playGameOver : function () {

		var pth = this . pathAudio ( "gameover.wav" ) ;
		var snd = new Audio ( pth ) ;

		snd . loop = false ;
		snd . play () ;

	},

	playGameWon : function () {

		var pth = this . pathAudio ( "gamewon.wav" ) ;
		var snd = new Audio ( pth ) ;

		snd . loop = false ;
		snd . play () ;

	},

	playMusic : function ( root ) {

		var pth = ( ( root ) ? root : "" ) + "data/sound/music.wav" ;

		this . musicObj = new Audio ( pth ) ;

		this . musicObj . loop = true ;
		this . musicObj . play () ;

	},

	stopMusic : function () {

		if ( this . musicObj ) {

			this . musicObj . pause () ;
			this . musicObj . currentTime = 0 ;

		}

	},

	display : function ( ele, type ) {

		document . getElementById ( ele ) . style . display = type ;

	},

	html : function ( ele, content ) {

		document . getElementById ( ele ) . innerHTML = content ;

	}

} ; 
