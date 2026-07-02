/** Bridge between “What does Luminy include?” and Why choose Luminy on the home page. */
export function ValuePropsSection() {
  return (
    <section id="why-luminy" className="section value-props">
      <div className="container">
        <div className="value-props__layout">
          <div className="value-props__copy">
            <p className="value-props__statement">
              We use the same <span className="value-props__hl">quantitative strategies</span>{' '}
              <span className="value-props__hl">hedge funds</span> use to power{' '}
              <span className="value-props__hl">your analytics</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
