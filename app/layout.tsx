import "./globals.css";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import { DataProvider } from "@/components/DataProvider";
export const metadata={title:"ProductionFlow",description:"Sistema de PCP"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body><AuthGuard><DataProvider><div className="flex min-h-screen"><Sidebar/><main className="min-w-0 flex-1 bg-white">{children}</main></div></DataProvider></AuthGuard></body></html>}
