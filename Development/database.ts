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
import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import Plants from './interface';
import ChatController from '../../server/systems/chat';

import { PERMISSIONS } from '../../shared/flags/PermissionFlags';
import { playerFuncs } from '../../server/extensions/Player';
import { getVectorInFrontOfPlayer } from '../../server/utility/vector';
import { InteractionController } from '../../server/systems/interaction';
import { dbSettings, db_plantObjects, getRandomInt, Translations } from './settings';
import { getFromRegistry } from '../../shared/items/itemRegistry';
import { resyncPlayerInventory } from './events';
import { ServerObjectController } from '../../server/streamers/object';
import { ServerTextLabelController } from '../../server/streamers/textlabel';

ChatController.addCommand('testPlant', '/testPlant - testing this glorious plantsystem without items!', PERMISSIONS.ADMIN, buildPlant);

export async function buildPlant(player: alt.Player) {
	const forwardVector = getVectorInFrontOfPlayer(player, 2);

	const newDocument = {
		owner: player.data.name,
		ownerId: player.data._id,
		position: {
			x: forwardVector.x,
			y: forwardVector.y,
			z: forwardVector.z - 1
		},
		data: {
			object: db_plantObjects.small,
			state: 'Beginning',
			time: 60,
			water: 0,
			hasSeeds: false,
			hasFertilizer: false,
			isHarvestable: false
		}
	};

	if (dbSettings.plantLimit) {
		const getPlayerPlants = await Database.selectData<Plants>('plants', ['ownerId']);
		if (getPlayerPlants.length >= dbSettings.maximumAllowedPlants) {
			playerFuncs.emit.notification(player, 'You already have planted the maximum of allowed plants.');
			return;
		}
	}

	const databasePlants = await Database.insertData<Plants>(newDocument, 'plants', true);
	if (!databasePlants) {
		generatePlantError('Could not insert data for the table <plants>.');
	}

	databasePlants.data.state = dbSettings.beginngStateText;
	ServerObjectController.append({
		pos: { x: forwardVector.x, y: forwardVector.y, z: forwardVector.z - 1 },
		model: db_plantObjects.small,
		uid: databasePlants._id.toString()
	});

	ServerTextLabelController.append({
		pos: { x: forwardVector.x, y: forwardVector.y, z: forwardVector.z },
		data: `${Translations.STATE} ~g~${databasePlants.data.state}~n~~w~${Translations.TIME} ~g~${databasePlants.data.time}~n~~w~${Translations.WATER} ~g~${databasePlants.data.water}%~n~~w~${Translations.FERTILIZER} ~g~${databasePlants.data.hasFertilizer}`,
		uid: `Plant-${databasePlants._id.toString()}`
	});

	const placingInteraction = InteractionController.add({
		position: {
			x: forwardVector.x,
			y: forwardVector.y,
			z: forwardVector.z - 1
		},
		description: Translations.INTERACTION_PLACESEEDS,
		identifier: `Plant-${databasePlants._id.toString()}`,
		type: `WeedPlant-Interaction`,
		callback: (player: alt.Player) => {
			if (dbSettings.useItems) {
				const seeds = getFromRegistry('weedseeds');
				const seedsInInventory = playerFuncs.inventory.isInInventory(player, {
					name: seeds.name
				});

				if (!seedsInInventory) {
					playerFuncs.emit.notification(player, Translations.NO_SEEDS_IN_INVENTORY);
					return;
				} else if (seedsInInventory) {
					player.data.inventory[seedsInInventory.index].quantity -= 1;
					if (player.data.inventory[seedsInInventory.index].quantity <= 0) {
						playerFuncs.inventory.findAndRemove(player, seeds.name);
					}
				}
			}

			playerFuncs.emit.scenario(player, dbSettings.seedPlacingScenario, dbSettings.seedPlacingTime);
			alt.setTimeout(() => {
				alt.emit(
					'PlantSystem:Serverside:PlaceSeeds',
					databasePlants._id.toString(),
					placingInteraction.type,
					placingInteraction.getIdentifier()
				);
			}, dbSettings.seedPlacingTime);
		}
	});
	playerFuncs.emit.notification(player, Translations.PLANT_SUCCESSFULLY_CREATED);
}

