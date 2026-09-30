import psycopg2
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

DB_PARAMS = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': 'blue30@04',
    'dbname': 'healthguard_db'
}

FEATURE_COLUMNS = [
    'day_of_week',
    'week_of_year',
    'month',
    'quarter',
    'season',
    'disease_cases_7_days',
    'disease_cases_30_days',
    'disease_growth_rate',
    'active_outbreaks',
    'village_health_risk_score',
    'stock_available',
    'average_daily_consumption',
    'stock_turnover_rate',
    'expiry_risk_score'
]

TARGET_COLUMN = 'next_30_day_demand'

def get_db_connection():
    return psycopg2.connect(**DB_PARAMS)

def get_season(month: int) -> int:
    # 1=Winter (Dec-Feb), 2=Summer (Mar-May), 3=Monsoon (Jun-Sep), 4=Post-Monsoon (Oct-Nov)
    if month in [12, 1, 2]:
        return 1
    elif month in [3, 4, 5]:
        return 2
    elif month in [6, 7, 8, 9]:
        return 3
    else:
        return 4

def build_training_dataset():
    """
    Extracts raw historical data from PostgreSQL, aggregates into daily observation points
    per (medicine, village), and calculates the 14 genuine features with next_30_day_demand target.
    Data is returned strictly in chronological order without shuffling.
    """
    conn = get_db_connection()
    try:
        # 1. Load medicine usage history
        usage_df = pd.read_sql("""
            SELECT usage_id, medicine_id, medicine_name, quantity_used, disease, village, usage_date
            FROM medicine_usage_history
            ORDER BY usage_date ASC
        """, conn)

        # 2. Load disease surveillance reports
        surv_df = pd.read_sql("""
            SELECT report_id, report_date, disease, severity, village, status
            FROM disease_surveillance_reports
            WHERE UPPER(status) = 'VERIFIED'
            ORDER BY report_date ASC
        """, conn)

        # 3. Load medicines
        med_df = pd.read_sql("""
            SELECT id AS medicine_id, name, medicine_name, quantity AS stock_available, expiry_date
            FROM medicines
        """, conn)

        # 4. Load outbreak alerts
        outbreak_df = pd.read_sql("""
            SELECT alert_id, alert_date, disease, village, status
            FROM outbreak_alerts
        """, conn) if pd.read_sql("SELECT to_regclass('outbreak_alerts')", conn).iloc[0, 0] else pd.DataFrame()

    finally:
        conn.close()

    if usage_df.empty:
        return pd.DataFrame()

    usage_df['usage_date'] = pd.to_datetime(usage_df['usage_date'])
    surv_df['report_date'] = pd.to_datetime(surv_df['report_date'])

    # Aggregate usage by medicine, village, and date
    daily_usage = usage_df.groupby(['usage_date', 'medicine_name', 'village', 'disease']).agg({
        'quantity_used': 'sum',
        'medicine_id': 'first'
    }).reset_index()

    # Map medicine stock & expiry
    med_lookup = {}
    for _, row in med_df.iterrows():
        key = (row['medicine_name'] or row['name']).strip().lower()
        days_to_expiry = 90
        if pd.notnull(row['expiry_date']):
            exp = pd.to_datetime(row['expiry_date'])
            days_to_expiry = max(1, (exp - datetime.now()).days)
        med_lookup[key] = {
            'stock': row['stock_available'] or 100,
            'days_to_exp': days_to_expiry,
            'medicine_id': row['medicine_id']
        }

    dataset_rows = []

    # Sort daily usage strictly chronologically
    daily_usage = daily_usage.sort_values('usage_date').reset_index(drop=True)

    for idx, row in daily_usage.iterrows():
        dt = row['usage_date']
        med = row['medicine_name']
        vil = row['village']
        dis = row['disease']

        # Temporal features
        day_of_week = dt.dayofweek
        week_of_year = dt.isocalendar().week
        month = dt.month
        quarter = dt.quarter
        season = get_season(month)

        # Disease features in surrounding window
        dt_7d_ago = dt - timedelta(days=7)
        dt_30d_ago = dt - timedelta(days=30)
        dt_60d_ago = dt - timedelta(days=60)
        dt_90d_ago = dt - timedelta(days=90)

        # Disease surveillance cases
        surv_cases_7d = len(surv_df[(surv_df['report_date'] >= dt_7d_ago) & (surv_df['report_date'] <= dt) & (surv_df['disease'] == dis)])
        surv_cases_30d = len(surv_df[(surv_df['report_date'] >= dt_30d_ago) & (surv_df['report_date'] <= dt) & (surv_df['disease'] == dis)])
        disease_growth_rate = round((surv_cases_7d * 4.28) / max(1.0, float(surv_cases_30d)), 2)

        # Active outbreaks in village
        active_outbreaks = 0
        if not outbreak_df.empty:
            outbreak_df['alert_date'] = pd.to_datetime(outbreak_df['alert_date'])
            active_outbreaks = len(outbreak_df[(outbreak_df['alert_date'] >= dt_30d_ago) & (outbreak_df['alert_date'] <= dt) & (outbreak_df['village'] == vil)])
        else:
            # Derived from surveillance severity Critical/High in past 14 days
            active_outbreaks = len(surv_df[(surv_df['report_date'] >= dt_7d_ago) & (surv_df['report_date'] <= dt) & (surv_df['village'] == vil) & (surv_df['severity'].isin(['High', 'Critical']))])

        # Village health risk score (1 - 100)
        v_reports = surv_df[(surv_df['report_date'] >= dt_30d_ago) & (surv_df['report_date'] <= dt) & (surv_df['village'] == vil)]
        critical_cnt = len(v_reports[v_reports['severity'] == 'Critical'])
        high_cnt = len(v_reports[v_reports['severity'] == 'High'])
        village_health_risk_score = min(100.0, float(15 + (critical_cnt * 18) + (high_cnt * 8) + len(v_reports) * 2))

        # Medicine stock and consumption
        med_info = med_lookup.get(med.strip().lower(), {'stock': 100, 'days_to_exp': 90, 'medicine_id': row['medicine_id']})
        stock_available = float(med_info['stock'])
        days_to_exp = med_info['days_to_exp']
        expiry_risk_score = round(max(0.0, float(100.0 - (days_to_exp * 0.8))), 2)

        # Average daily consumption in last 30 days for this medicine
        prior_30d_usage = usage_df[(usage_df['usage_date'] >= dt_30d_ago) & (usage_df['usage_date'] <= dt) & (usage_df['medicine_name'] == med)]['quantity_used'].sum()
        average_daily_consumption = round(float(prior_30d_usage) / 30.0, 2)
        stock_turnover_rate = round(float(prior_30d_usage) / max(1.0, stock_available), 2)

        # Target: actual total consumption in the subsequent 30-day window
        dt_future_30d = dt + timedelta(days=30)
        future_usage = usage_df[(usage_df['usage_date'] > dt) & (usage_df['usage_date'] <= dt_future_30d) & (usage_df['medicine_name'] == med)]['quantity_used'].sum()

        if future_usage == 0:
            # If at the very end of time series, project based on moving average
            future_usage = int(max(10, prior_30d_usage))

        dataset_rows.append({
            'usage_date': dt,
            'medicine_id': med_info['medicine_id'],
            'medicine_name': med,
            'village': vil,
            'disease': dis,
            'day_of_week': day_of_week,
            'week_of_year': week_of_year,
            'month': month,
            'quarter': quarter,
            'season': season,
            'disease_cases_7_days': surv_cases_7d,
            'disease_cases_30_days': surv_cases_30d,
            'disease_growth_rate': disease_growth_rate,
            'active_outbreaks': active_outbreaks,
            'village_health_risk_score': village_health_risk_score,
            'stock_available': stock_available,
            'average_daily_consumption': average_daily_consumption,
            'stock_turnover_rate': stock_turnover_rate,
            'expiry_risk_score': expiry_risk_score,
            'next_30_day_demand': int(future_usage)
        })

    df = pd.DataFrame(dataset_rows)
    # Strictly sort by usage_date ascending (No random shuffling)
    df = df.sort_values('usage_date').reset_index(drop=True)
    return df

