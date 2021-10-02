import * as alt from 'alt-server';
import { InteractionController } from '../../server/systems/interaction';
import { updateSinglePlant } from './database';
import { Translations } from './settings';

alt.on('PlantSystem:Serverside:PlaceSeeds', async (plantId: string, PlantPosition: alt.Vector3, InteractionType: string, InteractionIdentifier: string) => {
    InteractionController.remove(InteractionType, InteractionIdentifier);
    updateSinglePlant(plantId.toString(), true);
    alt.setTimeout(() => {
        const waterInteraction = InteractionController.add({
            identifier: InteractionIdentifier,
            type: InteractionType,
            position: PlantPosition,
            description: Translations.INTERACTION_FERTILIZE,
            callback: () => {
                alt.emit('PlantSystem:Serverside:Fertilize', waterInteraction.pos, waterInteraction.getType(), waterInteraction.getIdentifier());
            }
        });
    }, 250);
});

alt.on('PlantSystem:Serverside:Fertilize', (PlantPosition: alt.Vector3, InteractionType: string, InteractionIdentifier: string) => {
    const fertilizeInteraction = InteractionController.add({
        identifier: InteractionIdentifier,
        type: InteractionType,
        position: PlantPosition,
        description: Translations.INTERACTION_FERTILIZE,
        callback: () => {
            alt.emit('PlantSystem:Serverside:Water', fertilizeInteraction.pos,fertilizeInteraction.getType(), fertilizeInteraction.getIdentifier());
        }
    });
});