import { Bus, Map as MapIcon, TrainFront } from "lucide-react";
import {
  CHIAYI_BUSES,
  HOTEL_STATIONS,
  KAOHSIUNG_BUSES,
  MRT_RIDES,
  RED_NORTHBOUND,
  RED_SOUTHBOUND,
  type RideBus,
} from "../data/kaohsiungRideGuide";
import "./KaohsiungRideGuide.css";

type Props = { onOpenMapPlus: () => void };

const BusRow = ({ b }: { b: RideBus }) => (
  <li className="kr-bus">
    <span className="kr-ref" style={{ background: b.color }}>{b.ref}</span>
    <div>
      <b>{b.name}</b>
      {b.note ? <p>{b.note}</p> : null}
    </div>
  </li>
);

const KaohsiungRideGuide = ({ onOpenMapPlus }: Props) => (
  <section className="ja-app-section kr-ride" id="how-to-ride">
    <div className="ja-app-section-header">
      <div>
        <h3 className="ja-app-section-title">How to Ride · MRT &amp; Bus</h3>
        <p className="ja-app-section-desc">
          Same English names as Map+. Red Line platform signs say <b>{RED_NORTHBOUND}</b> (north) or <b>{RED_SOUTHBOUND}</b> (south).
        </p>
      </div>
    </div>

    <div className="kr-grid">
      <div className="kr-card">
        <h4><TrainFront size={16} /> Stations near Hub Hotel Yisin</h4>
        <ul className="kr-list">
          {HOTEL_STATIONS.map((s) => (
            <li key={s.label}>
              <span className="kr-dot" style={{ background: s.color }} />
              <div>
                <b>{s.label}</b> <span className="kr-muted">· {s.line}</span>
                <p>{s.note}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="kr-card">
        <h4><TrainFront size={16} /> MRT / HSR rides on this trip</h4>
        <ul className="kr-list">
          {MRT_RIDES.map((r) => (
            <li key={r.day}>
              <span className="kr-dot" style={{ background: r.color }} />
              <div>
                <b>{r.day}</b> <span className="kr-muted">· {r.title}</span>
                {r.steps.map((s) => <p key={s}>{s}</p>)}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="kr-card">
        <h4><Bus size={16} /> Kaohsiung buses (backup)</h4>
        <ul className="kr-list">{KAOHSIUNG_BUSES.map((b) => <BusRow key={b.ref} b={b} />)}</ul>
        <h4 className="kr-sub"><Bus size={16} /> Chiayi / CCU buses (backup to taxi)</h4>
        <ul className="kr-list">{CHIAYI_BUSES.map((b) => <BusRow key={b.ref} b={b} />)}</ul>
        <p className="kr-muted kr-foot">Our plan is MRT + taxi/Uber. Always check the number and destination on the front of the bus.</p>
      </div>
    </div>

    <button type="button" className="kr-mapbtn" onClick={onOpenMapPlus}>
      <MapIcon size={16} /> Open Map+ to see these lines
    </button>
  </section>
);

export default KaohsiungRideGuide;
