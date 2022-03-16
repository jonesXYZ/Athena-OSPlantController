import { ItemEffects } from "../../../server/systems/itemEffects";
import { PlantController } from "./plant-controller";
import { PLANT_EVENTS } from "./server-items";

ItemEffects.add(PLANT_EVENTS.GROW_PLANT, PlantController.growPlant);