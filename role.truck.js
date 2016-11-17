var roomController = require('controller.room');

var roleTruck = {

    /** @param {Creep} creep **/
    run: function(creep) {
      if( creep.carry.energy == creep.carryCapacity && !creep.memory.hauling) {
        creep.memory.hauling = true;
        creep.memory.pickupFromId = undefined;
      }

      if( creep.memory.hauling && creep.carry.energy == 0 ) {
        if( creep.memory.hasRefillTask ) {
          creep.memory.hasRefillTask = false;
          roomController.finishRefillTask(creep.room, creep.memory.depositAtId);
        }
        creep.memory.hauling = false;
        creep.memory.depositAtId = undefined;
      }

      if( creep.memory.hauling ) {
        // Refill task first!
        if( !creep.memory.hasRefillTask ) {
          // Deliver to extensions and spawns first
          var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                    structure.energy < structure.energyCapacity;
            }
          });
          if(targets.length > 0) {
              if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                  creep.moveTo(targets[0]);
                  return;
              }
          }
        }
        // If there are no empty extensions or spawns...
        if( creep.memory.depositAtId ) {
          var container = Game.getObjectById(creep.memory.depositAtId);
          if(creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
              creep.moveTo(container);
          }
        }
        else {
          // Check refill tasks
          var refillId = roomController.takeRefillTask(creep);
          if( refillId ) {
            creep.memory.depositAtId = refillId;
            creep.memory.hasRefillTask = true;
            return;
          }
          // Deliver to containers
          var storageContainers = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
              return (structure.structureType == STRUCTURE_CONTAINER &&
                      !creep.room.memory.pickup[structure.id] &&
                      structure.store[RESOURCE_ENERGY] < structure.storeCapacity
                     );
            }
          });
          if( storageContainers.length > 0 ) {
            var containerId = undefined;
            for ( var name in storageContainers ) {
              var container = storageContainers[name];
              if( container.store[RESOURCE_ENERGY] < (container.storeCapacity * 0.75) ) {
                containerId = container.id;
              }
            }
            if( !containerId ) {
              containerId = storageContainers[0].id;
            }
            creep.memory.depositAtId = containerId;
          }
        }
      }
      else {
        if( creep.memory.pickupFromId ) {
          var container = Game.getObjectById(creep.memory.pickupFromId);
          var withdrawCode = creep.withdraw(container, RESOURCE_ENERGY);
          if(withdrawCode == ERR_NOT_IN_RANGE) {
              creep.moveTo(container);
          }
          else if( withdrawCode == OK ) {
            creep.memory.hauling = true;
            creep.memory.pickupFromId = undefined;
          }
        }
        else {
          var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
              return (structure.structureType == STRUCTURE_CONTAINER &&
                      creep.room.memory.pickup[structure.id] &&
                      structure.store[RESOURCE_ENERGY] > 0 );
            }
          });
          if( creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(container);
            creep.memory.pickupFromId = container.id;
          }
          else {
            creep.memory.pickupFromId = undefined;
          }
        }
      }
	}
};

module.exports = roleTruck;
