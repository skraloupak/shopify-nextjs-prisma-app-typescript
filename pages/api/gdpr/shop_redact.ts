import withMiddleware from "@/utils/middleware/withMiddleware";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(100).send("Must be POST");
  }
  const { body } = req;
  const shop = req.body.shop_domain;
  console.log("gdpr/shop_redact", body, shop);
};

export default withMiddleware("verifyHmac")(handler);
