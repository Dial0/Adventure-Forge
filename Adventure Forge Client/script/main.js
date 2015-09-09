var GridSize = 64;
var TileSize = GridSize;
var RenderWindowScale = 1;

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
        
        this.MenuHitBoxes = {};
        this.camera = { x: 200, y: 500 };
        this.loadImage("grass");
        this.loadImage("stone");
        this.loadImage("sandstone");
        this.loadImage("sand");
        this.loadImage("podchair");
        this.chair = this.createmysprite("podchair");
        WorldMap(150,150);
        this.activeTile ="grass";
    },
    
    step: function(dt){
       
        var speed = 1000;
        
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
        RenderBGmap.call(this,WorldMap);
        RenderMapObjs.call(this,WorldMap);
        RenderMenu.call(this,"");
        this.layer.font("32px Arial");      
        this.layer.fillStyle("#fff");
        this.layer.fillText(this.text, 316, 32);
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
        if(data.x < 300)
        {
            menuClick.call(this,data.x,data.y);
        }
        else
        {
            mapclick.call(this,data.x,data.y);
        }
    },

    mouseup: function(data) {
        this.text = "mouse up " + data.button + " " + data.x +  " , " + data.y;
        this.clicking = false;
    },
    
    mousewheel: function(event) {
        event.x         /* mouseX */
        event.y         /* mouseY */
        event.delta     /* -1 or 1 */
        
        if(event.delta === -1){
            if(RenderWindowScale > 0.3){
                RenderWindowScale -= 0.1;
            }
        }
        if(event.delta ===1){
            if(RenderWindowScale < 1.0){
                RenderWindowScale += 0.1;
            }
            //GridSize = Math.floor(GridSize *= 1.1);
            //TileSize = GridSize;
        }
        this.handleResize();
        event.original  /* original DOM event */
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

    var RenTileSize = Math.floor(GridSize * RenderWindowScale);
    
    //get tile that is closest to the center of the camera
    var CentTileX = Math.floor(this.camera.x/GridSize);
    var CentTileY = Math.floor(this.camera.y/GridSize);
    
    var ytileres = Math.floor(this.height/RenTileSize);
    var xtileres = Math.floor(this.width/RenTileSize);
    
    //use a couple tile buffer over the view area
    //to reduce the chance showing blank area
    var tilebuf = 2;
    
    //get tile limits
    var ystart_tile = Math.floor(CentTileY - (ytileres / 2 + tilebuf));
	var yend_tile = Math.floor(CentTileY + (ytileres / 2 + tilebuf));
	var xstart_tile= Math.floor(CentTileX - (xtileres / 2 + tilebuf));
	var xend_tile = Math.floor(CentTileX + (xtileres/ 2 + tilebuf));
    var dst = {x: 0, y: 0};
    
    var CameraScaledx = this.camera.x * RenderWindowScale;
    var CameraScaledy = this.camera.y * RenderWindowScale;
    
    for (var i = xstart_tile; i < xend_tile; i++){
        for (var j = ystart_tile; j < yend_tile; j++){
            if(i > 0 && i < WorldMap.width && j > 0 && j < WorldMap.height){
                var tile = WorldMap.BackgroundTileMap[i * WorldMap.height + j]
                dst.x = (this.width / 2) + ((i * RenTileSize) - CameraScaledx);
                dst.y = (this.height / 2) +  ((j * RenTileSize) - CameraScaledy);
                this.layer.drawImage(this.images[tile.TileId],dst.x,dst.y,RenTileSize,RenTileSize);
            }
        }
    }
}

