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
import { PluginSystem } from '../../server/systems/plugins';
import './src/database';
import './src/server-events';
import './src/interfaces/IPlants';
import './src/items';
import './src/settings';
const ATHENA_PLANTSYSTEM = {
	name: 'PlantSystem',
	version: 1.0
}

PluginSystem.registerPlugin(ATHENA_PLANTSYSTEM.name, () => {
    alt.log(`~lg~${ATHENA_PLANTSYSTEM.name} ${ATHENA_PLANTSYSTEM.version} ==> sucessfully loaded.`);
    // setPlantInterval();
});
/* function setPlantInterval() {
	if (!defaultSettings.plantSystemEnabled) return false;

	loadPlants();

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
*/