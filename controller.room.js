var roomController = {

    /** @param {Room} room **/
    run: function(room) {
      // Build a queue of tasks to take
      if( !room.memory.refillQueue ) {
        room.memory.refillQueue = {};
      }

      this.controlTowers(room);

      // Verify owners of tasks still exist
      var takenTasks = _.filter(room.memory.refillQueue, (item) => {
        return item.taken == true
      });
      for( var id in takenTasks ) {
        var ownerId = takenTasks[id].ownerId;
        var owner = Game.getObjectById(ownerId);
        if( !owner ) {
          takenTasks[id].taken = false;
        }
      }

      // Find turrets that need refiling
      var towers = room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType == STRUCTURE_TOWER &&
                  structure.energy < structure.energyCapacity &&
                  !room.memory.refillQueue[structure.id]
          );
        }
      });
      if( towers ) {
        for( var name in towers ) {
          room.memory.refillQueue[towers[name].id] = { id: towers[name].id, taken: false };
        }
      }
	  },

    controlTowers: function(room) {
      // Get towers
      var towers = room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
          return structure.structureType == STRUCTURE_TOWER;
        }
      });

      for( var id in towers ) {
        var tower = towers[id];
        var damagedBuilding = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
              return (structure.hits < structure.hitsMax && structure.structureType != STRUCTURE_WALL );
            }
        });
        if( damagedBuilding ) {
          tower.repair(damagedBuilding);
        }

        var hostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if( hostile ) {
          tower.attack(hostile);
        }
      }
    },

    finishRefillTask: function(room, id) {
      if( room.memory.refillQueue[id] ) {
        room.memory.refillQueue[id] = undefined;
      }
    },

    takeRefillTask: function(creep) {
      var room = creep.room;
      var queue = room.memory.refillQueue;
      var openTasks = _.filter(queue, (item) => {
        return item.taken == false
      });
      if( openTasks.length ) {
        room.memory.refillQueue[openTasks[0].id].taken = true;
        room.memory.refillQueue[openTasks[0].id].ownerId = creep.id;
        console.log("Refill task taken from room: " + room.name);
        return openTasks[0].id;
      }
    }
};

module.exports = roomController;
