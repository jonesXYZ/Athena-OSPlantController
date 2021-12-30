import Database from '@stuyk/ezmongodb';
import * as alt from 'alt-server';
import { ATHENA_PLANTSYSTEM, DATABASE_SETTINGS } from '..';
import { ServerObjectController } from '../../../server/streamers/object';
import IPlants from './interfaces/IPlants';

export async function loadPlants() {
    const plants = await Database.fetchAllData<IPlants>(DATABASE_SETTINGS.collectionName);
    plants.forEach((plant, i) => {
        ServerObjectController.append({
            uid: `PlantSystem-${plant._id}`,
            model: plant.model,
            pos: plant.position,
        });
    });
    alt.log(`~lg~${ATHENA_PLANTSYSTEM.name} ${ATHENA_PLANTSYSTEM.version} | DATABASE | ==> found ${plants.length} plants to load.`);
}

export async function updatePlants() {
    const plants = Database.fetchAllData<IPlants>(DATABASE_SETTINGS.collectionName);
    (await plants).forEach(async (plant, i) => {
        await Database.updatePartialData(plant._id.toString(), 
        {
            
        }, DATABASE_SETTINGS.collectionName);
    });
}

export async function updateSinglePlant() {

}