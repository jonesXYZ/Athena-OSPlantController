import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import { PluginSystem } from '../../server/systems/plugins';
import { ServerBlipController } from '../../server/systems/blip';
import { SYSTEM_EVENTS } from '../../shared/enums/system';

import './PlantController';
import './src/interfaces/IPlants';
import './src/server-events';
import './src/server-items';

export const ATHENA_PLANTCONTROLLER = {
    name: 'PlantController',
    version: 'v1.0',
    searchRange: 2, // Used to find nearest Plant-Pot.
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
    updateInterval: 1000, // Used to set the timer's update Interval.
    distanceToSpot: 10,
    interactionRange: 1,
    textLabelDistance: 3,
    blipText: '~g~PlantController',
};

export const PLANTCONTROLLER_ANIMATIONS = {
    seedingAnimName: 'base',
    seedingAnimDict: 'amb@world_human_gardener_plant@male@base',
    seedingAnimDuration: 3000,

    fertilizingAnimName: 'default',
    fertilizingAnimDict: 'default',
    fertilizingAnimDuration: 3000,

    waterAnimName: 'default',
    waterAnimDict: 'default',
    waterAnimDuration: 3000,

    harvestAnimName: 'default',
    harvestAnimDict: 'default',
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
    PLANTCONTROLLER_SPOTS.forEach((spot, i) => {
        ServerBlipController.append({
            pos: spot as alt.Vector3,
            shortRange: true,
            sprite: 469,
            color: 2,
            text: PLANTCONTROLLER_SETTINGS.blipText,
            scale: 1,
            uid: i.toString(),
        });
    });
    // PlantController.loadPlants();
});