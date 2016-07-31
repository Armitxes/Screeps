// import modules
require('prototypes')();

var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleRepairer = require('role.repairer');

var minimumNumberOfHarvesters = 4;
var minimumNumberOfUpgraders = 1;
var minimumNumberOfRepairers = 1;

module.exports.loop = function () {
    let healer = false;
    
    var towers = Game.rooms.E49S36.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_TOWER});
    for (let tower of towers) {
        let target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (target != undefined) {
            tower.attack(target);
        } else if (tower.energy > 800) {
            healer = tower;
            let structure = tower.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => (s.hits < s.hitsMax && [STRUCTURE_WALL,STRUCTURE_RAMPART].indexOf(s.structureType) == -1)
                || (s.structureType == STRUCTURE_RAMPART && s.hits < 3000001)
            });

            if (structure != undefined) {tower.repair(structure)}
        }
        
    }
    
    // check for memory entries of died creeps by iterating over Memory.creeps
    for (let name in Memory.creeps) {
        var creep = Game.creeps[name];

        // and checking if the creep is still alive
        if (creep == undefined) {
            delete Memory.creeps[name];
        } else {
            creep.memory.isDying = creep.ticksToLive < 50;
            if (!creep.memory.isDying && creep.hits < 1000 && healer.energy > 800) { healer.heal(creep); }

            // if creep is bringing energy to the spawn or an extension but has no energy left
            if (creep.carry.energy == 0 && creep.memory.working && !creep.memory.isDying) {
                creep.memory.working = false;
            } else if ((creep.carry.energy == creep.carryCapacity && !creep.memory.working) || creep.memory.isDying) {
                creep.memory.working = true;
            }
            
            switch (creep.memory.role) {
                case 'harvester': roleHarvester.run(creep); break;
                case 'upgrader': roleUpgrader.run(creep); break;
                case 'repairer': roleRepairer.run(creep); break;
            }
            
            if (creep.memory.isDying && creep.carry.energy == 0) { creep.suicide() }
        }
    }

    // count the number of creeps alive for each role
    // _.sum will count the number of properties in Game.creeps filtered by the
    //  arrow function, which checks for the creep being a harvester
    var numberOfHarvesters = _.sum(Game.creeps, (c) => c.memory.role == 'harvester');
    var numberOfUpgraders = _.sum(Game.creeps, (c) => c.memory.role == 'upgrader');
    var numberOfRepairers = _.sum(Game.creeps, (c) => c.memory.role == 'repairer');

    var energy = Game.spawns.Atlantis.room.energyCapacityAvailable;
    var name = undefined;

    // if not enough harvesters
    if (numberOfHarvesters < minimumNumberOfHarvesters) {
        // try to spawn one
        name = Game.spawns.Atlantis.createCustomCreep(energy, 'harvester');

        // if spawning failed and we have no harvesters left
        if (name == ERR_NOT_ENOUGH_ENERGY && numberOfHarvesters == 0) {
            // spawn one with what is available
            name = Game.spawns.Atlantis.createCustomCreep(
                Game.spawns.Atlantis.room.energyAvailable, 'harvester');
        }
    }
    // if not enough upgraders
    else if (numberOfUpgraders < minimumNumberOfUpgraders) {
        // try to spawn one
        name = Game.spawns.Atlantis.createCustomCreep(energy, 'upgrader');
    }
    // if not enough repairers
    else if (numberOfRepairers < minimumNumberOfRepairers) {
        // try to spawn one
        name = Game.spawns.Atlantis.createCustomCreep(energy, 'repairer');
    }
};