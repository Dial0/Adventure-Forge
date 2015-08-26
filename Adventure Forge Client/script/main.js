var app = new PLAYGROUND.Application({
    
    scale: 1,
    
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
        this.loadImage("podchair");
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
        RenderBGmap.call(this,WorldMap);
        RenderMapObjs.call(this,WorldMap);
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
    WorldMap.MapObjects = new Array();
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
    
    var newobj = { x: 200, y: 200, height: 32, width: 32, id: "podchair"}
    WorldMap.MapObjects.push(newobj);
    newobj = { x: 200, y: 300, height: 32, width: 32, id: "podchair"}
    WorldMap.MapObjects.push(newobj);
    newobj = { x: 200, y: 400, height: 32, width: 32, id: "podchair"}
    WorldMap.MapObjects.push(newobj);
    newobj = { x: 200, y: 321, height: 32, width: 32, id: "podchair"}
    WorldMap.MapObjects.push(newobj);
    newobj = { x: 200, y: 311, height: 32, width: 32, id: "podchair"}
    WorldMap.MapObjects.push(newobj);
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
    //throw some houses or trees or critters or what-nots on it
    //get objects the are inside the camera bounding view
    var viewbounds = { x: this.camera.x - (this.width/2) , y: this.camera.y - (this.height/2), width: this.width, height: this.height}
    var RenderObj = WorldMap.MapObjects.filter(CheckInBounds.bind(this,viewbounds));
    //order them so they overlap and look sweet (things lower on the screen overlap things higher)
    var SortedRenObj = RenderObj.sort(RenderOrder);
    
    
    //calculate their relative location from the abosolute location and the camera location
    //draw it up
    var dst = {x: 0, y: 0};
    for (var RenObj of SortedRenObj) {
        dst.x = (this.width / 2) + (RenObj.x - this.camera.x)
        dst.y = (this.height / 2) + (RenObj.y - this.camera.y)
        this.layer.drawImage(this.images[RenObj.id],dst.x,dst.y);
    }
    
}


var CheckInBounds = function(Obj1,Obj2)
{
    //from 2 objects to points
    var A1 = {x: Obj1.x, y: Obj1.y};
    var A2 = {x: Obj1.x + Obj1.width, y: Obj1.y+Obj1.height};
    var B1 = {x: Obj2.x, y: Obj2.y};
    var B2 = {x: Obj2.x + Obj2.width, y: Obj2.y + Obj2.height};
	if((A1.x <= B2.x && A1.y <= B2.y) || (A2.x >= B1.x && A2.y >= B1.y) || (A1.x <= B2.x && A2.y >= B1.y) || (A2.x >= B1.x && A1.y <= B2.y) )
	{
		return true;
	}
	else
	{
		return false;
	}
}


function RenderOrder(a, b) {
  if (a.y+a.height < b.y+b.height) {
    return -1;
  }
  if (a.y+a.height > b.y+b.height) {
    return 1;
  }
  // a must be equal to b
  return 0;
}