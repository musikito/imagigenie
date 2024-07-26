"use client";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { navLinks } from "@/constants";
import { Button } from "./ui/button";


const MobileNav = () => {
    const pathname = usePathname();
    return (
        <header className="header">
            <Link href="/" className="flex items-center gap-2 md:py-2">
                <Image
                    src={"/assets/images/logo-text.svg"}
                    alt="Logo"
                    width={180}
                    height={28}
                />
            </Link>
            <nav className="flex gap-2">
                <SignedIn>
                    <UserButton showName />
                    <Sheet>
                        <SheetTrigger>
                            <Image
                                src={"/assets/icons/menu.svg"}
                                alt="menu"
                                width={32}
                                height={32}
                            />
                        </SheetTrigger>
                        <SheetContent className="sheet-content sm:w-64">
                            <>
                                <Image
                                    src={"/assets/images/logo-text.svg"}
                                    alt="Logo"
                                    width={152}
                                    height={28}
                                />
                                <ul className="header-nav_elements">
                                    {navLinks.map((link) => {
                                        const isActive = link.route === pathname;
                                        return (
                                            <li
                                                key={link.route}
                                                className={`${isActive && 'gradient-text'} p-18 flex whitespace-nowrap text-dark-700`}>
                                                <Link className="sidebar-link cursor-pointer" href={link.route}>
                                                    <Image
                                                        src={link.icon}
                                                        alt="icon"
                                                        width={24}
                                                        height={24}
                                                    />

                                                    {link.label}
                                                </Link>

                                            </li>
                                        );
                                    })} {/** End of navlinks*/}
                                </ul>
                            </>
                        </SheetContent>
                    </Sheet>

                </SignedIn>
                {/* /**
                     * Renders a "Login" button that links to the sign-in page when the user is signed out.
                     * This component is conditionally rendered using the `SignedOut` component from the Clerk library,
                     * which ensures that the button is only displayed when the user is not signed in.
                     */ }
                <SignedOut>
                    <Button
                        asChild
                        className="button bg-purple-gradient bg-cover">
                        <Link href="/sign-in">Login</Link>
                    </Button>
                </SignedOut>

            </nav>
        </header>
    )
}

export default MobileNav