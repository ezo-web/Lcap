import requests
import json
import os
import re

target_ip = os.environ.get("TARGET_IP")

# Defining the api-endpoint
url = 'https://api.abuseipdb.com/api/v2/check'

querystring = {
    'ipAddress': target_ip,
    'maxAgeInDays': '90'
}

headers = {
    'Accept': 'application/json',
    'Key': '0752628ce7ab23cdfc366cfa9ce4d0ddbe09cd426d690a1c4f1d61d27e221c4f1b803bae26396c58'
}

response = requests.request(method='GET', url=url, headers=headers, params=querystring)

# Formatted output
decodedResponse = json.loads(response.text)
position = re.search(r"\"abuseConfidenceScore\": \d+", json.dumps(decodedResponse))
print(position)