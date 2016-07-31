module.exports = {
    run: function(creep) {
        if (creep.memory.working) {
            if (creep.assignRepair()) {
            } else if (creep.assignConstruction()) {
            } else { creep.assignUpgrade(); }
        } else { creep.gatherEnergy(); }
    }
};