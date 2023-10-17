import { object, string } from "yup";

export const PlanetSchema = object({
  name: string().required(),
  description: string(),
  img: string(),
  velocity: string(),
  distance: string(),
  position: string(),
});