var RenderMapObjs = function(WorldMap) {
    //throw some houses or trees or critters or what-nots on it
    //get objects the are inside the camera bounding view
    var viewbounds = {
        x: this.camera.x - (this.width/2) / RenderWindowScale, 
        y: this.camera.y - (this.height/2) / RenderWindowScale, 
        width: this.width / RenderWindowScale, 
        height: this.height / RenderWindowScale
    }
    var RenderObj = WorldMap.MapObjects.filter(CheckInBounds.bind(this,viewbounds));
    //order them so they overlap and look sweet (things lower on the screen overlap things higher)
    var SortedRenObj = RenderObj.sort(RenderOrder);
    
    var RenTileSize = Math.floor(GridSize * RenderWindowScale);

    //calculate their relative location from the abosolute location and the camera location
    //draw it up
    var dst = {x: 0, y: 0};
    for (var RenObj of SortedRenObj) {
        //calculate offset to drop the image down so that the bounding box defined in RenObj is at the bottom of the image
        var imageHeightOffset = (this.images[RenObj.id].height - RenObj.height) * RenderWindowScale;
        
        var scaledheight = this.images[RenObj.id].height * RenderWindowScale;
        var scaledwidth = this.images[RenObj.id].width * RenderWindowScale;
        
        dst.x = (this.width / 2) + (RenObj.x - this.camera.x ) * RenderWindowScale;
        dst.y = (this.height / 2) + (RenObj.y - this.camera.y) * RenderWindowScale - imageHeightOffset; //- imageHeightOffset 
        this.layer.drawImage(this.images[RenObj.id],dst.x,dst.y,scaledwidth,scaledheight);
    }
    
}

var menuClick = function(MouseX,MouseY){
    var MouseCoOrd = {x: MouseX, y: MouseY, height: 1, width: 1};
    this.MenuHitBoxes = new Array();
    var xloc = 0;
    var yloc = 0;
    for (var tile in this.images) {
        
        var abslocX = 4 + xloc*69;
        var abslocY = 45 + yloc*69;
        
        var menuBox = { tile: tile, x: abslocX, y:abslocY, height: this.images[tile].height, width: this.images[tile].width};
        
        this.MenuHitBoxes.push(menuBox);
        
        if(xloc < 3){
            xloc++;
        }
        else{
            yloc++;
            xloc=0;
        }
        
    }
    var HitObject = this.MenuHitBoxes.filter(CheckInBounds.bind(this,MouseCoOrd));
    //check if the mouse is in any hitboxes
    this.activeTile = HitObject[0].tile;
    
}

var RenderMenu = function(ActiveTab){
    this.layer.fillStyle("#D0D3DF");
    this.layer.fillRect(0, 0, 300, this.height);
    this.layer.fillStyle("#A9AEC5");
    this.layer.fillRect(0, 0, 300, 32);
    this.layer.fillStyle("#424762");
    this.layer.font("20px Calibre"); 
    this.layer.fillText("Tiles", 4, 24);
    this.layer.fillText("Objects", 85, 24);
    this.layer.fillText("Special", 200, 24);
    var xloc = 0;
    var yloc = 0;
    for (var tile in this.images) {
        
        var abslocX = 4 + xloc*69;
        var abslocY = 45 + yloc*69;
        if(tile == this.activeTile)
        {
            this.layer.fillStyle("#3E859F");
            this.layer.fillRect(abslocX-4, abslocY-4, 72, 72);
        }
        this.layer.drawImage(this.images[tile],abslocX,abslocY);
        
        if(xloc < 3){
            xloc++;
        }
        else{
            yloc++;
            xloc=0;
        }
    }
    
}

var mapclick = function(mouseX, mouseY)
{
    var RenTileSize = Math.floor(GridSize * RenderWindowScale);
    var TileX = Math.floor((mouseX + (this.camera.x* RenderWindowScale) - (this.width / 2))/RenTileSize);
    var TileY = Math.floor((mouseY + (this.camera.y* RenderWindowScale) - (this.height / 2))/RenTileSize);
    WorldMap.BackgroundTileMap[TileX * WorldMap.height + TileY].TileId = this.activeTile;
}

var CheckInBounds = function(Obj1,Obj2)
{
    //from 2 objects to points
    var A1 = {x: Obj1.x, y: Obj1.y};
    var A2 = {x: Obj1.x + Obj1.width, y: Obj1.y+Obj1.height};
    var B1 = {x: Obj2.x, y: Obj2.y};
    var B2 = {x: Obj2.x + Obj2.width, y: Obj2.y + Obj2.height};
    
    var check1 = (A1.x <= B2.x && A1.y <= B2.y);
    var check2 = (A2.x >= B1.x && A2.y >= B1.y);
    var check3 = (A1.x <= B2.x && A2.y >= B1.y);
    var check4 = (A2.x >= B1.x && A1.y <= B2.y);
    
	if( (check1 && check2) || (check3 && check4) )
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