export async function loadPlants() {
	const allDatabasePlants = await Database.fetchAllData<Plants>('plants');

	if (!allDatabasePlants) {
		generatePlantError('Could not fetch data for table <plants>.');
	}

	allDatabasePlants.forEach(async (plant) => {
		if (!plant.data.hasSeeds) {
			const placingInteraction = InteractionController.add({
				position: {
					x: plant.position.x,
					y: plant.position.y,
					z: plant.position.z
				},
				description: Translations.INTERACTION_PLACESEEDS,
				identifier: `Plant-${plant._id.toString()}`,
				type: `WeedPlant-Interaction`,
				callback: (player: alt.Player) => {
					if (!dbSettings.allowEveryoneToInteract) {
						if (player.data._id != plant.ownerId) {
							playerFuncs.emit.notification(player, Translations.NOT_ALLOWED_TO_INTERACT);
							return;
						}
					}
					playerFuncs.emit.scenario(player, dbSettings.seedPlacingScenario, dbSettings.seedPlacingTime);
					alt.setTimeout(() => {
						if (!plant._id.toString()) return;
						alt.emit(
							'PlantSystem:Serverside:PlaceSeeds',
							plant._id.toString(),
							placingInteraction.pos,
							placingInteraction.type,
							placingInteraction.getIdentifier()
						);
					}, dbSettings.seedPlacingTime);
				}
			});
		} else if (!plant.data.hasFertilizer) {
			const fertilizerInteraction = InteractionController.add({
				position: {
					x: plant.position.x,
					y: plant.position.y,
					z: plant.position.z
				},
				description: Translations.INTERACTION_FERTILIZE,
				identifier: `Plant-${plant._id.toString()}`,
				type: `WeedPlant-Interaction`,
				callback: (player: alt.Player) => {
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
						}
					}

					if (!dbSettings.allowEveryoneToInteract) {
						if (player.data._id != plant.ownerId) {
							playerFuncs.emit.notification(player, Translations.NOT_ALLOWED_TO_INTERACT);
							return;
						}
					}

					playerFuncs.emit.scenario(player, dbSettings.fertilizeScenario, dbSettings.fertilizeTime);

					alt.setTimeout(() => {
						if (!plant._id.toString()) return;
						alt.emit(
							'PlantSystem:Serverside:Fertilize',
							plant._id.toString(),
							fertilizerInteraction.pos,
							fertilizerInteraction.type,
							fertilizerInteraction.getIdentifier()
						);
					}, dbSettings.fertilizeTime);
				}
			});
		} else if (plant.data.water >= 0 && plant.data.water < 100) {
			const waterInteraction = InteractionController.add({
				position: {
					x: plant.position.x,
					y: plant.position.y,
					z: plant.position.z
				},
				description: Translations.INTERACTION_WATER,
				identifier: `Plant-${plant._id.toString()}`,
				type: `WeedPlant-Interaction`,
				callback: (player: alt.Player) => {
					alt.emit('PlantSystem:Serverside:WaterPlant', player, plant._id.toString());
					/* */
				}
			});
		}

		if (plant.data.time <= dbSettings.plantMediumState && plant.data.time >= dbSettings.plantEndState) {
			alt.setTimeout(() => {
				ServerObjectController.remove(plant._id.toString());
				ServerObjectController.append({
					model: db_plantObjects.medium,
					pos: plant.position,
					uid: plant._id.toString()
				});
				updateSinglePlant(plant._id, undefined, undefined, undefined, undefined, dbSettings.mediumStateText, undefined, undefined);
				if (dbSettings.logsEnabled) {
					alt.log('Some plant was updated to medium state.');
				}
			}, 250);
		}

		if (plant.data.time <= dbSettings.plantEndState && plant.data.time >= 0) {
			alt.setTimeout(() => {
				ServerObjectController.remove(plant._id.toString());
				ServerObjectController.append({
					model: db_plantObjects.large,
					pos: plant.position,
					uid: plant._id.toString()
				});
				updateSinglePlant(plant._id, undefined, undefined, undefined, undefined, dbSettings.endStateText, undefined, undefined);
				if (dbSettings.logsEnabled) {
					alt.log('Some plant was updated to end state.');
				}
			}, 250);
		}
		if (plant.data.time > 0) {
			ServerTextLabelController.append({
				pos: { x: plant.position.x, y: plant.position.y, z: plant.position.z },
				data: `${Translations.STATE} ~g~${plant.data.state}~n~~w~${Translations.TIME} ~g~${plant.data.time}~n~~w~${Translations.WATER} ~g~${plant.data.water}%~n~~w~${Translations.FERTILIZER} ~g~${plant.data.hasFertilizer}`,
				uid: `Plant-${plant._id.toString()}`
			});
		}

		if (plant.data.time == 0) {
			plant.data.state = dbSettings.harvestableText;
			alt.setTimeout(() => {
				ServerTextLabelController.remove(`Plant-${plant._id.toString()}`);
				ServerTextLabelController.append({
					pos: {
						x: plant.position.x,
						y: plant.position.y,
						z: plant.position.z
					},
					data: `${Translations.STATE} ~g~${plant.data.state}`,
					uid: `Plant-${plant._id.toString()}`
				});
			}, 250);
		}

		ServerObjectController.append({
			model: plant.data.object,
			pos: plant.position,
			uid: plant._id.toString()
		});
	});

	if (dbSettings.logsEnabled) {
		alt.log(`Found ${allDatabasePlants.length} Plants to load from the Database.`);
	}
}