def build_single_inference_features(medicine_id: int, medicine_name: str, village: str, disease_cases: int, stock: int):
    """
    Builds the exact 14-feature vector for a real-time prediction request.
    """
    conn = get_db_connection()
    try:
        dt = datetime.now()
        day_of_week = dt.weekday()
        week_of_year = dt.isocalendar()[1]
        month = dt.month
        quarter = (month - 1) // 3 + 1
        season = get_season(month)

        cur = conn.cursor()
        
        # 1. Fetch medicine details
        cur.execute("SELECT id, name, medicine_name, quantity, expiry_date FROM medicines WHERE id = %s OR LOWER(medicine_name) = LOWER(%s) OR LOWER(name) = LOWER(%s) LIMIT 1",
                    (medicine_id, medicine_name, medicine_name))
        med_row = cur.fetchone()
        
        stock_available = float(stock)
        days_to_exp = 90
        if med_row and med_row[4]:
            days_to_exp = max(1, (med_row[4] - dt.date()).days)
        expiry_risk_score = round(max(0.0, float(100.0 - (days_to_exp * 0.8))), 2)

        # 2. Historical consumption in last 30 days
        dt_30d_ago = dt.date() - timedelta(days=30)
        cur.execute("""
            SELECT COALESCE(SUM(quantity_used), 0)
            FROM medicine_usage_history
            WHERE (medicine_id = %s OR LOWER(medicine_name) = LOWER(%s))
              AND usage_date >= %s
        """, (medicine_id, medicine_name, dt_30d_ago))
        usage_30d = float(cur.fetchone()[0])
        if usage_30d == 0:
            usage_30d = float(disease_cases * 2.5)

        average_daily_consumption = round(usage_30d / 30.0, 2)
        stock_turnover_rate = round(usage_30d / max(1.0, stock_available), 2)

        # 3. Disease cases
        cur.execute("""
            SELECT 
                COUNT(CASE WHEN report_date >= %s THEN 1 END) AS cases_7d,
                COUNT(CASE WHEN report_date >= %s THEN 1 END) AS cases_30d
            FROM disease_surveillance_reports
            WHERE UPPER(status) = 'VERIFIED' AND (LOWER(village) = LOWER(%s) OR %s IS NULL)
        """, (dt.date() - timedelta(days=7), dt_30d_ago, village, village))
        c_row = cur.fetchone()
        cases_7d = c_row[0] if c_row and c_row[0] > 0 else max(1, int(disease_cases * 0.25))
        cases_30d = c_row[1] if c_row and c_row[1] > 0 else max(cases_7d, disease_cases)
        disease_growth_rate = round((cases_7d * 4.28) / max(1.0, float(cases_30d)), 2)

        # 4. Active outbreaks & village health risk score
        cur.execute("""
            SELECT 
                COUNT(CASE WHEN severity IN ('High', 'Critical') AND report_date >= %s THEN 1 END),
                COUNT(CASE WHEN severity = 'Critical' AND report_date >= %s THEN 1 END)
            FROM disease_surveillance_reports
            WHERE UPPER(status) = 'VERIFIED' AND LOWER(village) = LOWER(%s)
        """, (dt.date() - timedelta(days=14), dt_30d_ago, village))
        v_row = cur.fetchone()
        active_outbreaks = v_row[0] if v_row else 1
        critical_cases = v_row[1] if v_row else 1
        village_health_risk_score = min(100.0, float(20 + (critical_cnt := critical_cases * 15) + (active_outbreaks * 10)))

        features = {
            'day_of_week': day_of_week,
            'week_of_year': week_of_year,
            'month': month,
            'quarter': quarter,
            'season': season,
            'disease_cases_7_days': cases_7d,
            'disease_cases_30_days': cases_30d,
            'disease_growth_rate': disease_growth_rate,
            'active_outbreaks': active_outbreaks,
            'village_health_risk_score': village_health_risk_score,
            'stock_available': stock_available,
            'average_daily_consumption': average_daily_consumption,
            'stock_turnover_rate': stock_turnover_rate,
            'expiry_risk_score': expiry_risk_score
        }
        return pd.DataFrame([features])[FEATURE_COLUMNS]

    finally:
        conn.close()
