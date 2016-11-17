var sourceFinder = require('source.finder');

var roleHarvesterStatic = {

    /** @param {Creep} creep **/
    run: function(creep) {

      var source;
      // Should creep be harvesting?
      if( this.shouldHarvest( creep ) ) {
        // Find new source if needed
        if( !creep.memory.harvestFromSourceId ) {
            // Find an open source
            source = sourceFinder.findSourceNeedsHarvester(creep.room);
            creep.memory.harvestFromSourceId = source.id;
        }
        else {
          source = Game.getObjectById( creep.memory.harvestFromSourceId );
        }

        // Harvest
        if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }
      }

      if( this.shouldDeposit( creep ) ) {
        // Find container close by
        var containers = creep.pos.findInRange(FIND_STRUCTURES, 3, {
          filter: (structure) => {
            return structure.structureType == STRUCTURE_CONTAINER;
          }
        });

        // Drop source in case something is out of range
        if(!containers[0]) {
          creep.drop(RESOURCE_ENERGY);
          creep.say('Opps');
          return;
        }

        // We found a container, let's mark is as a truck pickup
        if( creep.room.memory.pickup ){
          creep.room.memory.pickup[containers[0].id] = true;
        }
        else {
          creep.room.memory.pickup = {};
        }

        // Transfer to it
        if( creep.pos.x != containers[0].pos.x && creep.pos.y && containers[0].pos.y ) {
          creep.moveTo(containers[0]);
        }
        else {
          creep.drop(RESOURCE_ENERGY);
          creep.say("Fill'er up");
        }
      }
    },

    shouldHarvest: function(creep) {
      if( creep.carry.energy < creep.carryCapacity ) {
        return true;
      }
      else {
        return false;
      }
    },

    shouldDeposit: function(creep) {
      if( creep.carry.energy == creep.carryCapacity ) {
        return true;
      }
      else {
        return false;
      }
    }
};

module.exports = roleHarvesterStatic;
