/* @refresh reset */
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/venue')({
    component: VenuePage,
})

function VenuePage() {
    return (
        <main className="page">
            <section className="info">

                <div className="venue-card">
                    <div className="venue-card__icon" aria-hidden="true">🎂</div>
                    <h2 className="venue-card__name">Party Information</h2>

                    <ul className="venue-card__desc">
                        <li>Please make sure to arrive a few minutes early as the folks at Little Pulp will demonstrate the printmaking process at the start of the party. Little Pulp provides the smocks, but things get messy in the studio so please wear clothing you don't mind getting paint on. </li>
                        <li>Reach out if you have any questions and please inform us of any dietary restrictions by <a href="mailto:carlyanderson82@gmail.com">email</a> or by texting or calling Carly (860.836.5367) or Joe (317.709.6409).</li>
                        <li>We can't wait to celebrate with you!</li>

                    </ul>

                </div>

                <div className="venue-card">
                    <div className="venue-card__icon" aria-hidden="true">🎨</div>
                    <h2 className="venue-card__name">Little Pulp</h2>
                    <p className="venue-card__address">
                        80-16 Cooper Avenue<br />
                        Glendale, NY 11385
                    </p>
                    <p className="venue-card__desc">
                        A creative studio where kids (and adults) explore art through painting, printmaking, and more.
                    </p>

                    <a
                        href="https://maps.app.goo.gl/pDRcBvAxjHp5tsjV9"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="venue-link"
                    >
                        Directions ↗
                    </a>
                    <a
                        href="https://www.shopatlaspark.com/directory-map#/profile?location=1056810"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="venue-link"
                    >
                        Locating Little Pulp (once you're there) ↗
                    </a>
                </div>

                <div className="venue-card">
                    <div className="venue-card__icon" aria-hidden="true">🅿️</div>
                    <h2 className="venue-card__name">Parking</h2>
                    <p className="venue-card__desc">
                        Parking is available at Atlas Park, the shopping center right nearby.
                        It&rsquo;s an easy walk to Little Pulp from there.
                    </p>
                    <b>Parking Options:</b>

                    <ul className="venue-card__list">
                        <li>Free street parking on nearby neighborhood streets (less availability)</li>
                        <li>Garage parking at Atlas ($6 for 2-3 hours)</li>
                        <li>Outdoor parking at Atlas ($20 for more than 2 hours)</li>
                    </ul>


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
        </main >
    )
}
