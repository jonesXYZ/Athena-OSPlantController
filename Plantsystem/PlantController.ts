import Database from '@stuyk/ezmongodb';
import * as alt from 'alt-server';
import { isPlayerInCutscene } from 'natives';
import { ATHENA_PLANTCONTROLLER, DATABASE_SETTINGS } from '.';
import { playerFuncs } from '../../server/extensions/Player';
import { DiscordController } from '../../server/systems/discord';
import { sha256 } from '../../server/utility/encryption';
import IPlants from './src/interfaces/IPlants';

const result = { id: '' };

export enum PLANTCONTROLLER_EVENTS {
    addPlant = 'PlantController:Server:CreatePot',
    removePlant = 'PlantController:Server:RemovePot'
}

export class PlantController implements IPlants {
    _id?: string;
    model: string;
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
    * @memberof PlantController
    * @param _id Unique Identifier of this Plant.
    * @type string
    * @param model Model of the Pot Object.
    * @type string
    * @param data.owner The name of the Plant Owner.
    * @type string
    * @param data.type Harvest Bud Outcome.
    * @type string
    * @param data.seeds Is this Plant seeded or not?
    * @type boolean
    * @param data.fertilized Is this Plant fertilized or not?
    * @type boolean
    * @param data.state State which will result into 'growing' or something.
    * @type string
    * @param data.remaining Remaining time until harvestable.
    * @type number
    * @param data.water Water level of this plant 0-100.
    * @type number
    * @param data.harvestable Is this Plant harvestable?
    * @type boolean
    * @param position Plant Position as alt.Vector3
    * @type alt.Vector
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
        await Database.deleteById(id, DATABASE_SETTINGS.collectionName);
    }

    /** 
    * @memberof PlantController
    * @param player alt.Player
    * @param id id which is needed to remove a plant from the database collection.
    */ 
    static async removeNearestPlant(player: alt.Player, id: string) {
        this.findNearestPlant(player);
        await Database.deleteById(id, DATABASE_SETTINGS.collectionName);
    }
    /** 
    * @memberof PlantController
    * @param player alt.Player - Used to find the nearest plant.
    * @returns plant_id as string - Useful for scripting purposes ;)
    */ 
    static async findNearestPlant(player: alt.Player): Promise<String> {
        const plants = await Database.fetchAllData<IPlants>(DATABASE_SETTINGS.collectionName);
        plants.forEach((plant, i) => {
            if(player.pos.isInRange(plant.position, 2)) {
                result.id = plant._id;
            } 
        });
        return result.id;
    }

    static seedPlant() {

    }

    static fertilizePlant() {

    }

    static waterPlant() {

    }

    static harvestPlant() {

    }

    static updatePlant(player: alt.Player, id: string) {

    }

    static log(msg: string) {
        if(ATHENA_PLANTCONTROLLER.useDiscordLogs) {
            DiscordController.sendToChannel(ATHENA_PLANTCONTROLLER.discordChannel, msg);
        } else {
            alt.log("Please enable useDiscordLog to use this feature.");
            return;
        }
    }
}