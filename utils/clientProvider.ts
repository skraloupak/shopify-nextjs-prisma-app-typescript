import { ApiVersion, Session } from "@shopify/shopify-api";
import sessionHandler from "./sessionHandler";
import shopify from "./shopify";
import { NextApiRequest, NextApiResponse } from "next";
import NextApiRequestExtended from "./interfaces/NextApiRequestExtended";

const currentApiVersion = ApiVersion.January23;

interface ClientParams {
  req: NextApiRequest | NextApiRequestExtended;
  res: NextApiResponse;
  isOnline: boolean;
}

interface ShopParams {
  shop: string;
}

const fetchSession = async (params: ClientParams) => {
  const { req, res, isOnline } = params;
  //false for offline session, true for online session
  const sessionId = await shopify.session.getCurrentId({
    isOnline: isOnline,
    rawRequest: req,
    rawResponse: res,
  });
  if (!sessionId) {
    throw new Error("Session ID not found");
  }
  const session: Session | undefined = await sessionHandler.loadSession(
    sessionId
  );
  if (!session) {
    throw new Error("Session not found");
  }
  return session;
};

const graphqlClient = async (params: ClientParams) => {
  const { req, res, isOnline } = params;
  const session: Session | undefined = await fetchSession({
    req,
    res,
    isOnline,
  });
  if (!session) {
    throw new Error("Session not found");
  }
  const client = new shopify.clients.Graphql({ session });
  const { shop } = session;
  return { client, shop, session };
};

const restClient = async (params: ClientParams) => {
  const { req, res, isOnline } = params;
  const session: Session | undefined = await fetchSession({
    req,
    res,
    isOnline,
  });
  if (!session) {
    throw new Error("Session not found");
  }
  const client = new shopify.clients.Rest({
    session,
    apiVersion: currentApiVersion,
  });
  const { shop } = session;
  return { client, shop, session };
};

const fetchOfflineSession = async (shop: string) => {
  const sessionID = shopify.session.getOfflineId(shop);
  const session = await sessionHandler.loadSession(sessionID);
  return session;
};

const offline = {
  graphqlClient: async ({ shop }: ShopParams) => {
    if (!shop) {
      throw new Error("Shop not found");
    }
    const session = await fetchOfflineSession(shop);
    if (!session) {
      throw new Error("Session not found");
    }
    const client = new shopify.clients.Graphql({ session });
    return { client, shop, session };
  },
  restClient: async ({ shop }: ShopParams) => {
    const session = await fetchOfflineSession(shop);
    if (!session) {
      throw new Error("Session not found");
    }
    const client = new shopify.clients.Rest({
      session,
      apiVersion: currentApiVersion,
    });
    return { client, shop, session };
  },
};

const clientProvider = { graphqlClient, restClient, offline };

export default clientProvider;
