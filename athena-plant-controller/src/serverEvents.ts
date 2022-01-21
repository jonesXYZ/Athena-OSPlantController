import * as alt from 'alt-server';
import { animations, ATHENA_PLANTCONTROLLER, PLANTCONTROLLER_SETTINGS, PLANTCONTROLLER_SPOTS } from '../index';
import { Item } from '../../../shared/interfaces/item';
import Database from '@stuyk/ezmongodb';
import IPlants from './interfaces/IPlants';
import { playerFuncs } from '../../../server/extensions/extPlayer';
import { INVENTORY_TYPE } from '../../../shared/enums/inventoryTypes';
import { ItemEffects } from '../../../server/systems/itemEffects';
import { PlantController } from './controller';
import IAttachable from '../../../shared/interfaces/iAttachable';
import { ServerObjectController } from '../../../server/streamers/object';
import { ServerTextLabelController } from '../../../server/streamers/textlabel';
import { buds } from './serverItems';
import { ItemFactory } from '../../../server/systems/item';

ItemEffects.add(
    'PlantController:Server:CreatePot',
    async (player: alt.Player, item: Item, slot: number, type: INVENTORY_TYPE) => {
        if (!item) return;

        if (!PLANTCONTROLLER_SETTINGS.allowInterior) {
            if (player.data.interior || player.dimension != 0) return;
        }

        const allPlants = await Database.fetchAllData<IPlants>(ATHENA_PLANTCONTROLLER.collection);

        for (let x = 0; x < allPlants.length; x++) {
            let currentPlant = allPlants[x];
            if (player.pos.isInRange(currentPlant.position, PLANTCONTROLLER_SETTINGS.distanceBetweenPlants)) {
                return;
            }
        }

        if (PLANTCONTROLLER_SETTINGS.useSpots) {
            PLANTCONTROLLER_SPOTS.forEach((spot) => {
                if (player.pos.isInRange(spot, PLANTCONTROLLER_SETTINGS.distanceToSpot)) {
                    if (type === INVENTORY_TYPE.TOOLBAR) {
                        const index = player.data.toolbar.findIndex((i) => i && i.slot === item.slot)
                        const realItem = player.data.toolbar[index];
                        realItem.quantity --;
                        if (realItem.quantity <= 1) {
                            playerFuncs.inventory.toolbarRemove(player, realItem.slot);
                        }
                        const objToAttach: IAttachable = {
                            bone: 57005,
                            model: 'prop_cs_trowel',
                            pos: { x: 0.1, y: 0.01, z: -0.03 } as alt.Vector3,
                            rot: { x: 130, y: 70, z: -5 } as alt.Vector3,
                        };
                        playerFuncs.emit.objectAttach(player, objToAttach, 5000);
                        playerFuncs.emit.animation(
                            player,
                            animations[0].dict,
                            animations[0].name,
                            animations[0].flags,
                            5000,
                        );
                        resyncInventory(player);
                        alt.setTimeout(() => {
                            PlantController.addPlant(player, 'Requires Seeds.');
                        }, 5000);
                    } else {
                        playerFuncs.emit.notification(player, `Only works in Toolbar.`);
                    }
                }
            });
        }
    },
);

ItemEffects.add(
    'PlantController:Server:SeedPot',
    async (player: alt.Player, item: Item, slot: number, type: INVENTORY_TYPE) => {
        if (!item) return;

        if (!PLANTCONTROLLER_SETTINGS.allowInterior) {
            if (player.data.interior || player.dimension != 0) return;
        }

        const data = await Database.fetchAllData<IPlants>(ATHENA_PLANTCONTROLLER.collection);
        data.forEach(async (plant) => {
            if (
                player.pos.isInRange(plant.position, 1.5) &&
                plant.types.variety === 'N/A' &&
                plant.types.type === 'N/A'
            ) {
                if (type === INVENTORY_TYPE.TOOLBAR) {
                    const index = player.data.toolbar.findIndex((i) => i && i.slot === item.slot)
                    const realItem = player.data.toolbar[index];
                    realItem.quantity --;
                    if (realItem.quantity <= 1) {
                        playerFuncs.inventory.toolbarRemove(player, realItem.slot);
                    }
                    alt.log(item.quantity);
                    const objToAttach: IAttachable = {
                        bone: 57005,
                        model: 'prop_cs_trowel',
                        pos: { x: 0.1, y: 0.01, z: -0.03 } as alt.Vector3,
                        rot: { x: 130, y: 70, z: -5 } as alt.Vector3,
                    };
                    playerFuncs.emit.objectAttach(player, objToAttach, 5000);
                    playerFuncs.emit.animation(
                        player,
                        animations[1].dict,
                        animations[1].name,
                        animations[1].flags,
                        5000,
                    );
                    alt.setTimeout(async () => {
                        plant.data.isSeeds = true;
                        plant.data.state = 'Requires Fertilizer';
                        plant.data.required = item.data.time;
                        plant.data.remaining = item.data.time;
                        plant.types.type = item.data.type;
                        plant.types.variety = item.data.variety;

                        PlantController.updateTextlabels(plant);
                        await Database.updatePartialData(
                            plant._id,
                            { data: plant.data, types: plant.types },
                            ATHENA_PLANTCONTROLLER.collection,
                        );

                        resyncInventory(player);
                    }, 5000);
                } else {
                    playerFuncs.emit.notification(player, `Only works in Toolbar or pot is already seeded.`);
                    return;
                }
            }
        });
    },
);

