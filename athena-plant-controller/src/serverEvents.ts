import * as alt from 'alt-server';
import {
    PLANTCONTROLLER_DATABASE,
    PLANTCONTROLLER_SETTINGS,
    PLANTCONTROLLER_SPOTS,
    PLANTCONTROLLER_TRANSLATIONS,
} from '../index';
import { Item } from '../../../shared/interfaces/item';
import { getVectorInFrontOfPlayer } from '../../../server/utility/vector';
import { PlantController } from './controller';
import Database from '@stuyk/ezmongodb';
import IPlants from './interfaces/IPlants';
import { ITEM_TYPE } from '../../../shared/enums/itemTypes';
import { ItemFactory } from '../../../server/systems/item';
import { playerFuncs } from '../../../server/extensions/extPlayer';

/**
 * When the player clicks on the Plant Pot in inventory, the server will create a new pot for the
player.
 */
alt.on('PlantController:Server:CreatePot', async (player: alt.Player, data: Item) => {
    const potItem = await ItemFactory.getByName('Plant Pot');
    const potInInventory = playerFuncs.inventory.isInInventory(player, { name: potItem.name });
    const potInToolbar = playerFuncs.inventory.isInToolbar(player, { name: potItem.name });

    const vectorInFront = getVectorInFrontOfPlayer(player, 1);
    const allPlants = await Database.fetchAllData<IPlants>(PLANTCONTROLLER_DATABASE.collectionName);

    for (let x = 0; x < allPlants.length; x++) {
        let currentPlant = allPlants[x];
        if (player.pos.isInRange(currentPlant.position, PLANTCONTROLLER_SETTINGS.distanceBetweenPlants)) {
            if (potInInventory) {
                if (potItem.behavior !== ITEM_TYPE.SKIP_CONSUMABLE) {
                    potItem.behavior = ITEM_TYPE.SKIP_CONSUMABLE;
                    player.data.inventory[potInInventory.index].quantity += 1;
                    playerFuncs.save.field(player, 'inventory', player.data.inventory);
                    playerFuncs.sync.inventory(player);
                    return;
                }
            }

            if (potInToolbar) {
                potItem.behavior = ITEM_TYPE.SKIP_CONSUMABLE;
                player.data.toolbar[potInInventory.index].quantity += 1;
                playerFuncs.save.field(player, 'toolbar', player.data.toolbar);
                playerFuncs.sync.inventory(player);
                return;
            }
            return;
        }
    }
    if (!PLANTCONTROLLER_SETTINGS.allowInterior) {
        if (!player.data.interior && player.dimension != 0) return;
    }

    if (PLANTCONTROLLER_SETTINGS.useSpots) {
        PLANTCONTROLLER_SPOTS.forEach((spot, i) => {
            if (player.pos.isInRange(PLANTCONTROLLER_SPOTS[i], PLANTCONTROLLER_SETTINGS.distanceToSpot)) {
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
                return;
            }
        });
    }
});
