var util = require('Util.core');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

       if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.memory.voiceState = 1;
        }
        if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
            creep.say('Thanks!');
        }

        if(creep.memory.building) {
            if( creep.memory.buildingId ) {
              var target = Game.getObjectById(creep.memory.buildingId);
              if( target && target.progress ){
                if(creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
              }
              else {
                creep.memory.buildingId = undefined;
              }
            }
            else {
              var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
              if(targets.length) {
                  creep.memory.buildingId = targets[0].id;
                  if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                      creep.moveTo(targets[0]);
                  }
              }
              // Repair
              else {
                if( creep.memory.repairingId ) {
                  var target = Game.getObjectById(creep.memory.repairingId);
                  if( !target ) {
                    creep.memory.repairingId = undefined;
                    return;
                  }
                  if( target.hits < target.hitsMax ) {
                    if( target.structureType == STRUCTURE_WALL && target.hits > Memory.maxWallHits ) {
                      creep.memory.repairingId = undefined;
                    }
                    if ( creep.repair( target ) == ERR_NOT_IN_RANGE ) {
                      creep.moveTo(target);
                    }
                  }
                  else {
                    creep.memory.repairingId = undefined;
                  }
                }
                else {
                  targets = creep.room.find(FIND_STRUCTURES);
                  for( name in targets ) {
                    if( targets[name].hits < targets[name].hitsMax ) {
                      if( targets[name].structureType == STRUCTURE_WALL && targets[name].hits > Memory.maxWallHits ) {
                        continue;
                      }
                      if ( creep.repair( targets[name] ) == ERR_NOT_IN_RANGE ) {
                        creep.moveTo(targets[name]);
                        creep.memory.repairingId = targets[name].id;
                      }
                    }
                  }
                }
              }
            }
        }
        else {
          if( creep.memory.voiceState == 1 ) {
            creep.say('All out.');
            creep.memory.voiceState = 0;
          }
          else if (creep.memory.voiceState == 2) {
            creep.memory.voiceState = 0;
          }

          var container = creep.pos.findClosestByRange(FIND_STRUCTURES,
            {
            filter: (structure) => {
              return (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0 );
            }
          });

          var toHarvest = container;
          var resource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);

          if( resource ) {
            toHarvest = creep.pos.findClosestByRange([container,resource]);
          }

          if( !toHarvest ) { return; }

          if( toHarvest.structureType ) {
            if( creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
              creep.moveTo(container);
            }
          }
          else {
            if( creep.pickup(resource) == ERR_NOT_IN_RANGE) {
             creep.moveTo(resource);
            }
          }

        }
	}
};

module.exports = roleBuilder;
