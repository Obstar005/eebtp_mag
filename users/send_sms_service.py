# utils/sms.py
import requests
import os

SMS_API_KEY = os.getenv('SMS_API_KEY')
SMS_API_URL = os.getenv('SMS_API_URL', 'https://edok-api.kingsmspro.com/api/v1/sms/send')


def send_verification_sms(phone_number, code):
    url = f'{SMS_API_URL}send_sms'
    headers = {
        'Authorization': f'Bearer {SMS_API_KEY}',
        'Content-Type': 'application/json'
    }
    data = {
        'to': phone_number,
        'message': f'Votre code de vérification est : {code}',
        'sender': 'KING SMS'
    }
    
    response = requests.post(url, json=data, headers=headers)
    if response.status_code != 200:
        raise Exception(f"Erreur lors de l'envoi du SMS: {response.text}")
    try:
        data = response.json()
    except ValueError:
        data = response.text  # ou {}
    return response.status_code, data
    
