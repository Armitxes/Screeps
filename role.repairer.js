module.exports = {
    run: function(creep) {
        if (creep.memory.working) {
            if (creep.assignRepair()) {
            } else { creep.assignConstruction(); }
        } else { creep.gatherEnergy(); }
    }
};