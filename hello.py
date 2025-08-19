import csv
import random
from datetime import datetime, timedelta

# Parameters
start_date = datetime(2025, 7, 17)
end_date = datetime(2025, 8, 17)
rows_per_day = 24   # one data point per hour
output_file = "generated_data.csv"

def generate_random_row(timestamp):
    # generate 16 float values in the range 8.75–9.05
    values = [round(random.uniform(8.75, 9.05), 12) for _ in range(16)]
    return [timestamp.strftime("%Y-%m-%d %H:%M:%S")] + values

# Generate timestamps (one per hour)
timestamps = []
delta_days = (end_date - start_date).days + 1
for i in range(delta_days):
    day = start_date + timedelta(days=i)
    for hour in range(rows_per_day):
        ts = day + timedelta(hours=hour)
        timestamps.append(ts)

# Write to CSV
with open(output_file, "w", newline="") as csvfile:
    writer = csv.writer(csvfile)
    for ts in timestamps:
        row = generate_random_row(ts)
        writer.writerow(row)

print(f"CSV file '{output_file}' generated with {len(timestamps)} rows.")
