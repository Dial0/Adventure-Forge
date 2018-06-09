var GridSize = 16;
var TileSize = GridSize;
var RenderWindowScale = 1;

var app = new PLAYGROUND.Application({
    
    scale: 0.5,
    
    player: {
        position: {
            x: 0,y: 0
        }
    },
    
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
        this.loadImage("tiles");
        this.loadImage("Players");
        this.loadImage("tree");
        this.chair = this.createmysprite("podchair");
        WorldMap();
        this.vectorArr = new Array();
        this.activeTile ="grass";
        
        //var newobj = { x: 250, y: 250, height: 32, width: 32, Spriteid: "podchair"};
        


        
        //this.socket.on('disconnect', function(){});
        
        this.ServerSocket = io('http://localhost:3000');
        this.ServerSocket.on('connect', function(){
            
            this.send({Type:'GETMAP'});
        
        });
        this.ServerSocket.on('message', NetworkHandler);
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
        
        //update player sprite
        processVectors.call(this,this.vectorArr,dt);
        
    },
    
    render: function (dt){
        
        var rendchair = this.chair;
        this.layer.clear("#000000");
        RenderBGmap.call(this,WorldMap.BackgroundTileMap);
        RenderMapObjs.call(this,WorldMap);
        //RenderMenu.call(this,"");
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
        mapclick.call(this,data.x,data.y);
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
            if(RenderWindowScale < 4.0){
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



var WorldMap = function() {
    WorldMap.MapObjects = {};
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
    
    var CameraScaledx = Math.floor(this.camera.x * RenderWindowScale);
    var CameraScaledy = Math.floor(this.camera.y * RenderWindowScale);
    
    //resolve tile_id to texture coords
    //tiles are indexed from left to right, going from top to bottom
    //e.g.
    //0, 1 , 2
    //3, 4 , 5

    
    
    for (var i = xstart_tile; i < xend_tile; i++){
        for (var j = ystart_tile; j < yend_tile; j++){
            if(i > 0 && i < WorldMap.sizeX && j > 0 && j < WorldMap.sizeY){
                var tile = WorldMap.MapData[j * WorldMap.sizeX + i]
                
                var imagetilesx = 32;
                var imagetilesy = 24;
                var imagexcoord = ((Math.floor(tile % imagetilesx)) - 1)*16;
                var imageycoord = (Math.floor(tile / imagetilesx))*16;
                
                
                dst.x = Math.floor((this.width / 2)) + ((i * RenTileSize) - CameraScaledx);
                dst.y = Math.floor((this.height / 2)) +  ((j * RenTileSize) - CameraScaledy);
                this.layer.drawImage(this.images["tiles"],imagexcoord,imageycoord,16,16,dst.x,dst.y,RenTileSize,RenTileSize);
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
    
    var RenderObj = new Array();
    for(var obj in WorldMap.MapObjects){
        if(CheckInBounds(WorldMap.MapObjects[obj],viewbounds)){
            RenderObj.push(WorldMap.MapObjects[obj]);
        }
    }
    
    //var RenderObj = WorldMap.MapObjects.filter(CheckInBounds.bind(this,viewbounds));
//    var RenderObjId = Object.keys(WorldMap.MapObjects).filter(CheckInBounds.bind(this,viewbounds));
//    
//    var RenderObj = new Array();
//    
//    for (var ObjId of RenderObjId) {
//        RenderObj.push(WorldMap.MapObjects[ObjId]);
//    }
    
    
    //order them so they overlap and look sweet (things lower on the screen overlap things higher)
    var SortedRenObj = RenderObj.sort(RenderOrder);
    
    var RenTileSize = Math.floor(GridSize * RenderWindowScale);
    var ObjRenderScale = (RenTileSize/GridSize);

    //calculate their relative location from the abosolute location and the camera location
    //draw it up
    var dst = {x: 0, y: 0};
    for (var RenObj of SortedRenObj) {
        if(RenObj.Spriteid === 770){
            RenObj.Spriteid = "tree";
        }

        
        if(RenObj.Spriteid === "player"){
            //player and clothing from spritesheet etc.
            //var imageHeightOffset = (16 - RenObj.height) * RenderWindowScale;
            var scaledheight = 16 * ObjRenderScale;
            var scaledwidth = 16 * ObjRenderScale;
            
            dst.x = (this.width / 2) + (RenObj.x * ObjRenderScale) - (this.camera.x * RenderWindowScale);
            dst.y = (this.height / 2) + (RenObj.y * ObjRenderScale) - (this.camera.y * RenderWindowScale);// - imageHeightOffset; //- imageHeightOffset 
            
            this.layer.drawImage(this.images["Players"],0,0,16,16,dst.x,dst.y,scaledwidth,scaledheight);
            
        }
        else{
            //calculate offset to drop the image down so that the bounding box defined in RenObj is at the bottom of the image
            var imagexscale = RenObj.width / this.images[RenObj.Spriteid].width;
            var imageyscale = RenObj.height / this.images[RenObj.Spriteid].height;
            var scaledheight = this.images[RenObj.Spriteid].height * ObjRenderScale;
            var scaledwidth = this.images[RenObj.Spriteid].width * ObjRenderScale;
            scaledheight *= imageyscale;
            scaledwidth *= imagexscale;
            dst.x = (this.width / 2) + (RenObj.x * ObjRenderScale) - (this.camera.x * RenderWindowScale);
            dst.y = (this.height / 2) + (RenObj.y * ObjRenderScale) - (this.camera.y * RenderWindowScale);// - imageHeightOffset; 
            
            this.layer.drawImage(this.images[RenObj.Spriteid],dst.x,dst.y,scaledwidth,scaledheight);
        }
        
        
    }
    
}

var renderPLayer = function(PlayerObj){
    this.layer.drawImage(this.images["Players"],0,0,16,16,dst.x,dst.y,16*RenderWindowScale,16*RenderWindowScale);
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
    var MapX = (mouseX + (this.camera.x* RenderWindowScale) - (this.width / 2))/(RenTileSize/GridSize) -8;
    var MapY = (mouseY + (this.camera.y* RenderWindowScale) - (this.height / 2))/(RenTileSize/GridSize) - 16;
    
    var MapX2 = (mouseX + (this.camera.x* RenderWindowScale) - (this.width / 2));
    var MapY2 = (mouseY + (this.camera.y* RenderWindowScale) - (this.height / 2));
    
    
    var MovePacket = {
        Type: 'MOVECLICK',
        Data: {
            mapX: MapX,
            mapY: MapY,
        }
    };
    
    
    this.ServerSocket.send(MovePacket);
    //WorldMap.BackgroundTileMap[TileX * WorldMap.height + TileY].TileId = this.activeTile;
}

var CheckInBounds = function(Obj1,Obj2){
    //var Obj2 = WorldMap.MapObjects[Obj2name];
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


var NetworkHandler = function(message){
    if(message.Type === 'BGMAP'){
        WorldMap.BackgroundTileMap = extractBGMAP(message.Data);
    }
    else if(message.Type === 'MOVEOBJ'){
        WorldMap.MapObjects["player"].x = message.Data.x;
        WorldMap.MapObjects["player"].y = message.Data.y;
    }
    else if(message.Type === 'OBJVECTOR'){
        for(var vector of app.vectorArr){
            if(vector.OBJID === message.Data.OBJID){
                vector.startX = message.Data.startX;
                vector.startY = message.Data.startY;
                vector.endX = message.Data.endX;
                vector.endY = message.Data.endY;
                vector.speed = message.Data.speed;
            }
        }
        
        app.vectorArr.push(message.Data);
    }
    else if(message.Type === 'NEWOBJ'){
        WorldMap.MapObjects[message.Data.objid] = message.Data;
    }
    else if(message.Type === 'OBJMAP'){
        WorldMap.MapObjects = message.Data;
        WorldMap.MapObjects["podchair"] = { x: 1500, y: 1580, height: 32, width: 32, Spriteid: "podchair"};
    }
}



var extractBGMAP = function(rawMAP){
    var decodedMap = window.atob(rawMAP.map);
    
    var uintMAP = new Uint8Array(decodedMap.length);
    for(var i=0,j=decodedMap.length;i<j;++i){
        uintMAP[i]=decodedMap.charCodeAt(i);
    }
    
    var inflate = new Zlib.Inflate(uintMAP);
    var BinaryTileMap = inflate.decompress();
    var arraybuf = Array.from(BinaryTileMap);
    var TileMapArr = new Int32Array(BinaryTileMap.buffer,0,arraybuf.length/4);
    var FullMapRaw = {
        sizeX:rawMAP.mapsizex,
        sizeY:rawMAP.mapsizey,
        MapData: TileMapArr
    }
    return FullMapRaw;
}


var processVectors = function(Vectors, dt){
    
    for(var vector of Vectors)
    {
        //increment vector
        var distx = vector.endX-vector.startX;
        var disty = vector.endY-vector.startY;
        
        var displacement = dt*vector.speed;
        
        var vectorAngle = Math.atan2(distx,disty);
        
        var moveX = displacement* Math.sin(vectorAngle);
        var moveY = displacement* Math.cos(vectorAngle);
        
        
        var posX;
        var newPosX = moveX + vector.startX;
        //check if the new position is inside a bounding box, if it is lock movement to the correct edge of the bounding box
        if(Math.abs(moveX) > Math.abs(distx)){
            posX = vector.endX;
        }
        else {
            posX = newPosX;
        }
        
        var posY;
        if(Math.abs(moveY) > Math.abs(disty)){
            posY = vector.endY;
        }
        else
        {
            posY = moveY + vector.startY;
        }
        

        //set obj position
        WorldMap.MapObjects[vector.OBJID].x = posX;
        WorldMap.MapObjects[vector.OBJID].y = posY;
        
        //set vector start to obj postion
        vector.startX = posX;
        vector.startY = posY;
        
        //check if vector has ended
        if(posX === vector.endX && posY === vector.endY){
            //remove vector from vector list
        }
        
    }
    
}

var getsideofBB = function(Coord, Bbox){
    
    if(Coord.Axis = X){
        if(Coord.X < Bbox.X){
            //Left side of Bbox
        }
        else{
            //right side of Bbox
        }
    }
    else {
        if(Coord.Y < Bbox.Y){
            //Above Bbox
        }
        else {
            //Below Bbox
        }
    }
}


var checkVectorBounds = function(Obj1,Obj2){
    
    //check if there is a bounding box colision
    //  -get the destination (startvector + movement)
    //  -check if the destination is within a bounding box
    //      -if it is then check what side the player was on then limit the movement to the coresponding bounding box edge, along that axis of movement
    
    var vectorDest = vectorStart + movement;
    var colBB = null;
    for(var obj in WorldMap.BoundingBoxes){
        if(CheckInBounds(WorldMap.BoundingBoxes[obj],vectorDest)){
            colBB = WorldMap.BoundingBoxes[obj];
            break;
        }
    }
    
    if(colBB != null){
        if( movement > 0){ //moving to the east or south
            if(Axis = 'X'){
                //West Side of BBox
                //Dest = BBox.X
            }
            else{
                //North Side of BBox
                //Dest = BBox.Y
            }
        }
        else{ // moving west or north
            if(Axis = 'X'){
                //East Side of BBox
                //Dest = BBox.X + BBox.Width
            }
            else{
                //South Side of BBox
                //Dest = BBox.Y + BBox.Width
            }
            
        }
        //get the side the player is on
    }
    
}