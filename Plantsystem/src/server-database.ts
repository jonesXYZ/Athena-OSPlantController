import Database from '@stuyk/ezmongodb';
import * as alt from 'alt-server';
import {
    ATHENA_PLANTCONTROLLER,
    PLANTCONTROLLER_DATABASE,
    PLANTCONTROLLER_SETTINGS,
    PLANTCONTROLLER_SPOTS,
    PLANTCONTROLLER_TRANSLATIONS,
} from '../index';
import { ServerObjectController } from '../../../server/streamers/object';
import { ServerTextLabelController } from '../../../server/streamers/textlabel';
import { InteractionController } from '../../../server/systems/interaction';
import { PlantController } from '../PlantController';
import IPlants from './interfaces/IPlants';
import { ServerBlipController } from '../../../server/systems/blip';

export async function loadPlants() {
    const plants = await Database.fetchAllData<IPlants>(PLANTCONTROLLER_DATABASE.collectionName);
    plants.forEach((data, i) => {
        ServerObjectController.append({
            uid: `PlantSystem-${data._id}`,
            model: data.model,
            pos: data.position,
        });

        ServerTextLabelController.append({
            uid: data._id.toString(),
            pos: { x: data.position.x, y: data.position.y, z: data.position.z + 0.5},
            data: `~g~${data.data.variety} ~w~| ~g~${data.data.type}~n~~n~~g~${data.data.state}~n~~n~~b~${data.data.water}% ~w~| ~g~${data.data.remaining}m`,
        });

        if (!data.data.seeds) {
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
                },
            });
        } else if (!data.data.fertilized) {
            InteractionController.add({
                identifier: `${data._id}`,
                type: 'PlantController',
                position: data.position as alt.Vector3,
                description: PLANTCONTROLLER_TRANSLATIONS.seedingInteraction,
                disableMarker: true,
                range: PLANTCONTROLLER_SETTINGS.interactionRange,
                callback: (player: alt.Player) => {
                    data.data.fertilized = true;
                    data.data.state = 'Requires Water.';

                    InteractionController.remove(`PlantController`, `${data._id}`);
                    PlantController.updatePlant(data._id, data);
                },
            });
        }
    });
    alt.log(
        `~lg~${ATHENA_PLANTCONTROLLER.name} ${ATHENA_PLANTCONTROLLER.version} | DATABASE | ==> found ${plants.length} plants to load.`,
    );
}

export async function updatePlants() {
    const allPlants = await Database.fetchAllData<IPlants>(PLANTCONTROLLER_DATABASE.collectionName);
    allPlants.forEach(async (plant, i) => {
        if (plant.data.water > 0 && plant.data.remaining > 0) {
            plant.data.water -= 1;
            plant.data.remaining -= 1;
            await Database.updatePartialData(plant._id, plant, PLANTCONTROLLER_DATABASE.collectionName);
            PlantController.refreshLabels(plant, plant._id.toString());
        } else {
            await Database.updatePartialData(plant._id, plant, PLANTCONTROLLER_DATABASE.collectionName);
        }
    });
}