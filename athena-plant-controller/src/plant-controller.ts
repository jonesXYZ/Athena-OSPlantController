import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import iPlant, { iPlantData } from './interfaces/iPlant';
import { ServerObjectController } from '../../../server/streamers/object';
import { playerFuncs } from '../../../server/extensions/extPlayer';
import { sha256 } from '../../../server/utility/encryption';
import { SYSTEM_EVENTS } from '../../../shared/enums/system';
import { OSPlants } from '../index';
import { ServerTextLabelController } from '../../../server/streamers/textlabel';
import { ObjectId } from 'bson';

export class PlantController implements iPlant {
    _id?: string;
    owner: string;
    plants: iPlantData[];

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
            model: 'bkr_prop_weed_01_small_01a',
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
            states: {
                isSeeds: false,
                isFertilized: false,
                isHarvestable: false,
            },
            position: { x: player.pos.x, y: player.pos.y, z: player.pos.z - 1 } as alt.Vector3,
        };

        ServerObjectController.append({
            pos: { x: vectorInFront.x, y: vectorInFront.y, z: vectorInFront.z - 1 },
            model: plantDocument.model,
            uid: generatedUuid.toString(),
        });

        ServerTextLabelController.append({
            pos: { x: vectorInFront.x, y: vectorInFront.y, z: vectorInFront.z - 0.5 },
            data: 'Testing...',
            uid: generatedUuid.toString(),
        });

        data.plants.push({ ...plantDocument });
        await Database.updatePartialData(data._id, { plants: data.plants }, OSPlants.collection);
    }

    public static async seedPlant(player: alt.Player) {}

    public static async fertilizePlant(player: alt.Player) {}

    public static async waterPlant(player: alt.Player) {}

    public static async harvestPlant(player: alt.Player) {}

    private static refreshObjects() {}

    private static refreshLabels() {}

    /* static async handleBootup() {
        const allPlants = await Database.fetchAllData<iPlant>(OSPlants.collection);
        for (let x = 0; x < allPlants.length; x++) {
            const plantsToCreate = allPlants[x].plants;
            if(plantsToCreate.length > 0) {
                ServerObjectController.append({
                    model: plantsToCreate[x].model,
                    pos: plantsToCreate[x].position,
                    uid: plantsToCreate[x]._id,
                });
            } else continue;
            alt.logWarning(`PlantController => ${plantsToCreate.length} plants were loaded on Bootup entry.`);
        }
    } */
}

// alt.on(SYSTEM_EVENTS.BOOTUP_ENABLE_ENTRY, PlantController.handleBootup);
