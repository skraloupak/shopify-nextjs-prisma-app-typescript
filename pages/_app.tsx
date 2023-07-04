import { NavigationMenu } from "@shopify/app-bridge-react";
import { NavigationLink } from "@shopify/app-bridge-react/components/NavigationMenu/NavigationMenu";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import translations from "@shopify/polaris/locales/en.json";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import AppBridgeProvider from "../components/providers/AppBridgeProvider";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <PolarisProvider i18n={translations}>
      <AppBridgeProvider>
        <NavigationMenu
          navigationLinks={[
            {
              label: "Fetch Data",
              destination: "/debug/getData",
            },
            {
              label: "Billing API",
              destination: "/debug/billing",
            },
          ]}
          matcher={(link: NavigationLink) =>
            router.pathname === link.destination
          }
        />
        <Component {...pageProps} />
      </AppBridgeProvider>
    </PolarisProvider>
  );
}
