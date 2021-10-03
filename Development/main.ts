/**************************************************************************
 * The most configurable PlantSystem for the Athena Framework by Stuyk.   *
 * https://github.com/Stuyk/altv-athena                                   *
 * ---------------------------------------------------------------------- *
 * Written by Der Lord!                                                   *
 * Happy Hacktober! Support some OpenSource Projects you like.            *
 * https://hacktoberfest.digitalocean.com/                                *
 * ---------------------------------------------------------------------- *
 * Feel free to change whatever you need or dont want.                    *
 * Leave some feedback in the forums if you want to! I'd appreciate it.   *
 * Also feel free to open a PR / issue on my GitHub if you need something *
 * https://github.com/Booster1212/AthenaPlantsystem                       *
 **************************************************************************/
import * as alt from 'alt-server';
import { BlipController } from '../../server/systems/blip';
import { SYSTEM_EVENTS } from '../../shared/enums/system';
import { loadPlants, updatePlants } from './database';
import { blipSettings, defaultSettings, plantSpots } from './settings';

alt.on(SYSTEM_EVENTS.BOOTUP_ENABLE_ENTRY, setPlantInterval);
function setPlantInterval() {
	if (!defaultSettings.plantSystemEnabled) return false;

	loadPlants();

	alt.setInterval(() => {
		updatePlants();
	}, defaultSettings.plantUpdateInterval);

	if (defaultSettings.createBlips) {
		plantSpots.forEach((plantSpot, index) => {
			BlipController.append({
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
