Memory.repairingObjects = [];

require('prototypes')();
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleRepairer = require('role.repairer');

/*
    Can save you quite some resources because of odd reasons.
    Must be set manually, you can get the unique Object ID's by clicking on them.
*/
var ownedRooms = {
    'W2N2': {
        sources: [Game.getObjectById('399f0774a5bab03'), Game.getObjectById('067b0774a5b1a72')],
        spawn: Game.getObjectById('69bc2f3b646c9e1'),
        towers: [],
        mineral: Game.getObjectById('84816164dbb1281'),
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

        // Remove any non existent objects
        roomData.sources.remove(null);
        roomData.towers.remove(null);

        // You never will need more than one, this is just in case of towers
        // getting destroyed
        roomData.cfg.forceRepairerCount = (roomData.towers.length > 0) ? 0 : 1;
        roomData.cfg.forceUpgraderCount = (roomData.towers.length > 0) ? 0 : 1;

        for (let tower of roomData.towers) {
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
            if (typeof(creep) == 'object') {
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
        }

        // count the number of creeps alive for each role
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
        else if (numberOfRepairers < roomData.cfg.forceRepairerCount) {
            name = roomData.spawn.createCustomCreep(energy, 'repairer');
        }
    }
};
