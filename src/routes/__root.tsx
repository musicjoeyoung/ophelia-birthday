import '../App.css'

import { Link, Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
    component: Root,
})

function Root() {
    return (
        <>
            <nav className="site-nav" aria-label="Site navigation">
                <Link to="/" activeOptions={{ exact: true }} className="site-nav__link">
                    Home
                </Link>
                <Link to="/venue" className="site-nav__link">
                    More Details
                </Link>
            </nav>
            <Outlet />
        </>
    )
}
