/** “Why choose Luminy” band — heading, subtitle, and feature cards (content TBD). */
export function HighlightsSection() {
  return (
    <section id="why-choose-luminy" className="section highlights why-choose-luminy" aria-labelledby="why-choose-luminy-heading">
      <div className="container">
        <h2 className="section__title" id="why-choose-luminy-heading">
          Why choose Luminy
        </h2>
        <p className="why-choose-luminy__subtitle">
          Luminy is the most advanced personal finance tracker.
        </p>
        <div className="why-choose-luminy__grid">
          <div className="why-choose-luminy__card">
            <div className="why-choose-luminy__card-icon" aria-hidden="true" />
            <h3 className="why-choose-luminy__card-title">Actual Reliability/Accuracy</h3>
            <p className="why-choose-luminy__card-text">aaa.</p>
          </div>
          <div className="why-choose-luminy__card" />
          <div className="why-choose-luminy__card" />
          <div className="why-choose-luminy__card" />
        </div>
      </div>
    </section>
  );
}