export async function updatePlants() {
	const allDatabasePlants = Database.fetchAllData<Plants>('plants');
	if (!allDatabasePlants) {
		generatePlantError('Could not fetch data for table <plants>.');
	}

	(await allDatabasePlants).forEach(async (plant) => {
		if (!plant.data.hasSeeds || !plant.data.hasFertilizer || plant.data.water < dbSettings.plantRequiredWaterToGrowh) return;

		ServerTextLabelController.remove(`Plant-${plant._id.toString()}`);
		ServerTextLabelController.append({
			pos: plant.position,
			data: `${Translations.STATE} ~g~${plant.data.state}~n~~w~${Translations.TIME} ~g~${plant.data.time}~n~~w~${Translations.WATER} ~g~${plant.data.water}%~n~~w~${Translations.FERTILIZER} ~g~${plant.data.hasFertilizer}`,
			uid: `Plant-${plant._id.toString()}`
		});

		if (plant.data.water >= 100) plant.data.water = 100;
		if (plant.data.time == dbSettings.plantMediumState) {
			alt.setTimeout(() => {
				updateSinglePlant(plant._id, undefined, undefined, undefined, undefined, dbSettings.mediumStateText, undefined, undefined);
				ServerObjectController.remove(plant._id.toString());
				ServerObjectController.append({
					model: db_plantObjects.medium,
					pos: plant.position,
					uid: plant._id.toString()
				});
				if (dbSettings.logsEnabled) {
					alt.log('Some plant was updated to medium state.');
				}
			}, 250);
		}

		if (plant.data.time == dbSettings.plantEndState) {
			alt.setTimeout(() => {
				updateSinglePlant(plant._id, undefined, undefined, undefined, undefined, dbSettings.endStateText, undefined, undefined);
				ServerObjectController.remove(plant._id.toString());
				ServerObjectController.append({
					model: db_plantObjects.large,
					pos: plant.position,
					uid: plant._id.toString()
				});
				if (dbSettings.logsEnabled) {
					alt.log('Some plant was updated to end state.');
				}
			}, 250);
		}
		if (plant.data.time != 0) {
			await Database.updatePartialData(
				plant._id,
				{
					data: {
						object: plant.data.object,
						state: plant.data.state,
						time: plant.data.time - 1,
						water: plant.data.water - dbSettings.plantWaterLossPerMinute,
						hasSeeds: plant.data.hasSeeds,
						hasFertilizer: plant.data.hasFertilizer,
						isHarvestable: plant.data.isHarvestable
					}
				},
				'plants'
			);
		} else if (plant.data.time == 0) {
			plant.data.isHarvestable = true;
			plant.data.state = dbSettings.harvestableText;
			await Database.updatePartialData(
				plant._id,
				{
					data: {
						object: plant.data.object,
						state: plant.data.state,
						time: plant.data.time,
						water: plant.data.water,
						hasSeeds: plant.data.hasSeeds,
						hasFertilizer: plant.data.hasFertilizer,
						isHarvestable: plant.data.isHarvestable
					}
				},
				'plants'
			);
			alt.setTimeout(() => {
				ServerTextLabelController.remove(`Plant-${plant._id.toString()}`);
				ServerTextLabelController.append({
					pos: plant.position,
					data: `${Translations.STATE} ~g~${plant.data.state}`,
					uid: `Plant-${plant._id.toString()}`
				});

				InteractionController.remove(`WeedPlant-Interaction`, `Plant-${plant._id.toString()}`);
				const harvestInteraction = InteractionController.add({
					position: plant.position,
					description: dbSettings.harvestableText,
					callback: (player: alt.Player) => {
						alt.emit(
							'PlantSystem:Serverside:HarvestPlant',
							player,
							plant._id.toString(),
							harvestInteraction.type,
							harvestInteraction.getIdentifier()
						);
					}
				});
			}, 250);
			return;
		}
	});
}

