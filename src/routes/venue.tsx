/* @refresh reset */
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/venue')({
    component: VenuePage,
})

function VenuePage() {
    return (
        <main className="page">
            <section className="info">
                <h1 className="birthday-title">Venue &amp; Parking</h1>

                <div className="venue-card">
                    <div className="venue-card__icon" aria-hidden="true">🎨</div>
                    <h2 className="venue-card__name">Little Pulp</h2>
                    <p className="venue-card__address">
                        8016 Cooper Avenue<br />
                        Glendale, NY 11385
                    </p>
                    <p className="venue-card__desc">
                        A creative studio where kids explore art through painting, printmaking, and more.
                        Check their website for everything you need to know before arriving.
                    </p>
                    {/*                     <a
                        href="https://www.littlepulp.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="venue-link"
                    >
                        Little Pulp FAQ ↗
                    </a> */}
                </div>

                <div className="venue-card">
                    <div className="venue-card__icon" aria-hidden="true">🅿️</div>
                    <h2 className="venue-card__name">Parking</h2>
                    <p className="venue-card__desc">
                        Parking is available at Atlas Park, the shopping center right nearby.
                        It&rsquo;s an easy walk to Little Pulp from there.
                    </p>
                    <a
                        href="https://www.shopatlaspark.com/visit"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="venue-link"
                    >
                        Atlas Park Visitor Info ↗
                    </a>
                </div>
            </section>
        </main>
    )
}
