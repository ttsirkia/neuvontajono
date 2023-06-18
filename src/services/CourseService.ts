import { Course, CourseDTO } from "../models/Course";
import { CourseModel } from "../models/modelClasses";
import { User } from "../models/User";
import { dbConnect } from "../utils/database";

export namespace CourseService {
  // ************************************************************************************************
  export const findById = async (id: string) => {
    await dbConnect();
    return await CourseModel.findById(id);
  };

  // ************************************************************************************************
  export const findByCourseId = async (id: string) => {
    await dbConnect();
    return await CourseModel.findOne({ courseId: id });
  };

  // ************************************************************************************************
  export const findOrCreate = async (name: string, courseId: string, user: User) => {
    await dbConnect();

    const result = await CourseModel.findOrCreate({ courseId }, { name, courseId, createdBy: user._id });

    // Always update the name of the course
    if (!result.created) {
      result.doc.name = name;
      await result.doc.save();
    }

    return result;
  };

  // ************************************************************************************************
  export const create = async (course: Partial<Course>) => {
    await dbConnect();
    return await CourseModel.create(course);
  };

  // ************************************************************************************************
  export const update = async (course: Course, newData: CourseDTO) => {
    await dbConnect();
    return await CourseModel.findOneAndUpdate({ _id: course.id }, { $set: { ...newData } });
  };
}
