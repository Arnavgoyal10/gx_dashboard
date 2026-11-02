import { Reveal } from '../components/motion';

export default function Closing() {
  return (
    <>
      <section className="sec blue cta">
        <div className="wrap center">
          <Reveal>
            <h2>
              Simulated data, <em>real method</em>
            </h2>
            <p>Every number, rule and query on this page is open to inspect, change and re-run.</p>
            <a className="btn btn-white" href="https://github.com/Arnavgoyal10/gx_dashboard" target="_blank" rel="noreferrer">
              View the code on GitHub
            </a>
          </Reveal>
        </div>
      </section>
      <footer className="footer">
        <div className="wrap footer-inner">
          <p>Built by Arnav Goyal for the Galytix Product Analyst case study.</p>
          <p>All figures are simulated from stated assumptions, except the survey statistic marked ‘Real survey data’.</p>
        </div>
      </footer>
    </>
  );
}
