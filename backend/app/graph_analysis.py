import pandas as pd
from collections import defaultdict
from typing import List, Tuple


def graph_risk_score(df: pd.DataFrame) -> Tuple[List[int], List[List[str]]]:
    """
    Network analysis using multiple shared identifiers.
    """

    IDENTIFIER_COLUMNS = [
        "Bank Account",
        "Account No",
        "Account Number",
        "Phone",
        "Mobile",
        "Aadhaar",
        "Address"
    ]

    available_cols = [c for c in IDENTIFIER_COLUMNS if c in df.columns]

    if not available_cols:
        return [0] * len(df), [[] for _ in range(len(df))]

    entity_map = defaultdict(list)

    # Build graph
    for col in available_cols:
        for idx, val in enumerate(df[col].fillna("").astype(str).str.strip()):
            if val:
                entity_map[(col, val)].append(idx)

    network_scores = [0] * len(df)
    network_links = [[] for _ in range(len(df))]

    for (col, val), rows in entity_map.items():
        if len(rows) > 1:
            score = min(100, 20 + 10 * (len(rows) - 1))

            for r in rows:
                network_scores[r] = max(network_scores[r], score)
                network_links[r].append(
                    f"Shared {col} ({val}) with {len(rows) - 1} other entities"
                )

    return network_scores, network_links
