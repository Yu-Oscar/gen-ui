import "./globals.css";
import type { Metadata } from "next";

import { EndpointsContext } from "./agent";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ChatHKT",
  description: "ChatHKT",
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
          <EndpointsContext>{props.children}</EndpointsContext>
      </body>
    </html>
  );
}
