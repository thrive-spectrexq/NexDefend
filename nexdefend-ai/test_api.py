import pytest
import os
import json
from unittest.mock import patch, MagicMock
from api import app

# Set up the test client
@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['AI_SERVICE_TOKEN'] = 'test-service-token'
    with app.test_client() as client:
        yield client

# --- Test Auth ---
def test_analyze_event_unauthorized(client):
    """Tests that the /analyze-event endpoint is protected."""
    response = client.post('/analyze-event/1')
    assert response.status_code == 401

def test_scan_unauthorized(client):
    """Tests that the /scan endpoint is protected."""
    response = client.post('/scan', json={'target': '127.0.0.1'})
    assert response.status_code == 401

# --- Test /api-metrics Endpoint ---
def test_get_api_metrics(client):
    """Tests the main metrics endpoint."""
    response = client.get('/api-metrics')
    assert response.status_code == 200
    data = response.get_json()
    assert 'events_processed' in data
    assert 'anomalies_detected' in data
    assert 'incidents_created' in data

# --- Test /scan Endpoint ---
@patch('api.nmap.PortScanner')
@patch('api.requests.post')
def test_scan_host_success(mock_requests_post, mock_port_scanner, client):
    """Tests a successful scan that finds open ports and creates vulnerabilities."""
    # Mock the Nmap scan result
    target = '127.0.0.1'
    mock_nm = MagicMock()
    mock_nm.all_hosts.return_value = [target]
    mock_nm.__getitem__.return_value = {
        'tcp': {
            22: {'state': 'open', 'name': 'ssh'},
            80: {'state': 'open', 'name': 'http'}
        }
    }
    mock_port_scanner.return_value = mock_nm
    
    # Mock the backend vulnerability creation
    mock_requests_post.return_value.status_code = 201

    headers = {'Authorization': 'Bearer test-service-token'}
    response = client.post('/scan', json={'target': target}, headers=headers)
    
    data = response.get_json()
    assert response.status_code == 200
    assert data['status'] == 'Scan complete'
    assert len(data['open_ports']) == 2
    
    # Verify it tried to create 2 vulnerabilities in the backend
    assert mock_requests_post.call_count == 2
    first_call_args = mock_requests_post.call_args_list[0].kwargs['json']
    assert first_call_args['description'] == 'Open port discovered: 22/ssh'
    assert first_call_args['severity'] == 'High'

# --- Test /analyze-event Endpoint ---
@patch('api.update_event_analysis_status')
@patch('api.fetch_suricata_event_by_id')
@patch('api.preprocess_events')
@patch('api.detect_anomalies')
@patch('api.requests.post')
def test_analyze_event_creates_incident(mock_requests_post, mock_detect, mock_preprocess, mock_fetch, mock_update_status, client):
    """Tests that an anomalous event triggers an incident creation call."""
    # Mock the data
    mock_event = (1, '2025-11-11T20:00:00', 'alert', '1.2.3.4', '5.6.7.8', 80, 
                  None, None, None, {'signature': 'Test Attack', 'severity': 1}, False)
    mock_fetch.return_value = mock_event
    mock_preprocess.return_value = MagicMock() # Just needs to exist
    mock_detect.return_value = [-1] # -1 means anomaly

    # Mock the incident creation call
    mock_requests_post.return_value.status_code = 201
    
    headers = {'Authorization': 'Bearer test-service-token'}
    response = client.post('/analyze-event/1', headers=headers)
    
    assert response.status_code == 200
    assert response.get_json()['is_anomaly'] == True
    
    # Verify it called the backend to create an incident
    mock_requests_post.assert_called_once()
    call_args = mock_requests_post.call_args.kwargs['json']
    assert call_args['description'] == 'AI Anomaly Detected: Test Attack'
    assert call_args['severity'] == 'Critical'
    assert call_args['related_event_id'] == 1
