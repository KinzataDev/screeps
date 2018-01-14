var HARVESTER_PARTS = [WORK,CARRY,MOVE,MOVE]
var HARVESTER_STATIC_PARTS = [WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE];
var UPGRADER_PARTS = [WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE];
var BUILDER_PARTS = [WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE];
var TRUCK_PARTS = [CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE];


var partMap = {
  [global.CREEP_TYPES.HARVESTER]: [WORK, CARRY, MOVE, MOVE],
  [global.CREEP_TYPES.HARVESTER_STATIC]: [WORK],
  [global.CREEP_TYPES.TRUCK]: [CARRY,MOVE],
  [global.CREEP_TYPES.UPGRADER]: [WORK,MOVE],
  [global.CREEP_TYPES.BUILDER]: [WORK,CARRY,MOVE],
};

var spawner = {
  spawn: function(spawn, creepType) {

    var maxEnergy = this.getSpendAmount(spawn.room);
    var partEnergy = 0;
    var parts = [];

    // testing override
    //creepType = global.CREEP_TYPES.HARVESTER_STATIC;
    console.log();
    console.log("Attempting to spawn creep: " + creepType);
    console.log("Using an energy value of " + maxEnergy);

    var attempts = 0;
    while( partEnergy < maxEnergy &&
         ( this.getSumParts( partMap[creepType] ) <= maxEnergy - partEnergy) &&
         ++attempts < 10
    ) {
         if( creepType == global.CREEP_TYPES.HARVESTER_STATIC ) {
           if( attempts == 1 ) { parts = parts.concat( [MOVE, CARRY] ) };
         }
         if( creepType == global.CREEP_TYPES.UPGRADER ) {
           if( attempts == 1 ) { parts = parts.concat( [MOVE, CARRY] ) };
         }
         if( creepType == global.CREEP_TYPES.BUILDER ) {
           if( attempts == 1 ) { parts = parts.concat( [MOVE] ) };
         }

         parts = parts.concat( partMap[creepType] );

         partEnergy = this.getSumParts( parts );
    }

    console.log(parts);

    console.log( "Spawning a " + creepType + " at " + spawn.name + " for a cost of " + partEnergy);
    console.log();
    return this.spawnCreep(spawn, parts, creepType);
  },

  getSumParts: function( parts ) {
    var sumParts = 0;
    if( !parts ) {
      return;
    }
    parts.forEach( function(part) {
      sumParts += BODYPART_COST[part];
    });
    return sumParts;
  },

  spawnCreep: function(spawn, parts, creepType) {
      var retVal = -1;
      if( (retVal = spawn.canCreateCreep( parts, undefined) ) == OK ) {
          spawn.createCreep(parts, undefined, {'role':creepType });
      } else {
          var response = spawn.canCreateCreep( parts, undefined );
          console.log("Error spawning creep, error code: " + response);
      }
      return retVal;
  },

  getSpendAmount: function(room) {
    var rcl = room.controller.rcl;
    var floor = 300;
    var maxEnergy = room.energyAvailable;

    switch( rcl ) {
      case 1:
        floor = 300;
      case 2:
        floor = 400;
        break;
      case 3:
      case 4:
        floor = 600;
        break;
      case 5:
      case 6:
      case 7:
      case 8:
        floor = 800;
        break;
      default:
        floor = 300;
    }

    var spendAmount = Math.max(floor, (maxEnergy * global.SPAWN_PERCENTAGE))

    return spendAmount;
  }
};

module.exports = spawner;
