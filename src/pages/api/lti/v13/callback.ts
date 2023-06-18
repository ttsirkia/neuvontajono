import * as jose from "jose";
import type { NextApiRequest, NextApiResponse } from "next";
import { LTI13ConfModel } from "../../../../models/modelClasses";

import { LoginService } from "../../../../services/LoginService";
import { dbConnect } from "../../../../utils/database";
import { Role, getSession } from "../../../../utils/session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!req.body.state) {
    return res.status(400).send("LTI launch request does not contain enough information!");
  }

  // Initialize the session based on the session ID stored in the request
  req.headers.cookie = "neuvontajono_sid=" + req.body.state;
  req.cookies["neuvontajono_sid"] = req.body.state;

  await dbConnect();
  const [session, _] = await getSession(req, res);

  if (!req.body.state || !session.ltiKeyId || !session.ltiNonce) {
    await session.destroy();
    return res.status(400).send("Unexpected LTI launch request!");
  }

  // Search the correct LTI key based on the data stored in the session
  const confItem = await LTI13ConfModel.findOne({ keyId: session.ltiKeyId, status: "completed" });
  const sessionNonce = session.ltiNonce;

  // Prevent using the same launch twice
  session.ltiKeyId = "";
  session.ltiNonce = "";

  if (!confItem) {
    await session.commit();
    return res.status(400).send("Unexpected LTI launch request!");
  }

  let LTIPayload = null;
  try {
    if (confItem.jwks) {
      const JWKS = jose.createRemoteJWKSet(new URL(confItem.jwks));
      const { payload } = await jose.jwtVerify(req.body.id_token, JWKS, {
        issuer: confItem.iss,
      });
      LTIPayload = payload;
    } else if (confItem.otherPublic) {
      const { payload } = await jose.jwtVerify(
        req.body.id_token,
        await jose.importSPKI(confItem.otherPublic, "RS256"),
        {
          issuer: confItem.iss,
        }
      );
      LTIPayload = payload;
    } else {
      await session.commit();
      return res.status(400).send("LTI request could not be verified!");
    }
  } catch (e) {
    await session.commit();
    return res.status(400).send("LTI request could not be verified!");
  }

  if (LTIPayload.nonce !== sessionNonce) {
    await session.commit();
    return res.status(400).send("Contents of the LTI launch request do not match with the session!");
  }

  if (
    !LTIPayload.iss ||
    !LTIPayload.given_name ||
    !LTIPayload.family_name ||
    !LTIPayload.email ||
    !LTIPayload.sub ||
    !LTIPayload["https://purl.imsglobal.org/spec/lti/claim/context"] ||
    !(LTIPayload["https://purl.imsglobal.org/spec/lti/claim/context"] as any)["id"] ||
    !(LTIPayload["https://purl.imsglobal.org/spec/lti/claim/context"] as any)["title"] ||
    !LTIPayload["https://purl.imsglobal.org/spec/lti/claim/roles"]
  ) {
    await session.commit();
    return res.status(400).send("LTI launch request does not contain all required information!");
  }

  // Prevent using in embedded mode
  if (
    LTIPayload["https://purl.imsglobal.org/spec/lti/claim/launch_presentation"] &&
    (LTIPayload["https://purl.imsglobal.org/spec/lti/claim/launch_presentation"] as any)["document_target"] !== "window"
  ) {
    await session.commit();
    return res.status(400).send("Tool cannot be embedded, only window mode is supported!");
  }

  const toolId = LTIPayload.iss.toString();
  const firstName = LTIPayload.given_name.toString();
  const lastName = LTIPayload.family_name.toString();
  const email = LTIPayload.email.toString();
  const userLTI_id = LTIPayload.sub.toString();
  const courseLTI_id = (LTIPayload["https://purl.imsglobal.org/spec/lti/claim/context"] as any)["id"].toString();
  const courseName = (LTIPayload["https://purl.imsglobal.org/spec/lti/claim/context"] as any)["title"].toString();

  let language = null;
  const lp = "https://purl.imsglobal.org/spec/lti/claim/launch_presentation";
  if (LTIPayload[lp] && (LTIPayload[lp] as any)["locale"]) {
    language = (LTIPayload[lp] as any)["locale"].split("-")[0];
  }

  let role: Role = "student";
  const roleURI = "https://purl.imsglobal.org/spec/lti/claim/roles";
  const taRole = "http://purl.imsglobal.org/vocab/lis/v2/membership/Instructor#TeachingAssistant";
  const teacherRole = "http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor";
  if ((LTIPayload[roleURI] as string[]).indexOf(teacherRole) >= 0) {
    role = "teacher";
  } else if ((LTIPayload[roleURI] as string[]).indexOf(taRole) >= 0) {
    role = "staff";
  }

  // This will also commit changes to session
  return LoginService.login(
    { courseName, courseLTI_id, toolId },
    { firstName, lastName, email, role, userLTI_id, language },
    req,
    res
  );
}

// Avoid incorrect messages about API calls without responses because of session cookie handling
export const config = {
  api: {
    externalResolver: true,
  },
};
