module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        // if creep is supposed to transfer energy to the spawn or an extension
        if (creep.memory.working) {
            // find closest spawn or extension which is not full
            var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                // the second argument for findClosestByPath is an object which takes
                // a property called filter which can be a function
                // we use the arrow operator to define it
                filter: (s) => (s.structureType == STRUCTURE_TOWER
                             || s.structureType == STRUCTURE_SPAWN
                             || s.structureType == STRUCTURE_EXTENSION)
                             && s.energy < s.energyCapacity
            });

            // if we found one
            if (structure != undefined) {
                // try to transfer energy, if it is not in range
                if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(structure);
                }
            } else {
                // If can't store energy, use energy to build
                var constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
                if (constructionSite != undefined) {
                    // try to build, if the constructionSite is not in range
                    if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                        // move towards the constructionSite
                        creep.moveTo(constructionSite);
                    }
                } else {
                    // If can't build, upgrade
                    if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                        // if not in range, move towards the controller
                        creep.moveTo(creep.room.controller);
                    }
                }
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            // find closest source
            var source = creep.pos.findClosestByPath(FIND_SOURCES);
            // try to harvest energy, if the source is not in range
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                // move towards the source
                creep.moveTo(source);
            }
        }
    }
};