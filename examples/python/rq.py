import requests
import json

files = [('FILES', open('../../src/tests/1Mfile01.rnd', 'rb')),
         ('FILES', open('../../src/tests/eicar_com.zip', 'rb'))]


res = requests.post('http://localhost:3000/api/v1/scan', files=files)

print(json.dumps(res.json(), indent=2))
