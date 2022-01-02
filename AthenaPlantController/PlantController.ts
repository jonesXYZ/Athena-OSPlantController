import Database from '@stuyk/ezmongodb';
import * as alt from 'alt-server';
import {
    ATHENA_PLANTCONTROLLER,
    PLANTCONTROLLER_ANIMATIONS,
    PLANTCONTROLLER_DATABASE,
    PLANTCONTROLLER_SETTINGS,
    PLANTCONTROLLER_TRANSLATIONS,
} from './index';
import { ServerTextLabelController } from '../../server/streamers/textlabel';
import { ServerObjectController } from '../../server/streamers/object';
import { DiscordController } from '../../server/systems/discord';
import IPlants from './src/interfaces/IPlants';
import { InteractionController } from '../../server/systems/interaction';
import { sha256Random } from '../../server/utility/encryption';
import { ItemFactory } from '../../server/systems/item';
import { buds, PLANTCONTROLLER_ITEMS, seeds } from './src/server-items';
import { playerFuncs } from '../../server/extensions/Player';
import { Item } from '../../shared/interfaces/item';
import { ANIMATION_FLAGS } from '../../shared/flags/animationFlags';
import data from '../job-mule-delivery/src/data';

const result = { id: '' };
let textLabel: string;

export class PlantController implements IPlants {
    _id: string;
    shaIdentifier: string;
    model: string;
    data: {
        owner?: string;
        variety?: string;
        type?: string;
        seeds?: boolean;
        fertilized?: boolean;
        state?: string;
        remaining: number;
        startTime: number;
        water?: number;
        harvestable?: boolean;
    };
    position: alt.Vector3;

