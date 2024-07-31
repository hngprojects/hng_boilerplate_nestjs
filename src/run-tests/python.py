import requests
import unittest

base_URL = "http://localhost:3008"


class APITest(unittest.TestCase):
    # Class-level variables for auth details
    access_token = None
    user_id = None

    @classmethod
    def setUpClass(cls):
        """Register and log in to obtain authentication details."""
        # Step 1: Register user
        registration_endpoint = "/api/v1/auth/register"
        registration_url = base_URL + registration_endpoint
        registration_payload = {
            "email": "peedtree@gmail.com",
            "first_name": "John",
            "last_name": "Doe",
            "password": "wretyuTRY#n1@kels",
        }
        registration_response = requests.post(
            registration_url, json=registration_payload
        )

        # Step 2: Log in to get token and user ID
        login_endpoint = "/api/v1/auth/login"
        login_url = base_URL + login_endpoint
        login_payload = {
            "email": "peedtree@gmail.com",
            "password": "wretyuTRY#n1@kels",
        }
        login_response = requests.post(login_url, json=login_payload)

        response_json = login_response.json()
        cls.access_token = response_json.get("access_token")
        cls.user_id = response_json.get("data", {}).get("user", {}).get("id")

        # Check if access token and user ID are retrieved
        if not cls.access_token or not cls.user_id:
            raise Exception("Failed to retrieve access token or user ID")

    # TESTS THAT DO NOT REQUIRE AUTHORIZATION OR USER ID

    def test_root(self):
        endpoint = "/api"
        url = base_URL + endpoint
        response = requests.get(url)
        self.assertEqual(response.status_code, 200)

    def test_version(self):
        endpoint = "/api/v1"
        url = base_URL + endpoint
        response = requests.get(url)
        self.assertEqual(response.status_code, 200)

    def test_health(self):
        endpoint = "/health"
        url = base_URL + endpoint
        response = requests.get(url)
        self.assertEqual(response.status_code, 200)

    def test_probe(self):
        endpoint = "/probe"
        url = base_URL + endpoint
        response = requests.get(url)
        self.assertEqual(response.status_code, 200)

    def test_seed(self):
        endpoint = "/api/v1/seed"
        url = base_URL + endpoint
        response = requests.post(url)
        self.assertEqual(response.status_code, 201)

    def test_squeeze(self):
        endpoint = "/api/v1/squeeze"
        url = base_URL + endpoint
        data = {
            "email": "peedetree@gmail.com",
            "first_name": "Ria",
            "last_name": "Test",
            "phone": "082345869",
            "location": "Lagos",
            "job_title": "Software engineer",
            "company": "HNG Tech",
            "interests": ["basketball"],
            "referral_source": "string",
        }
        response = requests.post(url, json=data)
        self.assertEqual(response.status_code, 201)

    def test_get_timezones(self):
        endpoint = "/api/v1/timezones"
        headers = {"Authorization": f"Bearer {self.access_token}"}
        url = base_URL + endpoint
        response = requests.get(url, headers=headers)
        self.assertEqual(response.status_code, 200)

    def test_get_user(self):
        endpoint = f"/api/v1/users/{self.user_id}"
        headers = {"Authorization": f"Bearer {self.access_token}"}
        url = base_URL + endpoint
        response = requests.get(url, headers=headers)
        self.assertEqual(response.status_code, 200)

    def test_update_user(self):
        endpoint = f"/api/v1/users/{self.user_id}"
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
        }
        url = base_URL + endpoint
        data = {"last_name": "Lee"}
        response = requests.patch(url, json=data, headers=headers)
        self.assertEqual(response.status_code, 200)

    def test_create_testimonial(self):
        endpoint = "/api/v1/testimonials"
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
        }
        url = base_URL + endpoint
        data = {
            "name": "John Doe",
            "content": "I am very happy with the service provided by the company",
        }
        response = requests.post(url, json=data, headers=headers)
        self.assertEqual(response.status_code, 201)

    def test_register(self):
        endpoint = "/api/v1/auth/register"
        url = base_URL + endpoint
        data = {
            "email": "peedtree4@gmail.com",
            "first_name": "John",
            "last_name": "Doe",
            "password": "wretyuTRY#n1@kels",
        }
        response = requests.post(url, json=data)
        self.assertEqual(response.status_code, 201)

    def test_login(self):
        endpoint = "/api/v1/auth/login"
        url = base_URL + endpoint
        data = {
            "email": "peedtree4@gmail.com",
            "password": "wretyuTRY#n1@kels",
        }
        response = requests.post(url, json=data)
        self.assertEqual(response.status_code, 200)


if __name__ == "__main__":
    unittest.main(verbosity=2)
