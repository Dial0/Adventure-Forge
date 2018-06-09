//Load Map
var Maploader = require('fs');
var Map = JSON.parse(Maploader.readFileSync('./map.json', 'utf-8'));

var zlib = require('zlib');
var TileMapArray = {};
var Tilemap = Map.layers[0].data;
var Datamap = Map.layers[1].objects;
var TilemapBIN = new Buffer(Tilemap, "base64");
var tilemapraw;
var lastTick = Date.now();
var MapObj = {};
var vectorArr = new Array();

var addmapobjs = function(mapobjs){
    var objindex = 0;
    for(var obj of mapobjs) {
        if( obj.name === "") {
            var name = "tree" + objindex;

            MapObj[name] = {
                x: obj.x, y: obj.y - obj.height,
                height: obj.height, width: obj.width,
                Spriteid: obj.gid
            }
            objindex++;

        }
        else {
            
        }
    }
}

addmapobjs(Datamap);

zlib.inflate(TilemapBIN, function(err, data) {
    if (!err) {
        console.log('Extracted '+data.length);
    }
    
    for (var index = 0; index < (data.length)/4; index++) {
        TileMapArray[index] = data.readInt32LE(index*4);
    }
    
    Maploader.writeFileSync('./maptest.txt',JSON.stringify(TileMapArray));
});



var server = require('http').createServer();
var io = require('socket.io')(server);
io.on('connection', function(socket){
    console.log('User Connected');
    
    var PLAYERID = socket.id;
    
    var NewPacket = {
            Type: 'NEWOBJ',
            Data: {
                objid: PLAYERID,
                x: 1000, y: 1000,
                height: 32, width: 32,
                Spriteid: "player"
            }
        }
    io.sockets.send(NewPacket);    
    MapObj[PLAYERID] = {
        x: 1000, y: 1000,
        height: 32, width: 32,
        Spriteid: "player"
    }
    
    socket.on('disconnect', function(){
        console.log('User Disconnected');
    });
    
    socket.on('message', messageHandler)
  
});
server.listen(3000);

setInterval(function(){
    
    //process movement vectors
    var delta = Date.now() - lastTick;

    lastTick = Date.now();

    if (delta > 1000) return;

    var dt = delta / 1000;
    
    processVectors(vectorArr,dt);
    
    
}, 1000/60);



var messageHandler = function(message){
    //console.log(this.client.id + ': '+ message);
    if(message.Type === 'MOVECLICK') {
        
        var PlayerID = this.id;
        
        var VectorPacket = {
            Type: 'OBJVECTOR',
            Data: {
                OBJID: PlayerID,
                startX: MapObj[PlayerID].x, startY: MapObj[PlayerID].y,
                endX: message.Data.mapX, endY: message.Data.mapY,
                speed: 100
            }
        }
        
        for(var vector of vectorArr){
            if(vector.OBJID === VectorPacket.Data.OBJID){
                vector.startX = VectorPacket.Data.startX;
                vector.startY = VectorPacket.Data.startY;
                vector.endX = VectorPacket.Data.endX;
                vector.endY = VectorPacket.Data.endY;
                vector.speed = VectorPacket.Data.speed;
            }
        }
        
        vectorArr.push(VectorPacket.Data);
        this.server.sockets.send(VectorPacket);
        //this.send(VectorPacket);
        //add vector server side
    }
    //if else ladder to interpret messages
    if(message.Type === 'GETMAP') {
        
        var BGMAPPacket = {
            Type: 'BGMAP',
            Data: {
                mapsizex: Map.layers[0].width,
                mapsizey: Map.layers[0].height,
                map: Map.layers[0].data
            }
        }
        
        this.send(BGMAPPacket);

        var OBJMAPPacket = {
            Type: 'OBJMAP',
            Data: MapObj
        }
        console.log(OBJMAPPacket);
        this.send(OBJMAPPacket);
        //send objlist here
        
    }
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
        if(Math.abs(moveX) > Math.abs(distx)){
            posX = vector.endX;
        }
        else {
            posX = moveX + vector.startX;
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
        MapObj[vector.OBJID].x = posX;
        MapObj[vector.OBJID].y = posY;
        
        //set vector start to obj postion
        vector.startX = posX;
        vector.startY = posY;
        
        //check if vector has ended
        if(posX === vector.endX && posY === vector.endY){
            //remove vector from vector list
        }
        
    }
    
}