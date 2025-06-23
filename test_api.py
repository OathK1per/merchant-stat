import requests
import json

def test_fetch_and_save_api():
    url = "http://localhost:8000/api/rank/fetch_and_save/"
    ranges = (
        list(range(2001, 2031)) +
        list(range(24001, 24100)) +
        list(range(101001, 101028)) +
        list(range(102001, 102033)) +
        list(range(140001, 140011))
    )
    for i in ranges:
        cate_id = f"{i:06d}"
        data = {"cate_id": cate_id}
        print(f"\n--- Calling API for cate_id: {cate_id} ---")
        try:
            response = requests.post(url, json=data, timeout=60)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    result = response.json()
                    print(f"Success: {json.dumps(result, indent=2)}")
                except json.JSONDecodeError:
                    print(f"Error: Could not decode JSON. Response text: {response.text}")
            else:
                print(f"Error: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"Exception: {e}")

if __name__ == "__main__":
    test_fetch_and_save_api()