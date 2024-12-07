import json

from data_ingestion import fetch_suricata_events


def analyze_data(events):
    """Performs basic analysis on Suricata event data."""
    summary = {
        "total_events": len(events),
        "event_types": {},
    }
    for event in events:
        event_type = event[2]  # Assuming `event_type` is at index 2
        if event_type not in summary["event_types"]:
            summary["event_types"][event_type] = 0
        summary["event_types"][event_type] += 1
    return summary


if __name__ == "__main__":
    events = fetch_suricata_events()
    analysis = analyze_data(events)
    print(json.dumps(analysis, indent=2))
