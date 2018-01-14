var util = {
  resetOn: function(modTick) {
    if( Game.time % modTick == 0 ) {
      return true;
    }
    return false;
  },

  moveCreep: function( creep ) {
    // Get path
    var path = util.pathFinder(creep, creep.memory.comingFrom, creep.memory.movingTo);

    // Attempt to move creep
    var moveResult = creep.moveByPath(path);

    if( moveResult == ERR_NOT_FOUND ) {
      // Stop following path for now
      creep.moveByPath( util.pathFinder(creep, undefined, creep.memory.movingTo ));
    }
    else if ( moveResult == OK ) {
      if( !creep.memory.lastPos ) {
        creep.memory.lastPos = creep.pos;
        return;
      }
      // Check that it actually moved
      if( creep.memory.lastPos.x == creep.pos.x && creep.memory.lastPos.y == creep.pos.y) {
        creep.say("MOVE IT");
        creep.moveByPath( util.pathFinder(creep, undefined, creep.memory.movingTo ));
      }
      creep.memory.lastPos = creep.pos;
    }
  },

  pathFinder(creep, start, end) {
    var path;

    if( !start ) {
      return creep.pos.findPathTo(Game.getObjectById(end));
    }

    // Check to see if start object ID exists in map
    var startPathObjId = global.paths[start];
    if( startPathObjId ) {
      var checkPath = startPathObjId[end];
      if( checkPath ) {
        path = checkPath;
      }
      else {
        // If the start object ID exists, then it is simply missing a path to the other object
        // but contains others.

        path = PathFinder.search(Game.getObjectById(start).pos, Game.getObjectById(end).pos).path;
        global.paths[start][end] = path;
      }
    }

    // If not, calculate a path and add it
    else {
      path = PathFinder.search(Game.getObjectById(start).pos, Game.getObjectById(end).pos).path;
      global.paths[start] = {
        [end]: path,
      };
    }

    return path;
  }
};

module.exports = util;
