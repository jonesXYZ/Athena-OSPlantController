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
import './database';
import './events';
import './interface';
import './items';
import './settings';
import { ServerBlipController } from '../../server/systems/blip';
import { SYSTEM_EVENTS } from '../../shared/enums/system';
import { loadPlants, updatePlants } from './database';
import { blipSettings, defaultSettings, plantSpots } from './settings';
import { PluginSystem } from '../../server/systems/plugins';
import Database from '@stuyk/ezmongodb';

alt.on(SYSTEM_EVENTS.BOOTUP_ENABLE_ENTRY, setPlantInterval);

const ATHENA_PLANTSYSTEM = 'Athena Plantsystem';

PluginSystem.registerPlugin(ATHENA_PLANTSYSTEM, () => {
    alt.log(`~lg~${ATHENA_PLANTSYSTEM} was successfully loaded`);
	loadPlants();
	Database.createCollection('plants');
});

function setPlantInterval() {
	if (!defaultSettings.plantSystemEnabled) return false;

	alt.setInterval(() => {
		updatePlants();
	}, defaultSettings.plantUpdateInterval);

	if (defaultSettings.createBlips) {
		plantSpots.forEach((plantSpot, index) => {
			ServerBlipController.append({
				sprite: blipSettings.sprite,
				color: blipSettings.color,
				scale: blipSettings.scale,
				text: blipSettings.text,
				shortRange: blipSettings.shortRange,
				uid: `Blip-${index}`,
				pos: plantSpots[index]
			});
		});
	}
	return true;
}
