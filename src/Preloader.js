
BasicGame.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;

	this.ready = false;

};

BasicGame.Preloader.prototype = {

	preload: function () {

		//	These are the assets we loaded in Boot.js
		//	A nice sparkly background and a loading progress bar
		// this.background = this.add.sprite(0, 0, 'preloaderBackground');
		this.preloadBar = this.add.sprite(0, 0, 'preloaderBar');
		this.preloadBar.x = this.game.canvas.width/2 - this.preloadBar.width/2;
		this.preloadBar.y = this.game.canvas.height/2 - this.preloadBar.height/2;

		//	This sets the preloadBar sprite as a loader sprite.
		//	What that does is automatically crop the sprite from 0 to full-width
		//	as the files below are loaded in.
		// this.load.setPreloadSprite(this.preloadBar);

		//	Here we load the rest of the assets our game needs.
		//	As this is just a Project Template I've not provided these assets, the lines below won't work as the files themselves will 404, they are just an example of use.
		
		this.load.image('frame', 'images/frame.png');
		this.load.image('matting', 'images/matting.png');
		this.load.image('reflection-open', 'images/reflection-open.png');
		this.load.image('reflection-half', 'images/reflection-half.png');
		this.load.image('reflection-closed', 'images/reflection-closed.png');

		this.load.spritesheet('bg', 'images/bg.png', 2, 1);
		this.load.spritesheet('prometheus', 'images/prometheus.png', 49, 23);
		this.load.spritesheet('rockandchains', 'images/rockandchains.png', 200, 100);
		this.load.spritesheet('eagle', 'images/eagle.png', 30, 26);

		this.load.bitmapFont('commodore', 'fonts/commodore.png', 'fonts/commodore.xml');

		this.load.audio('peck',['sounds/peck.mp3','sounds/peck.ogg']);
		this.load.audio('restore',['sounds/restore.mp3','sounds/restore.ogg']);
	},

	create: function () {

		//	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
		this.preloadBar.cropEnabled = false;

	},

	update: function () {

		//	You don't actually need to do this, but I find it gives a much smoother game experience.
		//	Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
		//	You can jump right into the menu if you want and still play the music, but you'll have a few
		//	seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
		//	it's best to wait for it to decode here first, then carry on.
		
		//	If you don't have any music in your game then put the game.state.start line into the create function and delete
		//	the update function completely.
		
		// if (this.cache.isSoundDecoded('peck') && this.ready == false)
		if (this.ready == false)
		{
			this.ready = true;
			this.state.start('Game');
		}

	}

};
