/**************************************************************************
 * The most configurable PlantSystem for the Athena Framework by Stuyk.   *
 * https://github.com/Stuyk/altv-athena                                   *
 * ---------------------------------------------------------------------- *
 * 						Written by Der Lord!                              *
 * ---------------------------------------------------------------------- *
 * Feel free to change whatever you need or dont want.                    *
 * Leave some feedback in the forums if you want to! I'd appreciate it.   *
 * Also feel free to open a PR / issue on my GitHub if you need something *
 * https://github.com/Booster1212/AthenaPlantsystem                       *
 **************************************************************************/
import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import { PluginSystem } from '../../server/systems/plugins';
import './PlantController';
import './src/interfaces/IPlants';
import './src/server-functions';
import './src/server-database';
import './src/server-events';
import './src/server-items';
import { loadPlants } from './src/server-database';
import ChatController from '../../server/systems/chat';
import { PERMISSIONS } from '../../shared/flags/permissionFlags';
import { PlantController } from './PlantController';
import { ItemFactory } from '../../server/systems/item';
import { SYSTEM_EVENTS } from '../../shared/enums/system';
import { InteractionController } from '../../server/systems/interaction';
import { ServerTextLabelController } from '../../server/streamers/textlabel';
import { ServerObjectController } from '../../server/streamers/object';

export const ATHENA_PLANTCONTROLLER = {
    name: 'PlantSystem',
    version: 'v3.0',
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
    interactionRange: 1,
};
export const PLANTCONTROLLER_SPOTS: alt.Vector3[] = [
    { x: -1625.6290283203125, y: 3165.891357421875, z: 29.933713912963867 } as alt.Vector3,
];

export const BLIP_SETTINGS = {
    // sprite:
    // scale:
};

export enum PLANTCONTROLLER_TRANSLATIONS {
    seedingInteraction = 'Plant seeds',
}
PluginSystem.registerPlugin(ATHENA_PLANTCONTROLLER.name, async () => {
    alt.log(`~lg~${ATHENA_PLANTCONTROLLER.name} ${ATHENA_PLANTCONTROLLER.version} ==> sucessfully loaded.`);
    await Database.createCollection(PLANTCONTROLLER_DATABASE.collectionName);
    loadPlants();
});

ChatController.addCommand('Testplants', '/Testplants - Testing Plant System.', PERMISSIONS.ADMIN, someTest);
function someTest(player: alt.Player) {
    const plant = PlantController.addPlant(player, {
        model: PLANTCONTROLLER_SETTINGS.smallPot,
        data: {
            owner: player.data.name,
            variety: 'Sativa',
            type: 'Lemon Haze',
            seeds: false,
            fertilized: false,
            state: 'Requires Seeds.',
            remaining: 60,
            water: 0,
            harvestable: false,
        },
        position: { x: player.pos.x, y: player.pos.y, z: player.pos.z - 1 } as alt.Vector3,
    });
    plant.then(function (data) {
		PlantController.buildObject(data);
        InteractionController.add({
            identifier: `${data._id}`,
            type: 'PlantController',
            position: data.position as alt.Vector3,
            description: PLANTCONTROLLER_TRANSLATIONS.seedingInteraction,
            disableMarker: true,
            range: PLANTCONTROLLER_SETTINGS.interactionRange,
            callback: (player: alt.Player) => {
                data.data.seeds = true;
                data.data.state = 'Requires Fertilizer.';

                InteractionController.remove(`PlantController`, `${data._id}`);
                PlantController.updatePlant(data._id, data);
				PlantController.refreshLabels(data);
            },
        });
    });
}
/*

*/
