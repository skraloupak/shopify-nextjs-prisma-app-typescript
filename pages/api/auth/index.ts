import shopify from "@/utils/shopify";
import {
  CookieNotFound,
  InvalidOAuthError,
  InvalidSession,
} from "@shopify/shopify-api";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const shop = Array.isArray(req.query.shop)
      ? req.query.shop[0]
      : req.query.shop;

    if (!shop) {
      res.status(500);
      return res.send("No shop provided");
    }

    if (req.query.embedded === "1") {
      const sanitizedShop = shopify.utils.sanitizeShop(shop);
      const queryParams = new URLSearchParams({
        ...req.query,
        shop: sanitizedShop!,
        redirectUri: `/api/auth?shop=${sanitizedShop}&host=${req.query.host}`,
      }).toString();

      return res.redirect(`/exitframe?${queryParams}`);
    }

    return await shopify.auth.begin({
      shop,
      callbackPath: `/api/auth/tokens`,
      isOnline: false,
      rawRequest: req,
      rawResponse: res,
    });
  } catch (e: any) {
    console.error(`---> Error at /auth`, e);
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
