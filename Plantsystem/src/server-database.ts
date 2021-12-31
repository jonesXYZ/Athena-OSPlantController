import Database from '@stuyk/ezmongodb';
import * as alt from 'alt-server';
import {
    ATHENA_PLANTCONTROLLER,
    PLANTCONTROLLER_DATABASE,
    PLANTCONTROLLER_SETTINGS,
    PLANTCONTROLLER_TRANSLATIONS,
} from '../index';
import { ServerObjectController } from '../../../server/streamers/object';
import { ServerTextLabelController } from '../../../server/streamers/textlabel';
import { InteractionController } from '../../../server/systems/interaction';
import { PlantController } from '../PlantController';
import IPlants from './interfaces/IPlants';

export async function loadPlants() {
    const plants = await Database.fetchAllData<IPlants>(PLANTCONTROLLER_DATABASE.collectionName);
    plants.forEach((data, i) => {
        ServerObjectController.append({
            uid: `PlantSystem-${data._id}`,
            model: data.model,
            pos: data.position,
        });

        ServerTextLabelController.append({
            uid: `${data._id}`,
            pos: data.position as alt.Vector3,
            data: `~g~${data.data.variety} ~w~| ~g~${data.data.type}~n~~g~${data.data.state}`,
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
        }
    });
    alt.log(
        `~lg~${ATHENA_PLANTCONTROLLER.name} ${ATHENA_PLANTCONTROLLER.version} | DATABASE | ==> found ${plants.length} plants to load.`,
    );
}

export async function updatePlants() {
    const plants = Database.fetchAllData<IPlants>(PLANTCONTROLLER_DATABASE.collectionName);
    (await plants).forEach(async (plant, i) => {
        await Database.updatePartialData(plant._id.toString(), {}, PLANTCONTROLLER_DATABASE.collectionName);
    });
}

export async function updateSinglePlant() {}
