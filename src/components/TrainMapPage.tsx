import React from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const OFFICIAL_URL = "https://www.krtc.com.tw/eng/Guide/guide_map";
const btn: React.CSSProperties = { minWidth: 40, height: 40, borderRadius: 10, border: "1px solid #ccc", background: "#fff", fontSize: 20, fontWeight: 700, cursor: "pointer" };

export default function TrainMapPage() {
  return (
    <div style={{ padding: "12px 12px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>Kaohsiung Train Map (KRTC)</h2>
        <a href={OFFICIAL_URL} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600 }}>Open official map ↗</a>
      </div>
      <p style={{ margin: "0 0 8px", fontSize: 13, opacity: 0.75 }}>Pinch or scroll to zoom · drag to move · double-tap to zoom in</p>
      <TransformWrapper minScale={1} maxScale={8} doubleClick={{ step: 1 }} wheel={{ step: 0.15 }}>
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button type="button" style={btn} aria-label="Zoom in" onClick={() => zoomIn()}>+</button>
              <button type="button" style={btn} aria-label="Zoom out" onClick={() => zoomOut()}>−</button>
              <button type="button" style={{ ...btn, fontSize: 14, padding: "0 12px" }} onClick={() => resetTransform()}>Reset</button>
            </div>
            <div style={{ border: "1px solid #ddd", borderRadius: 12, overflow: "hidden", background: "#fff", touchAction: "none" }}>
              <TransformComponent wrapperStyle={{ width: "100%" }} contentStyle={{ width: "100%" }}>
                <img src="/kaohsiung-maps/krtc-train-map.jpg" alt="Kaohsiung MRT and Light Rail route map" style={{ width: "100%", height: "auto", display: "block" }} draggable={false} />
              </TransformComponent>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
