import pandas as pd

df = pd.DataFrame({
    'category': ['Electronics', 'Electronics', 'Electronics'],
    'product': ['Phone', 'Phone', 'Phone'],
    'variant': ['64GB', '64GB', '128GB'],
    'quantity': [10, 5, 2],
    'price': [500, 500, 600]
})

df.to_excel('test.xlsx', index=False)
