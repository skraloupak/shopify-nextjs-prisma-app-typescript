import crypto from "crypto";
import { NextResponse } from "next/server";
import shopify from "@/utils/shopify";
import type { NextApiRequest, NextApiResponse } from "next";

const verifyHmac = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => Promise<void>
): Promise<void> => {
  try {
    const generateHash = crypto
      .createHmac("SHA256", process.env.SHOPIFY_API_SECRET!)
      .update(JSON.stringify(req.body), "utf8")
      .digest("base64");

    const hmac = req.headers["x-shopify-hmac-sha256"];

    if (hmac === undefined) {
      res.status(401).send({
        success: false,
        message: "HMAC verification failed: No HMAC provided",
      });
      return;
    }

    if (shopify.auth.safeCompare(generateHash, hmac)) {
      await next();
    } else {
      res
        .status(401)
        .send({ success: false, message: "HMAC verification failed" });
    }
  } catch (e: any) {
    console.log(`---> An error occured while verifying HMAC`, e.message!);
    throw new NextResponse(
      JSON.stringify({ success: false, message: "HMAC verification failed" }),
      {
        status: 401,
        headers: {
          "content-type": "application/json",
        },
      }
    );
  }
};

export default verifyHmac;
