/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('room.spawner');
 * mod.thing == 'a thing'; // true
 */

var desiredHarvesterCount = 1;
var desiredHarvesterStaticCount = 1;
var desiredUpgraderCount = 1;
var desiredBuilderCount = 1;
var desiredTruckCount = 1;

var HARVESTER_PARTS = [WORK,CARRY,MOVE,MOVE]
var HARVESTER_STATIC_PARTS = [WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE];
var UPGRADER_PARTS = [WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE];
var BUILDER_PARTS = [WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE];
var TRUCK_PARTS = [CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE];

var buildMap = {
  'harvester_static': 'truck',
  'truck': 'upgrader',
  'upgrader': 'builder',
  'builder': 'harvester_static'
};

var roomSpawner = {

    spawn: function(parts, role) {
        var retVal = -1;
        var spawn = Game.spawns.Spawn1;
        if( (retVal = spawn.canCreateCreep( parts, undefined) ) == OK ) {
            spawn.createCreep(parts, undefined, {'role':role});
        } else {
            var response = spawn.canCreateCreep( parts, undefined);
            console.log("Error spawning creep, error code: " + response);
        }
        return retVal;
    },

    run: function() {
        if( Game.spawns.Spawn1.room.controller.level == 1 ) {
          desiredHarvesterCount = 5;
        }
        else {
          desiredHarvesterCount = 1;
        }

        var numHarvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester').length;
        var numStaticHarvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester_static').length;
        var numUpgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader').length;
        var numBuilders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder').length;
        var numTrucks = _.filter(Game.creeps, (creep) => creep.memory.role == 'truck').length;

        if( Memory.debug ) {
            console.log("Static Harvesters: " +numStaticHarvesters+ "/" + desiredHarvesterStaticCount);
            console.log("Harvesters: " +numHarvesters+ "/" + desiredHarvesterCount);
            console.log("Upgraders: " +numUpgraders+ "/" + desiredUpgraderCount);
            console.log("Builders: " +numBuilders+ "/" + desiredBuilderCount);
            console.log("Trucks: " +numTrucks+ "/" + desiredTruckCount);
        }

        // If missing one of any type, set limits to 1
        if( numHarvesters == 0 ||
            numStaticHarvesters == 0 ||
            numUpgraders == 0 ||
            numBuilders == 0 ||
            numTrucks == 0
          )
        {
          desiredHarvesterCount = 1;
          desiredHarvesterStaticCount = 1;
          desiredUpgraderCount = 1;
          desiredBuilderCount = 1;
          desiredTruckCount = 1;
        }
        else {
          desiredHarvesterCount = 1;
          desiredHarvesterStaticCount = 4;
          desiredUpgraderCount = 4;
          desiredBuilderCount = 3;
          desiredTruckCount = 8;
        }

        var nothingToBuild = true;
        // Always top off harvesters - without these, could cascade to nothing
        if( numHarvesters < desiredHarvesterCount ) {
            this.spawn(HARVESTER_PARTS, 'harvester');
            nothingToBuild = false;
        }

        var toBuild = buildMap[Memory.lastBuilt];
        console.log("To build: " + toBuild);

        if( toBuild == 'harvester_static'  ) {
          if( numStaticHarvesters >= desiredHarvesterStaticCount ) {
            Memory.lastBuilt = 'harvester_static';
          }
          else {
            if( this.spawn(HARVESTER_STATIC_PARTS, 'harvester_static') == OK ) {
              Memory.lastBuilt = 'harvester_static';
            }
            nothingToBuild = false;
          }
        }

        if( toBuild == 'truck' ) {
          if( numTrucks >= desiredTruckCount ) {
            Memory.lastBuilt = 'truck';
          }
          else {
            if( this.spawn(TRUCK_PARTS, 'truck') == OK ) {
              Memory.lastBuilt = 'truck';
            }
            nothingToBuild = false;
          }
        }

        if( toBuild == 'upgrader' ) {
          if( numUpgraders >= desiredUpgraderCount ) {
            Memory.lastBuilt = 'upgrader';
          }
          else {
            if( this.spawn(UPGRADER_PARTS, 'upgrader') == OK ) {
              Memory.lastBuilt = 'upgrader';
            }
            nothingToBuild = false;
          }
        }

        if( toBuild == 'builder' ) {
          if( numBuilders >= desiredBuilderCount ) {
            Memory.lastBuilt = 'builder';
          }
          else {
            if( this.spawn(BUILDER_PARTS, 'builder') == OK ) {
              Memory.lastBuilt = 'builder';
            }
            nothingToBuild = false;
          }
        }

        if( nothingToBuild ) {

        }

    }
};

module.exports = roomSpawner;
