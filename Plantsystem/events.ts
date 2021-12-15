/**************************************************************************
 * The most configurable PlantSystem for the Athena Framework by Stuyk.   *
 * https://github.com/Stuyk/altv-athena                                   *
 * ---------------------------------------------------------------------- *
 * Written by Der Lord!                                                   *
 * Happy Hacktober! Support some OpenSource Projects you like.            *
 * https://hacktoberfest.digitalocean.com/                                *
 * ---------------------------------------------------------------------- *
 * Feel free to change whatever you need or dont want.                    *
 * Leave some feedback in the forums if you want to! I'd appreciate it.   *
 * Also feel free to open a PR / issue on my GitHub if you need something *
 * https://github.com/Booster1212/AthenaPlantsystem                       *
 **************************************************************************/
import Database from '@stuyk/ezmongodb';
import * as alt from 'alt-server';
import { playerFuncs } from '../../server/extensions/Player';
import { ServerObjectController } from '../../server/streamers/object';
import { ServerTextLabelController } from '../../server/streamers/textlabel';
import { InteractionController } from '../../server/systems/interaction';
// import { ObjectController } from '../../server/systems/object';
// import { TextLabelController } from '../../server/systems/textlabel';
import { PLAYER_SYNCED_META } from '../../shared/enums/playerSynced';
import { getFromRegistry } from '../../shared/items/itemRegistry';

import { buildPlant, removePlant, updateSinglePlant } from './database';
import Plants from './interface';
import { dbSettings, getRandomInt, plantSpots, Translations } from './settings';

alt.on('PlantSystem:Serverside:PlantPot', (player: alt.Player) => {
	plantSpots.forEach((spot, index) => {
		if (player.pos.isInRange(plantSpots[index] as alt.Vector3, dbSettings.rangeToSpot)) {
			buildPlant(player);
		} else {
			playerFuncs.emit.notification(player, Translations.NOT_IN_RANGE_OF_SPOT);
			return;
		}
	});
});

alt.on('PlantSystem:Serverside:PlaceSeeds', async (plantId: string, InteractionType: string, InteractionIdentifier: string) => {
	const plant = await Database.fetchData<Plants>('_id', plantId, 'plants');
	InteractionController.remove(InteractionType, InteractionIdentifier);
	alt.log('Trying to Remove Place Seeds ' + InteractionType + ' ' + InteractionIdentifier);
	alt.setTimeout(() => {
		updateSinglePlant(plantId.toString(), true);
		const fertilizerInteraction = InteractionController.add({
			identifier: InteractionIdentifier,
			type: InteractionType,
			position: plant.position,
			description: Translations.INTERACTION_FERTILIZE,
			callback: (player: alt.Player) => {
				if (!plantId.toString()) return;
				if (!dbSettings.allowEveryoneToInteract) {
					if (player.data._id != plant.ownerId) {
						playerFuncs.emit.notification(player, Translations.NOT_ALLOWED_TO_INTERACT);
						return;
					}
				}
				if (dbSettings.useItems) {
					const fertilizer = getFromRegistry('weedfertilizer');
					const fertilizerInInventory = playerFuncs.inventory.isInInventory(player, {
						name: fertilizer.name
					});
					if (!fertilizerInInventory) {
						playerFuncs.emit.notification(player, Translations.NO_FERTILIZER_IN_INVENTORY);
						return;
					} else if (fertilizerInInventory) {
						player.data.inventory[fertilizerInInventory.index].quantity -= 1;
						if (player.data.inventory[fertilizerInInventory.index].quantity <= 0) {
							playerFuncs.inventory.findAndRemove(player, fertilizer.name);
						}
						resyncPlayerInventory(player);
					}
				}
				playerFuncs.emit.scenario(player, dbSettings.fertilizeScenario, dbSettings.fertilizeTime);
				alt.emit('PlantSystem:Serverside:Fertilize', plantId.toString(), fertilizerInteraction.type, fertilizerInteraction.getIdentifier());
			}
		});
	}, 250);
});

alt.on('PlantSystem:Serverside:Fertilize', async (plantId: string, InteractionType: string, InteractionIdentifier: string) => {
	const plant = await Database.fetchData<Plants>('_id', plantId, 'plants');
	InteractionController.remove(InteractionType, InteractionIdentifier);
	alt.setTimeout(() => {
		updateSinglePlant(plantId.toString(), undefined, true);
		const waterInteraction = InteractionController.add({
			identifier: InteractionIdentifier,
			type: InteractionType,
			position: plant.position,
			description: Translations.INTERACTION_WATER,
			callback: (player: alt.Player) => {
				alt.emit('PlantSystem:Serverside:WaterPlant', player, plant._id.toString());
			}
		});
	}, dbSettings.seedPlacingTime);
});

