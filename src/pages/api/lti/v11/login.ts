import type { NextApiRequest, NextApiResponse } from "next";
import { LTIConfModel } from "../../../../models/modelClasses";

import { LoginService } from "../../../../services/LoginService";
import { dbConnect } from "../../../../utils/database";
import { Role } from "../../../../utils/session";

const lti = require("ims-lti");

const LoginHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  if (req.body.oauth_consumer_key) {
    const ltiKey = req.body.oauth_consumer_key.toString();
    const ltiConf = await LTIConfModel.findOne({ version: "11", name: ltiKey });
    if (ltiConf) {
      const secret = JSON.parse(ltiConf.content)["secret"];
      const provider = new lti.Provider(ltiKey, secret);

      // Add neuvontajono manually to path because it is originally missing
      // and validating the hash would fail. Also ims-lti library cannot
      // find the information about the used protocol without setting it here.
      const r: any = req;
      r.protocol = req.headers["x-forwarded-proto"];
      r.url = "/neuvontajono/api/lti/v11/login";

      provider.valid_request(req, function (err: any, isValid: boolean) {
        if (!err && isValid) {
          const toolId = req.body.tool_consumer_instance_guid;
          const firstName = req.body.lis_person_name_given;
          const lastName = req.body.lis_person_name_family;
          const email = req.body.lis_person_contact_email_primary;
          const userLTI_id = req.body.user_id;
          const courseLTI_id = req.body.context_id;
          const courseName = req.body.context_title;

          let language = null;
          if (req.body.launch_presentation_locale) {
            language = req.body.launch_presentation_locale.split("-")[0];
          }

          let role: Role = "student";
          if (/TeachingAssistant|TA/.test(req.body.roles)) {
            role = "staff";
          } else if (/Instructor/.test(req.body.roles)) {
            role = "teacher";
          }

          return LoginService.login(
            { courseName, courseLTI_id, toolId },
            { firstName, lastName, email, role, userLTI_id, language },
            req,
            res
          );
        } else {
          return res.status(500).send({ error: "LTI Validation failed!" });
        }
      });
    } else {
      return res.status(500).send({ error: "Unknown LTI key!" });
    }
  } else {
    return res.status(500).send({ error: "No LTI key defined!" });
  }
};

export const config = {
  api: {
    externalResolver: true,
  },
};

export default LoginHandler;
