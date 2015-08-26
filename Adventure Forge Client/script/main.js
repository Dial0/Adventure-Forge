var app = new PLAYGROUND.Application({
    
    scale: 1.5,
    
   createmysprite: function(nameID) {
        return {
            id: nameID,
            x: this.center.x,
            y: this.center.y,
        }
    },
        
    create: function (){
        this.camera = { x: 200, y: 500 };
        this.loadImage("grass");
        this.chair = this.createmysprite("podchair");
        WorldMap(50,50);
    },
    
    step: function(dt){
       
        var speed = 100;
        
        if(this.moveup){
            this.camera.y -= dt*speed;
        }
        if(this.movedown){
            this.camera.y += dt*speed;
        }
        if(this.moveleft){
            this.camera.x -= dt*speed;
        }
        if(this.moveright){
            this.camera.x += dt*speed;
        }
        this.camera.x = Math.round(this.camera.x)
        this.camera.y = Math.round(this.camera.y)
        
    },
    
    render: function (dt){
        
        var rendchair = this.chair;
        this.layer.clear("#000000");
        this.layer.font("32px Arial");      
        this.layer.fillStyle("#fff");
        this.layer.fillText(this.text, 16, 32);
        RenderBGmap.call(this,WorldMap)
        //this.layer.drawImage(this.images[rendchair.id],rendchair.x,rendchair.y);
    },
    
    mousemove: function(data) {
        
        if(this.clicking){
            this.chair.x = data.x;
            this.chair.y = data.y;
        }
    },

    mousedown: function(data) {
        this.text = "mouse down " + data.button + " " + data.x +  " , " + data.y;
        this.clicking = true;
    },

    mouseup: function(data) {
        this.text = "mouse up " + data.button + " " + data.x +  " , " + data.y;
        this.clicking = false;
    },
    

    keydown: function(event) {
        var pk = event.key  /* pressed key name */
        if(pk === "w"){
            this.moveup = true;
        }
        if(pk === "s"){
            this.movedown = true;
        }
        if(pk === "a"){
            this.moveleft = true;
        }
        if(pk === "d"){
            this.moveright = true;
        }
    },

    keyup: function(event) {
        var pk = event.key  /* pressed key name */
        if(pk === "w"){
            this.moveup = false;
        }
        if(pk === "s"){
            this.movedown = false;
        }
        if(pk === "a"){
            this.moveleft = false;
        }
        if(pk === "d"){
            this.moveright = false;
        }

    }

});



var WorldMap = function(width,height) {
    WorldMap.width = width;
    WorldMap.height = height;
    WorldMap.BackgroundTileMap = new Array(width*height);
    WorldMap.MapObjects = {};
    (function populatemap(){
        for(var i = 0; i< width; i++){
            for(var j = 0; j < height; j++){
                WorldMap.BackgroundTileMap[i * height + j] = { 
                    xCoOrd: i,
                    yCoOrd: j,
                    TileId: "grass"
                };
            }
        }
    })();
}

var RenderBGmap = function(WorldMap) {
    var GridSize = 16;
    var TileSize = GridSize;
    
    //get tile that is closest to the center of the camera
    var CentTileX = Math.floor(this.camera.x/GridSize);
    var CentTileY = Math.floor(this.camera.y/GridSize);
    
    var ytileres = Math.floor(this.height/TileSize);
    var xtileres = Math.floor(this.width/TileSize);
    
    //use a couple tile buffer over the view area
    //to reduce the chance showing blank area
    var tilebuf = 2;
    
    //get tile limits
    var ystart_tile = Math.floor(CentTileY - (ytileres / 2 + tilebuf));
	var yend_tile = Math.floor(CentTileY + (ytileres / 2 + tilebuf));
	var xstart_tile= Math.floor(CentTileX - (xtileres / 2 + tilebuf));
	var xend_tile = Math.floor(CentTileX + (xtileres/ 2 + tilebuf));
    var dst = {x: 0, y: 0};
    
    for (var i = xstart_tile; i < xend_tile; i++){
        for (var j = ystart_tile; j < yend_tile; j++){
            if(i > 0 && i < WorldMap.width && j > 0 && j < WorldMap.height){
                
                var tile = WorldMap.BackgroundTileMap[i * WorldMap.height + j]
                dst.x = Math.floor((this.width / 2) + (i * GridSize) - this.camera.x);
                dst.y = Math.floor((this.height / 2) + (j * GridSize) - this.camera.y);
                this.layer.drawImage(this.images[tile.TileId],dst.x,dst.y);
            }
        }
    }
}

var RenderMapObjs = function(WorldMap) {
    //throw some houses or trees etc on it
    

}



