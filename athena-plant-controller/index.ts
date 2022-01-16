import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import { PluginSystem } from '../../server/systems/plugins';
import { ServerBlipController } from '../../server/systems/blip';
import { SYSTEM_EVENTS } from '../../shared/enums/system';

<<<<<<< HEAD:AthenaPlantController/index.ts
import './src/serverEvents';
import './src/serverItems';
import { PlantController } from './controller';
=======
import './src/server-events';
import './src/server-items';
import { PlantController } from './PlantController';
>>>>>>> e1c4d8669de3e2a1da56bf660b53d554945a066c:athena-plant-controller/index.ts

export const ATHENA_PLANTCONTROLLER = {
    name: 'PlantController',
    version: 'v1.0',
    useDiscordLogs: false,
    discordChannel: 'someChannelId',
};

export const PLANTCONTROLLER_DATABASE = {
    collectionName: 'plants', // Change me before booting if you need to.
};

export const PLANTCONTROLLER_SETTINGS = {
    smallPot: 'bkr_prop_weed_01_small_01a', // LEAVE ME ALONE
    mediumPot: 'bkr_prop_weed_med_01a', // LEAVE ME ALONE
    largePot: 'bkr_prop_weed_lrg_01a', // LEAVE ME ALONE
    useSpots: true, // Use configured Spots?
    updateInterval: 3000, // Used to set the timer's update Interval.
    allowInterior: false, // Allow in Interior / Other dimensions which are not null?
    distanceToSpot: 10,
    distanceBetweenPlants: 2,
    interactionRange: 0.8,
    textLabelDistance: 3,
};

// use 'default' to skip animations.
// Example ->
// seedingAnimName: 'default',
// seedingAnimDict: 'default',
export const PLANTCONTROLLER_ANIMATIONS = {
    seedingAnimName: 'base',
    seedingAnimDict: 'amb@world_human_gardener_plant@male@base',
    seedingAnimDuration: 3000,

    fertilizingAnimName: 'base',
    fertilizingAnimDict: 'amb@world_human_gardener_plant@male@base',
    fertilizingAnimDuration: 3000,

    waterAnimName: 'base',
    waterAnimDict: 'amb@world_human_gardener_plant@male@base',
    waterAnimDuration: 3000,

    harvestAnimName: 'base',
    harvestAnimDict: 'amb@world_human_gardener_plant@male@base',
    harvestAnimDuration: 3000,
};

/**
* The `PLANTCONTROLLER_SPOTS` array contains the locations of the spots where the plants
can be placed.
*/
export const PLANTCONTROLLER_SPOTS: alt.Vector3[] = [
    { x: -1625.6290283203125, y: 3165.891357421875, z: 29.933713912963867 } as alt.Vector3,
    { x: 3705.656982421875, y: 3079.053955078125, z: 13.06076717376709 } as alt.Vector3,
    { x: 3693.6142578125, y: 4932.6845703125, z: 18.710264205932617 } as alt.Vector3,
    { x: 2505.236328125, y: -2110.73095703125, z: 30.00033950805664 } as alt.Vector3,
];

/**
 * The `PLANTCONTROLLER_TRANSLATIONS` enum is used to store the text that will be displayed in the
 * UI when the player interacts with a plant.
 */
export enum PLANTCONTROLLER_TRANSLATIONS {
    // Related to general
    notInRange = 'Not in range of a valid plant spot!',
    // Related to Interaction Controllers.
    seedsRequired = 'Requires Seeds.',
    fertilizerRequired = 'Requires Fertilizer.',
    waterRequired = `Requires Water.`,
    seedingInteraction = 'Plant Seeds',
    fertilizingInteraction = 'Fertilize',
    waterInteraction = 'Water Plant',
    harvestable = 'Harvestable',
}

PluginSystem.registerPlugin(ATHENA_PLANTCONTROLLER.name, async () => {
    alt.log(`~lg~${ATHENA_PLANTCONTROLLER.name} ${ATHENA_PLANTCONTROLLER.version} ==> sucessfully loaded.`);
    await Database.createCollection(PLANTCONTROLLER_DATABASE.collectionName);
});

alt.on(SYSTEM_EVENTS.BOOTUP_ENABLE_ENTRY, () => {
    if (PLANTCONTROLLER_SETTINGS.useSpots) {
        for (let i = 0; i < PLANTCONTROLLER_SPOTS.length; i++) {
<<<<<<< HEAD:AthenaPlantController/index.ts
            let currentPlantspot = PLANTCONTROLLER_SPOTS[i];
=======
>>>>>>> e1c4d8669de3e2a1da56bf660b53d554945a066c:athena-plant-controller/index.ts
            ServerBlipController.append({
                shortRange: true,
                sprite: 469,
                color: 2,
                text: 'Plant Spot',
                scale: 1,
                pos: currentPlantspot,
                uid: `Blip-${i}`,
            });
        }
    }
    PlantController.loadPlants();
    alt.setInterval(() => {
        PlantController.updateAllPlants();
    }, PLANTCONTROLLER_SETTINGS.updateInterval);
});
