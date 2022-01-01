import Database from '@stuyk/ezmongodb';
import * as alt from 'alt-server';
import { ATHENA_PLANTCONTROLLER, PLANTCONTROLLER_DATABASE, PLANTCONTROLLER_SETTINGS, PLANTCONTROLLER_TRANSLATIONS } from './index';
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
     * Finds the nearest plant.
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

    static waterPlant(data: IPlants) {}

    static harvestPlant() {}

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
    static async buildObject(data: IPlants) {
        ServerObjectController.append({
            pos: data.position as alt.Vector3,
            model: PLANTCONTROLLER_SETTINGS.smallPot,
            uid: `PlantController-${data._id}`,
        });
    }

/**
 * It removes the label from the screen, then re-adds it.
 * @param {IPlants} data - IPlants
 * @returns None
 */
    static refreshLabels(data: IPlants) {
        const removed = ServerTextLabelController.remove(data._id);
        if (removed) {
            ServerTextLabelController.append({
                uid: data._id,
                pos: { x: data.position.x, y: data.position.y, z: data.position.z + 0.5 },
                data: `~g~${data.data.variety} ~w~| ~g~${data.data.type}~n~~n~~g~${data.data.state}~n~~n~~b~${data.data.water}% ~w~| ~g~${data.data.remaining}m`,
            });
        } else {
            alt.log('Something went wrong.');
        }
    }
}


/**
 *         const itemToSeed = await ItemFactory.get(PLANTCONTROLLER_ITEMS.seedsItemName.toString());
        const itemToFertilize = await ItemFactory.get(PLANTCONTROLLER_ITEMS.fertilizerItemName.toString());
        const itemToWater = await ItemFactory.get(PLANTCONTROLLER_ITEMS.waterItemName.toString());
    
        const seedsFound = playerFuncs.inventory.isInInventory(player, { name: itemToSeed.name.toString() });
        const fertilizerFound = playerFuncs.inventory.isInInventory(player, {
            name: itemToFertilize.name.toString(),
        });
        const waterFound = playerFuncs.inventory.isInInventory(player, { name: itemToWater.name.toString() });
        PlantController.buildObject(data);
        ServerTextLabelController.append({
            uid: data._id,
            pos: { x: data.position.x, y: data.position.y, z: data.position.z + 0.5 },
            data: `~g~${data.data.variety} ~w~| ~g~${data.data.type}~n~~n~~g~${data.data.state}~n~~n~~b~${data.data.water}% ~w~| ~g~${data.data.remaining}m`,
            maxDistance: PLANTCONTROLLER_SETTINGS.textLabelDistance,
        });

        if (!data.data.seeds) {
            InteractionController.add({
                identifier: `${data._id}`,
                type: 'PlantController',
                position: data.position as alt.Vector3,
                description: PLANTCONTROLLER_TRANSLATIONS.seedingInteraction,
                disableMarker: true,
                range: PLANTCONTROLLER_SETTINGS.interactionRange,
                callback: (player: alt.Player) => {
                    if (!seedsFound) {
                        playerFuncs.emit.notification(player, `No Seeds in Inventory.`);
                        return;
                    } else {
                        if (player.data.inventory[seedsFound.index] <= 1) {
                            playerFuncs.inventory.findAndRemove(player, itemToSeed.name);
                        }
                        data.data.seeds = true;
                        data.data.state = PLANTCONTROLLER_TRANSLATIONS.fertilizerRequired;

                        InteractionController.remove(`PlantController`, `${data._id}`);
                        PlantController.updatePlant(data._id, data);
                        PlantController.refreshLabels(data);
                        InteractionController.add({
                            identifier: `${data._id}`,
                            type: 'PlantController',
                            position: data.position as alt.Vector3,
                            description: PLANTCONTROLLER_TRANSLATIONS.fertilizingInteraction,
                            disableMarker: true,
                            range: PLANTCONTROLLER_SETTINGS.interactionRange,
                            callback: () => {
                                if (!fertilizerFound) {
                                    playerFuncs.emit.notification(player, `No Fertilizer in Inventory.`);
                                    return;
                                } else {
                                    if (player.data.inventory[fertilizerFound.index] <= 1) {
                                        playerFuncs.inventory.findAndRemove(player, itemToFertilize.name);
                                    }
                                    data.data.fertilized = true;
                                    data.data.state = PLANTCONTROLLER_TRANSLATIONS.waterRequired;

                                    InteractionController.remove(`PlantController`, `${data._id}`);
                                    PlantController.updatePlant(data._id, data);
                                    PlantController.refreshLabels(data);
                                    InteractionController.add({
                                        identifier: `${data._id}`,
                                        type: 'PlantController',
                                        position: data.position as alt.Vector3,
                                        description: PLANTCONTROLLER_TRANSLATIONS.waterInteraction,
                                        disableMarker: true,
                                        range: PLANTCONTROLLER_SETTINGS.interactionRange,
                                        callback: () => {
                                            if (!waterFound) {
                                                playerFuncs.emit.notification(player, `No Water in Inventory.`);
                                                return;
                                            } else {
                                                if (player.data.inventory[waterFound.index] <= 1) {
                                                    playerFuncs.inventory.findAndRemove(player, itemToWater.name);
                                                }
                                                if (data.data.water < 100) {
                                                    data.data.water += 25;
                                                } else if (data.data.water >= 100) {
                                                    data.data.water = 100;
                                                }
                                                data.data.state = PLANTCONTROLLER_TRANSLATIONS.waterRequired;

                                                InteractionController.remove(`PlantController`, `${data._id}`);
                                                PlantController.updatePlant(data._id, data);
                                                PlantController.refreshLabels(data);
                                                player.data.inventory[waterFound.index].quantity - 1;
                                            }
                                        },
                                    });
                                    player.data.inventory[fertilizerFound.index].quantity - 1;
                                }
                            },
                        });
                        player.data.inventory[fertilizerFound.index].quantity - 1;
                    }
                },
            });
        }
 */