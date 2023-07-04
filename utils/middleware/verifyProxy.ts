import crypto from "crypto";
import { NextApiResponse } from "next";
import NextApiRequestExtended from "../interfaces/NextApiRequestExtended";

const verifyProxy = async (
  req: NextApiRequestExtended,
  res: NextApiResponse,
  next: () => Promise<void>
): Promise<void> => {
  const { signature } = req.query as { signature: string };

  const queryURI = encodeQueryData(req.query as { [key: string]: string })
    .replace("/?", "")
    .replace(/&signature=[^&]*/, "")
    .split("&")
    .map((x) => decodeURIComponent(x))
    .sort()
    .join("");

  const calculatedSignature = crypto
    .createHmac("sha256", process.env.SHOPIFY_API_SECRET!)
    .update(queryURI, "utf-8")
    .digest("hex");

  if (calculatedSignature === signature) {
    req.user_shop = req.query.shop as string; //myshopify domain
    await next();
  } else {
    return res.status(401).send({
      success: false,
      message: "Signature verification failed",
    });
  }
};

function encodeQueryData(data: { [key: string]: string }): string {
  const queryString = [];
  for (let d in data) queryString.push(d + "=" + encodeURIComponent(data[d]));
  return queryString.join("&");
}

export default verifyProxy;
