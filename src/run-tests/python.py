import requests
import unittest


from faker import Faker


base_URL = "https://deployment.api-nestjs.boilerplate.hng.tech"


class APITest(unittest.TestCase):
    def setUp(self):
        # Initialize Faker
        self.faker= Faker()
        self.email = Faker.email
        self.token = None
    

    # REGISTER USER
    def test_register_user(self):
        endpoint = "/api/v1/auth/register"
        url = base_URL + endpoint
        # unique_email = self.fake.email()  # Generate a unique email
        print(self.email)
        payload = {
            "email": self.email,
            "first_name": "Ria",
            "last_name": "Test",
            "password": "wretyuTRY#n1@kels"
        }
        response = requests.post(url, json=payload)
        self.assertEqual(response.status_code, 201)


    # LOGIN
    def test_login(self):
        endpoint = "/api/v1/auth/login"
        url = base_URL + endpoint
        payload = {
            "password": "Tester@01",
            "email": self.email
        }
        response = requests.post(url, json=payload)
        self.token = response.json()["access_token"]

        self.assertEqual(response.status_code, 200)

    # GENERATE TOKEN
    @staticmethod
    def get_token():
        endpoint = "/api/v1/auth/login"
        url = base_URL + endpoint
        payload = {
            "password": "Tester@01",
            "email": APITest().email
        }
        response = requests.post(url, json=payload)
        response_json = response.json()
        

    # TEST ROOT
    def test_root(self):
        endpoint = "/api"
        url = base_URL + endpoint
        response = requests.get(url)
        self.assertEqual(response.status_code, 200)

    # TEST VERSION
    def test_version(self):
        endpoint = "/api/v1"
        url = base_URL + endpoint
        response = requests.get(url)
        self.assertEqual(response.status_code, 200)

    # TEST HEALTH
    def test_health(self):
        endpoint = "/health"
        url = base_URL + endpoint
        response = requests.get(url)
        self.assertEqual(response.status_code, 200)

    # TEST PROBE
    def test_probe(self):
        endpoint = "/probe"
        url = base_URL + endpoint
        response = requests.get(url)
        self.assertEqual(response.status_code, 200)
        
    # TEST SEED
    def test_seed(self):
        endpoint = "/api/v1/seed"
        url = base_URL + endpoint
        response = requests.post(url)
        self.assertEqual(response.status_code, 201)
        

    def test_squeeze(self):
        endpoint = "/api/v1/squeeze"
        url = base_URL + endpoint
        data = {
            "email": self.email,
            "first_name": "string",
            "last_name": "string",
            "phone": "string",
            "location": "string",
            "job_title": "string",
            "company": "string",
            "interests": [
                "string"
            ],
            "referral_source": "string"
        }
        response = requests.post(url, json=data)
        self.assertEqual(response.status_code, 201)
        

    def test_get_timezones(self):
        endpoint = "/api/v1/timezones"
        access_token = self.token
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        url = base_URL + endpoint
        response = requests.get(url, headers=headers)
        self.assertEqual(response.status_code, 200)


    def test_get_user(self):
        user_id = "8f7ca676-52af-44d0-acc2-d43b68d90467"
        endpoint = f"/api/v1/users/{user_id}"
        access_token = self.token
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        url = base_URL + endpoint
        response = requests.get(url, headers=headers)

        self.assertEqual(response.status_code, 200)


    def test_update_user(self):
        user_id = "8f7ca676-52af-44d0-acc2-d43b68d90467" 
        endpoint = f"/api/v1/users/{user_id}" 
        access_token = self.token
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"  
        }
        url = base_URL + endpoint
        data = {
            "last_name": "Doe"
        }
        response = requests.patch(url, json=data, headers=headers)
        self.assertEqual(response.status_code, 200)


    def test_create_testimonial(self):
        endpoint = "/api/v1/testimonials" 
        access_token = self.token
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json" 
        }
        url = base_URL + endpoint
        data = {
            "name": "John Doe",
            "content": "I am very happy with the service provided by the company"
        }        
        response = requests.post(url, json=data, headers=headers)
        self.assertEqual(response.status_code, 201)


import requests
import unittest
from dotenv import load_dotenv
import os

load_dotenv()

base_URL = os.getenv("BASE_URL")

AUTH_PASSWORD = os.getenv("AUTH_PASSWORD")


class APITest(unittest.TestCase):
    access_token = None
    user_id = None

    @classmethod
    def setUpClass(cls):
        """Register and log in to obtain authentication details."""
        registration_endpoint = "/api/v1/auth/register"
        registration_url = base_URL + registration_endpoint
        registration_payload = {
            "email": "peedtree@gmail.com",
            "first_name": "John",
            "last_name": "Doe",
            "password": AUTH_PASSWORD,
        }
        registration_response = requests.post(
            registration_url, json=registration_payload
        )

        login_endpoint = "/api/v1/auth/login"
        login_url = base_URL + login_endpoint
        login_payload = {
            "email": "peedtree@gmail.com",
            "password": AUTH_PASSWORD,
        }
        login_response = requests.post(login_url, json=login_payload)

        response_json = login_response.json()
        cls.access_token = response_json.get("access_token")
        cls.user_id = response_json.get("data", {}).get("user", {}).get("id")

        if not cls.access_token or not cls.user_id:
            raise Exception("Failed to retrieve access token or user ID")

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
            "password": AUTH_PASSWORD,
        }
        response = requests.post(url, json=data)
        self.assertEqual(response.status_code, 201)

    def test_login(self):
        endpoint = "/api/v1/auth/login"
        url = base_URL + endpoint
        data = {
            "email": "peedtree4@gmail.com",
            "password": AUTH_PASSWORD,
        }
        response = requests.post(url, json=data)
        self.assertEqual(response.status_code, 200)


if __name__ == "__main__":
    unittest.main(verbosity=2)

    unittest.main(verbosity=2)