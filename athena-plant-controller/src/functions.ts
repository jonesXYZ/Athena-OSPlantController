import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import iPlant from './interfaces/iPlant';
import { ATHENA_EVENTS_PLAYER } from '../../../shared/enums/athenaEvents';
import { PlayerEvents } from '../../../server/events/playerEvents';
import { OSPlants } from '../index';
import { ServerObjectController } from '../../../server/streamers/object';
import { ServerTextLabelController } from '../../../server/streamers/textlabel';

PlayerEvents.on(ATHENA_EVENTS_PLAYER.SELECTED_CHARACTER, async (player: alt.Player) => {
    const dataExist = await Database.fetchData<iPlant>('owner', player.data.name, OSPlants.collection);
    const plantDocument: iPlant = {
        owner: player.data.name,
        plants: [],
    };

    if (!dataExist) {
        await Database.insertData(plantDocument, OSPlants.collection);
        alt.logWarning(`PlantController => Created PlantController Data for ${player.data.name}.`);
    } else {
        alt.logWarning(`PlantController => Successfully loaded data for ${player.data.name}.`);
    }
});

export function createLabelAndObject(data: { pos: alt.Vector3; description: string; model: string; uid: string }) {
    ServerObjectController.append({
        pos: { x: data.pos.x, y: data.pos.y, z: data.pos.z - 1 },
        model: data.model,
        uid: data.uid,
    });
    ServerTextLabelController.append({
        pos: { x: data.pos.x, y: data.pos.y, z: data.pos.z - 0.5 },
        data: data.description,
        uid: data.uid,
    });
}
