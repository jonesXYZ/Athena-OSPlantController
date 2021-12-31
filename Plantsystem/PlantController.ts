import Database from '@stuyk/ezmongodb';
import * as alt from 'alt-server';
import { ATHENA_PLANTCONTROLLER, PLANTCONTROLLER_DATABASE, PLANTCONTROLLER_SETTINGS } from './index';
import { ServerTextLabelController } from '../../server/streamers/textlabel';
import { ServerObjectController } from '../../server/streamers/object';
import { DiscordController } from '../../server/systems/discord';
import IPlants from './src/interfaces/IPlants';

const result = { id: '' };

export enum PLANTCONTROLLER_EVENTS {
    addPlant = 'PlantController:Server:CreatePot',
    removePlant = 'PlantController:Server:RemovePot',
}

export class PlantController implements IPlants {
    _id?: string;
    model: string;
    data: {
        owner?: string;
        variety?: string;
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
            variety: this.data.variety,
            type: this.data.type,
            seeds: this.data.seeds,
            fertilized: this.data.fertilized,
            state: this.data.state,
            remaining: this.data.remaining,
            water: this.data.water,
            harvestable: this.data.harvestable,
        };
        this.position;
    }

    /**
    * @memberof PlantController
    * @param player alt.Player
    * @param IPlants IPlants Interface
    */
    static async addPlant(player: alt.Player, data: IPlants): Promise<IPlants | null> {
        const plantData = await Database.insertData(data, PLANTCONTROLLER_DATABASE.collectionName, true);
        alt.emit(PLANTCONTROLLER_EVENTS.addPlant, player, data);
        return plantData;
    }

    /**
     * @memberof PlantController
     * @param id id which is needed to remove a plant from the database collection.
     */
    static async removePlant(id: string): Promise<Boolean | null> {
        const isRemoved = await Database.deleteById(id, PLANTCONTROLLER_DATABASE.collectionName);
        return isRemoved;
    }

    /**
     * @memberof PlantController
     * @param player alt.Player
     * @param id id which is needed to remove a plant from the database collection.
     */
    static async removeNextPlant(player: alt.Player, id: string) {
        this.findNearestPlant(player);
        await Database.deleteById(id, PLANTCONTROLLER_DATABASE.collectionName);
    }
    /**
     * @memberof PlantController
     * @param player alt.Player - Used to find the nearest plant.
     * @returns plant_id as string - Useful for scripting purposes ;)
     */
    static async findNearestPlant(player: alt.Player): Promise<String> {
        const plants = await Database.fetchAllData<IPlants>(PLANTCONTROLLER_DATABASE.collectionName);
        plants.forEach((plant, i) => {
            if (player.pos.isInRange(plant.position, 2)) {
                result.id = plant._id;
            }
        });
        return result.id;
    }

    static waterPlant() {}

    static harvestPlant() {}

    static async updatePlant(id: string, data: IPlants) {
        const updateDocument: IPlants = {
            model: data.model,
            data: {
                owner: data.data.owner,
                variety: data.data.variety,
                type: data.data.type,
                seeds: data.data.seeds,
                fertilized: data.data.fertilized,
                state: data.data.state,
                remaining: data.data.remaining,
                water: data.data.water,
                harvestable: data.data.harvestable,
            },
            position: data.position,
        };
        await Database.updatePartialData(id, updateDocument, PLANTCONTROLLER_DATABASE.collectionName);
    }
    /**
    * Used to set a PlantController Log to Discord, if enabled.
    * @param msg 
    */
    static log(msg: string) {
        if (ATHENA_PLANTCONTROLLER.useDiscordLogs) {
            DiscordController.sendToChannel(ATHENA_PLANTCONTROLLER.discordChannel, msg);
        } else {
            alt.log('Please enable useDiscordLog to use this feature.');
            return;
        }
    }

    /**
    * Used to build a new pot object, should be used with/after PlantController.addPlant(...); 
    * @param data IPlants Interface 
    */
    static buildObject(data: IPlants) {
        ServerTextLabelController.append({
            uid: `${data._id}`,
            pos: data.position as alt.Vector3,
            data: `~g~${data.data.variety} ~w~| ~g~${data.data.type}~n~~g~${data.data.state}`,
        }); 
        ServerObjectController.append({
            pos: data.position as alt.Vector3,
            model: PLANTCONTROLLER_SETTINGS.smallPot,
            uid: `PlantController-${data._id}`,
        });
    }

    /**
    * Used to refresh the Textlabels on state changing and so on.
    * @param data IPlants Interface
    */
    static refreshLabels(data: IPlants) {
        ServerTextLabelController.remove(data._id);
        alt.setTimeout(() => {
            ServerTextLabelController.append({
                uid: `${data._id}`,
                pos: data.position as alt.Vector3,
                data: `~g~${data.data.variety} ~w~| ~g~${data.data.type}~n~~g~${data.data.state}`,
            });
        }, 1000*30);
    }
}
