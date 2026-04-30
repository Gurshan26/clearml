import { useState } from "react";
import ConfidenceBadge from "../../components/ConfidenceBadge/ConfidenceBadge";
import PredictionForm from "../../components/PredictionForm/PredictionForm";
import SHAPWaterfall from "../../components/SHAPWaterfall/SHAPWaterfall";
import styles from "./Explain.module.css";

export default function ExplainPage() {
  const [result, setResult] = useState(null);

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <h1>Prediction Explainer</h1>
        <p className="prose-italic">Inspect a single decision path with per-feature SHAP contribution.</p>
      </section>

      <div className={styles.grid}>
        <PredictionForm onResult={setResult} />

        <div className={styles.output}>
          {!result && <div className={styles.placeholder}>Run a prediction to generate SHAP explanation.</div>}
          {result && (
            <>
              <div className={styles.top}>
                <div>
                  <h3>{result.label}</h3>
                  <p className={`${styles.id} data`}>Prediction ID: {result.prediction_id}</p>
                </div>
                <ConfidenceBadge confidence={result.confidence} probability={result.probability_default} />
              </div>

              <div className={styles.factors}>
                <div className={styles.factorCard}>
                  <h4>Toward Default</h4>
                  <ul>
                    {(result.top_factors_for || []).map((f) => (
                      <li key={f} className="data">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={styles.factorCard}>
                  <h4>Against Default</h4>
                  <ul>
                    {(result.top_factors_against || []).map((f) => (
                      <li key={f} className="data">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <SHAPWaterfall contributions={result.shap_contributions} baseValue={result.base_value} prediction={result.prediction} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
