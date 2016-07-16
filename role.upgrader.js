/* DEPRECATED, JOB DONE BY HARVESTER & HEALER */

module.exports = {
    run: function(creep) {
        if (creep.memory.working) {
            creep.assignUpgrade();
        } else { creep.gatherEnergy(); }
    }
};