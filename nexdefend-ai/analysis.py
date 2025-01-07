import json
from collections import defaultdict
from data_ingestion import fetch_suricata_events

def analyze_data(events):
    """Performs detailed analysis on Suricata event data."""
    summary = {
        "total_events": len(events),
        "event_types": defaultdict(int),
        "severity_levels": defaultdict(int),
        "source_ips": defaultdict(int),
        "events_over_time": defaultdict(int),
    }

    for event in events:
        event_type = event.get("event_type")
        severity = event.get("severity")
        source_ip = event.get("src_ip")
        timestamp = event.get("timestamp")

        if event_type:
            summary["event_types"][event_type] += 1
        if severity:
            summary["severity_levels"][severity] += 1
        if source_ip:
            summary["source_ips"][source_ip] += 1
        if timestamp:
            date = timestamp.split("T")[0]  # Assuming timestamp is in ISO format
            summary["events_over_time"][date] += 1

    # Convert defaultdicts to regular dicts for JSON serialization
    summary["event_types"] = dict(summary["event_types"])
    summary["severity_levels"] = dict(summary["severity_levels"])
    summary["source_ips"] = dict(summary["source_ips"])
    summary["events_over_time"] = dict(summary["events_over_time"])

    return summary

if __name__ == "__main__":
    try:
        events = fetch_suricata_events()
        analysis = analyze_data(events)
        print(json.dumps(analysis, indent=2))
    except Exception as e:
        print(f"Error during analysis: {e}")