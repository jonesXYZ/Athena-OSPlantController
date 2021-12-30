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

import './src/interfaces/IPlants';
import './src/server-functions';
import './src/server-database';
import './src/server-events';
import './src/server-items';
import { loadPlants } from './src/server-database';
import IPlants from './src/interfaces/IPlants';
import { createPlant } from './src/server-functions';
import ChatController from '../../server/systems/chat';
import { PERMISSIONS } from '../../shared/flags/permissionFlags';
import { PlantController } from './PlantController';

export const ATHENA_PLANTSYSTEM = {
	name: 'PlantSystem',
	version: 'v3.0'
}

export const DATABASE_SETTINGS = {
	collectionName: 'plants', // Change me before booting if you need to.
}

export const PLANT_SETTINGS = {
    smallPot: 'bkr_prop_weed_01_small_01a', // LEAVE ME ALONE
    mediumPot: 'bkr_prop_weed_med_01a', // LEAVE ME ALONE
    largePot: 'bkr_prop_weed_lrg_01a', // LEAVE ME ALONE
	updateInterval: 1000, // Used to set the timer's update Interval.
}

export const BLIP_SETTINGS = {
	// sprite: 
	// scale: 
}

PluginSystem.registerPlugin(ATHENA_PLANTSYSTEM.name, async () => {
    alt.log(`~lg~${ATHENA_PLANTSYSTEM.name} ${ATHENA_PLANTSYSTEM.version} ==> sucessfully loaded.`);
	await Database.createCollection(DATABASE_SETTINGS.collectionName);
	loadPlants();
});

ChatController.addCommand('Testplants', '/Testplants - Testing Plant System.', PERMISSIONS.ADMIN, someTest);

function someTest(player: alt.Player, ) {
	PlantController.addPlant(player, {
		data: {
			owner: '',
			type: '',
			seeds: false,
			fertilized: false,
			state: '',
			remaining: 0,
			water: 0,
			harvestable: false
		},
		position: player.pos as alt.Vector3
	});
}