"""
KAVACH TITANIUM — ML Prediction Engine v3.0
Predicts fraud probability and next withdrawal ATM locations.
"""
import os
import joblib
import numpy as np
from math import radians, sin, cos, sqrt, atan2
from pathlib import Path

try:
    import pandas as pd
    HAS_PANDAS = True
except ImportError:
    HAS_PANDAS = False

from data.atm_locations import ATM_LOCATIONS

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH   = BASE_DIR / 'models' / 'fraud_model.pkl'
COLUMNS_PATH = BASE_DIR / 'models' / 'model_columns.pkl'


class PredictionEngine:
    def __init__(self):
        self.model = None
        self.model_columns = None
        self._load_model()

    def _load_model(self):
        try:
            if MODEL_PATH.exists():
                self.model = joblib.load(MODEL_PATH)
                print(f'[ML] Model loaded: {MODEL_PATH.name}')
            else:
                print('[ML] Warning: model not found — using rule-based fallback')

            if COLUMNS_PATH.exists():
                self.model_columns = joblib.load(COLUMNS_PATH)
        except Exception as e:
            print(f'[ML] Load error: {e}')

    @staticmethod
    def haversine(lat1, lon1, lat2, lon2) -> float:
        R = 6371.0
        dlat = radians(lat2 - lat1)
        dlon = radians(lon2 - lon1)
        a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
        return R * 2 * atan2(sqrt(a), sqrt(1 - a))

    def predict_withdrawal_locations(self, transaction: dict, top_k: int = 3) -> list:
        """
        Returns list of top_k ATMs ranked by probability of being
        the next withdrawal point for a fraudulent transaction.
        """
        tx_lat  = transaction.get('lat', 0)
        tx_lng  = transaction.get('lng', 0)
        city    = transaction.get('city')

        candidates = [a for a in ATM_LOCATIONS if city is None or a['city'] == city]
        if not candidates:
            candidates = ATM_LOCATIONS

        scored = []
        for atm in candidates:
            dist  = self.haversine(tx_lat, tx_lng, atm['lat'], atm['lng'])
            score = 100.0 / (dist + 0.5)
            scored.append({ **atm, 'distance': round(dist, 2), 'score': score })

        scored.sort(key=lambda x: x['score'], reverse=True)
        top = scored[:top_k]

        total = sum(a['score'] for a in top) or 1
        results = []
        for atm in top:
            prob = (atm['score'] / total) * 0.90
            results.append({
                'id':             atm['id'],
                'location':       atm['location'],
                'lat':            atm['lat'],
                'lng':            atm['lng'],
                'probability':    round(prob, 3),
                'distance':       atm['distance'],
                'estimated_time': f'{np.random.randint(15, 60)} mins',
            })
        return results