alt.on('PlantSystem:Serverside:WaterPlant', async (player: alt.Player, plantId: string) => {
	const plant = await Database.fetchData<Plants>('_id', plantId, 'plants');
	playerFuncs.emit.scenario(player, dbSettings.wateringScenario, dbSettings.wateringTime);
	if (!player.hasMeta('Watering')) {
		player.setMeta('Watering', true);
		alt.setTimeout(() => {
			if (!dbSettings.allowEveryoneToInteract) {
				if (player.data._id != plant.ownerId) {
					playerFuncs.emit.notification(player, Translations.NOT_ALLOWED_TO_INTERACT);
					return;
				}
			}
			if (dbSettings.useItems) {
				const plantWater = getFromRegistry('plantwater');
				const plantWaterInInventory = playerFuncs.inventory.isInInventory(player, {
					name: plantWater.name
				});
				if (!plantWaterInInventory) {
					playerFuncs.emit.notification(player, Translations.NO_PLANTWATER_IN_INVENTORY);
					return;
				} else if (plantWaterInInventory) {
					updateSinglePlant(plantId.toString(), undefined, undefined, undefined, undefined, undefined, plantWater.data.waterAmount, undefined);
					player.data.inventory[plantWaterInInventory.index].quantity -= 1;
					if (player.data.inventory[plantWaterInInventory.index].quantity <= 0) {
						playerFuncs.inventory.findAndRemove(player, plantWater.name);
					}
				}
			}
			player.deleteMeta('Watering');
		}, dbSettings.wateringTime);
	} else {
		playerFuncs.emit.notification(player, Translations.waitTillWateringFinished);
	}
});

alt.on(
	'PlantSystem:Serverside:HarvestPlant',
	async (player: alt.Player, plantId: string, InteractionType: string, InteractionIdentifier: string) => {
		const plant = await Database.fetchData<Plants>('_id', plantId, 'plants');
		if (!dbSettings.allowEveryoneToInteract) {
			if (player.data._id != plant.ownerId) {
				playerFuncs.emit.notification(player, Translations.NOT_ALLOWED_TO_INTERACT);
				return;
			}
		}
		if (dbSettings.randomizeHarvestOutcome) {
			const harvestOutcome = getFromRegistry('weedbuds');
			const budsInInventory = playerFuncs.inventory.isInInventory(player, { name: harvestOutcome.name });
			const emptySlot = playerFuncs.inventory.getFreeInventorySlot(player);
			if (!budsInInventory) {
				playerFuncs.inventory.inventoryAdd(player, harvestOutcome, emptySlot.slot);
			} else if (budsInInventory) {
				player.data.inventory[budsInInventory.index].quantity += getRandomInt(dbSettings.minOutcome, dbSettings.maxOutcome);
			}
			removePlant(plantId);
			ServerObjectController.remove(plantId.toString());
			ServerTextLabelController.remove(`Plant-${plantId.toString()}`);
			InteractionController.remove(InteractionType, InteractionIdentifier);
			resyncPlayerInventory(player);
		} else {
			const harvestOutcome = getFromRegistry('weedbuds');
			const budsInInventory = playerFuncs.inventory.isInInventory(player, { name: harvestOutcome.name });
			const emptySlot = playerFuncs.inventory.getFreeInventorySlot(player);
			if (!budsInInventory) {
				playerFuncs.inventory.inventoryAdd(player, harvestOutcome, emptySlot.slot);
			} else if (budsInInventory) {
				player.data.inventory[budsInInventory.index].quantity += harvestOutcome.data.amount;
			}
			removePlant(plantId);
			ServerObjectController.remove(plantId.toString());
			ServerTextLabelController.remove(`Plant-${plantId.toString()}`);
			InteractionController.remove(InteractionType, InteractionIdentifier);
			resyncPlayerInventory(player);
		}
		if (dbSettings.logsEnabled) {
			alt.log(`Successfully removed plant with id: ${plantId.toString()}`);
		}
	}
);

export function resyncPlayerInventory(player: alt.Player) {
	playerFuncs.save.field(player, 'inventory', player.data.inventory);
	playerFuncs.sync.inventory(player);
}
