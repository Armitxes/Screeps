module.exports = function() {
    // General JS Stuff
    Array.prototype.remove = function() {
        var what, a = arguments, L = a.length, ax;
        while (L && this.length) {
            what = a[--L];
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this;
    };

    // create a new function for StructureSpawn
    StructureSpawn.prototype.createCustomCreep =
        function(energy, roleName) {
            // create a balanced body as big as possible with the given energy
            let numberOfParts = Math.floor(energy / 200);
            if (numberOfParts > 7) { numberOfParts = 7; }
            let body = [];
            for (let i = 0; i < numberOfParts; i++) {
                body.push(WORK);
            }
            for (let i = 0; i < numberOfParts; i++) {
                body.push(CARRY);
            }
            for (let i = 0; i < numberOfParts; i++) {
                body.push(MOVE);
            }

            // create creep with the created body and the given role
            return this.createCreep(body, undefined, { role: roleName, working: false });
        };
    
    // Creeps
    Creep.prototype.gatherEnergy =
        function () {
            let source = this.pos.findClosestByPath(FIND_SOURCES, { filter: (s) => s.energy > 0 });
            if (source != null) {
                _actionResult = this.harvest(source);

                if (_actionResult == ERR_NOT_IN_RANGE)
                    this.moveTo(source);
            } else { this.working = true; }
        }

    Creep.prototype.storeEnergy =
        function () {
            let structure = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (s) => ((s.structureType == STRUCTURE_TOWER && s.energy < 801)
                             || s.structureType == STRUCTURE_SPAWN
                             || s.structureType == STRUCTURE_EXTENSION)
                             && s.energy < s.energyCapacity
                             && (
                                 s.assignedCreep == this
                                 || s.assignedCreep == undefined
                                 || [STRUCTURE_SPAWN,STRUCTURE_CONTROLLER].indexOf(s.structureType) > -1
                            )
            });

            if (structure != undefined) {
                // Max 1 Creeper per structure. Except if Spawn or Controller
                structure.assignedCreep = this;
                _doActionResult = this.transfer(structure, RESOURCE_ENERGY);
                if (_doActionResult == ERR_NOT_IN_RANGE) { this.moveTo(structure); }
                else if ([OK,ERR_NOT_OWNER,ERR_BUSY,ERR_INVALID_TARGET,ERR_FULL].indexOf(_doActionResult) > -1) {
                    structure.assignedCreep = undefined;
                }
                return true
            }
            return false
        }
        
    Creep.prototype.assignConstruction =
        function () {
            let constructionSite = this.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if (constructionSite != undefined) {
                if (this.build(constructionSite) == ERR_NOT_IN_RANGE) {
                    this.moveTo(constructionSite);
                }
                return true
            }
            return false
        }
        
    Creep.prototype.assignUpgrade =
        function () {
            if (this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) {
                this.moveTo(this.room.controller);
            }
            return true
        }
        
    Creep.prototype.assignRepair =
        function () {
            let structure = this.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => (s.hits < s.hitsMax && [STRUCTURE_WALL,STRUCTURE_RAMPART].indexOf(s.structureType) == -1)
            });

            if (structure != undefined) {
                if (this.repair(structure) == ERR_NOT_IN_RANGE) {
                    this.moveTo(structure);
                }
                return true
            }
            return false
        }
};