import { container } from ".";
import { NewsController } from "../../controllers";

export const registerControllers = () => {
  container.registerSingleton("NewsController", NewsController);
};
