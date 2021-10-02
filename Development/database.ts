import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import Plants from './interface';
import ChatController from '../../server/systems/chat';

import { PERMISSIONS } from '../../shared/flags/PermissionFlags';
import { playerFuncs } from '../../server/extensions/Player';
import { getVectorInFrontOfPlayer } from '../../server/utility/vector';
import { ObjectController } from '../../server/systems/object';
import { TextLabelController } from '../../server/systems/textlabel';
import { InteractionController } from '../../server/systems/interaction';
import { db_defaultSettings, db_plantObjects, Translations } from './settings';

ChatController.addCommand('testPlant', '/testPlant - testing this glorious plantsystem without items!', PERMISSIONS.ADMIN, buildPlant);

export async function loadPlants() {
    const allDatabasePlants = await Database.fetchAllData<Plants>('plants');
    if(!allDatabasePlants) {
        generatePlantError('Could not fetch data for table <plants>.');
    }

    allDatabasePlants.forEach(async plant => {
        if(!plant.data.hasSeeds) {
            const placingInteraction = InteractionController.add({
                position: { x: plant.position.x, y: plant.position.y, z: plant.position.z },
                description: Translations.INTERACTION_PLACESEEDS,
                identifier: `Plant-${plant._id}`,
                type: `WeedPlant-Interaction`,
                callback: (player: alt.Player) => {
                    if(!db_defaultSettings.allowEveryoneToInteract) {
                        if(player.data._id != plant.ownerId) {
                            playerFuncs.emit.notification(player, Translations.NOT_ALLOWED_TO_INTERACT);
                            return;
                        }
                    }
                    playerFuncs.emit.scenario(player, db_defaultSettings.seedPlacingScenario, db_defaultSettings.seedPlacingTime);
                    alt.setTimeout(() => {
                        alt.emit('PlantSystem:Serverside:PlaceSeeds', plant._id.toString(), placingInteraction.pos, placingInteraction.getType(), placingInteraction.getIdentifier());
                    }, db_defaultSettings.seedPlacingTime);
                }
            });
        }
        else if(!plant.data.hasFertilizer) {

        } 
        else if(plant.data.water >= 0 && plant.data.water < 100) {

        }

        TextLabelController.append({
            pos: { x: plant.position.x, y: plant.position.y, z: plant.position.z },
            data: `${Translations.STATE} ~g~${plant.data.state}~n~~w~${Translations.TIME} ~g~${plant.data.time}~n~~w~${Translations.WATER} ~g~${plant.data.water}~n~~w~${Translations.FERTILIZER} ~g~${plant.data.hasFertilizer}`,
            uid: `Plant-${plant._id}`
        });

        ObjectController.append({
            model: plant.data.object,
            pos: plant.position,
            uid: plant._id,
        });
    });

    if(db_defaultSettings.logsEnabled) {
        alt.log(`Found ${allDatabasePlants.length} Plants to load from the Database.`);
    }
}

