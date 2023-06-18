import type { NextApiRequest, NextApiResponse } from "next";
const randomstring = require("randomstring");

import { LTI13ConfModel } from "../../../../models/modelClasses";
import { dbConnect } from "../../../../utils/database";
import { getSession } from "../../../../utils/session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const searchParams: any = { iss: req.body.iss, status: "completed" };
  if (req.body.client_id) {
    searchParams.clientId = req.body.client_id;
  }
  if (req.body.lti_deployment_id) {
    searchParams.deploymentId = req.body.lti_deployment_id;
  }
  const confItem = await LTI13ConfModel.findOne(searchParams);

  if (!confItem) {
    return res.status(400).send("Unknown LTI launch issuer!");
  }

  const [session, _] = await getSession(req, res);

  const nonce = randomstring.generate();
  const params = new URLSearchParams({
    scope: "openid",
    response_type: "id_token",
    client_id: req.body.client_id,
    redirect_uri: `${process.env.HOSTNAME_URL}/neuvontajono/api/lti/v13/callback`,
    login_hint: req.body.login_hint,
    state: session.id, // session ID is stored in the request to resume the session
    response_mode: "form_post",
    nonce,
    prompt: "none",
  });

  session.ltiKeyId = confItem.keyId;
  session.ltiNonce = nonce;
  await session.commit();

  const url = new URL(confItem.loginURL + "?" + params.toString());
  return res.redirect(url.href);
}

// Avoid incorrect messages about API calls without responses because of session cookie handling
export const config = {
  api: {
    externalResolver: true,
  },
};
