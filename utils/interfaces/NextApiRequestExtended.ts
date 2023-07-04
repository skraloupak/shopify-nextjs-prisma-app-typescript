import { Session } from "@shopify/shopify-api";
import { NextApiRequest } from "next";

interface NextApiRequestExtended extends NextApiRequest {
  user_shop?: string;
  user_session?: Session;
}

export default NextApiRequestExtended;
