import * as alt from 'alt-server';
import { PLANT_SETTINGS } from '..';
import { loadPlants, updatePlants } from './server-database';

export function setPlantInterval() {
	loadPlants();
	alt.setInterval(() => {
		updatePlants();
	}, PLANT_SETTINGS.updateInterval);
}

export function createPlant() {
    
}