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
import { PLANTCONTROLLER_ITEMS } from './src/server-items';
import { playerFuncs } from '../../server/extensions/Player';

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
            pos: data.position,
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
        const itemToSeed = await ItemFactory.get(PLANTCONTROLLER_ITEMS.seedsItemName);
        const hasSeeds = playerFuncs.inventory.isInInventory(player, { name: itemToSeed.name });

        InteractionController.add({
            type: 'PlantController',
            identifier: JSON.stringify(data),
            description: `${PLANTCONTROLLER_TRANSLATIONS.seedingInteraction}`,
            position: data.position,
            disableMarker: true,
            range: PLANTCONTROLLER_SETTINGS.interactionRange,
            callback: () => {
                if (player.data.inventory[hasSeeds.index].quantity <= 0 || !hasSeeds) {
                    playerFuncs.emit.notification(player, `You need Seeds to do this.`);
                } else {
                    if (
                        PLANTCONTROLLER_ANIMATIONS.seedingAnimName != '' &&
                        PLANTCONTROLLER_ANIMATIONS.seedingAnimDict != ''
                    ) {
                        alt.setTimeout(() => {
                            data.data.seeds = true;
                            data.data.state = PLANTCONTROLLER_TRANSLATIONS.fertilizerRequired;
                            this.updatePlant(data._id, data);
                            InteractionController.remove('PlantController', JSON.stringify(data));
                            player.data.inventory[hasSeeds.index].quantity -1;
                            this.createFertilizingInteraction(player, data);
                        }, PLANTCONTROLLER_ANIMATIONS.seedingAnimDuration);
                    } else {
                        data.data.seeds = true;
                        data.data.state = PLANTCONTROLLER_TRANSLATIONS.fertilizerRequired;
                        this.updatePlant(data._id, data);
                        InteractionController.remove('PlantController', JSON.stringify(data));
                        player.data.inventory[hasSeeds.index].quantity -1;
                        this.createFertilizingInteraction(player, data);
                    }
                }
            },
        });
    }

    /**
     * When the player interacts with a plant, if it's not fertilized, then it will be fertilized.
     * @param {alt.Player} player - The player who is interacting with the plant.
     * @param {IPlants} data - The data of the plant.
     * @returns None
     */
    private static createFertilizingInteraction(player: alt.Player, data: IPlants) {
        InteractionController.add({
            type: 'PlantController',
            identifier: JSON.stringify(data),
            description: `${PLANTCONTROLLER_TRANSLATIONS.fertilizingInteraction}`,
            position: data.position,
            disableMarker: true,
            range: PLANTCONTROLLER_SETTINGS.interactionRange,
            callback: () => {
                if (
                    PLANTCONTROLLER_ANIMATIONS.fertilizingAnimName != '' &&
                    PLANTCONTROLLER_ANIMATIONS.fertilizingAnimDict != ''
                ) {
                    alt.setTimeout(() => {
                        data.data.fertilized = true;
                        data.data.state = PLANTCONTROLLER_TRANSLATIONS.waterRequired;
                        this.updatePlant(data._id, data);
                        InteractionController.remove('PlantController', JSON.stringify(data));
                    }, PLANTCONTROLLER_ANIMATIONS.seedingAnimDuration);
                } else {
                    data.data.fertilized = true;
                    data.data.state = PLANTCONTROLLER_TRANSLATIONS.waterRequired;
                    this.updatePlant(data._id, data);
                    InteractionController.remove('PlantController', JSON.stringify(data));
                    this.createWaterInteraction(player, data);
                }
            },
        });
    }

    /**
     * If the plant is fertilized, water it.
     * @param {alt.Player} player - The player who is interacting with the plant.
     * @param {IPlants} data - The data of the plant.
     * @returns None
     */
    private static async createWaterInteraction(player: alt.Player, data: IPlants) {
        const itemToWater = await ItemFactory.get(PLANTCONTROLLER_ITEMS.waterItemName);

        InteractionController.add({
            type: 'PlantController',
            identifier: JSON.stringify(data),
            description: `${PLANTCONTROLLER_TRANSLATIONS.waterInteraction}`,
            position: data.position,
            disableMarker: true,
            range: PLANTCONTROLLER_SETTINGS.interactionRange,
            callback: () => {
                if (
                    PLANTCONTROLLER_ANIMATIONS.fertilizingAnimName != '' &&
                    PLANTCONTROLLER_ANIMATIONS.fertilizingAnimDict != ''
                ) {
                    alt.setTimeout(() => {
                        data.data.fertilized = true;
                        data.data.state = PLANTCONTROLLER_TRANSLATIONS.waterRequired;
                        this.updatePlant(data._id, data);
                        InteractionController.remove('PlantController', JSON.stringify(data));
                    }, PLANTCONTROLLER_ANIMATIONS.seedingAnimDuration);
                } else {
                    data.data.water + itemToWater.data.amount;
                    data.data.state = PLANTCONTROLLER_TRANSLATIONS.waterRequired;
                    this.updatePlant(data._id, data);
                    InteractionController.remove('PlantController', JSON.stringify(data));
                    this.createWaterInteraction(player, data);
                }
            },
        });
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

    public static async updateAllPlants() {
        const allPlants = await Database.fetchAllData<IPlants>(PLANTCONTROLLER_DATABASE.collectionName);
        allPlants.forEach((plant, i) => {});
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
     * It removes the text label from the screen, then re-adds it.
     * @param {IPlants} data - IPlants
     * @returns None
     */
    private static refreshLabels(data: IPlants) {
        const removed = ServerTextLabelController.remove(data.shaIdentifier);
        if (removed) {
            ServerTextLabelController.append({
                uid: data.shaIdentifier,
                pos: { x: data.position.x, y: data.position.y, z: data.position.z + 0.5 },
                data: `~g~${data.data.variety} ~w~| ~g~${data.data.type}~n~~n~~g~${data.data.state}~n~~n~~b~${data.data.water}% ~w~| ~g~${data.data.remaining}m`,
            });
        } else {
            alt.log('PlantController - Seems like TextLabelController is broken again. Please consider reaching out.');
        }
    }
}