    /**
     * The constructor is used to initialize the object.
     */
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
            startTime: data.data.startTime,
            water: this.data.water,
            harvestable: this.data.harvestable,
        };
        this.position;
    }

    /**
     * This function adds a plant to the database.
     * @param {alt.Player} player - The player who is planting the plant.
     * @param {IPlants} data - IPlants
     * @returns None
     */
    static async addPlant(player: alt.Player, data: IPlants): Promise<IPlants | null> {
        const newPlant: IPlants = {
            _id: data._id,
            shaIdentifier: data.shaIdentifier,
            model: data.model,
            data: {
                owner: data.data.owner,
                variety: data.data.variety,
                type: data.data.type,
                seeds: data.data.seeds,
                fertilized: data.data.fertilized,
                state: data.data.state,
                remaining: data.data.remaining,
                startTime: data.data.startTime,
                water: data.data.water,
                harvestable: data.data.harvestable,
            },
            position: data.position as alt.Vector3,
        };

        ServerObjectController.append({
            pos: { x: data.position.x, y: data.position.y, z: data.position.z },
            model: data.model,
            uid: data.shaIdentifier,
        });

        ServerTextLabelController.append({
            uid: data.shaIdentifier,
            pos: { x: data.position.x, y: data.position.y, z: data.position.z + 0.5 },
            data: `~g~${data.data.state}`,
            maxDistance: PLANTCONTROLLER_SETTINGS.textLabelDistance,
        });
        this.createSeedingInteraction(player, newPlant);
        return await Database.insertData(newPlant, PLANTCONTROLLER_DATABASE.collectionName, false);
    }

    /**
     * Creates an interaction that allows the player to seed a plant.
     * @param {alt.Player} player - The player who is interacting with the plant.
     * @param {IPlants} data - The data of the plant.
     * @returns None
     */
    private static async createSeedingInteraction(player: alt.Player, data: IPlants) {
        if (!data.data.seeds) {
            InteractionController.add({
                type: 'PlantController',
                identifier: data.shaIdentifier,
                description: `${PLANTCONTROLLER_TRANSLATIONS.seedingInteraction}`,
                position: { x: data.position.x, y: data.position.y, z: data.position.z },
                disableMarker: true,
                range: PLANTCONTROLLER_SETTINGS.interactionRange,
                callback: () => {
                    seeds.forEach(async (seed, i) => {
                        const itemToSeed = await ItemFactory.get(seed.name);
                        const hasSeeds = playerFuncs.inventory.isInInventory(player, { name: itemToSeed.name });
                        if (hasSeeds) {
                            if (hasSeeds.index === 0) {
                                if (
                                    PLANTCONTROLLER_ANIMATIONS.seedingAnimName != 'default' &&
                                    PLANTCONTROLLER_ANIMATIONS.seedingAnimDict != 'default'
                                ) {
                                    playerFuncs.emit.animation(
                                        player,
                                        PLANTCONTROLLER_ANIMATIONS.seedingAnimDict,
                                        PLANTCONTROLLER_ANIMATIONS.seedingAnimName,
                                        ANIMATION_FLAGS.NORMAL,
                                        PLANTCONTROLLER_ANIMATIONS.seedingAnimDuration,
                                    );
                                    alt.setTimeout(() => {
                                        data.data.seeds = true;
                                        data.data.state = PLANTCONTROLLER_TRANSLATIONS.fertilizerRequired;
                                        data.data.type = itemToSeed.data.type;
                                        data.data.variety = itemToSeed.data.variety;
                                        data.data.remaining = itemToSeed.data.time;
                                        data.data.startTime = itemToSeed.data.time;
                                        this.updatePlant(data._id, data);
                                        player.data.inventory[hasSeeds.index].quantity = -1;
                                        if (player.data.inventory[hasSeeds.index].quantity <= 1) {
                                            playerFuncs.inventory.findAndRemove(player, itemToSeed.name);
                                        }
                                        playerFuncs.save.field(player, 'inventory', player.data.inventory);
                                        playerFuncs.sync.inventory(player);
                                        this.createFertilizingInteraction(player, data);
                                        return;
                                    }, PLANTCONTROLLER_ANIMATIONS.seedingAnimDuration);
                                } else {
                                    data.data.seeds = true;
                                    data.data.state = PLANTCONTROLLER_TRANSLATIONS.fertilizerRequired;
                                    data.data.type = itemToSeed.data.type;
                                    data.data.variety = itemToSeed.data.variety;
                                    data.data.remaining = itemToSeed.data.time;
                                    data.data.startTime = itemToSeed.data.time;
                                    this.updatePlant(data._id, data);
                                    player.data.inventory[hasSeeds.index].quantity = -1;
                                    if (player.data.inventory[hasSeeds.index].quantity <= 1) {
                                        playerFuncs.inventory.findAndRemove(player, itemToSeed.name);
                                    }
                                    playerFuncs.save.field(player, 'inventory', player.data.inventory);
                                    playerFuncs.sync.inventory(player);
                                    this.createFertilizingInteraction(player, data);
                                    return;
                                }
                            } else {
                                return;
                            }
                        }
                    });
                },
            });
        }
    }

    /**
     * When the player interacts with a plant, if it's not fertilized, then it will be fertilized.
     * @param {alt.Player} player - The player who is interacting with the plant.
     * @param {IPlants} data - The data of the plant.
     * @returns None
     */
    private static createFertilizingInteraction(player: alt.Player, data: IPlants) {
        this.removeInteraction(data);
        if (!data.data.fertilized) {
            InteractionController.add({
                type: 'PlantController',
                identifier: data.shaIdentifier,
                description: `${PLANTCONTROLLER_TRANSLATIONS.fertilizingInteraction}`,
                position: data.position,
                disableMarker: true,
                range: PLANTCONTROLLER_SETTINGS.interactionRange,
                callback: () => {
                    if (
                        PLANTCONTROLLER_ANIMATIONS.fertilizingAnimName != 'default' &&
                        PLANTCONTROLLER_ANIMATIONS.fertilizingAnimDict != 'default'
                    ) {
                        playerFuncs.emit.animation(
                            player,
                            PLANTCONTROLLER_ANIMATIONS.fertilizingAnimDict,
                            PLANTCONTROLLER_ANIMATIONS.fertilizingAnimName,
                            ANIMATION_FLAGS.NORMAL,
                            PLANTCONTROLLER_ANIMATIONS.fertilizingAnimDuration,
                        );
                        alt.setTimeout(() => {
                            data.data.fertilized = true;
                            data.data.state = PLANTCONTROLLER_TRANSLATIONS.waterRequired;
                            this.updatePlant(data._id, data);
                            this.createWaterInteraction(data);
                        }, PLANTCONTROLLER_ANIMATIONS.fertilizingAnimDuration);
                    } else {
                        data.data.fertilized = true;
                        data.data.state = PLANTCONTROLLER_TRANSLATIONS.waterRequired;
                        this.updatePlant(data._id, data);
                        this.createWaterInteraction(data);
                    }
                },
            });
        }
    }

    /**
     * If the plant is fertilized, water it.
     * @param {alt.Player} player - The player who is interacting with the plant.
     * @param {IPlants} data - The data of the plant.
     * @returns None
     */
    private static async createWaterInteraction(data: IPlants) {
        this.removeInteraction(data);
        if (data.data.seeds && data.data.fertilized && data.data.water <= 30) {
            InteractionController.add({
                type: 'PlantController',
                identifier: data.shaIdentifier,
                description: `${PLANTCONTROLLER_TRANSLATIONS.waterInteraction}`,
                position: data.position,
                disableMarker: true,
                range: PLANTCONTROLLER_SETTINGS.interactionRange,
                callback: async (player: alt.Player) => {
                    const itemToWater = await ItemFactory.get(PLANTCONTROLLER_ITEMS.waterItemName);
                    const hasWater = playerFuncs.inventory.isInInventory(player, { name: itemToWater.name });
                    if (
                        PLANTCONTROLLER_ANIMATIONS.waterAnimName != 'default' &&
                        PLANTCONTROLLER_ANIMATIONS.waterAnimDict != 'default'
                    ) {
                        playerFuncs.emit.animation(player, PLANTCONTROLLER_ANIMATIONS.waterAnimDict, PLANTCONTROLLER_ANIMATIONS.waterAnimName, ANIMATION_FLAGS.NORMAL, PLANTCONTROLLER_ANIMATIONS.waterAnimDuration);
                        alt.setTimeout(() => {
                            if (data.data.water >= 100) {
                                data.data.water = 100;
                                return;
                            }
                            data.data.water += itemToWater.data.amount;
                            data.data.state = PLANTCONTROLLER_TRANSLATIONS.waterRequired;
                            this.updatePlant(data._id, data);
                        }, PLANTCONTROLLER_ANIMATIONS.waterAnimDuration);
                    } else {
                        if (data.data.water >= 100) {
                            data.data.water = 100;
                            return;
                        }
                        data.data.water += itemToWater.data.amount;
                        data.data.state = PLANTCONTROLLER_TRANSLATIONS.waterRequired;
                        this.updatePlant(data._id, data);
                    }
                    this.removeInteraction(data);
                },
            });
        }
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
     * Update a plant in the database.
     * @param {string} id - The id of the plant to update.
     * @param {IPlants} data - IPlants
     * @returns A boolean value.
     */
    private static async updatePlant(id: string, data: IPlants): Promise<Boolean | null> {
        const updateDocument: IPlants = {
            _id: data._id,
            shaIdentifier: data.shaIdentifier,
            model: data.model,
            data: {
                owner: data.data.owner,
                variety: data.data.variety,
                type: data.data.type,
                seeds: data.data.seeds,
                fertilized: data.data.fertilized,
                state: data.data.state,
                remaining: data.data.remaining,
                startTime: data.data.startTime,
                water: data.data.water,
                harvestable: data.data.harvestable,
            },
            position: data.position,
        };
        this.refreshLabels(data);
        return await Database.updatePartialData(id, updateDocument, PLANTCONTROLLER_DATABASE.collectionName);
    }

    public static async loadPlants() {
        const allPlants = await Database.fetchAllData<IPlants>(PLANTCONTROLLER_DATABASE.collectionName);
        allPlants.forEach((data, i) => {
            ServerObjectController.remove(data.shaIdentifier);
            ServerObjectController.append({
                pos: { x: data.position.x, y: data.position.y, z: data.position.z },
                model: data.model,
                uid: data.shaIdentifier,
            });
            if (!data.data.harvestable) {
                ServerTextLabelController.append({
                    uid: data.shaIdentifier,
                    pos: { x: data.position.x, y: data.position.y, z: data.position.z + 0.5 },
                    data: `~g~${data.data.variety} ~w~| ~g~${data.data.type}~n~~n~~g~${data.data.state}~n~~n~~b~${data.data.water}% ~w~| ~g~${data.data.remaining}m`,
                });
            } else if (data.data.harvestable) {
                ServerTextLabelController.append({
                    uid: data.shaIdentifier,
                    pos: { x: data.position.x, y: data.position.y, z: data.position.z + 0.5 },
                    data: `~g~${data.data.variety} ~w~| ~g~${data.data.type}~n~~g~${PLANTCONTROLLER_TRANSLATIONS.harvestable}`,
                });
            }
        });
    }
    /**
     * Update all plants in the database.
     * @returns None
     */
    public static async updateAllPlants() {
        const allPlants = await Database.fetchAllData<IPlants>(PLANTCONTROLLER_DATABASE.collectionName);
        allPlants.forEach(async (plant, i) => {
            if (plant.data.water > 0 && plant.data.remaining > 0) {
                plant.data.water -= 1;
                plant.data.remaining -= 1;
                if (plant.data.remaining === plant.data.startTime / 2) {
                    ServerObjectController.remove(plant.shaIdentifier);
                    ServerObjectController.append({
                        pos: { x: plant.position.x, y: plant.position.y, z: plant.position.z },
                        model: PLANTCONTROLLER_SETTINGS.mediumPot,
                        uid: plant.shaIdentifier,
                    });
                    plant.model = PLANTCONTROLLER_SETTINGS.mediumPot;
                }
                if (plant.data.water <= 20) {
                    this.createWaterInteraction(plant);
                }
                await Database.updatePartialData(plant._id, plant, PLANTCONTROLLER_DATABASE.collectionName);
                this.refreshLabels(plant);
            } else if (plant.data.remaining === 0) {
                plant.data.harvestable = true;

                ServerTextLabelController.remove(plant.shaIdentifier);
                ServerTextLabelController.append({
                    uid: plant.shaIdentifier,
                    pos: { x: plant.position.x, y: plant.position.y, z: plant.position.z + 0.5 },
                    data: `~g~${plant.data.variety} ~w~| ~g~${plant.data.type}~n~~g~${PLANTCONTROLLER_TRANSLATIONS.harvestable}`,
                });

                if (plant.model !== PLANTCONTROLLER_SETTINGS.largePot) {
                    plant.model = PLANTCONTROLLER_SETTINGS.largePot;
                    ServerObjectController.remove(plant.shaIdentifier);
                    ServerObjectController.append({
                        pos: { x: plant.position.x, y: plant.position.y, z: plant.position.z },
                        model: PLANTCONTROLLER_SETTINGS.largePot,
                        uid: plant.shaIdentifier,
                    });
                }

                InteractionController.add({
                    type: 'PlantController',
                    identifier: plant.shaIdentifier,
                    description: 'Harvest',
                    position: plant.position as alt.Vector3,
                    callback: async (player: alt.Player) => {
                        ServerTextLabelController.remove(plant.shaIdentifier);
                        const emptySlot = playerFuncs.inventory.getFreeInventorySlot(player);
                        ServerObjectController.remove(plant.shaIdentifier);
                        buds.forEach(async (bud, i) => {
                            if (plant.data.variety === bud.variety) {
                                const harvestedItem = await ItemFactory.get(bud.name);
                                harvestedItem.quantity = harvestedItem.data.amount;
                                playerFuncs.inventory.inventoryAdd(player, harvestedItem, emptySlot.slot);
                                playerFuncs.save.field(player, 'inventory', player.data.inventory);
                                playerFuncs.sync.inventory(player);
                            }
                        });
                        await Database.deleteById(plant._id, PLANTCONTROLLER_DATABASE.collectionName);
                        this.removeInteraction(plant);
                    },
                });
                await Database.updatePartialData(plant._id, plant, PLANTCONTROLLER_DATABASE.collectionName);
            }
        });
    }

    /**
     * Send a message to the Discord channel specified in the config.
     * @param {string} msg - The message to send to the channel.
     * @returns The plant object.
     */
    public static log(msg: string) {
        if (ATHENA_PLANTCONTROLLER.useDiscordLogs) {
            DiscordController.sendToChannel(ATHENA_PLANTCONTROLLER.discordChannel, msg);
        } else {
            alt.log('Please enable useDiscordLog to use this feature.');
            return;
        }
    }

    /**
     * generate a random unique ID for a player based on their name.
     * @param {alt.Player} player - The player that is being checked.
     * @returns A string of the random sha256 hash of the player's name.
     */
    public static generateShaId(player: alt.Player) {
        return sha256Random(player.data.name).toString();
    }
    /**
     * Remove the interaction from the InteractionController.
     * @param {IPlants} data - IPlants
     * @returns None
     */
    private static removeInteraction(data: IPlants) {
        InteractionController.remove('PlantController', data.shaIdentifier);
    }

    /**
     * It removes the text label from the screen, then re-adds it.
     * @param {IPlants} data - IPlants
     * @returns None
     */
    private static refreshLabels(data: IPlants) {
        const removed = ServerTextLabelController.remove(data.shaIdentifier);
        if (removed) {
            if (!data.data.harvestable) {
                ServerTextLabelController.append({
                    uid: data.shaIdentifier,
                    pos: { x: data.position.x, y: data.position.y, z: data.position.z + 0.5 },
                    data: `~g~${data.data.variety} ~w~| ~g~${data.data.type}~n~~n~~g~${data.data.state}~n~~n~~b~${data.data.water}% ~w~| ~g~${data.data.remaining} minutes`,
                });
            } else {
                ServerTextLabelController.remove(data.shaIdentifier);
                ServerTextLabelController.append({
                    uid: data.shaIdentifier,
                    pos: { x: data.position.x, y: data.position.y, z: data.position.z + 0.5 },
                    data: `~g~${data.data.variety} ~w~| ~g~${data.data.type}~n~~g~${PLANTCONTROLLER_TRANSLATIONS.harvestable}`,
                });
            }
        } else {
            alt.log('PlantController - Seems like TextLabelController is broken again. Please consider reaching out.');
        }
    }
}
