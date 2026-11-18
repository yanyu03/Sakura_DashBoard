import packageMetadata from "./package.json";

export const APP_VERSION = packageMetadata.version;
export const DESIGN_STANDARD_VERSION = "1.0Sakura";
export const API_VERSION = "v1";

export const VERSION_INFO = Object.freeze({
  name: "SakuraEdu",
  version: APP_VERSION,
  designStandard: DESIGN_STANDARD_VERSION,
  apiVersion: API_VERSION,
});