export async function updateSinglePlant(
	idToUpdate?: string,
	seedState?: boolean,
	fertilizerState?: boolean,
	harvestState?: boolean,
	object?: string,
	state?: string,
	water?: number,
	time?: number
) {
	const plant = await Database.fetchData<Plants>('_id', idToUpdate, 'plants');

	if (seedState != undefined) plant.data.hasSeeds = seedState;
	if (fertilizerState != undefined) plant.data.hasFertilizer = fertilizerState;
	if (harvestState != undefined) plant.data.isHarvestable = harvestState;
	if (object != undefined) plant.data.object = object;
	if (state != undefined) plant.data.state = state;
	if (time != undefined) plant.data.time = time;
	if (water != undefined) plant.data.water += water;

	if (plant.data.water >= 100) plant.data.water = 100;

	await Database.updatePartialData(
		idToUpdate,
		{
			data: {
				object: plant.data.object,
				state: plant.data.state,
				time: plant.data.time,
				water: plant.data.water,
				hasSeeds: plant.data.hasSeeds,
				hasFertilizer: plant.data.hasFertilizer,
				isHarvestable: plant.data.isHarvestable
			}
		},
		'plants'
	);

	if (dbSettings.logsEnabled) {
		alt.log(`Updating Plant with the ID: ${plant._id.toString()}.`);
		if (object) alt.log(`Updating object (Param) >> ${object}`);
		if (state) alt.log(`Updating state (Param) >> ${state}`);
		if (time) alt.log(`Updating time (Param) >> ${time}`);
		if (water) alt.log(`Updating water (Param) >> ${water}`);
		if (seedState) alt.log(`Updating seedState (Param) >> ${seedState}`);
		if (fertilizerState) alt.log(`Updating fertilizerState (Param) >> ${fertilizerState}`);
		if (harvestState) alt.log(`Updating harvestState (Param) >> ${harvestState}`);
	}
}

export async function removePlant(plantId: string) {
	await Database.deleteById(plantId, 'plants');
	if (dbSettings.logsEnabled) {
		alt.log(`Successfully removed plant with the id: ${plantId}`);
	}
}

function generatePlantError(msg: string): never {
	throw Error(msg);
}
