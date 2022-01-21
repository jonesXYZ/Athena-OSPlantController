import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import { PluginSystem } from '../../server/systems/plugins';
import { ServerBlipController } from '../../server/systems/blip';
import { SYSTEM_EVENTS } from '../../shared/enums/system';

import './src/serverEvents';
import './src/serverItems';
import { Animation } from '../../shared/interfaces/animation';
import { ANIMATION_FLAGS } from '../../shared/flags/animationFlags';
import { PlantController } from './src/controller';

export const ATHENA_PLANTCONTROLLER = {
    name: 'PlantController',
    version: 'v1.0',
    collection: 'plants', // Change me before booting if you need to.
};

export const PLANTCONTROLLER_SPOTS: alt.Vector3[] = [
    { x: -1625.6290283203125, y: 3165.891357421875, z: 29.933713912963867 } as alt.Vector3,
    { x: 3705.656982421875, y: 3079.053955078125, z: 13.06076717376709 } as alt.Vector3,
    { x: 3693.6142578125, y: 4932.6845703125, z: 18.710264205932617 } as alt.Vector3,
    { x: 2505.236328125, y: -2110.73095703125, z: 30.00033950805664 } as alt.Vector3,
];

export const PLANTCONTROLLER_SETTINGS = {
    smallPot: 'bkr_prop_weed_01_small_01a', // LEAVE ME ALONE
    mediumPot: 'bkr_prop_weed_med_01a', // LEAVE ME ALONE
    largePot: 'bkr_prop_weed_lrg_01a', // LEAVE ME ALONE
    useSpots: true, // Use configured Spots?
    updateInterval: 3000, // Used to set the timer's update Interval.
    allowInterior: false, // Allow in Interior / Other dimensions which are not null?
    distanceToSpot: 10,
    distanceBetweenPlants: 2,
    textLabelDistance: 3,
};

export const animations: Array<Animation> = [
    // Planting Animation
    {
        dict: 'amb@world_human_gardener_plant@male@base',
        name: 'base',
        flags: ANIMATION_FLAGS.REPEAT,
        duration: 5000,
    },
    // Seeding Animation
    {
        dict: 'amb@world_human_gardener_plant@male@base',
        name: 'base',
        flags: ANIMATION_FLAGS.REPEAT,
        duration: 5000,
    },
    // Fertilize Animation
    {
        dict: 'amb@world_human_gardener_plant@female@idle_a',
        name: 'idle_a_female',
        flags: ANIMATION_FLAGS.REPEAT,
        duration: 5000,
    },
    // Water Animation
    {
        dict: 'missarmenian3_gardener',
        name: 'blower_idle_a',
        flags: ANIMATION_FLAGS.REPEAT,
        duration: 5000,
    },
    // Harvest Animation
    {
        dict: 'anim@amb@business@cfm@cfm_drying_notes@',
        name: 'loading_v1_worker',
        flags: ANIMATION_FLAGS.REPEAT,
        duration: 5000,
    },
];

PluginSystem.registerPlugin(ATHENA_PLANTCONTROLLER.name, async () => {
    alt.log(`~lg~${ATHENA_PLANTCONTROLLER.name} ${ATHENA_PLANTCONTROLLER.version} ==> sucessfully loaded.`);
    await Database.createCollection(ATHENA_PLANTCONTROLLER.collection);
});

alt.on(SYSTEM_EVENTS.BOOTUP_ENABLE_ENTRY, () => {
    if (PLANTCONTROLLER_SETTINGS.useSpots) {
        for (let i = 0; i < PLANTCONTROLLER_SPOTS.length; i++) {
            let currentPlantspot = PLANTCONTROLLER_SPOTS[i];
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
        PlantController.updatePlants();
    }, PLANTCONTROLLER_SETTINGS.updateInterval);
});
