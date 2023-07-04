import useFetch from "@/components/hooks/useFetch";
import { DataTable, Layout, LegacyCard } from "@shopify/polaris";
import { useEffect, useState } from "react";

interface Subscription {
  name: string;
  status: string;
  test: string;
  lineItems: [
    {
      plan: {
        pricingDetails: { price: { amount: string; currencyCode: string } };
      };
    }
  ];
}

const BillingAPI = () => {
  const fetch = useFetch();
  const [rows, setRows] = useState<string[][]>([]);

  async function getActiveSubscriptions() {
    const res = await fetch("/api/apps/debug/getActiveSubscriptions");
    const data = await res!.json();

    //MARK:- Replace this yet another amazing implementation with swr or react-query
    let rowsData: string[][] = [];
    const activeSubscriptions =
      data.body.data.appInstallation.activeSubscriptions;

    if (activeSubscriptions.length === 0) {
      rowsData.push(["No Plan", "N/A", "N/A", "USD 0.00"]);
    } else {
      console.log("Rendering Data");
      activeSubscriptions.map((subscription: Subscription) => {
        const { name, status, test } = subscription;
        const { amount, currencyCode } =
          subscription.lineItems[0].plan.pricingDetails.price;
        rowsData.push([name, status, `${test}`, `${currencyCode} ${amount}`]);
      });
    }
    setRows(rowsData);
  }
  useEffect(() => {
    getActiveSubscriptions();
  }, []);

  return (
    <LegacyCard title="Active Subscriptions" sectioned>
      <DataTable
        columnContentTypes={["text", "text", "text", "text"]}
        headings={["Plan Name", "Status", "Test", "Amount"]}
        rows={rows}
      />
    </LegacyCard>
  );
};

export default BillingAPI;
