// If you have the recommended extension installed, create a new page and type `createproxy` to generate proxy route boilerplate

import clientProvider from "@/utils/clientProvider";
import NextApiRequestExtended from "@/utils/interfaces/NextApiRequestExtended";
import withMiddleware from "@/utils/middleware/withMiddleware";
import { NextApiResponse } from "next";

const handler = async (req: NextApiRequestExtended, res: NextApiResponse) => {
  const { client } = await clientProvider.offline.graphqlClient({
    shop: req.user_shop,
  });
  res.status(200).send({ content: "Proxy Be Working" });
};

export default withMiddleware("verifyProxy")(handler);
