import "./globals.css"; // Ensure this is applied globally
import ChatBot from "./portal/component/Chatbot/ChatBot"; // Assuming ChatBot is shared across layouts
import { GlobalProvider } from "./portal/GlobalContext";
import Providers from "./providers";

export const metadata = {
  title: "M5C Logistic Solution Pvt. Ltd.",
  description: "M5C Logistic Solution Pvt. Ltd. web portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/dzm2myz.css" />
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
