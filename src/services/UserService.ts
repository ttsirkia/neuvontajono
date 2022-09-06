import { UserModel } from "../models/modelClasses";
import { dbConnect } from "../utils/database";

/**
 * Handles all actions related to the user in database level.
 */
export namespace UserService {
  // ************************************************************************************************
  export const findOrCreate = async (
    userId: string,
    toolId: string,
    firstName: string,
    lastName: string,
    email: string
  ) => {
    await dbConnect();

    const combinedId = toolId + "|" + userId;
    const result = await UserModel.findOrCreate(
      { ltiId: combinedId },
      { name: { first: firstName, last: lastName }, ltiId: combinedId, email: email }
    );

    // Always update the name and email of the user
    if (!result.created) {
      result.doc.name = { first: firstName, last: lastName };
      result.doc.email = email;
      await result.doc.save();
    }

    return result;
  };

  // ************************************************************************************************
  export const find = async (id: string) => {
    await dbConnect();
    return await UserModel.findById(id);
  };
}
