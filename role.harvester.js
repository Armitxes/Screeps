module.exports = {
    run: function(creep) {
        if (creep.memory.working) {
            if (creep.storeEnergy()) {
            } else if (creep.assignConstruction()) {
            } else if (creep.assignRepair()) {
            } else { creep.assignUpgrade(); }
        } else { creep.gatherEnergy(); }
    }
};