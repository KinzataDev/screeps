var sourceFinder = require('source.finder');

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

      if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
            creep.say('harvesting');
	    }
	    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.upgrading = true;
          creep.memory.hasCheckedForResources = false;
	        creep.say('upgrading');
	    }

	    if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
      }
      else {
        if( !creep.memory.hasCheckedForResources ) {
          var containers = creep.pos.findInRange(FIND_STRUCTURES, 7, {
            filter: (structure) => {
              return (structure.structureType == STRUCTURE_CONTAINER &&
                      structure.store[RESOURCE_ENERGY] > 0 );
            }
          });
          if( containers.length > 0 ){
            if( creep.withdraw(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
              creep.moveTo(containers[0]);
            }
          }
          else {
            creep.memory.hasCheckedForResources = true;
          }
        }
        else {
          var source = sourceFinder.findClosestValidSource(creep, 10);
          if( !source ) {
            //sourceFinder.findInAdjacentRooms(creep);
          }
          //var sources = creep.room.find(FIND_SOURCES);
          if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
              creep.moveTo(source);
          }
        }
      }
	}
};

module.exports = roleUpgrader;
