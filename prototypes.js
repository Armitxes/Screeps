module.exports = function() {
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
            let source = this.pos.findClosestByPath(FIND_SOURCES);
            if (this.harvest(source) == ERR_NOT_IN_RANGE)
                this.moveTo(source);
        }

    Creep.prototype.storeEnergy =
        function () {
            let structure = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_TOWER
                             || s.structureType == STRUCTURE_SPAWN
                             || s.structureType == STRUCTURE_EXTENSION)
                             && s.energy < s.energyCapacity
            });

            if (structure != undefined) {
                if (this.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    this.moveTo(structure);
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
                || (s.structureType == STRUCTURE_WALL && s.hits < 400001)
                || (s.structureType == STRUCTURE_RAMPART && s.hits < 3000001)
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