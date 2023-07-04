import clientProvider from "@/utils/clientProvider";
import withMiddleware from "@/utils/middleware/withMiddleware";
import { NextApiRequest, NextApiResponse } from "next";

interface GqlResponse {
  body: {
    data: {
      appSubscriptionCreate: {
        confirmationUrl: string;
        userErrors: [{ field: string; message: string }];
        appSubscription: {
          id: string;
          status: string;
        };
      };
    };
  };
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  //false for offline session, true for online session
  const { client, shop } = await clientProvider.graphqlClient({
    req,
    res,
    isOnline: true,
  });
  const returnUrl = `${process.env.SHOPIFY_APP_URL}/api/auth?shop=${shop}`;

  const planName = "$10.25 plan";
  const planPrice = 10.25; //Always a decimal

  const response: GqlResponse = await client.query({
    data: `mutation CreateSubscription{
    appSubscriptionCreate(
      name: "${planName}"
      returnUrl: "${returnUrl}"
      test: true
      lineItems: [
        {
          plan: {
            appRecurringPricingDetails: {
              price: { amount: ${planPrice}, currencyCode: USD }
            }
          }
        }
      ]
    ) {
      userErrors {
        field
        message
      }
      confirmationUrl
      appSubscription {
        id
        status
      }
    }
  }
`,
  });

  if (response.body.data.appSubscriptionCreate.userErrors.length > 0) {
    console.log(
      `--> Error subscribing ${shop} to plan:`,
      response.body.data.appSubscriptionCreate.userErrors
    );
    res.status(400).send({ error: "An error occured." });
    return;
  }

  res.status(200).send({
    confirmationUrl: `${response.body.data.appSubscriptionCreate.confirmationUrl}`,
  });
  return;
};

export default withMiddleware("verifyRequest")(handler);
