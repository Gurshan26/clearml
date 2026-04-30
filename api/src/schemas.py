from datetime import datetime
from enum import Enum
from typing import List, Dict, Optional

from pydantic import BaseModel, Field


class DriftSeverity(str, Enum):
    NONE = "none"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class PredictionInput(BaseModel):
    LIMIT_BAL: float = Field(..., gt=0, description="Credit limit in NT dollars")
    SEX: int = Field(..., ge=1, le=2, description="1=male, 2=female")
    EDUCATION: int = Field(..., ge=1, le=4, description="1=grad school, 2=university, 3=high school, 4=other")
    MARRIAGE: int = Field(..., ge=0, le=3, description="0=unknown, 1=married, 2=single, 3=other")
    AGE: int = Field(..., ge=18, le=100)
    PAY_0: int = Field(..., ge=-2, le=8, description="Repayment status September")
    PAY_2: int = Field(..., ge=-2, le=8, description="Repayment status August")
    PAY_3: int = Field(..., ge=-2, le=8, description="Repayment status July")
    PAY_4: int = Field(..., ge=-2, le=8, description="Repayment status June")
    PAY_5: int = Field(..., ge=-2, le=8, description="Repayment status May")
    PAY_6: int = Field(..., ge=-2, le=8, description="Repayment status April")
    BILL_AMT1: float = Field(..., description="Bill statement amount September")
    BILL_AMT2: float = Field(..., description="Bill statement amount August")
    BILL_AMT3: float = Field(..., description="Bill statement amount July")
    BILL_AMT4: float = Field(..., description="Bill statement amount June")
    BILL_AMT5: float = Field(..., description="Bill statement amount May")
    BILL_AMT6: float = Field(..., description="Bill statement amount April")
    PAY_AMT1: float = Field(..., ge=0, description="Previous payment amount September")
    PAY_AMT2: float = Field(..., ge=0, description="Previous payment amount August")
    PAY_AMT3: float = Field(..., ge=0, description="Previous payment amount July")
    PAY_AMT4: float = Field(..., ge=0, description="Previous payment amount June")
    PAY_AMT5: float = Field(..., ge=0, description="Previous payment amount May")
    PAY_AMT6: float = Field(..., ge=0, description="Previous payment amount April")


class SHAPFeatureContribution(BaseModel):
    feature: str
    value: float
    shap_value: float
    direction: str
    abs_importance: float


class PredictionResponse(BaseModel):
    prediction: int
    probability_default: float
    probability_no_default: float
    confidence: str
    label: str
    base_value: float
    shap_contributions: List[SHAPFeatureContribution]
    top_factors_for: List[str]
    top_factors_against: List[str]
    prediction_id: str


class DriftFeatureResult(BaseModel):
    feature: str
    ks_statistic: float
    ks_p_value: float
    psi: float
    severity: DriftSeverity
    reference_mean: float
    current_mean: float
    mean_shift_pct: float


class DriftReport(BaseModel):
    timestamp: str
    overall_severity: DriftSeverity
    features_drifted: int
    total_features: int
    drift_score: float
    feature_results: List[DriftFeatureResult]
    alert_triggered: bool
    alert_message: Optional[str]


class ModelMetrics(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1: float
    auc_roc: float
    total_training_samples: int
    test_samples: int
    default_rate: float
    feature_importances: Dict[str, float]
    training_timestamp: str


class AlertRecord(BaseModel):
    id: str
    timestamp: str
    severity: DriftSeverity
    message: str
    features_affected: List[str]
    drift_score: float
    resolved: bool = False


class DriftSimulationConfig(BaseModel):
    scenario: str = Field(..., description="mild | moderate | severe | extreme")
    description: str = ""
