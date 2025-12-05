"use client"

// Using the <Link> component instead of HTML <a> links is preferable in Next.js for internal links
// External links or file downloads should still use <a>
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export default function NavBar() {
    // We need the session information in the NavBar component to know whether or not a user is signed in
    const {data: session} = useSession();
    
    return (
        <nav className="bg-[#ff0000] text-white w-full py-4 px-8 flex justify-between items-center shadow-md">
            <h1 className="text-xl font-bold">Daily Journal</h1>
            <div className="flex gap-6">
                <Link href="/" className="hover:underline hover:text-gray-200 transition-colors">
                    Home
                </Link>
                <Link href="/thoughts" className="hover:underline hover:text-gray-200 transition-colors">
                    All Thoughts
                </Link>

                {// If the session is active, show the Sign Out button
                session ? (
                    <button
                        onClick={() => signOut()}
                        className="bg-white text-[#ff0000] px-3 py-1 rounded-md font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                        Sign Out
                    </button>
                ) // If the session is not active, show the Sign In button
                : (
                    <button
                        onClick={() => signIn()}
                        className="bg-white text-[#ff0000] px-3 py-1 rounded-md font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                        Sign In
                    </button>
                )
            }
            </div>
        </nav>
    );
}