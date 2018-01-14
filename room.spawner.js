/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('room.spawner');
 * mod.thing == 'a thing'; // true
 */

var spawner = require('Spawn.spawner');

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

    run: function() {
        var spawn = Game.spawns.Spawn1;
        if( spawn.room.controller.level == 1 ) {
          desiredHarvesterCount = 5;
          desiredHarvesterCount = 0;
          desiredHarvesterStaticCount = 0;
          desiredUpgraderCount = 0;
          desiredBuilderCount = 0;
          desiredTruckCount = 0;
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
        if( spawn.room.controller.level != 1 && (
            numHarvesters == 0 ||
            numStaticHarvesters == 0 ||
            numUpgraders == 0 ||
            numBuilders == 0 ||
            numTrucks == 0 )
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
          desiredHarvesterStaticCount = spawn.room.find(FIND_SOURCES).length;
          desiredUpgraderCount = 4;
          desiredBuilderCount = 3;
          desiredTruckCount = 4;
        }

        var nothingToBuild = true;
        // Always top off harvesters - without these, could cascade to nothing
        if( numHarvesters < desiredHarvesterCount ) {
            spawner.spawn(spawn, global.CREEP_TYPES.HARVESTER);
            nothingToBuild = false;
        }

        var toBuild = buildMap[Memory.lastBuilt];
        console.log("To build: " + toBuild);

        if( toBuild == global.CREEP_TYPES.HARVESTER_STATIC  ) {
          if( numStaticHarvesters >= desiredHarvesterStaticCount ) {
            Memory.lastBuilt = global.CREEP_TYPES.HARVESTER_STATIC;
          }
          else {
            if( spawner.spawn(spawn, global.CREEP_TYPES.HARVESTER_STATIC) == OK ) {
              Memory.lastBuilt = global.CREEP_TYPES.HARVESTER_STATIC;
            }
            nothingToBuild = false;
          }
        }

        if( toBuild == global.CREEP_TYPES.TRUCK ) {
          // First see if there are any pickup locations...
          var pickup_locations = Object.keys(Memory.rooms[spawn.room.name].pickup).length;
          if( pickup_locations == 0 || numTrucks >= desiredTruckCount ) {
            Memory.lastBuilt = global.CREEP_TYPES.TRUCK;
          }
          else {
            if( spawner.spawn(spawn, global.CREEP_TYPES.TRUCK) == OK ) {
              Memory.lastBuilt = global.CREEP_TYPES.TRUCK;
            }
            nothingToBuild = false;
          }
        }

        if( toBuild == global.CREEP_TYPES.UPGRADER ) {
          if( numUpgraders >= desiredUpgraderCount ) {
            Memory.lastBuilt = global.CREEP_TYPES.UPGRADER;
          }
          else {
            if( spawner.spawn(spawn, global.CREEP_TYPES.UPGRADER) == OK ) {
              Memory.lastBuilt = global.CREEP_TYPES.UPGRADER;
            }
            nothingToBuild = false;
          }
        }

        if( toBuild == global.CREEP_TYPES.BUILDER ) {
          if( numBuilders >= desiredBuilderCount ) {
            Memory.lastBuilt = global.CREEP_TYPES.BUILDER;
          }
          else {
            if( spawner.spawn(spawn, global.CREEP_TYPES.BUILDER) == OK ) {
              Memory.lastBuilt = global.CREEP_TYPES.BUILDER;
            }
            nothingToBuild = false;
          }
        }

        if( !toBuild ) {
          Memory.lastBuilt = 'builder';
        }

        if( nothingToBuild ) {

        }

    }
};

module.exports = roomSpawner;
