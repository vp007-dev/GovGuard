def apply_rules_rowwise(df):
    row_results = []

    bank_counts = df["bank account"].value_counts()
    name_counts = df["beneficiary name"].value_counts()

    for idx, row in df.iterrows():
        score = 0
        reasons = []

        if row["amount"] > df["amount"].mean() * 2:
            score += 30
            reasons.append("Unusually high payment amount")

        if bank_counts[row["bank account"]] > 1:
            score += 40
            reasons.append("Bank account shared by multiple beneficiaries")

        if name_counts[row["beneficiary name"]] > 1:
            score += 20
            reasons.append("Duplicate beneficiary name")

        row_results.append({
            "entity": row["beneficiary name"],
            "amount": row["amount"],
            "department": row["department"],
            "rule_score": score,
            "reasons": reasons
        })

    return row_results
