import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import ChatController from '../../server/systems/chat';
import { PERMISSIONS } from '../../shared/flags/PermissionFlags';
import { playerFuncs } from '../../server/extensions/Player';
import { getVectorInFrontOfPlayer } from '../../server/utility/vector';
import { ObjectController } from '../../server/systems/object';
import Plants from './interface';
import { TextLabelController } from '../../server/systems/textlabel';

const textVars = {
    state: 'N/A',
    time: 0,
    water: 0,
    hasFertilizer: false,
    isHarvestable: false
};

const generalSettings = {
    plantLimit: false,
    maximumAllowedPlants: 2,
    wateringTime: 5000,
    fertilizeTime: 5000,
    harvestTime: 10000,
    rangeToSpot: 20,
}

const plantObjects = {
    small: 'bkr_prop_weed_01_small_01a',
    medium: 'bkr_prop_weed_med_01a',
    large: 'bkr_prop_weed_lrg_01a',
};

ChatController.addCommand('testPlant', '/testPlant - testing this glorious plantsystem without items!', PERMISSIONS.ADMIN, buildPlant);

export async function loadPlants(): Promise<void> {

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
            object: plantObjects.small,
            state: 'Beginning',
            time: 60,
            water: 0,
            hasFertilizer: false,
            isHarvestable: false,
        }
    }

    const databasePlants = await Database.insertData<Plants>(newDocument, 'plants', true);
    if(!databasePlants) {
        generatePlantError('Could not insert data for the table <plants>.')
    }

    ObjectController.append({
        pos: { x: pFVector.x, y: pFVector.y, z: pFVector.z - 1 },
        model: plantObjects.small,
        uid: databasePlants._id
    });

    TextLabelController.append({
        pos: { x: pFVector.x, y: pFVector.y, z: pFVector.z - 0.5 },
        data: `
        State: ${textVars.state = databasePlants.data.state}
        Time: ${textVars.time = databasePlants.data.time}
        Water: ${textVars.water = databasePlants.data.water}
        hasFertilizer: ${textVars.hasFertilizer = databasePlants.data.hasFertilizer}
        `,
        uid: `Plant-${databasePlants._id}`
    });

    playerFuncs.emit.notification(player, "Successfully created a plant.");
}

export async function updatePlants(): Promise<void> {
    const allDatabasePlants = Database.fetchAllData<Plants>('plants');
    if(!allDatabasePlants) {
        generatePlantError('Could not fetch data for table <plants>.');
    }

    (await allDatabasePlants).forEach(async plant => {
        await Database.updatePartialData(plant._id, 
        { 
            data: 
            {
                object: plant.data.object,
                state: plant.data.state,
                time: plant.data.time - 1,
                water: plant.data.water,
                hasFertilizer: plant.data.hasFertilizer,
                isHarvestable: plant.data.isHarvestable
            }
        }, 'plants');
    });
};

function generatePlantError(msg: string): never {
    throw Error(msg);
}