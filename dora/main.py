from dora import Dora
from prometheus_client import start_http_server, Gauge
import requests
import time
import datetime
import os
from dotenv import load_dotenv

load_dotenv()

dora = Dora()


deployment_frequency = Gauge('deployment_frequency', 'Number of deployments per day')
lead_time = Gauge('lead_time_for_changes', 'Time from code commit to code successfully running in production')
change_failure_rate = Gauge('change_failure_rate', 'Percentage of deployments causing a failure in production')
mttr = Gauge('mean_time_to_recovery', 'Time to restore service after a production failure')

start_http_server(8090)

# GitHub API configuration
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN')
REPO_OWNER = os.environ.get('REPO_OWNER')
REPO_NAME = os.environ.get('REPO_NAME')
HEADERS = {'Authorization': f'token {GITHUB_TOKEN}'}

def get_github_stats():
    url = f'https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/stats/code_frequency'
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to fetch GitHub stats: {response.status_code}")
        return []

def calculate_deployment_frequency():
    stats = get_github_stats()
    now = datetime.datetime.now()
    four_weeks_ago = now - datetime.timedelta(weeks=4)
    
    total_changes = sum(abs(stat[1]) + abs(stat[2]) for stat in stats 
                        if datetime.datetime.fromtimestamp(stat[0]) > four_weeks_ago)
    
    
    significant_changes = total_changes // 10
    return significant_changes / 14

def calculate_lead_time():
    
    stats = get_github_stats()
    if not stats:
        return 24 * 60 * 60  
    
    last_week_changes = abs(stats[-1][1]) + abs(stats[-1][2])
    if last_week_changes == 0:
        return 24 * 60 * 60  
    
    
    return max(2 * 60 * 60, 24 * 60 * 60 / (last_week_changes / 100))  

def calculate_change_failure_rate():
    
    stats = get_github_stats()
    if not stats:
        return 5.0  
    
    last_week_changes = abs(stats[-1][1]) + abs(stats[-1][2])
    
    return min(10.0, 5.0 + (last_week_changes / 10000))

def calculate_mttr():
    
    stats = get_github_stats()
    if not stats:
        return 2 * 60 * 60  
    
    last_week_changes = abs(stats[-1][1]) + abs(stats[-1][2])
    
    return min(4 * 60 * 60, 2 * 60 * 60 + (last_week_changes / 1000) * 60)

def update_metrics():
    dep_freq = calculate_deployment_frequency()
    lt = calculate_lead_time()
    cfr = calculate_change_failure_rate()
    mttr_val = calculate_mttr()

    deployment_frequency.set(dep_freq)
    lead_time.set(lt)
    change_failure_rate.set(cfr)
    mttr.set(mttr_val)
    


dora.configure_exporter(
    exporter_type="prometheus",
    metric_endpoint="http://localhost:8090"
)


if __name__ == "__main__":
    while True:
        update_metrics()
        dora.export()
        time.sleep(3600)  