ItemEffects.add(
    'PlantController:Server:FertilizePot',
    async (player: alt.Player, item: Item, slot: number, type: INVENTORY_TYPE) => {
        if (!item) return;

        if (!PLANTCONTROLLER_SETTINGS.allowInterior) {
            if (player.data.interior || player.dimension != 0) return;
        }

        const data = await Database.fetchAllData<IPlants>(ATHENA_PLANTCONTROLLER.collection);
        data.forEach(async (plant) => {
            if (player.pos.isInRange(plant.position, 1.5) && plant.data.isFertilized === false) {
                if (type === INVENTORY_TYPE.TOOLBAR) {
                    const index = player.data.toolbar.findIndex((i) => i && i.slot === item.slot)
                    const realItem = player.data.toolbar[index];
                    realItem.quantity --;
                    if (realItem.quantity <= 1) {
                        playerFuncs.inventory.toolbarRemove(player, realItem.slot);
                    }
                    alt.log(item.quantity);
                    const objToAttach: IAttachable = {
                        bone: 57005,
                        model: 'prop_cs_trowel',
                        pos: { x: 0.1, y: 0.01, z: -0.03 } as alt.Vector3,
                        rot: { x: 130, y: 70, z: -5 } as alt.Vector3,
                    };
                    playerFuncs.emit.objectAttach(player, objToAttach, 5000);
                    playerFuncs.emit.animation(
                        player,
                        animations[2].dict,
                        animations[2].name,
                        animations[2].flags,
                        5000,
                    );
                    alt.setTimeout(async () => {
                        plant.data.isFertilized = true;
                        plant.data.state = 'Requires Water';

                        await Database.updatePartialData(
                            plant._id,
                            { data: plant.data },
                            ATHENA_PLANTCONTROLLER.collection,
                        );
                        PlantController.updateTextlabels(plant);
                        resyncInventory(player);
                    }, 5000);
                }
            }
        });
    },
);

ItemEffects.add(
    'PlantController:Server:WaterPot',
    async (player: alt.Player, item: Item, slot: number, type: INVENTORY_TYPE) => {
        if (!item) return;

        if (!PLANTCONTROLLER_SETTINGS.allowInterior) {
            if (player.data.interior || player.dimension != 0) return;
        }

        const data = await Database.fetchAllData<IPlants>(ATHENA_PLANTCONTROLLER.collection);
        data.forEach(async (plant) => {
            if (player.pos.isInRange(plant.position, 1.5) && plant.data.isFertilized === true) {
                if (type === INVENTORY_TYPE.TOOLBAR) {
                    const index = player.data.toolbar.findIndex((i) => i && i.slot === item.slot)
                    const realItem = player.data.toolbar[index];
                    realItem.quantity--;
                    if (item.quantity <= 1) {
                        playerFuncs.inventory.toolbarRemove(player, realItem.slot);
                    }
                    alt.log(item.quantity);
                    const objToAttach: IAttachable = {
                        bone: 57005,
                        model: 'prop_wateringcan',
                        pos: { x: 0.31, y: -0.13, z: -0.12 } as alt.Vector3,
                        rot: { x: -55, y: 0, z: 0 } as alt.Vector3,
                    };
                    playerFuncs.emit.objectAttach(player, objToAttach, 5000);
                    playerFuncs.emit.animation(
                        player,
                        animations[3].dict,
                        animations[3].name,
                        animations[3].flags,
                        5000,
                    );
                    alt.setTimeout(async () => {
                        plant.data.water += item.data.amount;
                        PlantController.updateTextlabels(plant);
                        await Database.updatePartialData(
                            plant._id,
                            { data: plant.data },
                            ATHENA_PLANTCONTROLLER.collection,
                        );
                        resyncInventory(player);
                    }, 5000);
                }
            }
        });
    },
);

ItemEffects.add('PlantController-HarvestPot', async (player: alt.Player, item: Item, slot: number, type: INVENTORY_TYPE) => {
    if (!item) return;

    if (!PLANTCONTROLLER_SETTINGS.allowInterior) {
        if (player.data.interior || player.dimension != 0) return;
    }

    const data = await Database.fetchAllData<IPlants>(ATHENA_PLANTCONTROLLER.collection);
    const emptySlot = playerFuncs.inventory.getFreeInventorySlot(player);
    data.forEach(async (plant) => { 
        if (player.pos.isInRange(plant.position, 1.5) && plant.data.isHarvestable === true) {
            if (type === INVENTORY_TYPE.TOOLBAR) {
                const index = player.data.toolbar.findIndex((i) => i && i.slot === item.slot)
                const realItem = player.data.toolbar[index];
                realItem.data.durability --;
                if(realItem.data.durability <= 1) {
                    playerFuncs.inventory.toolbarRemove(player, realItem.slot);
                }
                buds.forEach(async (bud) => {
                    if(bud.data.variety === plant.types.variety && bud.data.type === plant.types.type) {
                        const budAdd = await ItemFactory.get(bud.dbName);
                        if(PLANTCONTROLLER_SETTINGS.randomizeOutcome) {
                            const rndAmount = getRandomInt(0, budAdd.quantity);
                            budAdd.quantity = rndAmount;
                            playerFuncs.inventory.inventoryAdd(player, budAdd, emptySlot.slot);
                        } else {
                            playerFuncs.inventory.inventoryAdd(player, budAdd, emptySlot.slot);
                        }
                        resyncInventory(player);
                    }
                });
                ServerObjectController.remove(plant.data.shaIdentifier);
                ServerTextLabelController.remove(plant.data.shaIdentifier);
            } else {
                playerFuncs.emit.notification(player, `Only works in Toolbar.`);
                return;
            }
        }
    });
});

function resyncInventory(player: alt.Player) {
    playerFuncs.save.field(player, 'inventory', player.data.inventory);
    playerFuncs.save.field(player, 'toolbar', player.data.toolbar);
    playerFuncs.sync.inventory(player);
    alt.log(JSON.stringify(player.data.toolbar));
}

function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
