/**
* Provides access to the Webcam (if available)
*/

var firstTime = true;

Phaser.Plugin.Webcam = function (game, parent) {

    Phaser.Plugin.call(this, game, parent);

    this.doWebCam = false;

    this.video = document.createElement('video');
    this.video.autoplay = true;
    this.video.controls = true;

    this.context = null;
    this.stream = null;

    if (!game.device.getUserMedia)
    {
        return false;
    }

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    this.onConnect = new Phaser.Signal();
    this.onError = new Phaser.Signal();

};

Phaser.Plugin.Webcam.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.Webcam.prototype.constructor = Phaser.Plugin.Webcam;

Phaser.Plugin.Webcam.prototype.start = function (width, height, context) {

    // console.log("Webcam.start(" + width + "," + height + ", context)");

    this.context = context;

    // if (!this.stream)
    // {
        navigator.getUserMedia( { video: { mandatory: { minWidth: width, minHeight: height } } }, this.connectCallback.bind(this), this.errorCallback.bind(this));
    // }

};


Phaser.Plugin.Webcam.prototype.stop = function () {

    if (this.stream)
    {
        this.stream.stop();
        this.stream = null;
    }

};



Phaser.Plugin.Webcam.prototype.connectCallback = function (stream) {

        this.stream = stream;
        setTimeout(this.startStream.bind(this,stream),1000); 

};



Phaser.Plugin.Webcam.prototype.startStream = function (stream) {

        this.onConnect.dispatch(this.video);
        this.video.src = window.URL.createObjectURL(this.stream);  
        this.doWebCam = true;     

};



Phaser.Plugin.Webcam.prototype.enable = function () {

    this.doWebCam = true;

};



Phaser.Plugin.Webcam.prototype.errorCallback = function (event) {

    this.onError.dispatch(event);

};



Phaser.Plugin.Webcam.prototype.grab = function (context, x, y) {

    if (this.stream && this.doWebCam)
    {
        context.drawImage(this.video, x, y);
    }

};



Phaser.Plugin.Webcam.prototype.update = function () {

    // console.log("Stream: " + this.stream);
    // console.log("Context: " + this.context);
    // console.log("Video: " + this.video);

    if (this.stream != null && this.doWebCam)
    {

        try {
            this.context.drawImage(this.video, 0, 0);
        }
        catch (e)
        {
            if (e.name == "NS_ERROR_NOT_AVAILABLE")
            {
                // console.log("Caught NS ERROR");
            }
        }
    }

};



/**
* @name Phaser.Plugin.Webcam#active
* @property {boolean} active - Is this Webcam plugin capturing a video stream or not?
* @readonly
*/
Object.defineProperty(Phaser.Plugin.Webcam.prototype, "active", {

    get: function() {
        return (this.stream);
    }

});