"use client";

import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { navLinks } from "@/constants";
import { Button } from "./ui/button";


const Sidebar = () => {
    const pathname = usePathname();
    return (
        <aside className="sidebar">
            <div className="flex size-full flex-col gap-4">
                {/* /**
                 * Renders a link to the homepage with the application's logo.
                 */ }
                <Link className="sidebar-logo" href="/">
                    <Image
                        src={"/assets/images/logo-text.svg"}
                        width={180}
                        height={30}
                        alt="logo"
                    />
                </Link>
                <nav className="sidebar-nav">

                    {/* /**
                     * Renders a list of navigation links in the sidebar, with the active link highlighted.
                     * The links are defined in the `navLinks` array, which contains information about the route, label, and icon for each link.
                     * The `SignedIn` component from the Clerk library is used to conditionally render the navigation links only for signed-in users.
                     */ }
                    <SignedIn>
                        <ul className="sidebar-nav_elements">
                            {navLinks.map((link) => {
                                const isActive = link.route === pathname;
                                return (
                                    <li
                                        key={link.route}
                                        className={`sidebar-nav_element group ${isActive ? "bg-purple-gradient text-white" : "text-gray-700"
                                            }`}>
                                        <Link className="sidebar-link" href={link.route}>
                                            <Image
                                                src={link.icon}
                                                alt="icon"
                                                width={24}
                                                height={24}
                                                className={`${isActive && 'brightness-200'}`}
                                            />

                                            {link.label}
                                        </Link>

                                    </li>
                                );
                            })} {/** End of navlinks*/}
                        </ul>
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
            </div>
        </aside>
    );
};

export default Sidebar;