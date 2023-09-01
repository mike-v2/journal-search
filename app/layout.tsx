import Navbar from "@/components/navbar"
import { Metadata } from "next"
import '@/styles/globals.css'
import '@etchteam/next-pagination/dist/index.css'
import { Josefin_Sans } from 'next/font/google'
import NextAuthProvider from "@/pages/api/auth/nextAuthProvider"

const josefin = Josefin_Sans({
  subsets: ['latin'],
  weight: ['500', '700'],
});

export const metadata: Metadata = {
  title: "Harry's Journals",
  description: 'Explore a life in the 1930s and 40s with the help of AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="business" >
      <body className={`${josefin.className} bg-slate-800 text-slate-400`}>
        <NextAuthProvider>
          <Navbar />
          {children}
        </NextAuthProvider>
      </body>
    </html>
  )
}