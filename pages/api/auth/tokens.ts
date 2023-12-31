import sessionHandler from "@/utils/sessionHandler";
import shopify from "@/utils/shopify";
import {
  CookieNotFound,
  InvalidOAuthError,
  InvalidSession,
} from "@shopify/shopify-api";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const callbackResponse = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    const { session } = callbackResponse;

    await sessionHandler.storeSession(session);

    const webhookRegisterResponse = await shopify.webhooks.register({
      session,
    });
    console.log(webhookRegisterResponse);

    return await shopify.auth.begin({
      shop: session.shop,
      callbackPath: `/api/auth/callback`,
      isOnline: true,
      rawRequest: req,
      rawResponse: res,
    });
  } catch (e: any) {
    console.error(`---> Error at /auth/tokens`, e);

    const { shop } = req.query;
    switch (true) {
      case e instanceof CookieNotFound:
        res.redirect(`/exitframe/${shop}`);
        break;
      case e instanceof InvalidOAuthError:
      case e instanceof InvalidSession:
        res.redirect(`/api/auth?shop=${shop}`);
        break;
      default:
        res.status(500).send(e.message);
        break;
    }
  }
};

export default handler;
