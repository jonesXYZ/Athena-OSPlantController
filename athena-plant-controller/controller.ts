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
import { InteractionController } from '../../server/systems/interaction';
import { sha256Random } from '../../server/utility/encryption';
import { ItemFactory } from '../../server/systems/item';
import { buds, plantItems, seeds } from './src/serverItems';

import { ANIMATION_FLAGS } from '../../shared/flags/animationFlags';
import IPlants from './src/interfaces/IPlants';
import { playerFuncs } from '../../server/extensions/extPlayer';

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

        this.createSeedingInteraction(newPlant);
        return await Database.insertData(newPlant, PLANTCONTROLLER_DATABASE.collectionName, false);
    }

    /**
     * Creates an interaction that allows the player to seed a plant.
     * @param {alt.Player} player - The player who is interacting with the plant.
     * @param {IPlants} data - The data of the plant.
     * @returns None
     */
    private static async createSeedingInteraction(plant: IPlants) {
        if (!plant.data.seeds) {
            InteractionController.add({
                uid: plant.shaIdentifier,
                description: `${PLANTCONTROLLER_TRANSLATIONS.seedingInteraction}`,
                position: { x: plant.position.x, y: plant.position.y, z: plant.position.z },
                range: PLANTCONTROLLER_SETTINGS.interactionRange,
                callback: async (player: alt.Player) => {
                    let itemToSeed = null;
                    let hasSeeds = null;
                    for (let x = 0; x < seeds.length; x++) {
                        let currentSeed = seeds[x];
                        itemToSeed = await ItemFactory.get(currentSeed.dbName);
                        hasSeeds = playerFuncs.inventory.isInToolbar(player, { name: itemToSeed.name });
                    }
                    alt.log(hasSeeds);
                    if (hasSeeds) {
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
                                plant.data.seeds = true;
                                plant.data.state = PLANTCONTROLLER_TRANSLATIONS.fertilizerRequired;
                                plant.data.type = itemToSeed.data.type;
                                plant.data.variety = itemToSeed.data.variety;
                                plant.data.remaining = itemToSeed.data.time;
                                plant.data.startTime = itemToSeed.data.time;

                                this.updatePlant(plant._id, plant);

                                player.data.toolbar[hasSeeds.index].quantity -= 1;
                                if (player.data.toolbar[hasSeeds.index].quantity <= 1) {
                                    playerFuncs.inventory.toolbarRemove(player, player.data.toolbar[hasSeeds.index].slot);
                                }

                                playerFuncs.save.field(player, 'toolbar', player.data.toolbar);
                                playerFuncs.sync.inventory(player);

                                this.createFertilizingInteraction(plant);
                                return;
                            }, PLANTCONTROLLER_ANIMATIONS.seedingAnimDuration);
                        } else {
                            plant.data.seeds = true;
                            plant.data.state = PLANTCONTROLLER_TRANSLATIONS.fertilizerRequired;
                            plant.data.type = itemToSeed.data.type;
                            plant.data.variety = itemToSeed.data.variety;
                            plant.data.remaining = itemToSeed.data.time;
                            plant.data.startTime = itemToSeed.data.time;

                            this.updatePlant(plant._id, plant);

                            player.data.toolbar[hasSeeds.index].quantity -= 1;
                            playerFuncs.save.field(player, 'toolbar', player.data.toolbar);
                            playerFuncs.sync.inventory(player);
                            if (player.data.toolbar[hasSeeds.index].quantity <= 1) {
                                playerFuncs.inventory.toolbarRemove(player, player.data.toolbar[hasSeeds.index].slot);
                                playerFuncs.save.field(player, 'toolbar', player.data.toolbar);
                                playerFuncs.sync.inventory(player);
                                return;
                            }

                            this.createFertilizingInteraction(plant);
                            return;
                        }
                    } else {
                        playerFuncs.emit.notification(player, `No Seeds or move Seeds to Toolbar Slot 1`);
                        return;
                    }
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
    private static async createFertilizingInteraction(plant: IPlants) {
        this.removeInteraction(plant);
        if (!plant.data.fertilized) {
            InteractionController.add({
                uid: plant.shaIdentifier,
                description: `${PLANTCONTROLLER_TRANSLATIONS.fertilizingInteraction}`,
                position: plant.position,
                range: PLANTCONTROLLER_SETTINGS.interactionRange,
                callback: async (player: alt.Player) => {
                    const fertilizerItem = await ItemFactory.getByName(`Fertilizer`);
                    const hasFertilizer = playerFuncs.inventory.isInInventory(player, { name: fertilizerItem.name });
                    if (hasFertilizer) {
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
                                plant.data.fertilized = true;
                                plant.data.state = PLANTCONTROLLER_TRANSLATIONS.waterRequired;
                                this.updatePlant(plant._id, plant);
                                this.createWaterInteraction(plant);
                                player.data.inventory[hasFertilizer.index].quantity -= 1;
                                if (player.data.inventory[hasFertilizer.index].quantity <= 1) {
                                    playerFuncs.inventory.findAndRemove(player, fertilizerItem.name);
                                }
                                playerFuncs.save.field(player, 'inventory', player.data.inventory);
                                playerFuncs.sync.inventory(player);
                            }, PLANTCONTROLLER_ANIMATIONS.fertilizingAnimDuration);
                        } else {
                            plant.data.fertilized = true;
                            plant.data.state = PLANTCONTROLLER_TRANSLATIONS.waterRequired;
                            this.updatePlant(plant._id, plant);
                            this.createWaterInteraction(plant);
                            if (player.data.inventory[hasFertilizer.index].quantity <= 1) {
                                playerFuncs.inventory.findAndRemove(player, fertilizerItem.name);
                            }
                            player.data.inventory[hasFertilizer.index].quantity -= 1;
                            playerFuncs.save.field(player, 'inventory', player.data.inventory);
                            playerFuncs.sync.inventory(player);
                        }
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
    private static async createWaterInteraction(plant: IPlants) {
        this.removeInteraction(plant);
        if (plant.data.seeds && plant.data.fertilized && plant.data.water <= 30) {
            InteractionController.add({
                uid: plant.shaIdentifier,
                description: `${PLANTCONTROLLER_TRANSLATIONS.waterInteraction}`,
                position: plant.position,
                range: PLANTCONTROLLER_SETTINGS.interactionRange,
                callback: async (player: alt.Player) => {
                    const itemToWater = await ItemFactory.getByName(`Plantwater`);
                    const hasWater = playerFuncs.inventory.isInInventory(player, { name: itemToWater.name });
                    if (hasWater) {
                        if (
                            PLANTCONTROLLER_ANIMATIONS.waterAnimName != 'default' &&
                            PLANTCONTROLLER_ANIMATIONS.waterAnimDict != 'default'
                        ) {
                            playerFuncs.emit.animation(
                                player,
                                PLANTCONTROLLER_ANIMATIONS.waterAnimDict,
                                PLANTCONTROLLER_ANIMATIONS.waterAnimName,
                                ANIMATION_FLAGS.NORMAL,
                                PLANTCONTROLLER_ANIMATIONS.waterAnimDuration,
                            );

                            alt.setTimeout(() => {
                                player.data.inventory[hasWater.index].quantity -= 1;
                                if (player.data.inventory[hasWater.index].quantity <= 1) {
                                    playerFuncs.inventory.findAndRemove(player, itemToWater.name);
                                }
                                playerFuncs.save.field(player, 'inventory', player.data.inventory);
                                playerFuncs.sync.inventory(player);
                                if (plant.data.water >= 100) {
                                    plant.data.water = 100;
                                    return;
                                }
                                plant.data.water += itemToWater.data.amount;
                                plant.data.state = PLANTCONTROLLER_TRANSLATIONS.waterRequired;
                                this.updatePlant(plant._id, plant);
                            }, PLANTCONTROLLER_ANIMATIONS.waterAnimDuration);
                        } else {
                            player.data.inventory[hasWater.index].quantity -= 1;
                            if (player.data.inventory[hasWater.index].quantity <= 1) {
                                playerFuncs.inventory.findAndRemove(player, itemToWater.name);
                            }
                            playerFuncs.save.field(player, 'inventory', player.data.inventory);
                            playerFuncs.sync.inventory(player);

                            if (plant.data.water >= 100) {
                                plant.data.water = 100;
                                return;
                            }

                            plant.data.water += itemToWater.data.amount;
                            plant.data.state = PLANTCONTROLLER_TRANSLATIONS.waterRequired;

                            this.updatePlant(plant._id, plant);
                        }
                    }
                    this.removeInteraction(plant);
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
    private static async updatePlant(id: string, plant: IPlants): Promise<Boolean | null> {
        const updateDocument: IPlants = {
            _id: plant._id,
            shaIdentifier: plant.shaIdentifier,
            model: plant.model,
            data: {
                owner: plant.data.owner,
                variety: plant.data.variety,
                type: plant.data.type,
                seeds: plant.data.seeds,
                fertilized: plant.data.fertilized,
                state: plant.data.state,
                remaining: plant.data.remaining,
                startTime: plant.data.startTime,
                water: plant.data.water,
                harvestable: plant.data.harvestable,
            },
            position: plant.position,
        };
        this.refreshLabels(plant);
        return await Database.updatePartialData(id, updateDocument, PLANTCONTROLLER_DATABASE.collectionName);
    }

    /**
     * Load all plants from the database and append them to the server.
     * @returns None
     */
    public static async loadPlants() {
        const allPlants = await Database.fetchAllData<IPlants>(PLANTCONTROLLER_DATABASE.collectionName);
        allPlants.forEach((plant, i) => {
            ServerObjectController.remove(plant.shaIdentifier);
            ServerObjectController.append({
                pos: { x: plant.position.x, y: plant.position.y, z: plant.position.z },
                model: plant.model,
                uid: plant.shaIdentifier,
            });

            if (!plant.data.seeds) {
                this.createSeedingInteraction(plant);
            } else if (!plant.data.fertilized) {
                this.createFertilizingInteraction(plant);
            } else if (plant.data.fertilized && plant.data.water === 0) {
                this.createWaterInteraction(plant);
            }

            if (!plant.data.harvestable) {
                if (plant.data.remaining === -1) {
                    ServerTextLabelController.append({
                        uid: plant.shaIdentifier,
                        pos: { x: plant.position.x, y: plant.position.y, z: plant.position.z + 0.5 },
                        data: `~g~${PLANTCONTROLLER_TRANSLATIONS.seedsRequired}`,
                    });
                } else {
                    ServerTextLabelController.append({
                        uid: plant.shaIdentifier,
                        pos: { x: plant.position.x, y: plant.position.y, z: plant.position.z + 0.5 },
                        data: `~g~${plant.data.variety} ~w~| ~g~${plant.data.type}~n~~n~~g~${plant.data.state}~n~~n~~b~${plant.data.water}% ~w~| ~g~${plant.data.remaining} minutes`,
                    });
                }
            } else if (plant.data.harvestable) {
                ServerTextLabelController.append({
                    uid: plant.shaIdentifier,
                    pos: { x: plant.position.x, y: plant.position.y, z: plant.position.z + 0.5 },
                    data: `~g~${plant.data.variety} ~w~| ~g~${plant.data.type}~n~~g~${PLANTCONTROLLER_TRANSLATIONS.harvestable}`,
                });
                this.createHarvestInteraction(plant);
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
                this.refreshLabels(plant);

                await Database.updatePartialData(plant._id, plant, PLANTCONTROLLER_DATABASE.collectionName);
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

                    this.createHarvestInteraction(plant);
                }
                await Database.updatePartialData(plant._id, plant, PLANTCONTROLLER_DATABASE.collectionName);
            }
        });
    }

    /**
     * Creates a harvest interaction for the plant.
     * @param {IPlants} data - IPlants
     * @returns None
     */
    private static async createHarvestInteraction(plant: IPlants) {
        InteractionController.add({
            uid: plant.shaIdentifier,
            description: 'Harvest',
            position: plant.position as alt.Vector3,
            range: PLANTCONTROLLER_SETTINGS.interactionRange,
            callback: async (player: alt.Player) => {
                const emptySlot = playerFuncs.inventory.getFreeInventorySlot(player);
                if (
                    PLANTCONTROLLER_ANIMATIONS.harvestAnimDict != '' &&
                    PLANTCONTROLLER_ANIMATIONS.harvestAnimName != ''
                ) {
                    playerFuncs.emit.animation(
                        player,
                        PLANTCONTROLLER_ANIMATIONS.harvestAnimDict,
                        PLANTCONTROLLER_ANIMATIONS.harvestAnimName,
                        ANIMATION_FLAGS.NORMAL,
                        PLANTCONTROLLER_ANIMATIONS.harvestAnimDuration,
                    );
                    alt.setTimeout(() => {
                        ServerTextLabelController.remove(plant.shaIdentifier);
                        ServerObjectController.remove(plant.shaIdentifier);

                        buds.forEach(async (bud, i) => {
                            if (plant.data.variety === bud.data.variety) {
                                const harvestedItem = await ItemFactory.get(bud.name);
                                harvestedItem.quantity = harvestedItem.data.amount;
                                playerFuncs.inventory.inventoryAdd(player, harvestedItem, emptySlot.slot);
                                playerFuncs.save.field(player, 'inventory', player.data.inventory);
                                playerFuncs.sync.inventory(player);
                            }
                        });
                    }, PLANTCONTROLLER_ANIMATIONS.harvestAnimDuration);
                } else {
                    buds.forEach(async (bud, i) => {
                        if (plant.data.variety === bud.data.variety) {
                            const harvestedItem = await ItemFactory.get(bud.name);
                            harvestedItem.quantity = harvestedItem.data.amount;
                            playerFuncs.inventory.inventoryAdd(player, harvestedItem, emptySlot.slot);
                            playerFuncs.save.field(player, 'inventory', player.data.inventory);
                            playerFuncs.sync.inventory(player);
                        }
                    });
                }
                await Database.deleteById(plant._id, PLANTCONTROLLER_DATABASE.collectionName);
                this.removeInteraction(plant);
            },
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
        InteractionController.remove(data.shaIdentifier);
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
