import * as alt from 'alt-server';
import {
    PLANTCONTROLLER_DATABASE,
    PLANTCONTROLLER_SETTINGS,
    PLANTCONTROLLER_SPOTS,
    PLANTCONTROLLER_TRANSLATIONS,
} from '../index';
import { Item } from '../../../shared/interfaces/item';
import { getVectorInFrontOfPlayer } from '../../../server/utility/vector';
import { PlantController } from '../PlantController';
import Database from '@stuyk/ezmongodb';
import IPlants from './interfaces/IPlants';
import { playerFuncs } from '../../../server/extensions/Player';
import { ItemFactory } from '../../../server/systems/item';
import { PLANTCONTROLLER_ITEMS } from './items/server-items';

/**
 * When the player clicks on the Plant Pot in inventory, the server will create a new pot for the
player.
 */
alt.on('PlantController:Server:CreatePot', async (player: alt.Player, data: Item) => {
    /**
     * Get the player's inventory and toolbar, and check if the plant controller item is in either.
     */
    const potItem = await ItemFactory.get(PLANTCONTROLLER_ITEMS.potItemName);
    const potInToolbar = playerFuncs.inventory.isInToolbar(player, potItem);
    const vectorInFront = getVectorInFrontOfPlayer(player, 1);
    const allPlants = await Database.fetchAllData<IPlants>(PLANTCONTROLLER_DATABASE.collectionName);

    /**
    * If the player is in an interior, and we don't want to allow interiors, then don't allow the
    player to plant a plant.
    */
    if (!PLANTCONTROLLER_SETTINGS.allowInterior) {
        if (player.data.interior != '0' && player.dimension != 0) return;
    }

    /**
     * If the player is within a certain distance of a plant, don't spawn a new plant.
     */
    for (let i = 0; i < allPlants.length; i++) {
        if (player.pos.isInRange(allPlants[i].position, PLANTCONTROLLER_SETTINGS.distanceBetweenPlants)) {
            return;
        }
    }

    /**
     * If the player is within a certain distance of a spot, and they have a pot in their inventory,
    they will place the pot on the spot.
     */
    if (PLANTCONTROLLER_SETTINGS.useSpots) {
        for (let x = 0; x < PLANTCONTROLLER_SPOTS.length; x++) {
            if (player.pos.isInRange(PLANTCONTROLLER_SPOTS[x], PLANTCONTROLLER_SETTINGS.distanceToSpot)) {
                if (!player.pos.isInRange(PLANTCONTROLLER_SPOTS[x], PLANTCONTROLLER_SETTINGS.distanceToSpot)) {
                    continue;
                } else {
                    if (potInToolbar) {
                        PlantController.addPlant(player, {
                            model: PLANTCONTROLLER_SETTINGS.smallPot,
                            shaIdentifier: PlantController.generateShaId(player),
                            data: {
                                owner: player.data.name,
                                variety: '',
                                type: '',
                                seeds: false,
                                fertilized: false,
                                state: PLANTCONTROLLER_TRANSLATIONS.seedsRequired,
                                remaining: -1, // Don't touch. Different Times for Different Seeds? ;)
                                startTime: -1, // Don't touch.
                                water: 0,
                                harvestable: false,
                            },
                            position: { x: vectorInFront.x, y: vectorInFront.y, z: vectorInFront.z - 1 } as alt.Vector3,
                        });
                        player.data.toolbar[potInToolbar.index].quantity -= 1;
                        if (player.data.toolbar[potInToolbar.index].quantity <= 1) {
                            playerFuncs.inventory.toolbarRemove(player, potInToolbar.index);
                        }
                        playerFuncs.save.field(player, 'tooolbar', player.data.toolbar);
                        playerFuncs.sync.inventory(player);
                       // continue;
                    } else break;
                }
            }
        }
    }
});
