import "./globals.css";
import {Toaster} from "sonner";
import {delius} from "@/utils/fonts";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
    >
      <body className="min-h-full flex flex-col">
      <>
        <div className="hidden md:block">
          <Toaster
            position="top-right"
            expand
            richColors
            toastOptions={{
              duration: 5000,
              className: `${delius.className} text-3xl`,
            }}
          />
        </div>
        <div className="block md:hidden">
          <Toaster
            position="bottom-center"
            richColors
            toastOptions={{
              duration: 3000,
              className: `${delius.className} text-base`,
            }}
          />
        </div>
      </>
      {children}
      </body>
    </html>
  );
}
