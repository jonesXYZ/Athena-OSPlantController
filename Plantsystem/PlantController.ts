import Database from '@stuyk/ezmongodb';
import * as alt from 'alt-server';
import {
    ATHENA_PLANTCONTROLLER,
    PLANTCONTROLLER_DATABASE,
    PLANTCONTROLLER_SETTINGS,
    PLANTCONTROLLER_TRANSLATIONS,
} from './index';
import { ServerTextLabelController } from '../../server/streamers/textlabel';
import { ServerObjectController } from '../../server/streamers/object';
import { DiscordController } from '../../server/systems/discord';
import IPlants from './src/interfaces/IPlants';
import { InteractionController } from '../../server/systems/interaction';
import { TextLabel } from '../../shared/interfaces/textLabel';

const result = { id: '' };
let textLabel: string;

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
     * Adds a new plant to the database.
     * @param {alt.Player} player - The player who is adding the plant.
     * @param {IPlants} data - IPlants
     * @returns The data of the plant that was added.
     */
    static async addPlant(player: alt.Player, data: IPlants): Promise<IPlants | null> {
        await Database.insertData(data, PLANTCONTROLLER_DATABASE.collectionName, false);
        return data;
    }

    /**
     * `removePlant` is a function that takes in a plant id and removes the plant from the database.
     * @param {string} id - string
     * @returns A boolean value.
     */
    static async removePlant(id: string): Promise<Boolean | null> {
        const isRemoved = await Database.deleteById(id, PLANTCONTROLLER_DATABASE.collectionName);
        return isRemoved;
    }

    /**
     * `removeNextPlant` removes the next plant in the queue.
     * @param {alt.Player} player - alt.Player - The player who is removing the plant.
     * @param {string} id - string - The id of the plant to remove.
     * @returns A boolean value.
     */
    static async removeNextPlant(player: alt.Player, id: string): Promise<Boolean | null> {
        this.findNearestPlant(player);
        const isRemoved = await Database.deleteById(id, PLANTCONTROLLER_DATABASE.collectionName);
        return isRemoved;
    }

    /**
     * Returns id of nearest plant.
     * @param {alt.Player} player - alt.Player - The player that is looking for a plant.
     * @returns The ID of the nearest plant.
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

    /**
     * Update the plant's data in the database.
     * @param {string} id - The id of the plant to update.
     * @param {IPlants} data - IPlants
     * @returns None
     */
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
     * Update all plants in the database.
     * @returns None
     */
    static async updatePlants() {}
    /**
     * Send a message to the Discord channel specified in the config.
     * @param {string} msg - The message to send to the channel.
     * @returns The plant object.
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
     * Cannot generate summary
     * @param {IPlants} data - IPlants
     * @returns None
     */
    static async buildObject(data: IPlants, object: string) {
        if(!object) {
            alt.log(`Missing Object.`);
        }
        ServerObjectController.append({
            pos: data.position as alt.Vector3,
            model: object,
            uid: `PlantController-${data._id}`,
        });
    }

    /**
     * It removes the text label from the screen, then re-adds it.
     * @param {IPlants} data - IPlants
     * @returns None
     */
    static refreshLabels(data: IPlants, plantId: string) {
        const removed = ServerTextLabelController.remove(plantId);
        if (removed) {
            ServerTextLabelController.append({
                uid: plantId,
                pos: { x: data.position.x, y: data.position.y, z: data.position.z + 0.5 },
                data: `~g~${data.data.variety} ~w~| ~g~${data.data.type}~n~~n~~g~${data.data.state}~n~~n~~b~${data.data.water}% ~w~| ~g~${data.data.remaining}m`,
            });
        } else {
            alt.log('Something went wrong.');
        }
    }
}