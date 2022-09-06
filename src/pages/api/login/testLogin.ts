import type { NextApiRequest, NextApiResponse } from "next";
import { LoginService } from "../../../services/LoginService";
import { Role } from "../../../utils/session";

// http://localhost:3002/neuvontajono/api/login/testLogin?firstName=First&lastName=Last&course=Course+1&role=teacher&language=fi

/**
 * This API endpoint can be used in development to log in without a LMS or
 * to change the login parameters easily. Blocked in production environment.
 */
const LoginHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "Cannot be used in production mode." });
  }

  if (
    !req.query.firstName ||
    !req.query.lastName ||
    !req.query.role ||
    !req.query.course ||
    !req.query.language ||
    ["student", "teacher", "staff"].indexOf(req.query.role.toString()) < 0
  ) {
    return res.status(500).json({ error: true });
  }

  const toolId = "Test tool";
  const firstName = req.query.firstName.toString();
  const lastName = req.query.lastName.toString();
  const email = "user@example.com";
  const userLTI_id = `User|${firstName}|${lastName}`;
  const courseLTI_id = req.query.course.toString();
  const courseName = req.query.course.toString();
  const language = req.query.language.toString();
  let role: Role = req.query.role.toString() as Role;

  return LoginService.login(
    { courseName, courseLTI_id, toolId },
    { firstName, lastName, email, role, userLTI_id, language },
    req,
    res
  );
};

export const config = {
  api: {
    externalResolver: true,
  },
};

export default LoginHandler;
