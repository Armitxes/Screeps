Memory.repairingObjects = [];

require('prototypes')();
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleRepairer = require('role.repairer');

var minimumNumberOfHarvesters = 4;
var minimumNumberOfUpgraders = 1;
var minimumNumberOfRepairers = 1;

var ownedRooms = {
    'W1N3': {
        sources: [Game.getObjectById('16476a46e5be0de'), Game.getObjectById('65c26a46e5bf23d')],
        spawn: Game.getObjectById('6a63bab435b4fdb'),
        towers: [Game.getObjectById('f08959cc6771307'), Game.getObjectById('8be29c791437eae')],
        mineral: [Game.getObjectById('ae846a46e5b4b7f')],
        cfg: {
            forceHarvesterCount: 4,
            forceUpgraderCount: 1,
            forceRepairerCount: 1
        }
    }
}

module.exports.loop = function () {


    let healer = false;

    for (let key in ownedRooms) {
        roomObj = Game.rooms[key];
        roomData = ownedRooms[key];

        roomData.cfg.forceRepairerCount = (roomData.towers.length > 0) ? 0 : 1;

        for (let tower of roomData.towers) {
            minimumNumberOfRepairers = 0;
            let target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (target != undefined) {
                tower.attack(target);
            } else if (tower.energy > 500) {
                healer = tower;
                let structure = tower.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => (s.hits < s.hitsMax && [STRUCTURE_WALL,STRUCTURE_RAMPART].indexOf(s.structureType) == -1)
                    || (s.structureType == STRUCTURE_WALL && s.hits < 500001)
                    || (s.structureType == STRUCTURE_RAMPART && s.hits < 3000001)
                });

                if (structure != undefined) {tower.repair(structure)}
            }
        }

        roomOwnedCreeps = roomObj.find(FIND_MY_CREEPS);
        for (let index in roomOwnedCreeps) {
            var creep = roomOwnedCreeps[index];

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
        var numberOfHarvesters = _.sum(roomOwnedCreeps, (c) => c.memory.role == 'harvester');
        var numberOfUpgraders = _.sum(roomOwnedCreeps, (c) => c.memory.role == 'upgrader');
        var numberOfRepairers = _.sum(roomOwnedCreeps, (c) => c.memory.role == 'repairer');

        var energy = roomObj.energyAvailable;
        var name = undefined;

        // if not enough harvesters
        if (numberOfHarvesters < roomData.cfg.forceHarvesterCount) {
            name = roomData.spawn.createCustomCreep(energy, 'harvester');
        }
        // if not enough upgraders
        else if (numberOfUpgraders < roomData.cfg.forceUpgraderCount) {
            name = roomData.spawn.createCustomCreep(energy, 'upgrader');
        }
        // if not enough repairers
        else if (numberOfRepairers < minimumNumberOfRepairers) {
            name = roomData.spawn.createCustomCreep(energy, 'repairer');
        }
    }
};