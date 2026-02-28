import Header from "@/modules/home/components/header";
import { Metadata } from "next";
import  Footer  from "@/modules/home/components/footer";

export const metadata: Metadata = {
    title: {
        template: "VibeCode - Editor",
        default: "Code Editor For VibeCoders - VibeCode",
    },
};

export default function HomeLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col ">
            <Header />
            <main className="flex-1 pt-16">
                {children}
            </main>
            <Footer />
        </div>
    )
}