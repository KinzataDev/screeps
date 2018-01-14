
global.CREEP_TYPES = {
  HARVESTER: 'harvester',
  HARVESTER_STATIC: 'harvester_static',
  TRUCK: 'truck',
  UPGRADER: 'upgrader',
  BUILDER: 'builder',
};

global.SPAWN_PERCENTAGE = 1;

global.paths = {};

var roleHarvester = require('role.harvester');
var roleHarvesterStatic = require('role.harvester.static');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleTruck = require('role.truck');

var roomController = require('controller.room');

var roomSpawner = require('room.spawner');

module.exports.loop = function () {

    // for(var f in Game.flags ) {
    //   Game.flags[f].remove();
    // }


    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    var rooms = Game.rooms;

    for(var name in rooms) {

      var room = rooms[name];
      roomController.run(rooms[name]);

      var paths = global.paths;

      for( name in paths ) {
        for( iname in paths[name]) {
          paths[name][iname].forEach(function(p) {
            var look = _.filter(room.lookAt(p.x, p.y),
              (s) => s.type == LOOK_FLAGS || s.type == LOOK_STRUCTURES || s.type == LOOK_CONSTRUCTION_SITES
            );
            if( look.length == 0 ) {
              room.createFlag(p);
            }
          });
        }
      }
    }

    roomSpawner.run();

    var cpuUsed = {
      'harvester': 0,
      'harvester_static': 0,
      'truck': 0,
      'upgrader': 0,
      'builder': 0
    };

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
          var startCPU = Game.cpu.getUsed();
          roleHarvester.run(creep);
          var endCPU = Game.cpu.getUsed();
          cpuUsed['harvester'] += endCPU - startCPU;
        }
        if(creep.memory.role == 'harvester_static') {
          var startCPU = Game.cpu.getUsed();
          roleHarvesterStatic.run(creep);
          var endCPU = Game.cpu.getUsed();
          cpuUsed['harvester_static'] += endCPU - startCPU;
        }
        if(creep.memory.role == 'truck') {
          var startCPU = Game.cpu.getUsed();
          roleTruck.run(creep);
          var endCPU = Game.cpu.getUsed();
          cpuUsed['truck'] += endCPU - startCPU;
        }
        if(creep.memory.role == 'upgrader') {
          var startCPU = Game.cpu.getUsed();
          roleUpgrader.run(creep);
          var endCPU = Game.cpu.getUsed();
          cpuUsed['upgrader'] += endCPU - startCPU;
        }
        if(creep.memory.role == 'builder') {
          var startCPU = Game.cpu.getUsed();
          roleBuilder.run(creep);
          var endCPU = Game.cpu.getUsed();
          cpuUsed['builder'] += endCPU - startCPU;
        }
    }

    var cpuLeft = Game.cpu.limit - Game.cpu.getUsed();
    console.log( "Total CPU remaining: " + cpuLeft );
    if( Memory.debug ) {
      console.log( "Harvester CPU used: " + cpuUsed['harvester']);
      console.log( "Static Harvester CPU used: " + cpuUsed['harvester_static']);
      console.log( "Truck CPU used: " + cpuUsed['truck']);
      console.log( "Upgrader CPU used: " + cpuUsed['upgrader']);
      console.log( "Builder CPU used: " + cpuUsed['builder']);
    }
}
