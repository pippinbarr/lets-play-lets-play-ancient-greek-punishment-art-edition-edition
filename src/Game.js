
BasicGame.Game = function (game) {

	//	When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;		//	a reference to the currently running game
    this.add;		//	used to add sprites, text, groups, etc
    this.camera;	//	a reference to the game camera
    this.cache;		//	the game cache
    this.input;		//	the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
    this.load;		//	for preloading assets
    this.math;		//	lots of useful common math operations
    this.sound;		//	the sound manager - add a sound, play one, set-up markers, etc
    this.stage;		//	the game stage
    this.time;		//	the clock
    this.tweens;	//	the tween manager
    this.world;		//	the game world
    this.particles;	//	the particle manager
    this.physics;	//	the physics manager
    this.rnd;		//	the repeatable random number generator

    //	You can use any of these from any function within this State.
    //	But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

};

var StateEnum = {
    DAYBREAK: "daybreak",
    START: "start",
    PERCHED: "perched",
    PECKING: "pecking",
    FLAPUP: "flapup",
    FLAPDOWN: "flapdown",
    HOVER: "hover",
    PREDEPARTURE: "predeparture",
    DEPARTING: "departing",
    DEPARTED: "departed",
    NIGHT: "night"
}

var DAY_FRAME = 0;
var NIGHT_FRAME = 1;

var FRAME_Y = 80; // WHAT IS IT REALLY?

var EAGLE_START_X = 154;
var EAGLE_START_Y = 80;
var EAGLE_LAND_Y = 290;
var EAGLE_HOVER_Y = 260;
var BIRD_SPEED = 0.8;

var state = StateEnum.DAYBREAK;

var webcam = false;
var video = null;
var bmd;
var sprite;
var resizedForWebcam = false;

var reflection_open;
var reflection_half;
var reflection_closed;

var prometheus;
var rock;
var eagle;

var liver;
var days;

var justPecked = false;

var instructionsText;
var liverText;
var daysText;

var startTimer;
var perchTimer;
var hoverTimer;
var departTimer;
var nightTimer;

var peckSound;
var restoreSound;

var blinkToClosed = true;
var blinkToOpen = false;

