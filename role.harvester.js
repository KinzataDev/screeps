var sourceFinder = require('source.finder');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
      if(creep.carry.energy == 0 && creep.memory.upgrading ) {
          creep.memory.upgrading = false;
      }

	    if(creep.carry.energy < creep.carryCapacity && !creep.memory.upgrading ) {
	        if( creep.memory.sourceTargetId == undefined) {
	            var sourceList = creep.room.find(FIND_SOURCES);
	            sourceFinder.run(creep, sourceList);
	        }
	        var source = Game.getObjectById(creep.memory.sourceTargetId);
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
        else {
            creep.memory.sourceTargetId = undefined;
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.energy < structure.energyCapacity;
                    }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            }
            else {
                creep.memory.upgrading = true;
            }

            if( creep.memory.upgrading ) {
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            }
        }
	}
};

module.exports = roleHarvester;
