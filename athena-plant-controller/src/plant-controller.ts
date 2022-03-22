import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import iPlant, { iPlantData } from './interfaces/iPlant';
import { ServerObjectController } from '../../../server/streamers/object';
import { playerFuncs } from '../../../server/extensions/extPlayer';
import { OSPlants } from '../index';
import { ServerTextLabelController } from '../../../server/streamers/textlabel';
import { ObjectId } from 'bson';
import { InteractionController } from '../../../server/systems/interaction';

export class PlantController implements iPlant {
    _id?: string;
    owner: string;
    plants: iPlantData[];

    /**
     * It creates a new Plant object from the data that was passed in.
     * @param {iPlant} data - iPlant
     */
    constructor(data: iPlant) {
        this._id = data._id;
        this.owner = data.owner;
        this.plants = data.plants;
    }

    public static async growPlant(player: alt.Player, faction?: string | number) {
        if (!player || !player.valid) return;

        let generatedUuid = new ObjectId();
        const vectorInFront = playerFuncs.utility.getPositionFrontOf(player, 1);
        const data = await Database.fetchData<iPlant>('owner', player.data.name, OSPlants.collection);
        const plantDocument: iPlantData = {
            _id: generatedUuid.toString(),
            data: {
                time: 0,
                type: '',
                variety: '',
                water: 0,
            },
            general: {
                dimension: player.data.dimension,
                interior: player.data.interior,
                faction: faction,
            },
            object: {
                model: 'bkr_prop_weed_01_small_01a',
            },
            textLabel: {
                data: '~r~Plant requires Attention.',
                position: { x: vectorInFront.x, y: vectorInFront.y, z: vectorInFront.z - 0.5 } as alt.Vector3,
            },
            states: {
                isSeeds: false,
                isFertilized: false,
                isHarvestable: false,
            },
            position: { x: vectorInFront.x, y: vectorInFront.y, z: vectorInFront.z - 1 } as alt.Vector3,
        };

        ServerObjectController.append({
            pos: { x: vectorInFront.x, y: vectorInFront.y, z: vectorInFront.z - 1 },
            model: plantDocument.object.model,
            uid: generatedUuid.toString(),
            dimension: player.dimension,
            maxDistance: OSPlants.objectDistance,
        });

        ServerTextLabelController.append({
            pos: { x: vectorInFront.x, y: vectorInFront.y, z: vectorInFront.z - 0.5 },
            data: plantDocument.textLabel.data,
            uid: generatedUuid.toString(),
            dimension: player.dimension,
            maxDistance: OSPlants.textLabelDistance,
        });

        InteractionController.add({
            position: plantDocument.position,
            description: 'Test...',
            callback: async (player: alt.Player) => {
                const returnedPlant = await PlantController.isPlayerInRangeOfPlant(player, 3);
                console.log(JSON.stringify(returnedPlant));
            },
        });

        data.plants.push({ ...plantDocument });
        await Database.updatePartialData(data._id, { plants: data.plants }, OSPlants.collection);
    }

    public static async isPlayerInRangeOfPlant(player: alt.Player, range: number): Promise<iPlantData> {
        const playerPlantDocument = await Database.fetchAllData<iPlant>(OSPlants.collection);
        let returnedData: iPlantData = null;
        for (let x = 0; x < playerPlantDocument.length; x++) {
            const plantsForCheck = [...playerPlantDocument[x].plants];
            plantsForCheck.forEach((entry) => {
                if(player.pos.isInRange(entry.position, range)) {
                    returnedData = entry;
                } else return null;
            });
        }
        return returnedData;
    }
}
