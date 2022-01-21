import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import { sha256Random } from '../../../server/utility/encryption';
import IPlants from './interfaces/IPlants';
import { ATHENA_PLANTCONTROLLER, PLANTCONTROLLER_SETTINGS } from '..';
import { ServerObjectController } from '../../../server/streamers/object';
import { ServerTextLabelController } from '../../../server/streamers/textlabel';
import { getVectorInFrontOfPlayer } from '../../../server/utility/vector';

export class PlantController implements IPlants {
    _id?: string;
    owner: string;

    data: {
        shaIdentifier: string;
        objectModel: string;
        state: string;
        interior: string;
        isSeeds: boolean;
        isFertilized: boolean;
        isHarvestable: boolean;
        water: number;
        required: number;
        remaining: number;
        dimension: number;
    };

    types: { type: string; variety: string };
    position: alt.Vector3;

    static async addPlant(player: alt.Player, state: string) {
        const vectorInFront = getVectorInFrontOfPlayer(player, 1);
        const plantDocument: IPlants = {
            owner: player.data.name,
            data: {
                shaIdentifier: this.generateShaId(player),
                objectModel: PLANTCONTROLLER_SETTINGS.smallPot,
                state: state,
                interior: player.data.interior,

                isSeeds: false,
                isFertilized: false,
                isHarvestable: false,

                water: 0,
                required: 0,
                remaining: 0,
                dimension: player.dimension,
            },
            types: {
                type: 'N/A', // DONT CHANGE!
                variety: 'N/A', // DONT CHANGE!
            },
            position: { x: vectorInFront.x, y: vectorInFront.y, z: vectorInFront.z - 1 } as alt.Vector3,
        };

        const plant = await Database.insertData(plantDocument, ATHENA_PLANTCONTROLLER.collection, true);
        const pos = plant.position;

        ServerObjectController.append({
            pos: plant.position,
            model: plant.data.objectModel,
            uid: plant.data.shaIdentifier,
        });

        ServerTextLabelController.append({
            uid: plant.data.shaIdentifier,
            pos: { x: pos.x, y: pos.y, z: pos.z + 0.5 },
            data: `~g~${plant.types.variety} ~w~| ~g~${plant.types.type}~n~~n~~g~${plant.data.state}~n~~n~~b~${plant.data.water}% ~w~| ~g~${plant.data.remaining} minutes`,
            maxDistance: 0,
            dimension: 0,
        });
    }

    static async loadPlants() {
        const data = await Database.fetchAllData<IPlants>(ATHENA_PLANTCONTROLLER.collection);
        data.forEach((plant) => {
            const pos = plant.position;
            ServerObjectController.append({
                pos: plant.position,
                model: plant.data.objectModel,
                uid: plant.data.shaIdentifier,
            });

            ServerTextLabelController.append({
                uid: plant.data.shaIdentifier,
                pos: { x: pos.x, y: pos.y, z: pos.z + 0.5 },
                data: `~g~${plant.types.variety} ~w~| ~g~${plant.types.type}~n~~n~~g~${plant.data.state}~n~~n~~b~${plant.data.water}% ~w~| ~g~${plant.data.remaining} minutes`,
                maxDistance: 15,
                dimension: plant.data.dimension,
            });
        });
    }

    static async updatePlants() {
        const data = await Database.fetchAllData<IPlants>(ATHENA_PLANTCONTROLLER.collection);
        data.forEach(async (plant) => {
            if (plant.data.water > 0 && plant.data.isHarvestable === false) {
                plant.data.water--;
                plant.data.remaining--;
                await Database.updatePartialData(plant._id, { data: plant.data }, ATHENA_PLANTCONTROLLER.collection);
                this.updateTextlabels(plant);

                if (plant.data.remaining === plant.data.required / 2) {
                    ServerObjectController.remove(plant.data.shaIdentifier);
                    ServerObjectController.append({
                        pos: plant.position,
                        model: PLANTCONTROLLER_SETTINGS.mediumPot,
                        uid: plant.data.shaIdentifier,
                    });
                    plant.data.objectModel = PLANTCONTROLLER_SETTINGS.mediumPot;
                }

                if (plant.data.remaining === 0) {
                    ServerObjectController.remove(plant.data.shaIdentifier);
                    ServerObjectController.append({
                        pos: plant.position,
                        model: PLANTCONTROLLER_SETTINGS.largePot,
                        uid: plant.data.shaIdentifier,
                    });

                    plant.data.objectModel = PLANTCONTROLLER_SETTINGS.largePot;
                    plant.data.isHarvestable = true;
                    plant.data.state = '~g~HARVESTABLE';
                    await Database.updatePartialData(
                        plant._id,
                        { data: plant.data },
                        ATHENA_PLANTCONTROLLER.collection,
                    );
                    this.updateTextlabels(plant);
                }
            }
        });
    }

    static async updateTextlabels(plant: IPlants) {
        const pos = plant.position;
        ServerTextLabelController.remove(plant.data.shaIdentifier);
        ServerTextLabelController.append({
            uid: plant.data.shaIdentifier,
            pos: { x: pos.x, y: pos.y, z: pos.z + 0.5 },
            data: `~g~${plant.types.variety} ~w~| ~g~${plant.types.type}~n~~n~~g~${plant.data.state}~n~~n~~b~${plant.data.water}% ~w~| ~g~${plant.data.remaining} minutes`,
        });
    }

    /**
     * generate a random unique ID for a player based on their name.
     * @param {alt.Player} player - The player that is being checked.
     * @returns A string of the random sha256 hash of the player's name.
     */
    public static generateShaId(player: alt.Player) {
        return sha256Random(player.data.name).toString();
    }
}
