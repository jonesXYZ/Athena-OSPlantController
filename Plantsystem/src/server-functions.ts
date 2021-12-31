import * as alt from 'alt-server';
import { PLANTCONTROLLER_SETTINGS } from '../index';
import { loadPlants, updatePlants } from './server-database';

export function setPlantInterval() {
	loadPlants();
	alt.setInterval(() => {
		updatePlants();
	}, PLANTCONTROLLER_SETTINGS.updateInterval);
}

export function createPlant() {
    
}