async function buildPlant(player: alt.Player) {
    const pFVector = getVectorInFrontOfPlayer(player, 2);

    const newDocument = {
        owner: player.data.name,
        ownerId: player.data._id,
        position: {
            x: pFVector.x,
            y: pFVector.y,
            z: pFVector.z - 1,
        },
        data: {
            object: db_plantObjects.small,
            state: 'Beginning',
            time: 60,
            water: 0,
            hasSeeds: false,
            hasFertilizer: false,
            isHarvestable: false,
        }
    }

    if(db_defaultSettings.plantLimit) {
        const getPlayerPlants = await Database.selectData<Plants>('plants', ['ownerId']);
        if(getPlayerPlants.length >= db_defaultSettings.maximumAllowedPlants) {
            playerFuncs.emit.notification(player, "You already have planted the maximum of allowed plants.");
            return;
        }
    }

    const databasePlants = await Database.insertData<Plants>(newDocument, 'plants', true);
    if(!databasePlants) {
        generatePlantError('Could not insert data for the table <plants>.')
    }

    ObjectController.append({
        pos: { x: pFVector.x, y: pFVector.y, z: pFVector.z - 1 },
        model: db_plantObjects.small,
        uid: databasePlants._id
    });

    TextLabelController.append({
        pos: { x: pFVector.x, y: pFVector.y, z: pFVector.z - 0.5 },
        data: `${Translations.STATE} ~g~${databasePlants.data.state}~n~~w~${Translations.TIME} ~g~${databasePlants.data.time}~n~~w~${Translations.WATER} ~g~${databasePlants.data.water}~n~~w~${Translations.FERTILIZER} ~g~${databasePlants.data.hasFertilizer}`,
        uid: `Plant-${databasePlants._id.toString()}`
    });

    const fertilizeInteraction = InteractionController.add({
        position: { x: pFVector.x, y: pFVector.y, z: pFVector.z - 1 },
        description: Translations.INTERACTION_PLACESEEDS,
        identifier: `Plant-${databasePlants._id.toString()}`,
        type: `WeedPlant-Interaction`,
        callback: () => {
            playerFuncs.emit.scenario(player, db_defaultSettings.seedPlacingScenario, db_defaultSettings.seedPlacingTime);
            alt.setTimeout(() => {
                alt.emit('PlantSystem:Serverside:PlaceSeeds', databasePlants._id.toString(), fertilizeInteraction.pos, fertilizeInteraction.getType(), fertilizeInteraction.getIdentifier());
            }, db_defaultSettings.seedPlacingTime);
        }
    });
    playerFuncs.emit.notification(player, Translations.PLANT_SUCCESSFULLY_CREATED);
};

export async function updateSinglePlant(idToUpdate: string, seedState?: boolean, fertilizerState?: boolean, harvestState?: boolean, object?: string, state?: string, water?: number, time?: number) {
    const plant = await Database.fetchData<Plants>('_id', idToUpdate, 'plants');

    if(seedState) plant.data.hasSeeds = seedState;
    if(fertilizerState) plant.data.hasFertilizer = fertilizerState;
    if(harvestState) plant.data.isHarvestable = harvestState;

    await Database.updatePartialData(idToUpdate, 
    {
        data: 
        {
            object: plant.data.object,
            state: plant.data.state,
            time: plant.data.time,
            water: plant.data.water,
            hasSeeds: plant.data.hasSeeds,
            hasFertilizer: plant.data.hasFertilizer,
            isHarvestable: plant.data.isHarvestable
        }
    }, 'plants');

    if(db_defaultSettings.logsEnabled) {
        alt.log(`Trying to update plant with the id: ${plant._id}.`);
        if(object) alt.log(`Updating object (Param) >> ${object}`);
        if(state) alt.log(`Updating state (Param) >> ${state}`);
        if(time) alt.log(`Updating time (Param) >> ${time}`);
        if(water) alt.log(`Updating water (Param) >> ${water}`);
        if(seedState) alt.log(`Updating seedState (Param) >> ${seedState}`);
        if(fertilizerState) alt.log(`Updating fertilizerState (Param) >> ${fertilizerState}`);
        if(harvestState) alt.log(`Updating harvestState (Param) >> ${harvestState}`);
    }
};

export async function updatePlants() {
    const allDatabasePlants = Database.fetchAllData<Plants>('plants');
    if(!allDatabasePlants) {
        generatePlantError('Could not fetch data for table <plants>.');
    }

    (await allDatabasePlants).forEach(async plant => {
        if(plant.data.time != 0) {
            await Database.updatePartialData(plant._id, 
            { 
                data: 
                {
                    object: plant.data.object,
                    state: plant.data.state,
                    time: plant.data.time - 1,
                    water: plant.data.water,
                    hasSeeds: plant.data.hasSeeds,
                    hasFertilizer: plant.data.hasFertilizer,
                    isHarvestable: plant.data.isHarvestable
                }
            }, 'plants');
        } else return;
    });
};

function generatePlantError(msg: string): never {
    throw Error(msg);
};