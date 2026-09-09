import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="page container">
      <div className="hero">
        <h1>Know your risk. Find your nearest care.</h1>
        <p>CerviBloom brings verified HPV &amp; cervical cancer information, screening reminders, and real public screening centers together in one place. It is built for Kenyan women and the volunteers supporting them.</p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/info-hub">Learn about HPV</Link>
          <Link className="btn btn-outline" to="/directory">Find a screening center</Link>
        </div>
      </div>
      <div className="stats-row">
        <div className="stat-card"><div className="num">#1</div><div className="lbl">cause of cancer deaths among Kenyan women</div></div>
        <div className="stat-card"><div className="num">90%+</div><div className="lbl">preventable with vaccination &amp; screening</div></div>
        <div className="stat-card"><div className="num">47</div><div className="lbl">counties we aim to reach</div></div>
      </div>
    </div>
  );
}
