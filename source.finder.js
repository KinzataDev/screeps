/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('source.finder');
 * mod.thing == 'a thing'; // true
 */

sourceFinder = {

    run: function(creep,sources) {
        var closestSource = creep.pos.findClosestByPath(sources);
        if( closestSource.pos.findInRange(FIND_MY_CREEPS,1).length < 2 ) {
          if( closestSource.energy > 0 ) {
            creep.memory.sourceTargetId = closestSource.id;
          }
        }
        else {
          for( var name in sources ) {
              var source = sources[name];
              var creeps = source.pos.findInRange(FIND_MY_CREEPS,1);
              if( creeps.length < 3 ) {
                  sourceToHarvest = source;
                  console.log(source.id);
                  creep.memory.sourceTargetId = source.id;
                  console.log(creep.memory.sourceTargetId);
                  return;
              }
          }
        }
    },

    findClosestValidSource: function( creep, creepLimit ) {
      var closestSource = creep.pos.findClosestByPath(FIND_SOURCES, {
        filter: function( source ) {
          return ( source.energy > 0 &&
                   source.pos.findInRange(FIND_MY_CREEPS,2).length < creepLimit
          );
        }
      });
      return closestSource;
    },

    findInAdjacentRooms: function(creep) {
      return;
    },

    findSourceNeedsHarvester: function(room) {
      var sourceIds = room.memory.sourceIds;
      if( sourceIds ) {
        for( var id in sourceIds ) {
          var source = Game.getObjectById(id);

          var numHarvesters = source.pos.findInRange(FIND_MY_CREEPS, 3, {
            filter: (creep) => {
              return creep.memory.role == 'harvester_static';
            }
          }).length;

          if( numHarvesters < 2 ) {
            return source;
          }
        }

        // Still here?  Return undefined because there are no open sources;
        return undefined;
      }
      else {
        // No source ids for the room... build it!
        room.memory.sourceIds = {};
        var sources = room.find(FIND_SOURCES);
        for( var name in sources ) {
          room.memory.sourceIds[sources[name].id] = true;
        }
      }
    }
}

module.exports = sourceFinder;
