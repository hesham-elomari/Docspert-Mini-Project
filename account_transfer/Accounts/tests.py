from django.test import TestCase, Client
from django.urls import reverse,resolve
from rest_framework import status
from Accounts.models import Accounts
from io import BytesIO
import pandas as pd
from Accounts.views import Account_List
from unittest.mock import patch
from django.core.files.uploadedfile import SimpleUploadedFile



class ImportFilesTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.url = reverse('Accounts:importcsv')  
        self.valid_file = SimpleUploadedFile("test_file.txt", b"File content", content_type="text/plain")
        self.invalid_file_data = {"files": "not_a_file"}

    def test_valid_single_file_upload(self):
        response = self.client.post(self.url, {'file': self.valid_file})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Success')

    def test_valid_multiple_files_upload(self):
        files = [
            SimpleUploadedFile("file1.txt", b"Content1", content_type="text/plain"),
            SimpleUploadedFile("file2.txt", b"Content2", content_type="text/plain"),
        ]
        response = self.client.post(self.url, {'files': files})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_no_file_provided(self):
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_file_format(self):
        response = self.client.post(self.url, self.invalid_file_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_error_during_file_processing(self):
        response = self.client.post(self.url, {'file': self.valid_file})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class AccountListTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.url = reverse('Accounts:list_all_accounts')  
        Accounts.objects.create(id='cc26b56c-36f6-41f1-b689-d1d5065b95af', name="John Doe", balance='1000')
        Accounts.objects.create(id='be6acfdc-cae1-4611-b3b2-dfb5167ba5fe', name="Jane Doe", balance='2000')

    def test_account_list(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data['data']), 0)  

    def test_account_list_no_data(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data['data']), 0)

class AccountDetailsTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.url = reverse('Accounts:get_account_details')  
        self.account = Accounts.objects.create(name='Test Account', balance="1000")

    def test_account_details_search_by_id(self):
        response = self.client.get(self.url, {'search': self.account.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data'][0]['name'], self.account.name)

    def test_account_details_search_by_name(self):
        response = self.client.get(self.url, {'search': self.account.name})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data'][0]['name'], self.account.name)

    def test_account_details_invalid_search(self):
        response = self.client.get(self.url, {'search': 'nonexistent'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['data']), 0)

class TransferToAPITestCase(TestCase):
    def setUp(self):

        self.url = reverse('Accounts:transfer_to')  
        self.from_account = Accounts.objects.create(
            id="11111111-1111-1111-1111-111111111111", balance=100.0
        )
        self.to_account = Accounts.objects.create(
            id="22222222-2222-2222-2222-222222222222", balance=50.0
        )
        self.valid_data = {
            "id_from": "11111111-1111-1111-1111-111111111111",
            "balance_from": 50.0,
            "id_to": "22222222-2222-2222-2222-222222222222",
        }

    def test_transfer_success(self):
        response = self.client.post(self.url, self.valid_data, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get("message"), "Success")

    def test_nonexistent_from_account(self):
        invalid_data = {
            "id_from": "33333333-3333-3333-3333-333333333333",
            "balance_from": 50.0,
            "id_to": "22222222-2222-2222-2222-222222222222",
        }
        response = self.client.post(self.url, invalid_data, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("does not exist", response.json().get("errors", ""))

    def test_insufficient_balance(self):
        invalid_data = {
            "id_from": "11111111-1111-1111-1111-111111111111",
            "balance_from": 150.0,
            "id_to": "22222222-2222-2222-2222-222222222222",
        }
        response = self.client.post(self.url, invalid_data, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("do not have enough balance", response.json().get("errors", ""))

    def test_nonexistent_to_account(self):
        invalid_data = {
            "id_from": "11111111-1111-1111-1111-111111111111",
            "balance_from": 50.0,
            "id_to": "33333333-3333-3333-3333-333333333333",
        }
        response = self.client.post(self.url, invalid_data, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("does not exist", response.json().get("errors", ""))

    def test_transfer_to_same_account(self):
        invalid_data = {
            "id_from": "11111111-1111-1111-1111-111111111111",
            "balance_from": 50.0,
            "id_to": "11111111-1111-1111-1111-111111111111",
        }
        response = self.client.post(self.url, invalid_data, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("Can not transfer to the same person", response.json().get("errors", ""))