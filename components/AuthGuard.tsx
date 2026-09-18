"use client";
import { useEffect } from "react"; import { usePathname, useRouter } from "next/navigation";
export default function AuthGuard({children}:{children:React.ReactNode}){const router=useRouter();const path=usePathname();useEffect(()=>{if(path!=="/login"&&!localStorage.getItem("production-flow-auth"))router.replace("/login");},[path,router]);return <>{children}</>}
