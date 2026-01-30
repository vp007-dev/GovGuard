import pandas as pd

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # standardize column names
    df.columns = [c.strip().lower() for c in df.columns]

    # remove exact duplicates
    df.drop_duplicates(inplace=True)

    # handle missing values
    df.fillna("UNKNOWN", inplace=True)

    return df
