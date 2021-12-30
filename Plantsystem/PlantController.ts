import Database from '@stuyk/ezmongodb';
import * as alt from 'alt-server';
import { isPlayerInCutscene } from 'natives';
import { ATHENA_PLANTCONTROLLER, DATABASE_SETTINGS } from '.';
import { playerFuncs } from '../../server/extensions/Player';
import { sha256 } from '../../server/utility/encryption';
import IPlants from './src/interfaces/IPlants';

export enum PLANTCONTROLLER_EVENTS {
    addPlant = 'PlantController:Server:CreatePot',
    removePlant = 'PlantController:Server:RemovePot'
}

export class PlantController implements IPlants {
    _id?: string;
    model?: string;
    data: { 
        owner?: string; 
        type?: string; 
        seeds?: boolean;
        fertilized?: boolean;
        state?: string;
        remaining?: number;
        water?: number;
        harvestable?: boolean; 
    };
    position: alt.Vector3; 
    
    constructor(data: IPlants) {
        data._id = this._id;
        data.model = this.model;
        data.data = {
            owner: this.data.owner,
            type: this.data.type,
            seeds: this.data.seeds,
            fertilized: this.data.fertilized,
            state: this.data.state,
            remaining: this.data.remaining,
            water: this.data.water,
            harvestable: this.data.harvestable
        };
        this.position 
    }
    
    /**
    * @param model Model of the Pot Object.
    * @param data.owner The name of the pot owner.
    * @param data.type type of harvested buds.
    * @param data.seeds seeding state of this plant pot.
    * @param data.fertilized fertilizing state of this plant pot.
    * @param data.state State which will result into 'growing' or something.
    * @param data.remaining remaining time until plant is finished.
    * @param data.water water level of this plant.
    * @param data.harvestable is plant harvestable or not
    * @param position alt.Vector3
    * @memberof PlantController
    */
    static async addPlant(player: alt.Player, data: IPlants) {
        alt.log("PlantController - " + JSON.stringify(data));
        await Database.insertData(data, DATABASE_SETTINGS.collectionName, false);
        alt.emit(PLANTCONTROLLER_EVENTS.addPlant, player, data); 
    }

    /** 
    * @memberof PlantController
    * @param id id which is needed to remove a plant from the database collection.
    */ 
    static async removePlant(id: string) {

    }

    /** 
    * @memberof PlantController
    * @param player alt.Player
    * @param id id which is needed to remove a plant from the database collection.
    */ 
    static async removeNearestPlant(player: alt.Player, id: string) {
        this.findNearestPlant(player)
        await Database.deleteById(id, DATABASE_SETTINGS.collectionName);
    }
    /** 
    * @memberof PlantController
    * @param player alt.Player - Used to find the nearest plant.
    */ 
    static async findNearestPlant(player: alt.Player) {
        const plants = await Database.fetchAllData<IPlants>(DATABASE_SETTINGS.collectionName);
        plants.forEach((plant, i) => {
            if(player.pos.isInRange(plant.position, ATHENA_PLANTCONTROLLER.searchRange)) {
                alt.log(`ID of nearest pod -> ${plant._id}`);
            } else {
                return false;
            }
            return true;
        });
    }

    static seedPlant() {

    }

    static fertilizePlant() {

    }

    static waterPlant() {

    }

    static updatePlant(player: alt.Player) {

    }
}