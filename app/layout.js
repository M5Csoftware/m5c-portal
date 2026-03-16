import "./globals.css"; // Ensure this is applied globally
import ChatBot from "./portal/component/Chatbot/ChatBot"; // Assuming ChatBot is shared across layouts
import { GlobalProvider } from "./portal/GlobalContext";
import Providers from "./providers";

export const metadata = {
  title: "M5C Logistic Solution Pvt. Ltd. - Web Portal",
  description: "Advanced logistics and shipment management portal for M5C Logistic Solution Pvt. Ltd.",
  openGraph: {
    title: "M5C Logistic Solution Pvt. Ltd.",
    description: "Manage your shipments, manifests, and logistics seamlessly with the M5C Web Portal.",
    url: "https://m5c-portal.vercel.app", // Placeholder, user to update if domain changes
    siteName: "M5C Portal",
    images: [
      {
        url: "/logo.png", // Ensure this exists in public/ or update path
        width: 800,
        height: 600,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "M5C Logistic Solution Pvt. Ltd.",
    description: "Manage your shipments, manifests, and logistics seamlessly with the M5C Web Portal.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
        <link rel="preload" as="style" href="https://use.typekit.net/dzm2myz.css" />
        <link rel="stylesheet" href="https://use.typekit.net/dzm2myz.css" media="print" onLoad="this.media='all'" />
        <noscript>
          <link rel="stylesheet" href="https://use.typekit.net/dzm2myz.css" />
        </noscript>
      </head>
      <body className="font-lato">
        <Providers>
          <GlobalProvider>
            <div className="flex flex-col">
              <main>{children}</main>
              {/* If ChatBot is global */}
              {/* <ChatBot /> */}
            </div>
          </GlobalProvider>
        </Providers>
      </body>
    </html>
  );
}
