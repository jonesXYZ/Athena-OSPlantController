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
export default interface Plants {
	_id?: string;
	owner?: string;
	ownerId?: string;
	position: {
		x: number;
		y: number;
		z: number;
	};
	data: {
		object?: string;
		state?: string;
		time?: number;
		water?: number;
		hasSeeds?: boolean;
		hasFertilizer?: boolean;
		isHarvestable?: boolean;
	};
}