BasicGame.Game.prototype = {


    create: function () {

        this.stage.backgroundColor = 0xffcccccc;
        // this.stage.backgroundColor = 0xffff0000;


        liver = 100;
        days = 0;


        // The pink background of the game
        bg = this.add.sprite(120,140,'bg');

        bg.smoothed = false;
        bg.scale.x *= 420;
        bg.scale.y *= 420;

        bg.animations.frame = DAY_FRAME;

        // Prometheus
        prometheus = this.add.sprite(360,303,'prometheus');
        prometheus.animations.add('struggle',[1,0],5,false);
        prometheus.animations.add('night',[2],1,false);

        prometheus.smoothed = false;


        // The rock and chains
        rock = this.add.sprite(150,174,'rockandchains');

        rock.smoothed = false;
        rock.scale.x = 2.34;
        rock.scale.y = 2.34;

        rock.animations.frame = DAY_FRAME;

        // The eagle
        eagle = this.add.sprite(EAGLE_START_X,EAGLE_START_Y,'eagle');
        eagle.animations.add('fly',[0,1,2,3],5,true);
        eagle.animations.add('perched',[4,4],10,false);
        eagle.animations.add('peck',[5,4,4,4,4,4,5,4,4,4,4,4,4,4,4,4,4,5,4,4,4,5,4,4,4,4,4,4,5,4,4,4,4,4,5,4,4,4],5,true);
        eagle.smoothed = false;
        eagle.animations.play('fly');

        // The instructions

        if (this.game.device.desktop) 
        {
            instructionsText1 = this.game.add.bitmapText(290, 226, 'commodore','RAPIDLY CLICK ON THE',24);
            instructionsText2 = this.game.add.bitmapText(instructionsText1.x - 0, instructionsText1.y + 12, 'commodore','ARTWORK TO WRITHE IN',24);
            instructionsText3 = this.game.add.bitmapText(instructionsText1.x + 14, instructionsText2.y + 12, 'commodore','PAIN AND DISLODGE',24);
            instructionsText4 = this.game.add.bitmapText(instructionsText1.x + 48, instructionsText3.y + 12, 'commodore','THE EAGLE!',24);
        }
        else 
        {
            instructionsText1 = this.game.add.bitmapText(300, 226, 'commodore','RAPIDLY TAP ON THE',24);
            instructionsText2 = this.game.add.bitmapText(instructionsText1.x - 10, instructionsText1.y + 12, 'commodore','ARTWORK TO WRITHE IN',24);
            instructionsText3 = this.game.add.bitmapText(instructionsText1.x + 4, instructionsText2.y + 12, 'commodore','PAIN AND DISLODGE',24);
            instructionsText4 = this.game.add.bitmapText(instructionsText1.x + 40, instructionsText3.y + 12, 'commodore','THE EAGLE!',24);
        }

        instructionsText1.scale.x = instructionsText1.scale.y = 0.5;
        instructionsText1.smoothed = false;

        instructionsText2.scale.x = instructionsText2.scale.y = 0.5;
        instructionsText2.smoothed = false;

        instructionsText3.scale.x = instructionsText3.scale.y = 0.5;
        instructionsText3.smoothed = false;

        instructionsText4.scale.x = instructionsText4.scale.y = 0.5;
        instructionsText4.smoothed = false;

        // Liver text
        liverText = this.game.add.bitmapText(200, 314, 'commodore','LIVER: ' + liver + '%',24);
        liverText.scale.x = liverText.scale.y = 0.7;
        liverText.smoothed = false;
        
        // Days text
        daysText = this.game.add.bitmapText(440, 314, 'commodore','DAYS: ' + days,24);
        daysText.scale.x = daysText.scale.y = 0.7;
        daysText.smoothed = false;


        // NEED TO ADD THE MATTING IN HERE SEPARATELY (SO IT IS BEHIND THE WEBCAM)
        matting = this.game.add.sprite(109,140,'matting');

        

        if (this.game.device.desktop) // DESKTOP
        {
            bmd = this.game.make.bitmapData(640, 480);
            sprite = bmd.addToWorld();
            sprite.alpha = 0.15;
            sprite.scale.x = -1.2;
            sprite.scale.y = 1.2;

            sprite.x = matting.x + matting.width;
            sprite.y = matting.y;

            if (this.game.device.firefox || this.game.device.chrome || this.game.device.opera)
            {
                webcam = this.game.plugins.add(Phaser.Plugin.Webcam);
                webcam.video.src = "video/reflection.webm";
                webcam.video.type = "video/webm";   
                webcam.video.loop = true;
                webcam.start(640, 480, bmd.context);
            }
            else
            {
                if (this.game.device.safari || this.game.device.ie)
                {
                    // console.log("Setting video to mp4");
                    this.video = document.createElement('video');
                    this.video.src = "video/reflection.mp4";
                    this.video.type = "video/mp4";
                }
                else
                {
                    this.video = document.createElement('video');
                    this.video.src = "video/reflection.webm";
                    this.video.type = "video/webm";
                }
                this.video.loop = true;
                this.video.play();
            }
        }
        else // MOBILE
        {
            // Otherwise just a static image
            reflection_open = this.game.add.sprite(matting.x,matting.y,'reflection-open');
            reflection_open.alpha = 0.15;
            reflection_open.scale.x = reflection_open.scale.y = 1.2;
            reflection_half = this.game.add.sprite(reflection_open.x,reflection_open.y,'reflection-half');
            reflection_half.alpha = 0.15;
            reflection_half.scale.x = reflection_half.scale.y = reflection_open.scale.x;
            reflection_closed = this.game.add.sprite(reflection_open.x,reflection_open.y,'reflection-closed');
            reflection_closed.alpha = 0.15;
            reflection_closed.scale.x = reflection_closed.scale.y = reflection_open.scale.x;

            reflection_half.visible = false;
            reflection_closed.visible = false;

            instructionsText1.visible = false;
            instructionsText2.visible = false;
            instructionsText3.visible = false;
            instructionsText4.visible = false;

            this.time.events.add(Phaser.Timer.SECOND * 2, this.blink, this);
        }


        // The wall and frame
        this.add.sprite(0,0,'frame');


        peckSound = this.add.audio('peck',1,false);
        restoreSound = this.add.audio('restore',1,false);


        startTimer = this.time.events.add(Phaser.Timer.SECOND * 1, this.startDay, this);


    },



    blink: function () {
        blinkToClosed = true;
    },


    handleBlinking: function () {
        if (blinkToClosed)
        {
            if (reflection_open.visible)
            {
                // console.log("open");
                reflection_open.visible = false;
                reflection_half.visible = true;
            }
            else if (reflection_half.visible)
            {
                // console.log("half");
                reflection_half.visible = false;
                reflection_closed.visible = true;
            }
            else if (reflection_closed.visible)
            {
                // console.log("closed");
                reflection_closed.visible = false;
                reflection_half.visible = true;
                blinkToOpen = true;
                blinkToClosed = false;
            }

        }
        else if (blinkToOpen)
        {
            if (reflection_open.visible)
            {
                blinkToOpen = false;
                blinkToClosed = false;

                this.time.events.add(Phaser.Timer.SECOND * 4 + 2, this.blink, this);
            }
            else if (reflection_half.visible)
            {
                reflection_half.visible = false;
                reflection_open.visible = true;
            }
        }
    },


    drawVideo: function () {

        if (this.video != null)
        {
            bmd.context.drawImage(this.video,0,0);           
        }
        else if (this.webcam != false)
        {
            webcam.update();

            bmd.context.drawImage(webcam.video,0,0);
            if (!resizedForWebcam && webcam.stream)
            {
                sprite.scale.x = -0.9;
                sprite.scale.y = 0.9;
                resizedForWebcam = true;
            }
        }

    },


    update: function () {


        if (this.game.device.desktop) this.drawVideo();        
        else this.handleBlinking();

        if (liver == 0 && eagle.animations.currentAnim.frame == 4 && state != StateEnum.PREDEPARTURE && state != StateEnum.DEPARTING && state != StateEnum.DEPARTED) 
        {
            state = StateEnum.PREDEPARTURE;
            eagle.animations.stop();
            departTimer = this.time.events.add(Phaser.Timer.SECOND * 2, this.depart, this);
        }


        if (state != StateEnum.NIGHT && state != StateEnum.PREDEPARTURE && state != StateEnum.DEPARTING && state != StateEnum.DEPARTED)
        {
            if (this.input.activePointer.justPressed(30) && 
                this.input.activePointer.x > matting.x &&
                this.input.activePointer.x < matting.x + matting.width &&
                this.input.activePointer.y > matting.y &&
                this.input.activePointer.y < matting.y + matting.height)
            {
                prometheus.animations.play('struggle');

                if (state == StateEnum.PERCHED || state == StateEnum.PECKING)
                {
                    this.game.time.events.remove(perchTimer);
                    eagle.animations.play('fly');
                    state = StateEnum.FLAPUP;
                }
            }
        }


        switch (state)
        {
            case StateEnum.START:
            if (eagle.y < EAGLE_LAND_Y)
            {
                eagle.x += BIRD_SPEED;
                eagle.y += BIRD_SPEED;
            }
            else
            {
                eagle.animations.play('perched');
                perchTimer = this.time.events.add(Phaser.Timer.SECOND * (Math.random() * 2 + 1), this.peck, this);
                state = StateEnum.PERCHED;
            }

            break;

            case StateEnum.PERCHED:

            break;

            case StateEnum.PECKING:

            if (eagle.animations.currentAnim.frame == 5 && !justPecked)
            {
                peckSound.play();
                justPecked = true;
                liver -= 5;
                liverText.text = "LIVER: " + liver + "%";
            }
            else if (eagle.animations.currentAnim.frame == 4)
            {
                justPecked = false;
            }

            break;

            case StateEnum.FLAPUP:
            if (eagle.y > EAGLE_HOVER_Y)
            {
                eagle.y -= BIRD_SPEED;
            }
            else
            {
                state = StateEnum.HOVER;
                hoverTimer = this.time.events.add(Phaser.Timer.SECOND * (Math.random() * 3 + 1), this.stopHover, this);
            }

            break;

            case StateEnum.FLAPDOWN:

            if (instructionsText1.visible) 
            {
                instructionsText1.visible = false;
                instructionsText2.visible = false;
                instructionsText3.visible = false;
                instructionsText4.visible = false;
            }

            if (eagle.y < EAGLE_LAND_Y)
            {
                eagle.y += BIRD_SPEED;
            }
            else
            {
                eagle.animations.play('perched');
                perchTimer = this.time.events.add(Phaser.Timer.SECOND * (Math.random() * 2 + 1), this.peck, this);
                state = StateEnum.PERCHED;                
            }

            break;


            case StateEnum.HOVER:

            break;


            case StateEnum.PREDEPARTURE:

            break;

            case StateEnum.DEPARTING:

            if (eagle.y > FRAME_Y)
            {
                eagle.x += BIRD_SPEED; eagle.y -= BIRD_SPEED;
            }
            else
            {
                state = StateEnum.DEPARTED;
                nightTimer = this.time.events.add(Phaser.Timer.SECOND * 2, this.nightFall, this);
            }

            break;

            case StateEnum.DEPARTED:
            break;

            case StateEnum.NIGHT:
            break;

        }



    },


    peck: function () {

        eagle.animations.play('peck');
        state = StateEnum.PECKING;

    },


    stopHover: function () {

        state = StateEnum.FLAPDOWN;

    },


    depart: function () {

        state = StateEnum.DEPARTING;
        eagle.animations.play("fly");

    },


    nightFall: function () {

        state = StateEnum.NIGHT;
        liverText.visible = false;
        daysText.visible = false;
        liver = 100;
        days++;
        prometheus.animations.play('night');
        rock.animations.frame = NIGHT_FRAME;
        bg.animations.frame = NIGHT_FRAME;
        prometheus.visible = false;

        nightTimer = this.time.events.add(Phaser.Timer.SECOND * 5, this.dayTime, this);
    },


    dayTime: function () {

        state = StateEnum.DAYBREAK;
        eagle.x = EAGLE_START_X;
        eagle.y = EAGLE_START_Y;
        rock.animations.frame = DAY_FRAME;
        bg.animations.frame = DAY_FRAME;

        prometheus.visible = true;
        prometheus.animations.frame = 0;
        liverText.visible = true;
        daysText.visible = true;
        instructionsText1.visible = false;
        instructionsText2.visible = false;
        instructionsText3.visible = false;
        instructionsText4.visible = false;
        liverText.text = 'LIVER: ' + liver + '%';
        daysText.text = 'DAYS: ' + days;

        justPecked = false;

        restoreSound.play();

        startTimer = this.time.events.add(Phaser.Timer.SECOND * 1, this.startDay, this);

    },


    startDay: function () {

        state = StateEnum.START;

    },


    quitGame: function (pointer) {

		//	Here you should destroy anything you no longer need.
		//	Stop music, delete sprites, purge caches, free resources, all that good stuff.

		//	Then let's go back to the main menu.
		this.state.start('MainMenu');

	}

};
