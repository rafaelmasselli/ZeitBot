import { injectable, inject } from "tsyringe";
import { UserRegistrationStep } from "@/shared/entities/user.entity";
import { IRegistrationStep } from "./interfaces/registration-step.interface";
import { StartRegistrationStep } from "./steps/start-registration.step";
import { CategoriesStep } from "./steps/categories.step";

@injectable()
export class RegistrationStepFactory {
  private steps: Map<UserRegistrationStep, IRegistrationStep>;

  constructor(
    @inject(StartRegistrationStep) private startStep: StartRegistrationStep,
    @inject(CategoriesStep) private categoriesStep: CategoriesStep
  ) {
    this.steps = new Map<UserRegistrationStep, IRegistrationStep>();
    this.steps.set(UserRegistrationStep.NONE, this.startStep);
    this.steps.set(UserRegistrationStep.AWAITING_CATEGORIES, this.categoriesStep);
  }

  getStep(stepType: UserRegistrationStep): IRegistrationStep {
    const step = this.steps.get(stepType);
    if (!step) {
      throw new Error(`Step not found for type: ${stepType}`);
    }
    return step;
  }
}
