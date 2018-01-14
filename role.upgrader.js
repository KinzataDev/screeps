var sourceFinder = require('source.finder');
var util = require('Util.core');

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

      if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
            creep.memory.comingFrom = creep.room.controller.id;
            creep.say('harvesting');
	    }
	    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.upgrading = true;
          creep.memory.hasCheckedForResources = false;
	        creep.say('upgrading');

          // Find controller
          creep.memory.movingTo = creep.room.controller.id;
	    }

	    if(creep.memory.upgrading) {
        var controller = Game.getObjectById(creep.memory.movingTo);
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {

          if( !creep.memory.movingTo ) {
            creep.memory.movingTo = creep.room.controller.id;
          }

          util.moveCreep(creep);
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
          var harvestResult = creep.harvest(source);
          creep.memory.movingTo = harvestResult.id;
          if( harvestResult == ERR_NOT_IN_RANGE) {
              creep.moveTo(source);
          } else if( harvestResult == OK ) {
            creep.memory.comingFrom = source.id;
          }
        }
      }
	}
};

module.exports = roleUpgrader;
