import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata = {
  title: "FoglaljVelem – Online Időpontfoglaló Rendszer",
  description: "Egyszerű és gyors online időpontfoglaló rendszer szalonok, tanácsadók és edzők számára. Foglalj időpontot pillanatok alatt!",
  keywords: "időpontfoglalás, online foglalás, naptár, fodrász, kozmetikus, edző, tanácsadó, foglaljvelem",
  openGraph: {
    title: "FoglaljVelem – Online Időpontfoglaló Rendszer",
    description: "Egyszerű és gyors online időpontfoglaló rendszer szalonok, tanácsadók és edzők számára.",
    type: "website",
    url: "https://foglaljvelem.hu",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="hu">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
