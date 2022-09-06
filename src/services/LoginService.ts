import { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "../utils/database";
import { getSession, Role } from "../utils/session";
import { CourseService } from "./CourseService";
import { UserService } from "./UserService";

// ************************************************************************************************

type CourseDetails = {
  courseName: string;
  courseLTI_id: string;
  toolId: string;
};

type UserDetails = {
  firstName: string;
  lastName: string;
  userLTI_id: string;
  email: string;
  role: Role;
  language: string;
};

// ************************************************************************************************

/**
 * Provides the functionality to log in and set session data.
 */
export namespace LoginService {
  // ************************************************************************************************
  export const login = async (course: CourseDetails, user: UserDetails, req: NextApiRequest, res: NextApiResponse) => {
    await dbConnect();
    const [session, _] = await getSession(req, res);
    const userObject = await UserService.findOrCreate(
      user.userLTI_id,
      course.toolId,
      user.firstName,
      user.lastName,
      user.email
    );
    const courseObject = await CourseService.findOrCreate(course.courseName, course.courseLTI_id, userObject.doc);

    let language = user.language;
    if (["en", "fi"].indexOf(user.language) < 0) {
      language = courseObject.doc.defaultLanguage || process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || "en";
    }

    session.language = language;
    session.userId = userObject.doc.id;
    session.courseId = courseObject.doc.id;
    session.role = user.role;

    // Change course id to session if the course is combined with an another course
    if (courseObject.doc.combined && user.role !== "teacher") {
      const combinedCourse = await CourseService.findByCourseId(courseObject.doc.combined);
      if (combinedCourse) {
        session.courseId = combinedCourse.id;
      }
    }

    await session.commit();
    return res.redirect(303, "/neuvontajono");
  };
}
